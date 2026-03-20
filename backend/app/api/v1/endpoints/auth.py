from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.auth import create_access_token, hash_password, verify_password
from app.core.dependencies import get_db
from app.models.user import User, UserRole
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse
from app.schemas.user import UserResponse

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", response_model=UserResponse)
def register(
    data: RegisterRequest,
    db: Session = Depends(get_db),
):
    existing_user = db.query(User).filter(User.email == data.email).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    new_user = User(
        email=data.email,
        hashed_password=hash_password(data.password),
        role=UserRole.CLIENT.value,
        verification_status="PENDING",
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "id": new_user.id,
        "email": new_user.email,
        "role": new_user.role,
        "verification_status": new_user.verification_status,
    }


@router.post("/login", response_model=TokenResponse)
def login(
    data: LoginRequest,
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.email == data.email).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    if not verify_password(data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    token = create_access_token({"sub": str(user.id)})

    return {
        "access_token": token,
        "token_type": "bearer",
    }
