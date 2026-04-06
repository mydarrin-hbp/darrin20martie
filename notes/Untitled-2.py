import pytest
from pydantic import BaseModel, ValidationError, ConfigDict
from pydantic import EmailStr

# Define enums if they don't exist in your schemas
from enum import Enum

class UserRole(str, Enum):
    ADMIN = "ADMIN"
    USER = "USER"

class VerificationStatus(str, Enum):
    APPROVED = "APPROVED"
    PENDING = "PENDING"

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    role: UserRole | str | None = None
    verification_status: VerificationStatus | str | None = None

    model_config = ConfigDict(from_attributes=True)
    
    def test_user_response_serialization():
        # Testare cu date valide
        user_data = {
            "id": 1,
            "email": "test@example.com",
            "role": "ADMIN",
            "verification_status": "APPROVED"
        }
        user = UserResponse(**user_data)
        assert user.id == 1
        assert user.email == "test@example.com"
        assert user.role == "ADMIN"
        assert user.verification_status == "APPROVED"
    
    def test_user_response_optional_fields():
        # Testare cu câmpuri opționale None
        user_data = {
            "id": 2,
            "email": "optional@example.com",
            "role": None,
            "verification_status": None
        }
        user = UserResponse(**user_data)
        assert user.role is None
        assert user.verification_status is None
    
    def test_user_response_invalid_data():
        # Testare cu date invalide
        with pytest.raises(ValidationError):
            UserResponse(id="invalid_id", email="not-an-email")