from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.dependencies import get_db
from app.modules.geo_fiscal_engine.google_places import get_location_details
from app.modules.geo_fiscal_engine.service import autocomplete_address


router = APIRouter(prefix="/public/geo-fiscal", tags=["GeoFiscalEngine"])


@router.get("/autocomplete")
def autocomplete_route(
    q: str = Query(min_length=2),
):
    return {"predictions": autocomplete_address(q)}


@router.get("/place-details")
def place_details_route(
    place_id: str | None = Query(default=None),
    address: str | None = Query(default=None),
    db: Session = Depends(get_db),
):
    details = get_location_details(db, address=address, place_id=place_id)
    return {
        "place_id": details.place_id,
        "address": details.address,
        "country_code": details.country_code,
        "locality_name": details.locality_name,
        "locality_slug": details.locality_slug,
        "lat": details.lat,
        "lng": details.lng,
        "currency_code": details.currency_code,
        "source": details.source,
    }
