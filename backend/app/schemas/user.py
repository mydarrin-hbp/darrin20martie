from enum import Enum
from typing import Any

from pydantic import BaseModel, ConfigDict, EmailStr


class UserRole(str, Enum):
    CLIENT = "CLIENT"
    PARTNER = "PARTNER"
    ADMIN = "ADMIN"
    INVESTOR = "INVESTOR"
    SUPER_ADMIN = "SUPER_ADMIN"


class VerificationStatus(str, Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"


class UserCreate(BaseModel):
    full_name: str | None = None
    email: EmailStr
    phone: str | None = None
    city: str | None = None
    password: str
    role: UserRole = UserRole.CLIENT


class UserUpdate(BaseModel):
    full_name: str | None = None
    email: EmailStr | None = None
    phone: str | None = None
    city: str | None = None
    role: UserRole | None = None
    verification_status: VerificationStatus | None = None


class UserVerify(BaseModel):
    verification_status: VerificationStatus


class UserResponse(BaseModel):
    id: int
    full_name: str | None = None
    email: EmailStr
    phone: str | None = None
    city: str | None = None
    role: UserRole | None
    verification_status: VerificationStatus | None
    permissions: list[str] = []
    admin_role_key: str | None = None
    country_access: list[str] = []
    module_access: list[str] = []
    design_edit: bool = False

    model_config = ConfigDict(from_attributes=True)

    @classmethod
    def from_user(cls, user: Any) -> "UserResponse":
        admin_profile = getattr(user, "admin_profile", None)
        return cls(
            id=user.id,
            full_name=getattr(user, "full_name", None),
            email=user.email,
            phone=getattr(user, "phone", None),
            city=getattr(user, "city", None),
            role=user.role,
            verification_status=user.verification_status,
            permissions=get_role_permissions(user.role, admin_profile=admin_profile),
            admin_role_key=getattr(admin_profile, "role_key", None),
            country_access=getattr(admin_profile, "country_access", []) or [],
            module_access=getattr(admin_profile, "module_access", []) or [],
            design_edit="visual_cms" in {str(item).lower() for item in (getattr(admin_profile, "module_access", []) or [])},
        )


def get_role_permissions(role: Any, *, admin_profile: Any | None = None) -> list[str]:
    from app.models.user import ROLE_PERMISSIONS
    from app.models.admin_rbac import ROLE_PERMISSION_TEMPLATES

    if not role:
        return []
    base_permissions = ROLE_PERMISSIONS.get(str(role), []).copy()
    if admin_profile and getattr(admin_profile, "role_key", None):
        for permission in ROLE_PERMISSION_TEMPLATES.get(str(admin_profile.role_key), []):
            if permission not in base_permissions:
                base_permissions.append(permission)
    if admin_profile and "visual_cms" in {str(item).lower() for item in (getattr(admin_profile, "module_access", []) or [])}:
        if "design_edit:use" not in base_permissions:
            base_permissions.append("design_edit:use")
    if "backoffice:access" not in base_permissions and role in {UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.ADMIN.value, UserRole.SUPER_ADMIN.value}:
        base_permissions.append("backoffice:access")
    return base_permissions
