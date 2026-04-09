from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_db
from app.core.security import get_current_admin_user
from app.modules.cost_engine.schemas import CostDraftRequest, CostDraftResponse
from app.modules.cost_engine.service import calculate_draft

router = APIRouter(
    prefix="/cost",
    tags=["cost-engine"],
    dependencies=[Depends(get_current_admin_user)],
)


@router.post("/calculate-draft", response_model=CostDraftResponse)
def calculate_cost_draft(
    data: CostDraftRequest,
    db: Session = Depends(get_db),
):
    result = calculate_draft(db, data)

    if result == "service_not_found":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not found")
    if result == "country_not_found":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Country not found")
    if result == "zone_not_found":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Zone not found")
    if result == "zone_country_mismatch":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Zone does not belong to the selected country",
        )
    if result == "locality_not_found":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Locality not found")
    if result == "locality_country_mismatch":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Locality does not belong to the selected country")
    if result == "locality_zone_mismatch":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Locality does not belong to the selected zone")
    if result == "price_config_not_found":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Manual price configuration not found for the selected context",
        )

    return result
