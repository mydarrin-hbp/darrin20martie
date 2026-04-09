from __future__ import annotations

import asyncio
import json
import re
import unicodedata
from collections import defaultdict
from datetime import UTC, datetime
from typing import Any, AsyncIterator

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.service import Service
from app.modules.orders.models import Order
from app.modules.cost_engine.models import AdminPriceConfig
from app.modules.cost_engine.schemas import CostDraftRequest, PartialAvailabilityResponse, ServiceLevel
from app.modules.cost_engine.service import calculate_draft
from app.modules.deviz_engine.schemas import DevizLevelName
from app.modules.deviz_engine.service import _resolve_level_rules, _select_recommended_level
from app.modules.geo_fiscal_engine.service import resolve_geo_fiscal_context
from app.modules.geography.models import Country, Locality, Zone
from app.modules.site_content.models import SiteContentPage
from app.modules.sync.schemas import (
    OrderStatusSnapshotResponse,
    OrderStatusUpdateRequest,
    PublicCatalogPriceLevelResponse,
    PublicCatalogPriceResponse,
    PublicPriceBreakdownResponse,
    PublicSyncManifestResponse,
)
from app.schemas.price_analysis import RecipeLevelName, ResourceType
from app.services.catalog_service import get_service_by_slug
from app.services.price_analysis_service import get_recipe_rows_for_activities, get_service_recipe_activities


_sync_subscribers: dict[str, list[asyncio.Queue[dict[str, Any]]]] = defaultdict(list)
_order_status_state: dict[str, OrderStatusSnapshotResponse] = {}


def _utcnow() -> datetime:
    return datetime.now(UTC)


def _serialize_sse(event_name: str, data: dict[str, Any]) -> bytes:
    payload = json.dumps(data, default=str, ensure_ascii=True)
    return f"event: {event_name}\ndata: {payload}\n\n".encode("utf-8")


def publish_sync_event(channel: str, event_name: str, payload: dict[str, Any]) -> None:
    message = {
        "event": event_name,
        "payload": payload,
        "sent_at": _utcnow().isoformat(),
    }
    for queue in list(_sync_subscribers.get(channel, [])):
        try:
            queue.put_nowait(message)
        except asyncio.QueueFull:
            continue


async def stream_sync_events(channel: str, initial_payload: dict[str, Any] | None = None) -> AsyncIterator[bytes]:
    queue: asyncio.Queue[dict[str, Any]] = asyncio.Queue(maxsize=50)
    _sync_subscribers[channel].append(queue)

    try:
        if initial_payload is not None:
            yield _serialize_sse("snapshot", initial_payload)

        while True:
            try:
                message = await asyncio.wait_for(queue.get(), timeout=20)
                yield _serialize_sse(message["event"], message["payload"])
            except TimeoutError:
                yield b": keep-alive\n\n"
    finally:
        subscribers = _sync_subscribers.get(channel, [])
        if queue in subscribers:
            subscribers.remove(queue)


def get_public_sync_manifest(db: Session) -> PublicSyncManifestResponse:
    content_updated_at = db.execute(select(func.max(SiteContentPage.updated_at))).scalar_one_or_none()
    tracked_pages = [row[0] for row in db.execute(select(SiteContentPage.slug).order_by(SiteContentPage.slug.asc())).all()]
    content_version = content_updated_at.isoformat() if content_updated_at else "bootstrap"
    return PublicSyncManifestResponse(
        content_version=content_version,
        content_updated_at=content_updated_at,
        tracked_pages=tracked_pages,
    )


def publish_site_content_change(page: SiteContentPage) -> None:
    publish_sync_event(
        "site-content",
        "site_content.updated",
        {
            "slug": page.slug,
            "title": page.title,
            "status": page.status,
            "updated_at": page.updated_at.isoformat() if page.updated_at else _utcnow().isoformat(),
        },
    )


def _normalize_geo_text(value: str | None) -> str:
    if not value:
        return ""
    normalized = unicodedata.normalize("NFKD", value)
    ascii_only = normalized.encode("ascii", "ignore").decode("ascii")
    return re.sub(r"[^a-z0-9]+", " ", ascii_only.lower()).strip()


