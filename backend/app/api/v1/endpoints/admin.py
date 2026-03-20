from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.dependencies import get_db
from app.core.security import get_current_admin_user
from app.models.user import User
from app.schemas.user import UserResponse

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/users", response_model=list[UserResponse])
def get_all_users(
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user),
):
    users = db.query(User).all()
    return [
        UserResponse(
            id=user.id,
            email=user.email,
            role=user.role,
            verification_status=user.verification_status,
        )
        for user in users
    ]


@router.get("/users/pending", response_model=list[UserResponse])
def get_pending_users(
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user),
):
    users = db.query(User).filter(User.verification_status == "PENDING").all()
    return [
        UserResponse(
            id=user.id,
            email=user.email,
            role=user.role,
            verification_status=user.verification_status,
        )
        for user in users
    ]


@router.get("/users/{user_id}", response_model=UserResponse)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user),
):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return UserResponse(
        id=user.id,
        email=user.email,
        role=user.role,
        verification_status=user.verification_status,
    )


@router.put("/users/{user_id}/activate")
def activate_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user),
):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.verification_status = "APPROVED"
    db.commit()
    db.refresh(user)

    return {"message": "User activated successfully"}


@router.put("/users/{user_id}/deactivate")
def deactivate_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user),
):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.verification_status = "REJECTED"
    db.commit()
    db.refresh(user)

    return {"message": "User deactivated successfully"}
