from typing import List, Optional, Union
from datetime import datetime

from sqlalchemy.orm import Session

from app.models.user import User, Role, VerificationStatus
from app.schemas.user import UserCreate, UserUpdate, UserVerify

def get_user(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()

def get_users_by_status(db: Session, status: VerificationStatus) -> List[User]:
    return db.query(User).filter(User.verification_status == status).all()

def verify_user_kyc(db: Session, user_id: int, user_verify: UserVerify) -> Union[User, None, str]:
    db_user = db.query(User).filter(User.id == user_id).first()

    if not db_user:
        return None
    
    # Only update validated_at if status changes to VALIDATED
    if user_verify.verification_status == VerificationStatus.VALIDATED and db_user.verification_status != VerificationStatus.VALIDATED:
        db_user.is_active = True
        db_user.validated_at = datetime.utcnow()
    elif user_verify.verification_status != VerificationStatus.VALIDATED:
        db_user.is_active = False # If rejected or pending again, deactivate
        db_user.validated_at = None # Clear validated_at if not validated

    db_user.verification_status = user_verify.verification_status
    db_user.admin_notes = user_verify.admin_notes
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user