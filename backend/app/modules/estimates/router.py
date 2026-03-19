from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.modules.estimates.schemas import EstimateRequest, EstimateResponse
from app.modules.estimates.service import calculate_estimate

router = APIRouter(prefix="/estimates", tags=["estimates"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


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