from pydantic import BaseModel, EmailStr
from typing import Optional
from enum import Enum


# 🔐 ENUMURI (aliniate cu modelul User)
class UserRole(str, Enum):
    ADMIN = "ADMIN"
    PARTNER = "PARTNER"
    CLIENT = "CLIENT"


class VerificationStatus(str, Enum):
    PENDING = "PENDING"
    VERIFIED = "VERIFIED"
    REJECTED = "REJECTED"


# 📦 SCHEME DE BAZĂ
class UserBase(BaseModel):
    email: EmailStr
    full_name: str


# 🧾 CREARE USER
class UserCreate(UserBase):
    password: str


# 🔄 UPDATE USER
class UserUpdate(BaseModel):
    full_name: Optional[str] = None


# 🔐 VERIFICARE USER (BACKOFFICE)
class UserVerify(BaseModel):
    verification_status: VerificationStatus


# 📤 RESPONSE USER
class UserResponse(UserBase):
    id: int
    role: UserRole
    is_active: bool
    verification_status: VerificationStatus

    class Config:
        from_attributes = True
