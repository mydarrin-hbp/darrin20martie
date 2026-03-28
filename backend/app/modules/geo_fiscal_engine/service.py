from __future__ import annotations

from dataclasses import dataclass

from sqlalchemy.orm import Session

from app.modules.geo_fiscal_engine.google_places import (
    LocationDetails,
    get_location_details,
    get_place_autocomplete_predictions,
)
from app.modules.geo_fiscal_engine.vatsense_sync import sync_vat_rates


CURRENCY_SYMBOL_MAP = {
    "RON": "RON",
    "EUR": "EUR",
    "USD": "$",
    "GBP": "GBP",
    "CHF": "CHF",
    "BGN": "BGN",
}


@dataclass
class GeoFiscalContext:
    place_id: str | None
    address: str
    country_code: str
    locality_name: str | None
    locality_slug: str | None
    lat: float | None
    lng: float | None
    currency_code: str
    currency_symbol: str
    vat_percentage: float
    geocode_source: str
    tax_source: str


def resolve_geo_fiscal_context(
    db: Session,
    *,
    target_address: str | None = None,
    place_id: str | None = None,
    service_type: str,
    fallback_country_code: str = "RO",
) -> GeoFiscalContext:
    location: LocationDetails = get_location_details(
        db,
        address=target_address,
        place_id=place_id,
        fallback_country_code=fallback_country_code,
    )
    vat_rates = sync_vat_rates(db, location.country_code)
    vat_percentage = vat_rates.get(service_type.upper(), vat_rates.get("SERVICE", 0.19))
    return GeoFiscalContext(
        place_id=location.place_id,
        address=location.address,
        country_code=location.country_code,
        locality_name=location.locality_name,
        locality_slug=location.locality_slug,
        lat=location.lat,
        lng=location.lng,
        currency_code=location.currency_code,
        currency_symbol=CURRENCY_SYMBOL_MAP.get(location.currency_code, location.currency_code),
        vat_percentage=vat_percentage,
        geocode_source=location.source,
        tax_source="vatsense-sync",
    )


def autocomplete_address(query: str) -> list[dict[str, str]]:
    return get_place_autocomplete_predictions(query)
