from datetime import datetime, timedelta, timezone
import secrets

from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session

from app.core.auth import create_access_token, hash_password, verify_password
from app.core.config import settings
from app.core.dependencies import get_db
from app.core.security import get_current_user
from app.core.limiter import limiter
from app.models.user import User, UserRole
from app.schemas.admin_rbac import AdminInviteAcceptRequest
from app.models.signup_lead import SignupLead
from app.schemas.auth import (
    LoginRequest,
    RegisterRequest,
    SignupLeadCompleteRequest,
    SignupLeadResponse,
    SignupLeadSelectRoleRequest,
    SignupLeadStartRequest,
    SignupLeadVerifyRequest,
    TokenResponse,
)
from app.schemas.user import UserResponse, get_role_permissions
from app.services.admin_rbac_service import accept_admin_invitation
router = APIRouter(prefix="/auth", tags=["Auth"])


AUTO_APPROVED_ROLES = {UserRole.CLIENT.value}
PUBLIC_SIGNUP_ROLES = {UserRole.CLIENT.value, UserRole.PARTNER.value, UserRole.INVESTOR.value}


def _full_name(first_name: str, last_name: str) -> str:
    return " ".join(part.strip() for part in [first_name, last_name] if part.strip())


def _generate_sms_code() -> str:
    return "".join(str(secrets.randbelow(10)) for _ in range(6))


def _lead_to_response(lead: SignupLead, *, redirect_path: str | None = None) -> SignupLeadResponse:
    return SignupLeadResponse(
        id=lead.id,
        first_name=lead.first_name,
        last_name=lead.last_name,
        email=lead.email,
        phone=lead.phone,
        city=lead.city,
        status=lead.status,
        selected_role=lead.selected_role,
        phone_verified=lead.phone_verified_at is not None,
        sms_debug_code=lead.sms_code if settings.SMS_DEBUG_DELIVERY else None,
        redirect_path=redirect_path,
    )


def _get_lead_or_404(db: Session, lead_id: int) -> SignupLead:
    lead = db.query(SignupLead).filter(SignupLead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Signup lead not found")
    return lead


@router.post("/signup-leads/start", response_model=SignupLeadResponse)
@limiter.limit("8 per 15 minutes")
def start_signup_lead(request: Request, data: SignupLeadStartRequest, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == data.email).first()
    if existing_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    lead = db.query(SignupLead).filter(SignupLead.email == data.email).first()
    code = _generate_sms_code()
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=settings.SIGNUP_SMS_CODE_TTL_MINUTES)

    if not lead:
        lead = SignupLead(
            first_name=data.first_name.strip(),
            last_name=data.last_name.strip(),
            email=data.email,
            phone=data.phone.strip(),
            city=data.city.strip() if data.city else None,
            status="SMS_PENDING",
            sms_code=code,
            sms_code_expires_at=expires_at,
            phone_verified_at=None,
            selected_role=None,
        )
        db.add(lead)
    else:
        lead.first_name = data.first_name.strip()
        lead.last_name = data.last_name.strip()
        lead.phone = data.phone.strip()
        lead.city = data.city.strip() if data.city else None
        lead.status = "SMS_PENDING"
        lead.sms_code = code
        lead.sms_code_expires_at = expires_at
        lead.phone_verified_at = None
        lead.selected_role = None

    db.commit()
    db.refresh(lead)
    return _lead_to_response(lead)


@router.post("/signup-leads/verify-phone", response_model=SignupLeadResponse)
@limiter.limit("10 per 15 minutes")
def verify_signup_lead_phone(request: Request, data: SignupLeadVerifyRequest, db: Session = Depends(get_db)):
    lead = db.query(SignupLead).filter(SignupLead.email == data.email).first()
    if not lead:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Signup lead not found")

    if not lead.sms_code or not lead.sms_code_expires_at:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="SMS verification not started")

    if lead.sms_code != data.code.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Codul SMS este invalid")

    expires_at = lead.sms_code_expires_at
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Codul SMS a expirat")

    lead.phone_verified_at = datetime.now(timezone.utc)
    lead.status = "PHONE_VERIFIED"
    db.commit()
    db.refresh(lead)
    return _lead_to_response(lead)


@router.get("/signup-leads/{lead_id}", response_model=SignupLeadResponse)
def get_signup_lead(lead_id: int, db: Session = Depends(get_db)):
    lead = _get_lead_or_404(db, lead_id)
    return _lead_to_response(lead)


