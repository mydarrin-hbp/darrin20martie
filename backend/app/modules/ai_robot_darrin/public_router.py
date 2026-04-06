from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from fastapi import Depends
from app.core.dependencies import get_db
from app.models.service import Service
from app.modules.geography.models import Country, Locality, Zone
from app.modules.ai_robot_darrin.service import interpret_request


class PublicAIRobotInterpretRequest(BaseModel):
    message: str = Field(min_length=3, max_length=1000)
    service_slug: str | None = None
    country_code: str | None = None
    zone_slug: str | None = None
    locality_slug: str | None = None
    currency: str | None = None
    legislation_code: str | None = None


router = APIRouter(prefix="/ai/public", tags=["ai-robot-darrin-public"])


@router.post("/interpret")
def interpret_public(data: PublicAIRobotInterpretRequest, db: Session = Depends(get_db)):
    service = None
    if data.service_slug:
        service = db.execute(select(Service).where(Service.slug == data.service_slug)).scalar_one_or_none()

    if service is None:
        service = db.execute(select(Service).order_by(Service.id)).scalar_one_or_none()

    if service is None:
        raise HTTPException(status_code=400, detail="Nu exista servicii active in catalog.")

    country = None
    if data.country_code:
        country = db.execute(select(Country).where(Country.code == data.country_code)).scalar_one_or_none()
    if country is None:
        country = db.execute(select(Country).order_by(Country.id)).scalar_one_or_none()
    if country is None:
        raise HTTPException(status_code=400, detail="Nu exista tari configurate.")

    zone = None
    if data.zone_slug:
        zone = db.execute(select(Zone).where(Zone.slug == data.zone_slug, Zone.country_id == country.id)).scalar_one_or_none()
    if zone is None:
        zone = db.execute(select(Zone).where(Zone.country_id == country.id).order_by(Zone.id)).scalar_one_or_none()
    if zone is None:
        raise HTTPException(status_code=400, detail="Nu exista zone configurate.")

    locality = None
    if data.locality_slug:
        locality = db.execute(
            select(Locality).where(Locality.slug == data.locality_slug, Locality.country_id == country.id)
        ).scalar_one_or_none()
    if locality is None:
        locality = db.execute(
            select(Locality).where(Locality.country_id == country.id).order_by(Locality.id)
        ).scalar_one_or_none()

    result = interpret_request(
        db,
        service_id=service.id,
        country_id=country.id,
        zone_id=zone.id,
        locality_id=locality.id if locality else None,
        currency=data.currency or country.currency,
        legislation_code=data.legislation_code or country.code,
        message=data.message,
        urgency=None,
        service_level=None,
        resources=[],
    )

    return {
        "service": {"id": service.id, "slug": service.slug, "name": service.name},
        "location": {
            "country": country.code,
            "zone": zone.slug,
            "locality": locality.slug if locality else None,
        },
        "interpreted_summary": result["interpreted_summary"],
        "interpreted_urgency": result["interpreted_urgency"],
        "interpreted_service_level": result["interpreted_service_level"].value,
        "recommended_deviz_level": result["recommended_deviz_level"],
        "client_explanation": result["client_explanation"],
        "follow_up_questions": result["follow_up_questions"],
        "price_breakdown": result.get("price_breakdown"),
        "provider": result["provider"],
        "used_fallback": result["used_fallback"],
    }
