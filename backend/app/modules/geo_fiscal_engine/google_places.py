from __future__ import annotations

import json
import re
import unicodedata
from dataclasses import dataclass
from typing import Any
from urllib.parse import quote_plus
from urllib.request import Request, urlopen

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.modules.geography.models import Country, Locality


GOOGLE_PLACES_AUTOCOMPLETE_URL = "https://places.googleapis.com/v1/places:autocomplete"
GOOGLE_PLACES_DETAILS_URL = "https://places.googleapis.com/v1/places"

COUNTRY_CURRENCY_MAP = {
    "RO": "RON",
    "GR": "EUR",
    "DE": "EUR",
    "FR": "EUR",
    "IT": "EUR",
    "ES": "EUR",
    "BG": "BGN",
    "US": "USD",
    "GB": "GBP",
    "CH": "CHF",
}


@dataclass
class LocationDetails:
    place_id: str | None
    address: str
    country_code: str
    locality_name: str | None
    locality_slug: str | None
    lat: float | None
    lng: float | None
    currency_code: str
    source: str


def _normalize_text(value: str | None) -> str:
    if not value:
        return ""
    normalized = unicodedata.normalize("NFKD", value)
    ascii_only = normalized.encode("ascii", "ignore").decode("ascii")
    return re.sub(r"[^a-z0-9]+", " ", ascii_only.lower()).strip()


def _slugify(value: str | None) -> str | None:
    normalized = _normalize_text(value)
    return normalized.replace(" ", "-") if normalized else None


def _http_get_json(url: str, *, headers: dict[str, str] | None = None, timeout: int = 10) -> dict[str, Any] | list[Any] | None:
    request = Request(url, headers=headers or {})
    try:
        with urlopen(request, timeout=timeout) as response:
            return json.loads(response.read().decode("utf-8"))
    except Exception:
        return None


def _http_post_json(
    url: str,
    *,
    payload: dict[str, Any],
    headers: dict[str, str] | None = None,
    timeout: int = 10,
) -> dict[str, Any] | list[Any] | None:
    final_headers = {"Content-Type": "application/json", **(headers or {})}
    request = Request(url, data=json.dumps(payload).encode("utf-8"), headers=final_headers, method="POST")
    try:
        with urlopen(request, timeout=timeout) as response:
            return json.loads(response.read().decode("utf-8"))
    except Exception:
        return None


def _resolve_currency_code(country_code: str) -> str:
    return COUNTRY_CURRENCY_MAP.get(country_code.upper(), "EUR")


def _fallback_location_from_db(db: Session, address: str, fallback_country_code: str = "RO") -> LocationDetails:
    normalized_address = _normalize_text(address)
    localities = db.execute(select(Locality).where(Locality.is_active.is_(True)).order_by(Locality.id.asc())).scalars().all()
    for locality in localities:
        if any(
            _normalize_text(candidate) in normalized_address
            for candidate in [locality.name_ro, locality.name_en, locality.slug]
            if candidate
        ):
            country = db.get(Country, locality.country_id)
            country_code = country.code.upper() if country else fallback_country_code.upper()
            return LocationDetails(
                place_id=None,
                address=address,
                country_code=country_code,
                locality_name=locality.name_ro,
                locality_slug=locality.slug,
                lat=locality.latitude,
                lng=locality.longitude,
                currency_code=_resolve_currency_code(country_code),
                source="local-db",
            )

    countries = db.execute(select(Country).where(Country.is_active.is_(True)).order_by(Country.id.asc())).scalars().all()
    for country in countries:
        if any(
            _normalize_text(candidate) in normalized_address
            for candidate in [country.code, country.name, country.name_ro, country.name_en, country.slug]
            if candidate
        ):
            return LocationDetails(
                place_id=None,
                address=address,
                country_code=country.code.upper(),
                locality_name=None,
                locality_slug=None,
                lat=None,
                lng=None,
                currency_code=_resolve_currency_code(country.code),
                source="local-db",
            )

    return LocationDetails(
        place_id=None,
        address=address,
        country_code=fallback_country_code.upper(),
        locality_name=None,
        locality_slug=None,
        lat=None,
        lng=None,
        currency_code=_resolve_currency_code(fallback_country_code),
        source="fallback",
    )


