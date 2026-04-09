from pydantic import BaseModel, EmailStr

from app.schemas.user import UserRole, VerificationStatus


class RegisterRequest(BaseModel):
    full_name: str | None = None
    email: EmailStr
    phone: str | None = None
    city: str | None = None
    password: str
    role: UserRole = UserRole.CLIENT


class SignupLeadStartRequest(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone: str
    city: str | None = None


class SignupLeadVerifyRequest(BaseModel):
    email: EmailStr
    code: str


class SignupLeadSelectRoleRequest(BaseModel):
    lead_id: int
    role: UserRole


class SignupLeadCompleteRequest(BaseModel):
    lead_id: int
    password: str
    role: UserRole


class SignupLeadResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: EmailStr
    phone: str
    city: str | None = None
    status: str
    selected_role: UserRole | None = None
    phone_verified: bool
    sms_debug_code: str | None = None
    redirect_path: str | None = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user_id: int
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
