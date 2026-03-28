from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.dependencies import get_db
from app.core.security import get_current_admin_user
from app.models.user import User, UserRole
from app.schemas.user import UserResponse, UserUpdate

router = APIRouter(prefix="/admin", tags=["Admin"])


def _require_super_admin(current_admin: User) -> None:
    if current_admin.role != UserRole.SUPER_ADMIN.value:
        raise HTTPException(status_code=403, detail="Super admin access required")


@router.get("/users", response_model=list[UserResponse])
def get_all_users(
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user),
):
    users = db.query(User).all()
    return [UserResponse.from_user(user) for user in users]


@router.get("/users/pending", response_model=list[UserResponse])
def get_pending_users(
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user),
):
    users = db.query(User).filter(User.verification_status == "PENDING").all()
    return [UserResponse.from_user(user) for user in users]


@router.get("/users/{user_id}", response_model=UserResponse)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user),
):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return UserResponse.from_user(user)


@router.put("/users/{user_id}/activate", response_model=UserResponse)
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
    return UserResponse.from_user(user)


@router.put("/users/{user_id}/deactivate", response_model=UserResponse)
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
    return UserResponse.from_user(user)


@router.put("/users/{user_id}/role", response_model=UserResponse)
def update_user_role(
    user_id: int,
    payload: UserUpdate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user),
):
    _require_super_admin(current_admin)

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if payload.role is None:
        raise HTTPException(status_code=400, detail="Role is required")

    if payload.full_name is not None:
        user.full_name = payload.full_name
    if payload.phone is not None:
        user.phone = payload.phone
    if payload.city is not None:
        user.city = payload.city
    user.role = payload.role.value
    if user.role in (UserRole.ADMIN.value, UserRole.SUPER_ADMIN.value, UserRole.PARTNER.value, UserRole.INVESTOR.value) and user.verification_status != "APPROVED":
        user.verification_status = "PENDING"
    db.commit()
    db.refresh(user)
    return UserResponse.from_user(user)


@router.put("/users/{user_id}", response_model=UserResponse)
def update_user_profile(
    user_id: int,
    payload: UserUpdate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user),
):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if payload.full_name is not None:
        user.full_name = payload.full_name
    if payload.email is not None:
        user.email = payload.email
    if payload.phone is not None:
        user.phone = payload.phone
    if payload.city is not None:
        user.city = payload.city

    if payload.role is not None:
        _require_super_admin(current_admin)
        user.role = payload.role.value

    if payload.verification_status is not None:
        user.verification_status = payload.verification_status.value

    db.commit()
    db.refresh(user)
    return UserResponse.from_user(user)
