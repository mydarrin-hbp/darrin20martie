from __future__ import annotations

import json
from urllib.parse import quote_plus
from urllib.request import Request, urlopen

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.price_analysis import TaxRule


DEFAULT_SERVICE_TYPES = ("SERVICE", "LANDSCAPING", "CONSTRUCTION_MATERIAL")
DEFAULT_VAT_RULES = {
    "RO": {"SERVICE": 0.19, "LANDSCAPING": 0.19, "CONSTRUCTION_MATERIAL": 0.19},
    "GR": {"SERVICE": 0.24, "LANDSCAPING": 0.24, "CONSTRUCTION_MATERIAL": 0.24},
}


def _http_get_json(url: str, *, headers: dict[str, str] | None = None, timeout: int = 10):
    request = Request(url, headers=headers or {})
    try:
        with urlopen(request, timeout=timeout) as response:
            return json.loads(response.read().decode("utf-8"))
    except Exception:
        return None


def _extract_standard_rate(payload) -> float | None:
    if not isinstance(payload, dict):
        return None
    candidate = payload.get("standard_rate") or payload.get("standard") or payload.get("rate")
    if isinstance(candidate, str):
        try:
            candidate = float(candidate)
        except ValueError:
            return None
    if isinstance(candidate, (int, float)):
        candidate = float(candidate)
        return candidate / 100.0 if candidate > 1 else candidate
    return None


def _upsert_tax_rule(
    db: Session,
    *,
    country_code: str,
    service_type: str,
    vat_percentage: float,
) -> TaxRule:
    rule = db.execute(
        select(TaxRule).where(
            TaxRule.country_code == country_code,
            TaxRule.locality_slug.is_(None),
            TaxRule.service_type == service_type,
        )
    ).scalar_one_or_none()
    if rule is None:
        rule = TaxRule(
            country_code=country_code,
            locality_slug=None,
            service_type=service_type,
            vat_percentage=vat_percentage,
            is_active=True,
        )
        db.add(rule)
    else:
        rule.vat_percentage = vat_percentage
        rule.is_active = True
    db.flush()
    return rule


def sync_vat_rates(db: Session, country_code: str) -> dict[str, float]:
    normalized_country_code = country_code.upper().strip()
    standard_rate = None

    if settings.VATSENSE_API_KEY:
        payload = _http_get_json(
            f"{settings.VATSENSE_API_URL}?country_code={quote_plus(normalized_country_code)}",
            headers={"x-api-key": settings.VATSENSE_API_KEY},
        )
        standard_rate = _extract_standard_rate(payload)

    if standard_rate is None:
        fallback = DEFAULT_VAT_RULES.get(normalized_country_code, {})
        standard_rate = fallback.get("SERVICE", 0.19)

    result: dict[str, float] = {}
    fallback_by_type = DEFAULT_VAT_RULES.get(normalized_country_code, {})
    for service_type in DEFAULT_SERVICE_TYPES:
        vat_percentage = fallback_by_type.get(service_type, standard_rate)
        _upsert_tax_rule(
            db,
            country_code=normalized_country_code,
            service_type=service_type,
            vat_percentage=vat_percentage,
        )
        result[service_type] = float(vat_percentage)

    db.commit()
    return result
