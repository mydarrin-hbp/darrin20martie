from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_db
from app.core.security import get_current_admin_user
from app.modules.activities.schemas import (
    ActivityResponse,
    ServiceActivityResponse,
    UnitResponse,
)
from app.modules.activities.service import (
    get_activities,
    get_service_activities,
    get_units,
)

router = APIRouter(
    prefix="/activities",
    tags=["activities"],
    dependencies=[Depends(get_current_admin_user)],
)


@router.get("/units", response_model=list[UnitResponse])
def list_units(db: Session = Depends(get_db)):
    return get_units(db)


@router.get("", response_model=list[ActivityResponse])
def list_activities(db: Session = Depends(get_db)):
    return get_activities(db)


@router.get("/service-links", response_model=list[ServiceActivityResponse])
def list_service_activities(db: Session = Depends(get_db)):
    return get_service_activities(db)
