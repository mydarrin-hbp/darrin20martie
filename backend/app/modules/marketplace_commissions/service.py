from __future__ import annotations

from sqlalchemy.orm import Session

from app.models.marketplace import MarketplaceCommission
from app.modules.marketplace_commissions.schemas import MarketplaceCommissionCreate, MarketplaceCommissionUpdate


def list_commissions(db: Session) -> list[MarketplaceCommission]:
    return db.query(MarketplaceCommission).order_by(MarketplaceCommission.category.asc()).all()


def create_commission(db: Session, payload: MarketplaceCommissionCreate) -> MarketplaceCommission:
    commission = MarketplaceCommission(
        category=payload.category.upper(),
        min_percentage=payload.min_percentage,
        max_percentage=payload.max_percentage,
        is_active=payload.is_active,
    )
    if commission.min_percentage > commission.max_percentage:
        raise ValueError("min_greater_than_max")
    db.add(commission)
    db.commit()
    db.refresh(commission)
    return commission


def update_commission(db: Session, commission_id: int, payload: MarketplaceCommissionUpdate) -> MarketplaceCommission | None:
    commission = db.get(MarketplaceCommission, commission_id)
    if not commission:
        return None
    if payload.min_percentage is not None:
        commission.min_percentage = payload.min_percentage
    if payload.max_percentage is not None:
        commission.max_percentage = payload.max_percentage
    if payload.is_active is not None:
        commission.is_active = payload.is_active
    if commission.min_percentage > commission.max_percentage:
        raise ValueError("min_greater_than_max")
    db.add(commission)
    db.commit()
    db.refresh(commission)
    return commission


def delete_commission(db: Session, commission_id: int) -> bool:
    commission = db.get(MarketplaceCommission, commission_id)
    if not commission:
        return False
    db.delete(commission)
    db.commit()
    return True