def _matches_geo_fragment(haystack: str, *candidates: str | None) -> bool:
    for candidate in candidates:
        normalized_candidate = _normalize_geo_text(candidate)
        if normalized_candidate and normalized_candidate in haystack:
            return True
    return False


def _resolve_geo_context_from_target_address(
    db: Session,
    *,
    target_address: str,
    fallback_country_code: str | None = None,
) -> tuple[Country, Zone, Locality | None] | None:
    normalized_address = _normalize_geo_text(target_address)
    if not normalized_address:
        return None

    countries = db.execute(
        select(Country).where(Country.is_active.is_(True)).order_by(Country.id.asc())
    ).scalars().all()
    matched_country = None
    for country in countries:
        if _matches_geo_fragment(normalized_address, country.name, country.name_ro, country.name_en, country.slug, country.code):
            matched_country = country
            break
    if matched_country is None:
        preferred_country_code = (fallback_country_code or "RO").upper()
        matched_country = next((item for item in countries if item.code.upper() == preferred_country_code), None)
    if matched_country is None:
        return None

    localities = db.execute(
        select(Locality)
        .where(Locality.country_id == matched_country.id, Locality.is_active.is_(True))
        .order_by(Locality.id.asc())
    ).scalars().all()
    for locality in localities:
        if _matches_geo_fragment(normalized_address, locality.name_ro, locality.name_en, locality.slug):
            zone = db.get(Zone, locality.zone_id)
            if zone and zone.is_active:
                return matched_country, zone, locality

    zones = db.execute(
        select(Zone)
        .where(Zone.country_id == matched_country.id, Zone.is_active.is_(True))
        .order_by(Zone.id.asc())
    ).scalars().all()
    for zone in zones:
        if _matches_geo_fragment(normalized_address, zone.name, zone.name_ro, zone.name_en, zone.slug):
            return matched_country, zone, None

    return None


def _resolve_geo_context(
    db: Session,
    *,
    country_code: str | None = None,
    zone_slug: str | None = None,
    locality_slug: str | None = None,
    target_address: str | None = None,
) -> tuple[Country, Zone, Locality | None]:
    if target_address:
        resolved_from_target = _resolve_geo_context_from_target_address(
            db,
            target_address=target_address,
            fallback_country_code=country_code,
        )
        if resolved_from_target is not None:
            return resolved_from_target

    preferred_country_code = (country_code or "RO").upper()
    country_query = select(Country).where(Country.is_active.is_(True)).order_by(
        (func.upper(Country.code) == preferred_country_code).desc(),
        Country.id.asc(),
    )
    if country_code:
        country_query = country_query.where(func.upper(Country.code) == preferred_country_code)
    country = db.execute(country_query).scalars().first()
    if not country:
        raise LookupError("country_not_found")

    zone_query = (
        select(Zone)
        .where(Zone.country_id == country.id, Zone.is_active.is_(True))
        .order_by(Zone.id.asc())
    )
    if zone_slug:
        zone_query = zone_query.where(Zone.slug == zone_slug)
    zone = db.execute(zone_query).scalars().first()
    if not zone:
        raise LookupError("zone_not_found")

    locality = None
    if locality_slug:
        locality = db.execute(
            select(Locality).where(
                Locality.country_id == country.id,
                Locality.zone_id == zone.id,
                Locality.slug == locality_slug,
                Locality.is_active.is_(True),
            )
        ).scalars().first()
        if not locality:
            raise LookupError("locality_not_found")

    return country, zone, locality


def _build_delivery_badge(lead_time_days: int | None) -> str | None:
    if lead_time_days is None:
        return None
    if lead_time_days <= 1:
        return "Livrare rapida"
    if lead_time_days <= 2:
        return "Livrare 24-48h"
    return f"Livrare in {lead_time_days} zile"


def _build_minimum_order_note(minimum_order_applied: bool) -> str | None:
    if not minimum_order_applied:
        return None
    return "Acesta este tariful minim care acopera deplasarea si logistica pentru zona dvs."


