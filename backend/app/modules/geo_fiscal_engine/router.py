from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.dependencies import get_db
from app.core.security import get_current_admin_user
from app.models.price_analysis import TaxRule
from app.modules.geography.models import Country
from app.modules.geo_fiscal_engine.google_places import get_location_details
from app.modules.geo_fiscal_engine.schemas import TaxRuleCreate, TaxRuleResponse, TaxRuleUpdate
from app.modules.geo_fiscal_engine.service import autocomplete_address


router = APIRouter(prefix="/public/geo-fiscal", tags=["GeoFiscalEngine"])
admin_router = APIRouter(prefix="/backoffice/geo-fiscal", tags=["AdminGeoFiscal"], dependencies=[Depends(get_current_admin_user)])


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


@router.get("/region-status")
def region_status_route(
    request: Request,
    country_code: str | None = Query(default=None),
    db: Session = Depends(get_db),
):
    detected_country = (
        country_code
        or request.headers.get("cf-ipcountry")
        or request.headers.get("x-appengine-country")
        or request.headers.get("x-vercel-ip-country")
        or request.headers.get("cloudfront-viewer-country")
        or request.headers.get("x-country-code")
        or "RO"
    )
    normalized_country = detected_country.strip().upper()
    active_codes = {
        item.code.upper()
        for item in db.execute(select(Country).where(Country.is_active.is_(True))).scalars().all()
        if item.code
    }
    if not active_codes:
        active_codes = {"RO", "IT"}

    supported = normalized_country in active_codes
    return {
        "country_code": normalized_country,
        "supported": supported,
        "message": None
        if supported
        else "My Darrin nu a ajuns inca la tine. Te putem anunta imediat ce lansam in regiunea ta.",
        "partner_signup_href": "/partners/join",
        "investor_signup_href": "/investors",
        "active_markets": sorted(active_codes),
        "source": "ip_header_or_query",
    }


@admin_router.get("/tax-rules", response_model=list[TaxRuleResponse])
def list_tax_rules_route(db: Session = Depends(get_db)):
    return db.execute(select(TaxRule).order_by(TaxRule.country_code, TaxRule.service_type, TaxRule.id)).scalars().all()


@admin_router.post("/tax-rules", response_model=TaxRuleResponse, status_code=status.HTTP_201_CREATED)
def create_tax_rule_route(payload: TaxRuleCreate, db: Session = Depends(get_db)):
    tax_rule = TaxRule(**payload.model_dump())
    db.add(tax_rule)
    try:
        db.commit()
        db.refresh(tax_rule)
        return tax_rule
    except Exception:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Tax rule already exists for this scope")


@admin_router.put("/tax-rules/{tax_rule_id}", response_model=TaxRuleResponse)
def update_tax_rule_route(tax_rule_id: int, payload: TaxRuleUpdate, db: Session = Depends(get_db)):
    tax_rule = db.get(TaxRule, tax_rule_id)
    if tax_rule is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tax rule not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(tax_rule, field, value)
    try:
        db.commit()
        db.refresh(tax_rule)
        return tax_rule
    except Exception:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Tax rule already exists for this scope")


@admin_router.delete("/tax-rules/{tax_rule_id}")
def delete_tax_rule_route(tax_rule_id: int, db: Session = Depends(get_db)):
    tax_rule = db.get(TaxRule, tax_rule_id)
    if tax_rule is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tax rule not found")
    db.delete(tax_rule)
    db.commit()
    return {"message": "Tax rule deleted"}
