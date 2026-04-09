from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
import jwt

from app.core.dependencies import get_db
from app.models.admin_rbac import Admin, AdminRoleKey
from app.models.user import User, UserRole
from app.schemas.user import get_role_permissions
from app.core.config import settings

security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        user_id_raw = payload.get("sub")
        if user_id_raw is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        try:
            user_id = int(user_id_raw)
        except (TypeError, ValueError) as exc:
            raise HTTPException(status_code=401, detail="Invalid token") from exc

        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.InvalidTokenError as exc:
        raise HTTPException(status_code=401, detail="Invalid token") from exc


def get_current_admin_user(
    current_user: User = Depends(get_current_user),
):
    if current_user.role not in (UserRole.ADMIN.value, UserRole.SUPER_ADMIN.value):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    if current_user.verification_status not in {"APPROVED", "VERIFIED"}:
        raise HTTPException(status_code=403, detail="Admin account is not approved")
    if "backoffice:access" not in get_role_permissions(current_user.role, admin_profile=getattr(current_user, "admin_profile", None)):
        raise HTTPException(status_code=403, detail="Backoffice access missing")
    return current_user


def get_current_partner_user(
    current_user: User = Depends(get_current_user),
):
    if current_user.role != UserRole.PARTNER.value:
        raise HTTPException(status_code=403, detail="Partner access required")
    if current_user.verification_status not in {"APPROVED", "VERIFIED"}:
        raise HTTPException(status_code=403, detail="Partner account is not approved")
    if "partner:dashboard" not in get_role_permissions(current_user.role, admin_profile=getattr(current_user, "admin_profile", None)):
        raise HTTPException(status_code=403, detail="Partner dashboard access missing")
    return current_user


def get_current_admin_profile(
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
) -> Admin | None:
    profile = db.query(Admin).filter(Admin.user_id == current_user.id, Admin.is_active.is_(True)).first()
    if current_user.role == UserRole.SUPER_ADMIN.value and profile is None:
        return None
    if profile is None:
        raise HTTPException(status_code=403, detail="Admin profile missing")
    return profile


def ensure_module_access(
    current_user: User,
    admin_profile: Admin | None,
    module_key: str,
) -> None:
    if current_user.role == UserRole.SUPER_ADMIN.value:
        return
    if admin_profile is None:
        raise HTTPException(status_code=403, detail="Admin profile missing")
    allowed_modules = {str(item).lower() for item in (admin_profile.module_access or [])}
    if module_key.lower() not in allowed_modules:
        raise HTTPException(status_code=403, detail="Module access denied")


def ensure_country_access(
    current_user: User,
    admin_profile: Admin | None,
    country_code: str | None,
) -> None:
    if current_user.role == UserRole.SUPER_ADMIN.value:
        return
    if admin_profile is None:
        raise HTTPException(status_code=403, detail="Admin profile missing")
    if not country_code:
        return
    allowed_countries = {str(item).upper() for item in (admin_profile.country_access or [])}
    if allowed_countries and country_code.upper() not in allowed_countries and "GLOBAL" not in allowed_countries:
        raise HTTPException(status_code=403, detail="Country access denied")