def _resolve_public_currency(
    *,
    country_code: str,
    fallback_currency: str | None,
    geo_fiscal_context: Any | None,
) -> tuple[str, str]:
    currency = fallback_currency or country_code
    symbol = fallback_currency or country_code
    if geo_fiscal_context and geo_fiscal_context.country_code == country_code:
        currency = geo_fiscal_context.currency_code or currency
        symbol = geo_fiscal_context.currency_symbol or currency
    return currency, symbol


def _build_public_unavailability_message(reason: str) -> str:
    messages = {
        "price_config_not_found": "Pretul nu este configurat inca pentru aceasta zona.",
        "resource_unavailable": "Serviciul este indisponibil temporar in zona selectata.",
        "partial_available": "Serviciul este disponibil partial si necesita validare operationala.",
    }
    return messages.get(reason, "Momentan nu putem calcula pretul final pentru acest serviciu.")


def _build_catalog_unavailable_response(
    *,
    service: Service,
    country: Country,
    zone: Zone,
    locality: Locality | None,
    fallback_currency: str | None,
    geo_fiscal_context: Any | None,
    status_value: str,
    partial_availability: dict[str, Any] | None = None,
) -> PublicCatalogPriceResponse:
    currency, currency_symbol = _resolve_public_currency(
        country_code=country.code,
        fallback_currency=fallback_currency,
        geo_fiscal_context=geo_fiscal_context,
    )
    return PublicCatalogPriceResponse(
        slug=service.slug,
        service_name=service.name,
        currency=currency,
        currency_symbol=currency_symbol,
        legislation_code=country.code,
        country_code=country.code,
        zone_slug=zone.slug,
        locality_slug=locality.slug if locality else None,
        availability_status=status_value,
        partial_availability=partial_availability
        or {
            "status": status_value,
            "message": _build_public_unavailability_message(status_value),
        },
        minimum_order_applied=False,
        minimum_order_note=None,
        recommended_level=DevizLevelName.ARGINT.value,
        base_gross_total=0,
        delivery_badge=None,
        delivery_lead_time_days=None,
        levels=[],
        last_calculated_at=_utcnow(),
    )


def _build_breakdown_unavailable_response(
    *,
    service: Service,
    country: Country,
    zone: Zone,
    locality: Locality | None,
    fallback_currency: str | None,
    geo_fiscal_context: Any | None,
    status_value: str,
    service_level: ServiceLevel,
    recipe_level: RecipeLevelName,
    urgency: bool,
    partial_availability: dict[str, Any] | None = None,
) -> PublicPriceBreakdownResponse:
    currency, currency_symbol = _resolve_public_currency(
        country_code=country.code,
        fallback_currency=fallback_currency,
        geo_fiscal_context=geo_fiscal_context,
    )
    return PublicPriceBreakdownResponse(
        slug=service.slug,
        service_name=service.name,
        currency=currency,
        currency_symbol=currency_symbol,
        legislation_code=country.code,
        country_code=country.code,
        zone_slug=zone.slug,
        locality_slug=locality.slug if locality else None,
        availability_status=status_value,
        partial_availability=partial_availability
        or {
            "status": status_value,
            "message": _build_public_unavailability_message(status_value),
        },
        minimum_order_applied=False,
        minimum_order_note=None,
        service_level=service_level.value,
        recipe_level=recipe_level.value,
        urgency=urgency,
        distributie_furnizori=0,
        cost_direct=0,
        cost_regie=0,
        mentenanta_platforma=0,
        venit_platforma=0,
        garantie_buna_executie=0,
        taxe_si_garantii=0,
        tva=0,
        total_facturabil=0,
        package_label=None,
        package_unit=None,
        included_components=[],
        delivery_badge=None,
        delivery_lead_time_days=None,
        last_calculated_at=_utcnow(),
    )


def _infer_sync_service_type(service: Service) -> str:
    normalized_slug = (service.slug or "").lower()
    if "gazon" in normalized_slug or "grass" in normalized_slug or "landscape" in normalized_slug:
        return "LANDSCAPING"
    if "beton" in normalized_slug or "materiale" in normalized_slug:
        return "CONSTRUCTION_MATERIAL"
    return "SERVICE"


