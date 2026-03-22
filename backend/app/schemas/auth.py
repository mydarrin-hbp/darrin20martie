from pydantic import BaseModel, EmailStr

from app.schemas.user import UserRole, VerificationStatus


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    email: EmailStr
    role: UserRole | None
    verification_status: VerificationStatus | None
