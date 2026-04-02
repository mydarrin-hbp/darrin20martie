from __future__ import annotations

import secrets

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.core.auth import hash_password
from app.models.admin_rbac import (
    Admin,
    AdminPermission,
    AdminRoleKey,
    ROLE_MODULE_TEMPLATES,
    ROLE_PERMISSION_TEMPLATES,
)
from app.models.user import User, UserRole
from app.schemas.admin_rbac import AdminInviteResponse, AdminPermissionResponse, AdminProfileResponse, InviteAdminRequest

def _normalize_country_access(values: list[str]) -> list[str]:
    normalized = []
    for value in values:
        item = value.strip().upper()
        if item and item not in normalized:
            normalized.append(item)
    return normalized


def _normalize_module_access(role_key: str, values: list[str]) -> list[str]:
    base = ROLE_MODULE_TEMPLATES.get(role_key, [])
    merged = base + list(values)
    normalized: list[str] = []
    for value in merged:
        item = value.strip().lower()
        if item and item not in normalized:
            normalized.append(item)
    return normalized


def _apply_design_edit(module_access: list[str], design_edit: bool) -> list[str]:
    if not design_edit:
        return module_access
    if "visual_cms" not in module_access:
        module_access.append("visual_cms")
    return module_access


def _role_permissions(role_key: str) -> list[str]:
    return ROLE_PERMISSION_TEMPLATES.get(role_key, ["backoffice:access"])


def _build_invitation_url(token: str) -> str:
    return f"/login?invite={token}"


def _serialize_admin(admin: Admin) -> AdminProfileResponse:
    user = admin.user
    design_edit = "visual_cms" in {str(item).lower() for item in (admin.module_access or [])}
    return AdminProfileResponse(
        id=admin.id,
        user_id=admin.user_id,
        email=user.email,
        full_name=user.full_name,
        role_key=admin.role_key,
        country_access=admin.country_access or [],
        module_access=admin.module_access or [],
        invitation_status=admin.invitation_status,
        is_active=admin.is_active,
        design_edit=design_edit,
        invitation_url=_build_invitation_url(admin.invitation_token) if admin.invitation_token else None,
        created_at=admin.created_at,
        permissions=[
            AdminPermissionResponse(
                id=item.id,
                permission_code=item.permission_code,
                module_key=item.module_key,
                country_code=item.country_code,
                is_active=item.is_active,
            )
            for item in admin.permissions
        ],
    )


def list_admin_profiles(db: Session) -> list[AdminProfileResponse]:
    admins = db.execute(
        select(Admin).options(selectinload(Admin.user), selectinload(Admin.permissions)).order_by(Admin.created_at.desc())
    ).scalars().all()
    return [_serialize_admin(item) for item in admins]


def invite_admin(db: Session, *, current_admin: User, payload: InviteAdminRequest) -> AdminInviteResponse:
    role_key = payload.role_key.upper().strip()
    if role_key not in {item.value for item in AdminRoleKey}:
        raise ValueError("unsupported_role")

    module_access = _apply_design_edit(
        _normalize_module_access(role_key, payload.module_access),
        payload.design_edit,
    )
    user = db.execute(select(User).where(User.email == payload.email)).scalar_one_or_none()
    if user is None:
        user = User(
            email=payload.email,
            full_name=payload.full_name,
            hashed_password=hash_password(secrets.token_urlsafe(24)),
            role=UserRole.ADMIN.value if role_key != AdminRoleKey.SUPER_ADMIN.value else UserRole.SUPER_ADMIN.value,
            verification_status="PENDING",
        )
        db.add(user)
        db.flush()
    else:
        user.full_name = payload.full_name or user.full_name
        user.role = UserRole.ADMIN.value if role_key != AdminRoleKey.SUPER_ADMIN.value else UserRole.SUPER_ADMIN.value
        user.verification_status = "PENDING"
        db.flush()

    invitation_token = secrets.token_urlsafe(32)
    admin = db.execute(
        select(Admin).where(Admin.user_id == user.id).options(selectinload(Admin.permissions), selectinload(Admin.user))
    ).scalar_one_or_none()
    if admin is None:
        admin = Admin(
            user_id=user.id,
            role_key=role_key,
            country_access=_normalize_country_access(payload.country_access),
            module_access=module_access,
            invitation_token=invitation_token,
            invitation_status="PENDING",
            invited_by_user_id=current_admin.id,
            is_active=True,
        )
        db.add(admin)
        db.flush()
    else:
        admin.role_key = role_key
        admin.country_access = _normalize_country_access(payload.country_access)
        admin.module_access = module_access
        admin.invitation_token = invitation_token
        admin.invitation_status = "PENDING"
        admin.invited_by_user_id = current_admin.id
        admin.is_active = True
        for permission in list(admin.permissions):
            db.delete(permission)
        db.flush()

    permissions = _role_permissions(role_key)
    if payload.design_edit and "design_edit:use" not in permissions:
        permissions.append("design_edit:use")
    country_scope = admin.country_access or [None]
    for permission_code in permissions:
        module_key = permission_code.split(":", 1)[0]
        for country_code in country_scope:
            db.add(
                AdminPermission(
                    admin_id=admin.id,
                    permission_code=permission_code,
                    module_key=module_key,
                    country_code=country_code,
                    is_active=True,
                )
            )

    db.commit()
    admin = db.execute(
        select(Admin).where(Admin.id == admin.id).options(selectinload(Admin.user), selectinload(Admin.permissions))
    ).scalar_one()
    return AdminInviteResponse(**_serialize_admin(admin).model_dump())


def accept_admin_invitation(db: Session, *, token: str, password: str, full_name: str | None) -> User | None | str:
    admin = db.execute(
        select(Admin).where(Admin.invitation_token == token, Admin.is_active.is_(True)).options(selectinload(Admin.user))
    ).scalar_one_or_none()
    if admin is None:
        return None
    if admin.invitation_status != "PENDING":
        return "invitation_not_pending"

    user = admin.user
    user.hashed_password = hash_password(password)
    if full_name:
        user.full_name = full_name
    user.verification_status = "APPROVED"
    user.role = UserRole.ADMIN.value if admin.role_key != AdminRoleKey.SUPER_ADMIN.value else UserRole.SUPER_ADMIN.value
    admin.invitation_status = "ACCEPTED"
    admin.invitation_token = None
    db.commit()
    db.refresh(user)
    return user


def get_admin_profile_by_user_id(db: Session, user_id: int) -> Admin | None:
    return db.execute(
        select(Admin).where(Admin.user_id == user_id, Admin.is_active.is_(True)).options(selectinload(Admin.permissions))
    ).scalar_one_or_none()


def revoke_admin_access(db: Session, admin_id: int) -> Admin | None:
    admin = db.execute(
        select(Admin).where(Admin.id == admin_id).options(selectinload(Admin.user), selectinload(Admin.permissions))
    ).scalar_one_or_none()
    if admin is None:
        return None
    admin.is_active = False
    admin.invitation_status = "REVOKED"
    admin.invitation_token = None
    if admin.user is not None:
        admin.user.verification_status = "REJECTED"
    db.commit()
    return admin
