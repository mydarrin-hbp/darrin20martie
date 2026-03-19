from pydantic import BaseModel, EmailStr


# 📝 REGISTER
class RegisterRequest(BaseModel):
    email: EmailStr
    password: str


# 🔐 LOGIN
class LoginRequest(BaseModel):
    email: EmailStr
    password: str


# 🔑 TOKEN RESPONSE
class TokenResponse(BaseModel):
    access_token: str
    token_type: str