def _resolve_service_package_metadata(db: Session, service: Service) -> dict[str, Any]:
    activities = get_service_recipe_activities(db, service.id)
    recipe_rows = get_recipe_rows_for_activities(db, [activity.id for activity in activities])
    resources = [recipe.resource for recipe in recipe_rows]

    included_components: list[str] = []
    material_units: list[str] = []
    lead_times: list[int] = []

    for resource in resources:
        resource_type = (resource.resource_type or "").upper()
        if resource_type == ResourceType.MATERIAL.value:
            included_components.append("Beton")
            material_units.append(resource.unit)
        elif resource_type == ResourceType.TRANSPORT.value:
            included_components.append("Transport")
        elif resource_type == ResourceType.EQUIPMENT.value:
            included_components.append("Pompa")
        elif resource_type == ResourceType.LABOR.value:
            included_components.append("Executie")
        if resource.lead_time_days is not None:
            lead_times.append(resource.lead_time_days)

    unique_components = list(dict.fromkeys(included_components))
    has_delivery_bundle = any(component in unique_components for component in ("Beton", "Transport", "Pompa"))
    lead_time_days = min(lead_times) if lead_times else None

    return {
        "package_label": "Pachet de livrare" if has_delivery_bundle else "Pachet de servicii",
        "package_unit": material_units[0] if material_units else "serviciu",
        "included_components": unique_components,
        "delivery_lead_time_days": lead_time_days,
        "delivery_badge": _build_delivery_badge(lead_time_days),
    }