@router.post("/signup-leads/select-role", response_model=SignupLeadResponse)
@limiter.limit("10 per hour")
def select_signup_role(request: Request, data: SignupLeadSelectRoleRequest, db: Session = Depends(get_db)):
    if data.role.value not in PUBLIC_SIGNUP_ROLES:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Rolul selectat necesita aprobare separata din Backoffice",
        )

    lead = _get_lead_or_404(db, data.lead_id)
    if lead.phone_verified_at is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Telefonul trebuie validat inainte de alegerea rolului")

    lead.selected_role = data.role.value
    lead.status = "ROLE_SELECTED"
    db.commit()
    db.refresh(lead)

    redirect_path = {
        UserRole.CLIENT.value: f"/account/create/client?lead={lead.id}",
        UserRole.PARTNER.value: f"/partners/join/create?lead={lead.id}",
        UserRole.INVESTOR.value: f"/investors/create?lead={lead.id}",
    }[data.role.value]
    return _lead_to_response(lead, redirect_path=redirect_path)


@router.post("/register-complete", response_model=UserResponse)
@limiter.limit("6 per hour")
def complete_register(request: Request, data: SignupLeadCompleteRequest, db: Session = Depends(get_db)):
    lead = _get_lead_or_404(db, data.lead_id)

    if lead.phone_verified_at is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Telefonul trebuie validat inainte de finalizarea contului")

    if data.role.value not in PUBLIC_SIGNUP_ROLES:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Rolul nu poate fi finalizat din fluxul public")

    if lead.selected_role and lead.selected_role != data.role.value:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Rolul selectat nu corespunde cu fluxul curent")

    existing_user = db.query(User).filter(User.email == lead.email).first()
    if existing_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    new_user = User(
        full_name=_full_name(lead.first_name, lead.last_name),
        email=lead.email,
        phone=lead.phone,
        city=lead.city,
        hashed_password=hash_password(data.password),
        role=data.role.value,
        verification_status="APPROVED" if data.role.value in AUTO_APPROVED_ROLES else "PENDING",
    )

    lead.selected_role = data.role.value
    lead.status = "COMPLETED"

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return UserResponse.from_user(new_user)


@router.post("/register", response_model=UserResponse)
@limiter.limit("3 per hour")
def register(request: Request, data: RegisterRequest, db: Session = Depends(get_db)):
    if data.role.value in {UserRole.ADMIN.value, UserRole.SUPER_ADMIN.value}:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Rolul selectat necesita aprobare si creare controlata din Backoffice",
        )

    existing_user = db.query(User).filter(User.email == data.email).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    new_user = User(
        full_name=data.full_name,
        email=data.email,
        phone=data.phone,
        city=data.city,
        hashed_password=hash_password(data.password),
        role=data.role.value,
        verification_status="APPROVED" if data.role.value in AUTO_APPROVED_ROLES else "PENDING",
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return UserResponse.from_user(new_user)


@router.post("/login", response_model=TokenResponse)
@limiter.limit("5 per 15 minutes")
def login(request: Request, data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    if not verify_password(data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    if user.verification_status == "REJECTED":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account access has been rejected",
        )

    if user.role in {UserRole.ADMIN.value, UserRole.SUPER_ADMIN.value, UserRole.PARTNER.value, UserRole.INVESTOR.value} and user.verification_status != "APPROVED":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account pending approval",
        )

    permissions = get_role_permissions(user.role, admin_profile=user.admin_profile)
    token = create_access_token(
        {
            "sub": str(user.id),
            "role": user.role,
            "permissions": permissions,
            "admin_role_key": getattr(user.admin_profile, "role_key", None),
            "country_access": getattr(user.admin_profile, "country_access", []) or [],
            "module_access": getattr(user.admin_profile, "module_access", []) or [],
        }
    )

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user_id=user.id,
        full_name=user.full_name,
        email=user.email,
        phone=user.phone,
        city=user.city,
        role=user.role,
        verification_status=user.verification_status,
        permissions=permissions,
        admin_role_key=getattr(user.admin_profile, "role_key", None),
        country_access=getattr(user.admin_profile, "country_access", []) or [],
        module_access=getattr(user.admin_profile, "module_access", []) or [],
        design_edit="visual_cms" in {str(item).lower() for item in (getattr(user.admin_profile, "module_access", []) or [])},
    )


@router.get("/me", response_model=UserResponse)
def me(current_user: User = Depends(get_current_user)):
    return UserResponse.from_user(current_user)


@router.post("/admin-invite/accept", response_model=UserResponse)
def accept_admin_invite(data: AdminInviteAcceptRequest, db: Session = Depends(get_db)):
    result = accept_admin_invitation(db, token=data.token, password=data.password, full_name=data.full_name)
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invitation not found")
    if result == "invitation_not_pending":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Invitation is no longer pending")
    return UserResponse.from_user(result)
