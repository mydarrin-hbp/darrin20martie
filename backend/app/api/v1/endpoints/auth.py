from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_db
from app.core.auth import (
    hash_password,
    verify_password,
    create_access_token,
)
from app.models.user import User
from app.schemas.auth import LoginRequest, RegisterRequest

router = APIRouter(prefix="/auth", tags=["Auth"])

# 📝 REGISTER
@router.post("/register")
def register(
    data: RegisterRequest,
    db: Session = Depends(get_db),
):
    # Verificăm dacă emailul este deja înregistrat
    existing_user = db.query(User).filter(User.email == data.email).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    # Creăm un nou utilizator
    new_user = User(
        email=data.email,
        password=hash_password(data.password),
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "User created successfully"}

# 🔐 LOGIN
@router.post("/login")
def login(
    data: LoginRequest,
    db: Session = Depends(get_db),
):
    # Căutăm utilizatorul după email
    user = db.query(User).filter(User.email == data.email).first()

    # Verificăm validitatea credentialelor
    if not user or not verify_password(data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    # Generăm un token de acces
    token = create_access_token({"sub": str(user.id)})

    return {
        "access_token": token,
        "token_type": "bearer",
    }
# app/models/subcategory.py
class SubCategory:
    # definiția clasei aici
    pass
# app/main.py
from app.db.base import Base  # verifică dacă Base este corect definit