def get_public_catalog_price(
    db: Session,
    slug: str,
    *,
    country_code: str | None = None,
    zone_slug: str | None = None,
    locality_slug: str | None = None,
    target_address: str | None = None,
    place_id: str | None = None,
    requested_quantity: float | None = None,
    urgency: bool = False,
) -> PublicCatalogPriceResponse | str | None:
    service = get_service_by_slug(db, slug)
    if not service:
        return None

    geo_fiscal_context = None
    resolved_country_code = country_code
    if target_address or place_id:
        geo_fiscal_context = resolve_geo_fiscal_context(
            db,
            target_address=target_address,
            place_id=place_id,
            service_type=_infer_sync_service_type(service),
            fallback_country_code=country_code or "RO",
        )
        resolved_country_code = geo_fiscal_context.country_code

    try:
        country, zone, locality = _resolve_geo_context(
            db,
            country_code=resolved_country_code,
            zone_slug=zone_slug,
            locality_slug=locality_slug,
            target_address=target_address,
        )
    except LookupError:
        country, zone, locality = _resolve_geo_context(
            db,
            country_code=country_code,
            zone_slug=zone_slug,
            locality_slug=locality_slug,
            target_address=target_address,
        )

    pricing_config = db.execute(
        select(AdminPriceConfig)
        .where(
            AdminPriceConfig.service_id == service.id,
            AdminPriceConfig.country_id == country.id,
            AdminPriceConfig.is_active.is_(True),
        )
        .order_by(
            (AdminPriceConfig.zone_id == zone.id).desc(),
            AdminPriceConfig.zone_id.asc().nullsfirst(),
            AdminPriceConfig.id.asc(),
        )
    ).scalars().first()
    if not pricing_config:
        return _build_catalog_unavailable_response(
            service=service,
            country=country,
            zone=zone,
            locality=locality,
            fallback_currency=country.code,
            geo_fiscal_context=geo_fiscal_context,
            status_value="resource_unavailable",
            partial_availability={
                "status": "resource_unavailable",
                "message": _build_public_unavailability_message("price_config_not_found"),
            },
        )

    if pricing_config.zone_id and pricing_config.zone_id != zone.id:
        configured_zone = db.get(Zone, pricing_config.zone_id)
        if configured_zone:
            zone = configured_zone

    level_rules = _resolve_level_rules(db, service_id=service.id, country_id=country.id)
    raw_cost_results: dict[DevizLevelName, Any] = {}

    for level_name in (
        DevizLevelName.BRONZ,
        DevizLevelName.ARGINT,
        DevizLevelName.AUR,
        DevizLevelName.PLATINUM,
    ):
        result = calculate_draft(
            db,
            CostDraftRequest(
                service_id=service.id,
                country_id=country.id,
                zone_id=zone.id,
                locality_id=locality.id if locality else None,
                currency=pricing_config.currency,
                legislation_code=pricing_config.legislation_code,
                urgency=urgency,
                service_level=ServiceLevel.STANDARD,
                recipe_level=RecipeLevelName(level_name.value),
                requested_quantity=requested_quantity,
                target_address=target_address,
                activity_ids=[],
                resources=[],
            ),
        )
        if isinstance(result, str):
            return _build_catalog_unavailable_response(
                service=service,
                country=country,
                zone=zone,
                locality=locality,
                fallback_currency=pricing_config.currency,
                geo_fiscal_context=geo_fiscal_context,
                status_value="resource_unavailable",
                partial_availability={
                    "status": "resource_unavailable",
                    "message": _build_public_unavailability_message(result),
                },
            )
        if isinstance(result, PartialAvailabilityResponse):
            return _build_catalog_unavailable_response(
                service=service,
                country=country,
                zone=zone,
                locality=locality,
                fallback_currency=pricing_config.currency,
                geo_fiscal_context=geo_fiscal_context,
                status_value=result.status,
                partial_availability=result.model_dump(mode="json"),
            )
        raw_cost_results[level_name] = result

    recommended_level = _select_recommended_level(
        urgency,
        raw_cost_results[DevizLevelName.ARGINT].calculation.gross_total,
    )
    package_meta = _resolve_service_package_metadata(db, service)

    levels: list[PublicCatalogPriceLevelResponse] = []
    for rule in level_rules:
        cost_result = raw_cost_results[rule["level_name"]]
        multiplier = rule["multiplier"]
        levels.append(
            PublicCatalogPriceLevelResponse(
                level_name=rule["level_name"].value,
                label=rule["label"],
                description=rule["description"],
                net_total=round(cost_result.calculation.net_total * multiplier, 2),
                gross_total=round(cost_result.calculation.gross_total * multiplier, 2),
                recommended=rule["level_name"] == recommended_level,
                sort_order=rule["sort_order"],
            )
        )

    recommended_result = raw_cost_results[recommended_level]
    base = recommended_result.calculation
    response_currency, response_currency_symbol = _resolve_public_currency(
        country_code=country.code,
        fallback_currency=pricing_config.currency,
        geo_fiscal_context=geo_fiscal_context,
    )
    return PublicCatalogPriceResponse(
        slug=service.slug,
        service_name=service.name,
        currency=response_currency,
        currency_symbol=response_currency_symbol,
        legislation_code=pricing_config.legislation_code,
        country_code=country.code,
        zone_slug=zone.slug,
        locality_slug=locality.slug if locality else None,
        availability_status="available",
        partial_availability=None,
        minimum_order_applied=bool(recommended_result.minimum_order_applied),
        minimum_order_note=_build_minimum_order_note(bool(recommended_result.minimum_order_applied)),
        recommended_level=recommended_level.value,
        base_gross_total=round(base.gross_total, 2),
        delivery_badge=package_meta["delivery_badge"],
        delivery_lead_time_days=package_meta["delivery_lead_time_days"],
        levels=sorted(levels, key=lambda item: item.sort_order),
        last_calculated_at=_utcnow(),
    )


