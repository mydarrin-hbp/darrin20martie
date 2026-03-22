from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_db
from app.core.security import get_current_admin_user
from app.modules.estimates.schemas import EstimateRequest, EstimateResponse
from app.modules.estimates.service import calculate_estimate

router = APIRouter(
    prefix="/estimates",
    tags=["estimates"],
    dependencies=[Depends(get_current_admin_user)],
)


@router.post("/calculate", response_model=EstimateResponse)
def calculate(data: EstimateRequest, db: Session = Depends(get_db)):
    return calculate_estimate(
        db=db,
        service_id=data.service_id,
        quantity=data.quantity,
        unit_price=data.unit_price,
        zone_id=data.zone_id,
        urgency=data.urgency,
    )
