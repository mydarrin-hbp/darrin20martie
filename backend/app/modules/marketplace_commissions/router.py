from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_db
from app.core.security import get_current_admin_user
from app.modules.marketplace_commissions.schemas import (
    MarketplaceCommissionCreate,
    MarketplaceCommissionResponse,
    MarketplaceCommissionUpdate,
)
from app.modules.marketplace_commissions.service import (
    create_commission,
    delete_commission,
    list_commissions,
    update_commission,
)

router = APIRouter(
    prefix="/backoffice/marketplace-commissions",
    tags=["MarketplaceCommissions"],
    dependencies=[Depends(get_current_admin_user)],
)


@router.get("", response_model=list[MarketplaceCommissionResponse])
def list_commissions_route(db: Session = Depends(get_db)):
    return list_commissions(db)


@router.post("", response_model=MarketplaceCommissionResponse, status_code=status.HTTP_201_CREATED)
def create_commission_route(payload: MarketplaceCommissionCreate, db: Session = Depends(get_db)):
    try:
        return create_commission(db, payload)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.put("/{commission_id}", response_model=MarketplaceCommissionResponse)
def update_commission_route(commission_id: int, payload: MarketplaceCommissionUpdate, db: Session = Depends(get_db)):
    try:
        commission = update_commission(db, commission_id, payload)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    if not commission:
        raise HTTPException(status_code=404, detail="commission_not_found")
    return commission


@router.delete("/{commission_id}")
def delete_commission_route(commission_id: int, db: Session = Depends(get_db)):
    if not delete_commission(db, commission_id):
        raise HTTPException(status_code=404, detail="commission_not_found")
    return {"message": "Commission deleted"}