def syncPublicPrices(
    db: Session,
    slug: str,
    *,
    country_code: str | None = None,
    zone_slug: str | None = None,
    locality_slug: str | None = None,
    target_address: str | None = None,
    place_id: str | None = None,
    requested_quantity: float | None = None,
    urgency: bool = False,
    service_level: ServiceLevel = ServiceLevel.STANDARD,
    recipe_level: RecipeLevelName = RecipeLevelName.ARGINT,
) -> PublicPriceBreakdownResponse | str | None:
    service = get_service_by_slug(db, slug)
    if not service:
        return None

    geo_fiscal_context = None
    resolved_country_code = country_code
    if target_address or place_id:
        geo_fiscal_context = resolve_geo_fiscal_context(
            db,
            target_address=target_address,
            place_id=place_id,
            service_type=_infer_sync_service_type(service),
            fallback_country_code=country_code or "RO",
        )
        resolved_country_code = geo_fiscal_context.country_code

    try:
        country, zone, locality = _resolve_geo_context(
            db,
            country_code=resolved_country_code,
            zone_slug=zone_slug,
            locality_slug=locality_slug,
            target_address=target_address,
        )
    except LookupError:
        country, zone, locality = _resolve_geo_context(
            db,
            country_code=country_code,
            zone_slug=zone_slug,
            locality_slug=locality_slug,
            target_address=target_address,
        )

    pricing_config = db.execute(
        select(AdminPriceConfig)
        .where(
            AdminPriceConfig.service_id == service.id,
            AdminPriceConfig.country_id == country.id,
            AdminPriceConfig.is_active.is_(True),
        )
        .order_by(
            (AdminPriceConfig.zone_id == zone.id).desc(),
            AdminPriceConfig.zone_id.asc().nullsfirst(),
            AdminPriceConfig.id.asc(),
        )
    ).scalars().first()
    if not pricing_config:
        return _build_breakdown_unavailable_response(
            service=service,
            country=country,
            zone=zone,
            locality=locality,
            fallback_currency=country.code,
            geo_fiscal_context=geo_fiscal_context,
            status_value="resource_unavailable",
            service_level=service_level,
            recipe_level=recipe_level,
            urgency=urgency,
            partial_availability={
                "status": "resource_unavailable",
                "message": _build_public_unavailability_message("price_config_not_found"),
            },
        )

    if pricing_config.zone_id and pricing_config.zone_id != zone.id:
        configured_zone = db.get(Zone, pricing_config.zone_id)
        if configured_zone:
            zone = configured_zone

    draft = calculate_draft(
        db,
        CostDraftRequest(
            service_id=service.id,
            country_id=country.id,
            zone_id=zone.id,
            locality_id=locality.id if locality else None,
            currency=pricing_config.currency,
            legislation_code=pricing_config.legislation_code,
            urgency=urgency,
            service_level=service_level,
            recipe_level=recipe_level,
            requested_quantity=requested_quantity,
            target_address=target_address,
            activity_ids=[],
            resources=[],
        ),
    )
    if isinstance(draft, str):
        return _build_breakdown_unavailable_response(
            service=service,
            country=country,
            zone=zone,
            locality=locality,
            fallback_currency=pricing_config.currency,
            geo_fiscal_context=geo_fiscal_context,
            status_value="resource_unavailable",
            service_level=service_level,
            recipe_level=recipe_level,
            urgency=urgency,
            partial_availability={
                "status": "resource_unavailable",
                "message": _build_public_unavailability_message(draft),
            },
        )
    if isinstance(draft, PartialAvailabilityResponse):
        return _build_breakdown_unavailable_response(
            service=service,
            country=country,
            zone=zone,
            locality=locality,
            fallback_currency=pricing_config.currency,
            geo_fiscal_context=geo_fiscal_context,
            status_value=draft.status,
            service_level=service_level,
            recipe_level=recipe_level,
            urgency=urgency,
            partial_availability=draft.model_dump(mode="json"),
        )
    package_meta = _resolve_service_package_metadata(db, service)

    direct_cost = round(draft.calculation.cost_direct_total, 2)
    maintenance_cost = round(draft.calculation.platform_maintenance_value, 2)
    platform_commission = round(draft.calculation.mydarrin_platform_value, 2)
    general_management_fee = round(getattr(draft.calculation, "darrin_management_fee_value", 0.0), 2)
    insurance_cost = round(getattr(draft.calculation, "insurance_premium_value", 0.0), 2)
    guarantee_cost = round(getattr(draft.calculation, "escrow_retention_value", 0.0), 2)
    vat_cost = round(draft.calculation.vat_value, 2)
    cost_regie = round(direct_cost + guarantee_cost + maintenance_cost + insurance_cost + general_management_fee, 2)
    taxes_and_guarantees = round(vat_cost + guarantee_cost + insurance_cost, 2)
    platform_revenue = round(platform_commission + maintenance_cost + general_management_fee, 2)
    response_currency, response_currency_symbol = _resolve_public_currency(
        country_code=country.code,
        fallback_currency=pricing_config.currency,
        geo_fiscal_context=geo_fiscal_context,
    )

    return PublicPriceBreakdownResponse(
        slug=service.slug,
        service_name=service.name,
        currency=response_currency,
        currency_symbol=response_currency_symbol,
        legislation_code=pricing_config.legislation_code,
        country_code=country.code,
        zone_slug=zone.slug,
        locality_slug=locality.slug if locality else None,
        availability_status="available",
        partial_availability=None,
        minimum_order_applied=bool(draft.minimum_order_applied),
        minimum_order_note=_build_minimum_order_note(bool(draft.minimum_order_applied)),
        service_level=service_level.value,
        recipe_level=recipe_level.value,
        urgency=urgency,
        distributie_furnizori=direct_cost,
        cost_direct=direct_cost,
        cost_regie=cost_regie,
        mentenanta_platforma=maintenance_cost,
        venit_platforma=platform_revenue,
        garantie_buna_executie=guarantee_cost,
        insurance_premium=insurance_cost,
        darrin_management_fee=general_management_fee,
        taxe_si_garantii=taxes_and_guarantees,
        tva=vat_cost,
        total_facturabil=round(draft.calculation.gross_total, 2),
        package_label=package_meta["package_label"],
        package_unit=package_meta["package_unit"],
        included_components=package_meta["included_components"],
        delivery_badge=package_meta["delivery_badge"],
        delivery_lead_time_days=package_meta["delivery_lead_time_days"],
        last_calculated_at=_utcnow(),
    )


