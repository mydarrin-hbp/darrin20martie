from sqlalchemy.orm import Session
from app.models.service import Service
from app.models.user import User, UserRole, VerificationStatus

def check_and_activate_service(db: Session, service_id: int) -> bool:
    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        return False

    valid_partners_count = db.query(User).join(User.services).filter(
        Service.id == service_id,
        User.role == UserRole.PARTNER,
        User.verification_status == VerificationStatus.VALIDATED
    ).count()

    service.is_active = (valid_partners_count >= 3)
    db.commit()
    db.refresh(service)
    
    return service.is_active