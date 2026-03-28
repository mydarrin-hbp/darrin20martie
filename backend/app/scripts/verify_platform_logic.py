from __future__ import annotations

from dataclasses import dataclass
from math import asin, cos, radians, sin, sqrt

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.models.price_analysis import CatalogResource, Supplier
from app.models.service import Service
from app.modules.geography.models import Country, Locality, Zone
from app.modules.sync.service import syncPublicPrices
from app.services.price_analysis_service import get_recipe_rows_for_activities, get_service_recipe_activities


SERVICE_SLUG = "montaj-centrala-termica"
GAZON_SERVICE_SLUG = "tuns-gazon"
COUNTRY_CODE = "RO"
ZONE_SLUG = "bucuresti-ilfov"
LOCALITY_SLUG = "bucuresti-sud"
SUPPLIER_NAME = "Furnizor B (Bucuresti Sud)"
RESOURCE_NAME = "Echipa montaj centrala termica"


@dataclass
class VerificationResult:
    name: str
    passed: bool
    details: str


def _haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    earth_radius_km = 6371.0
    delta_lat = radians(lat2 - lat1)
    delta_lon = radians(lon2 - lon1)
    a = (
        sin(delta_lat / 2) ** 2
        + cos(radians(lat1)) * cos(radians(lat2)) * sin(delta_lon / 2) ** 2
    )
    return 2 * earth_radius_km * asin(sqrt(a))


def _round_amount(value: float) -> float:
    return round(value, 2)


def _build_ai_unavailable_message() -> str:
    return "Momentan nu putem genera oferta finala deoarece o resursa critica nu este disponibila la furnizorii activi din zona selectata."


def _get_context(db: Session) -> tuple[Service, Country, Zone, Locality]:
    service = db.execute(select(Service).where(Service.slug == SERVICE_SLUG)).scalar_one_or_none()
    if service is None:
        raise RuntimeError(f"Service not found: {SERVICE_SLUG}")

    country = db.execute(select(Country).where(Country.code == COUNTRY_CODE)).scalar_one_or_none()
    if country is None:
        raise RuntimeError(f"Country not found: {COUNTRY_CODE}")

    zone = db.execute(
        select(Zone).where(
            Zone.country_id == country.id,
            Zone.slug == ZONE_SLUG,
            Zone.is_active.is_(True),
        )
    ).scalar_one_or_none()
    if zone is None:
        raise RuntimeError(f"Zone not found: {ZONE_SLUG}")

    locality = db.execute(
        select(Locality).where(
            Locality.country_id == country.id,
            Locality.zone_id == zone.id,
            Locality.slug == LOCALITY_SLUG,
            Locality.is_active.is_(True),
        )
    ).scalar_one_or_none()
    if locality is None:
        raise RuntimeError(f"Locality not found: {LOCALITY_SLUG}")

    return service, country, zone, locality


def verify_price_logic(db: Session) -> VerificationResult:
    _service, country, zone, locality = _get_context(db)
    breakdown = syncPublicPrices(
        db,
        SERVICE_SLUG,
        country_code=country.code,
        zone_slug=zone.slug,
        locality_slug=locality.slug,
    )
    if isinstance(breakdown, str) or breakdown is None:
        return VerificationResult(
            name="Test Pret",
            passed=False,
            details=f"syncPublicPrices returned {breakdown!r}",
        )

    expected_total = _round_amount(
        breakdown.distributie_furnizori
        + breakdown.garantie_buna_executie
        + breakdown.venit_platforma
        + breakdown.tva
    )
    passed = _round_amount(breakdown.total_facturabil) == expected_total
    return VerificationResult(
        name="Test Pret",
        passed=passed,
        details=(
            f"direct={breakdown.distributie_furnizori:.2f}, "
            f"garantie={breakdown.garantie_buna_executie:.2f}, "
            f"mentenanta={breakdown.mentenanta_platforma:.2f}, "
            f"venit_platforma={breakdown.venit_platforma:.2f}, "
            f"tva={breakdown.tva:.2f}, "
            f"total={breakdown.total_facturabil:.2f}, "
            f"expected={expected_total:.2f}"
        ),
    )


def _supplier_matches_geo(supplier: Supplier, *, country: Country, zone: Zone, locality: Locality) -> bool:
    if not supplier.is_active:
        return False
    location_geo = supplier.location_geo or {}
    country_codes = {str(item).upper() for item in location_geo.get("country_codes", []) if str(item).strip()}
    zone_slugs = {str(item).lower() for item in location_geo.get("zone_slugs", []) if str(item).strip()}
    locality_slugs = {str(item).lower() for item in location_geo.get("locality_slugs", []) if str(item).strip()}

    if country_codes and country.code.upper() not in country_codes:
        return False
    if zone_slugs and zone.slug.lower() not in zone_slugs:
        return False
    if locality_slugs and locality.slug.lower() not in locality_slugs:
        return False
    return True


