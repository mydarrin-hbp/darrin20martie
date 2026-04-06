class UserResponse(BaseModel):
    id: int
    email: EmailStr
    role: UserRole | str | None
    verification_status: VerificationStatus | str | None

    model_config = ConfigDict(from_attributes=True)    class UserResponse(BaseModel):
        id: int
        email: EmailStr
        role: UserRole | str | None
        verification_status: VerificationStatus | str | None
    
        model_config = ConfigDict(from_attributes=True)