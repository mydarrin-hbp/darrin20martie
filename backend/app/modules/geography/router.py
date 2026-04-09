from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_db
from app.core.security import get_current_admin_user
from app.modules.geography.schemas import CountryResponse, LocalityResponse, ZoneResponse
from app.modules.geography.service import get_countries, get_zones, list_localities

router = APIRouter(
    prefix="/geography",
    tags=["geography"],
    dependencies=[Depends(get_current_admin_user)],
)


@router.get("/countries", response_model=list[CountryResponse])
def list_countries(db: Session = Depends(get_db)):
    return get_countries(db)


@router.get("/zones", response_model=list[ZoneResponse])
def list_zones(db: Session = Depends(get_db)):
    return get_zones(db)


@router.get("/localities", response_model=list[LocalityResponse])
def list_public_localities(
    country_id: int | None = None,
    zone_id: int | None = None,
    db: Session = Depends(get_db),
):
    return list_localities(db, country_id=country_id, zone_id=zone_id)