def get_place_autocomplete_predictions(query: str) -> list[dict[str, str]]:
    api_key = settings.MAPS_API_KEY or settings.GOOGLE_MAPS_GEOCODING_API_KEY or settings.GOOGLE_API_KEY
    if not api_key or not query.strip():
        return []

    payload = _http_post_json(
        GOOGLE_PLACES_AUTOCOMPLETE_URL,
        payload={"input": query, "includedRegionCodes": ["ro", "gr", "de", "fr", "it", "es", "bg"]},
        headers={
            "X-Goog-Api-Key": api_key,
            "X-Goog-FieldMask": "suggestions.placePrediction.place,suggestions.placePrediction.placeId,suggestions.placePrediction.text",
        },
    )
    if not isinstance(payload, dict):
        return []

    suggestions = []
    for item in payload.get("suggestions", []):
        place_prediction = item.get("placePrediction") or {}
        text = place_prediction.get("text") or {}
        place_id = place_prediction.get("placeId")
        if place_id:
            suggestions.append(
                {
                    "place_id": str(place_id),
                    "description": str(text.get("text") or place_prediction.get("place") or query),
                }
            )
    return suggestions


def get_location_details(
    db: Session,
    *,
    address: str | None = None,
    place_id: str | None = None,
    fallback_country_code: str = "RO",
) -> LocationDetails:
    api_key = settings.MAPS_API_KEY or settings.GOOGLE_MAPS_GEOCODING_API_KEY or settings.GOOGLE_API_KEY

    if api_key and place_id:
        payload = _http_get_json(
            f"{GOOGLE_PLACES_DETAILS_URL}/{quote_plus(place_id)}?fields=id,formattedAddress,addressComponents,location",
            headers={"X-Goog-Api-Key": api_key},
        )
        if isinstance(payload, dict):
            country_code = fallback_country_code.upper()
            locality_name = None
            for component in payload.get("addressComponents", []):
                component_types = set(component.get("types", []))
                if "country" in component_types:
                    country_code = str(component.get("shortText") or fallback_country_code).upper()
                if "locality" in component_types or "administrative_area_level_2" in component_types:
                    locality_name = component.get("longText") or component.get("shortText")
            location = payload.get("location") or {}
            return LocationDetails(
                place_id=str(payload.get("id") or place_id),
                address=str(payload.get("formattedAddress") or address or ""),
                country_code=country_code,
                locality_name=locality_name,
                locality_slug=_slugify(locality_name),
                lat=float(location["latitude"]) if location.get("latitude") is not None else None,
                lng=float(location["longitude"]) if location.get("longitude") is not None else None,
                currency_code=_resolve_currency_code(country_code),
                source="google-places-details",
            )

    if api_key and address:
        payload = _http_get_json(
            f"{settings.GOOGLE_MAPS_GEOCODING_API_URL}?address={quote_plus(address)}&key={quote_plus(api_key)}"
        )
        if isinstance(payload, dict) and payload.get("results"):
            result = payload["results"][0]
            country_code = fallback_country_code.upper()
            locality_name = None
            for component in result.get("address_components", []):
                component_types = set(component.get("types", []))
                if "country" in component_types:
                    country_code = str(component.get("short_name") or fallback_country_code).upper()
                if "locality" in component_types or "administrative_area_level_2" in component_types:
                    locality_name = component.get("long_name") or component.get("short_name")
            geometry = result.get("geometry", {}).get("location", {})
            return LocationDetails(
                place_id=place_id,
                address=str(result.get("formatted_address") or address),
                country_code=country_code,
                locality_name=locality_name,
                locality_slug=_slugify(locality_name),
                lat=float(geometry["lat"]) if geometry.get("lat") is not None else None,
                lng=float(geometry["lng"]) if geometry.get("lng") is not None else None,
                currency_code=_resolve_currency_code(country_code),
                source="google-geocoding",
            )

    return _fallback_location_from_db(db, address or place_id or "", fallback_country_code=fallback_country_code)
