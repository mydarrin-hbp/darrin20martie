from enum import Enum

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
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    email: EmailStr | None = None
    role: UserRole | None = None
    verification_status: VerificationStatus | None = None


class UserVerify(BaseModel):
    verification_status: VerificationStatus


class UserResponse(BaseModel):
    id: int
    email: EmailStr
    role: UserRole | str | None
    verification_status: VerificationStatus | str | None

    model_config = ConfigDict(from_attributes=True)