def _default_order_message(status: str) -> str:
    messages = {
        "PENDING_PROVIDER_SELECTION": "Comanda a fost primita si se pregateste alocarea.",
        "SEARCHING_PROVIDER": "Cautam furnizor disponibil",
        "ASSIGNED": "Comanda a fost alocata.",
        "IN_PROGRESS": "Executia este in desfasurare.",
        "PAID": "Plata a fost confirmata.",
        "COMPLETED": "Comanda a fost finalizata.",
        "CANCELLED": "Comanda a fost anulata.",
    }
    return messages.get(status, "Status actualizat.")


def get_order_status_snapshot(db: Session, order_ref: str) -> OrderStatusSnapshotResponse:
    existing = _order_status_state.get(order_ref)
    order = db.execute(select(Order).where(Order.order_ref == order_ref)).scalar_one_or_none()
    if order:
        return OrderStatusSnapshotResponse(
            order_ref=order.order_ref,
            status=order.status,
            provider_ref=order.provider_ref,
            provider_name=order.provider_name,
            message=existing.message if existing and existing.message else _default_order_message(order.status),
            updated_at=order.updated_at or order.created_at,
            source="orders.db",
        )
    if existing:
        return existing
    return OrderStatusSnapshotResponse(
        order_ref=order_ref,
        status="SEARCHING_PROVIDER",
        message="Cautam furnizor disponibil",
        updated_at=_utcnow(),
    )


def update_order_status(order_ref: str, data: OrderStatusUpdateRequest) -> OrderStatusSnapshotResponse:
    snapshot = OrderStatusSnapshotResponse(
        order_ref=order_ref,
        status=data.status,
        provider_ref=data.provider_ref,
        provider_name=data.provider_name,
        message=data.message or _default_order_message(data.status),
        updated_at=_utcnow(),
    )
    _order_status_state[order_ref] = snapshot
    publish_sync_event(
        f"order-status:{order_ref}",
        "order_status.updated",
        snapshot.model_dump(mode="json"),
    )
    return snapshot
