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

    model_config = ConfigDict(from_attributes=True)

    @classmethod
    def from_user(cls, user: Any) -> "UserResponse":
        return cls(
            id=user.id,
            full_name=getattr(user, "full_name", None),
            email=user.email,
            phone=getattr(user, "phone", None),
            city=getattr(user, "city", None),
            role=user.role,
            verification_status=user.verification_status,
            permissions=get_role_permissions(user.role),
        )


def get_role_permissions(role: Any) -> list[str]:
    from app.models.user import ROLE_PERMISSIONS

    if not role:
        return []
    return ROLE_PERMISSIONS.get(str(role), [])