def _select_best_supplier(db: Session, *, service: Service, country: Country, zone: Zone, locality: Locality) -> tuple[Supplier | None, float | None]:
    activities = get_service_recipe_activities(db, service.id)
    recipes = get_recipe_rows_for_activities(db, [activity.id for activity in activities])

    best_supplier: Supplier | None = None
    best_distance: float | None = None

    for recipe in recipes:
        resource = recipe.resource
        supplier = resource.supplier
        if supplier is None:
            continue
        if not _supplier_matches_geo(supplier, country=country, zone=zone, locality=locality):
            continue
        if not resource.is_active:
            continue
        if resource.stock_qty is not None and resource.stock_qty <= 0:
            continue
        if (resource.availability_status or "IN_STOCK").upper() in {"OUT_OF_STOCK", "UNAVAILABLE", "BLOCKED"}:
            continue

        geo = supplier.location_geo or {}
        if "lat" not in geo or "lng" not in geo or locality.latitude is None or locality.longitude is None:
            continue

        distance = _haversine_km(locality.latitude, locality.longitude, float(geo["lat"]), float(geo["lng"]))
        if best_distance is None or distance < best_distance:
            best_supplier = supplier
            best_distance = distance

    return best_supplier, best_distance


def verify_rideshare_logic(db: Session) -> VerificationResult:
    service, country, zone, locality = _get_context(db)
    supplier, distance = _select_best_supplier(db, service=service, country=country, zone=zone, locality=locality)
    passed = supplier is not None and supplier.name == SUPPLIER_NAME
    details = (
        f"selected={supplier.name if supplier else 'None'}, "
        f"distance_km={distance:.2f}" if supplier and distance is not None else "no matching supplier found"
    )
    return VerificationResult(name="Test Rideshare", passed=passed, details=details)


def verify_stock_logic(db: Session) -> VerificationResult:
    service, country, zone, locality = _get_context(db)
    activities = get_service_recipe_activities(db, service.id)
    recipes = get_recipe_rows_for_activities(db, [activity.id for activity in activities])
    resources = [
        recipe.resource
        for recipe in recipes
        if (recipe.resource.resource_type or "").upper() == "LABOR"
    ]
    if not resources:
        return VerificationResult(name="Test Stoc", passed=False, details="no LABOR resources found for service")

    original_states = [
        (resource, resource.stock_qty, resource.availability_status)
        for resource in resources
    ]

    try:
        for resource in resources:
            resource.stock_qty = 0.0
            resource.availability_status = "OUT_OF_STOCK"
        db.flush()

        breakdown = syncPublicPrices(
            db,
            SERVICE_SLUG,
            country_code=country.code,
            zone_slug=zone.slug,
            locality_slug=locality.slug,
        )
        is_unavailable = breakdown == "resource_unavailable" or getattr(breakdown, "availability_status", None) == "resource_unavailable"
        ai_message = _build_ai_unavailable_message() if is_unavailable else "Oferta disponibila"
        passed = is_unavailable and "Momentan nu putem genera oferta finala" in ai_message
        return VerificationResult(
            name="Test Stoc",
            passed=passed,
            details=f"breakdown={breakdown!r}, ai_message={ai_message}",
        )
    finally:
        for resource, original_stock, original_status in original_states:
            resource.stock_qty = original_stock
            resource.availability_status = original_status
        db.rollback()


def verify_minimum_order_logic(db: Session) -> VerificationResult:
    _service, country, zone, locality = _get_context(db)
    breakdown = syncPublicPrices(
        db,
        GAZON_SERVICE_SLUG,
        country_code=country.code,
        zone_slug=zone.slug,
        locality_slug=locality.slug,
        target_address="Bucuresti Sud, Romania",
        requested_quantity=10,
    )
    if isinstance(breakdown, str) or breakdown is None:
        return VerificationResult(
            name="Test Comanda Sub Prag",
            passed=False,
            details=f"syncPublicPrices returned {breakdown!r}",
        )

    passed = (
        getattr(breakdown, "minimum_order_applied", False) is True
        and _round_amount(breakdown.total_facturabil) == 150.0
    )
    return VerificationResult(
        name="Test Comanda Sub Prag",
        passed=passed,
        details=(
            f"minimum_order_applied={getattr(breakdown, 'minimum_order_applied', False)}, "
            f"total={breakdown.total_facturabil:.2f}, "
            f"note={getattr(breakdown, 'minimum_order_note', None)!r}"
        ),
    )


def main() -> None:
    db = SessionLocal()
    try:
        results = [
            verify_price_logic(db),
            verify_rideshare_logic(db),
            verify_stock_logic(db),
            verify_minimum_order_logic(db),
        ]
    finally:
        db.close()

    print("Platform verification results:")
    for result in results:
        status = "PASS" if result.passed else "FAIL"
        print(f"- [{status}] {result.name}: {result.details}")

    if not all(result.passed for result in results):
        raise SystemExit(1)


if __name__ == "__main__":
    main()
