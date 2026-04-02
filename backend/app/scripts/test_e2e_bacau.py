from __future__ import annotations

import os
from dataclasses import dataclass

os.environ.setdefault("JWT_SECRET", "verify-local-secret-2026")
os.environ.setdefault("DATABASE_URL", "sqlite:///backend/mydarrin.db")
os.environ.setdefault("ENABLE_BASIC_AUTH_GATE", "false")

from fastapi.testclient import TestClient
from sqlalchemy import inspect, select
from sqlalchemy.exc import OperationalError

from app.core.auth import create_access_token, hash_password
from app.db.session import SessionLocal, engine
from app.db.sqlite_compat import ensure_sqlite_runtime_schema
from app.main import app
from app.models.price_analysis import TaxRule
from app.models.service import Service
from app.models.user import User, UserRole
from app.modules.cost_engine.models import AdminPriceConfig
from app.modules.cost_engine.schemas import ServiceLevel
from app.modules.deviz_engine.models import DevizDraft
from app.modules.deviz_engine.schemas import DevizRequest
from app.modules.deviz_engine.service import generate_deviz
from app.modules.geography.models import Country, Zone
from app.modules.orders.models import Order
from app.modules.orders.service import get_projected_revenue_metric
from app.modules.sync.service import syncPublicPrices
from app.schemas.price_analysis import RecipeLevelName


TARGET_ADDRESS = "Strada Republicii, Bacau"
SERVICE_SLUG = "tuns-gazon"
COUNTRY_CODE = "RO"
ZONE_SLUG = "bucuresti-ilfov"
EXPECTED_MINIMUM_NET = 150.0
EXPECTED_GROSS_TOTAL = 178.50


@dataclass
class CheckResult:
    key: str
    passed: bool
    details: str

    @property
    def label(self) -> str:
        return "OK" if self.passed else "FAIL"


def _get_service_context(db):
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

    config = db.execute(
        select(AdminPriceConfig).where(
            AdminPriceConfig.service_id == service.id,
            AdminPriceConfig.country_id == country.id,
            AdminPriceConfig.is_active.is_(True),
        )
    ).scalars().first()
    if config is None:
        raise RuntimeError(f"AdminPriceConfig not found for service: {SERVICE_SLUG}")

    return service, country, zone, config


def verify_geo_detection() -> CheckResult:
    client = TestClient(app)
    response = client.get(
        "/api/v1/public/geo-fiscal/place-details",
        params={"address": TARGET_ADDRESS},
    )
    if response.status_code != 200:
        return CheckResult("GEO", False, f"place-details returned {response.status_code}")

    payload = response.json()
    passed = payload.get("country_code") == "RO" and payload.get("currency_code") == "RON"
    return CheckResult(
        "GEO",
        passed,
        (
            f"country_code={payload.get('country_code')}, "
            f"currency_code={payload.get('currency_code')}, "
            f"locality_slug={payload.get('locality_slug')}, "
            f"source={payload.get('source')}"
        ),
    )


def verify_tax_rule(db) -> CheckResult:
    rule = db.execute(
        select(TaxRule).where(
            TaxRule.country_code == "RO",
            TaxRule.locality_slug.is_(None),
            TaxRule.service_type == "LANDSCAPING",
            TaxRule.is_active.is_(True),
        )
    ).scalar_one_or_none()
    if rule is None:
        return CheckResult("TAX", False, "TaxRule missing for RO/LANDSCAPING")

    passed = round(float(rule.vat_percentage), 2) == 0.19
    return CheckResult("TAX", passed, f"vat_percentage={float(rule.vat_percentage):.2f}")


def verify_price_logic(db) -> CheckResult:
    breakdown = syncPublicPrices(
        db,
        SERVICE_SLUG,
        target_address=TARGET_ADDRESS,
        requested_quantity=10,
    )
    if breakdown is None or isinstance(breakdown, str):
        return CheckResult("PRICE", False, f"syncPublicPrices returned {breakdown!r}")

    passed = round(breakdown.total_facturabil, 2) == EXPECTED_GROSS_TOTAL and bool(breakdown.minimum_order_applied) is True
    return CheckResult(
        "PRICE",
        passed,
        (
            f"net_minimum={EXPECTED_MINIMUM_NET:.2f}, "
            f"expected_total={EXPECTED_GROSS_TOTAL:.2f}, "
            f"actual_total={breakdown.total_facturabil:.2f}, "
            f"minimum_order_applied={breakdown.minimum_order_applied}, "
            f"vat={breakdown.tva:.2f}"
        ),
    )


def verify_deviz_persistence(db) -> CheckResult:
    try:
        before_total = len(db.execute(select(DevizDraft)).scalars().all())

        service, country, zone, config = _get_service_context(db)
        deviz = generate_deviz(
            db,
            DevizRequest(
                service_id=service.id,
                country_id=country.id,
                zone_id=zone.id,
                locality_id=None,
                currency=config.currency,
                legislation_code=config.legislation_code,
                urgency=False,
                service_level=ServiceLevel.STANDARD,
                recipe_level=RecipeLevelName.ARGINT,
                requested_quantity=10,
                target_address=TARGET_ADDRESS,
                source_message="E2E Bacau test",
                activity_ids=[],
                resources=[],
            ),
        )
        after_total = len(db.execute(select(DevizDraft)).scalars().all())

        passed = (
            deviz is not None
            and not isinstance(deviz, str)
            and after_total == before_total + 1
            and round(deviz.calculation.cost_direct_total, 2) >= 0
            and round(deviz.calculation.indirect_costs, 2) >= 0
            and round(deviz.calculation.platform_maintenance, 2) >= 0
        )
        return CheckResult(
            "DEVIZ",
            passed,
            (
                f"draft_id={getattr(deviz, 'id', None)}, "
                f"cost_direct={getattr(deviz.calculation, 'cost_direct_total', 0):.2f}, "
                f"indirect={getattr(deviz.calculation, 'indirect_costs', 0):.2f}, "
                f"maintenance={getattr(deviz.calculation, 'platform_maintenance', 0):.2f}"
            ),
        )
    except OperationalError as exc:
        db.rollback()
        return CheckResult("DEVIZ", False, f"schema mismatch for DevizDraft: {exc.__class__.__name__}")


def verify_order_write(db) -> CheckResult:
    tables = set(inspect(engine).get_table_names())
    if "orders" not in tables:
        return CheckResult("DB_WRITE", False, "orders table is not implemented")

    before_total = len(db.execute(select(Order)).scalars().all())
    client = TestClient(app)
    response = client.post(
        "/api/v1/public/orders",
        json={
            "slug": SERVICE_SLUG,
            "target_address": TARGET_ADDRESS,
            "requested_quantity": 10,
        },
    )
    if response.status_code != 201:
        return CheckResult("DB_WRITE", False, f"order create returned {response.status_code}: {response.text}")

    payload = response.json()
    stored_order = db.execute(select(Order).where(Order.order_ref == payload["order_ref"])).scalar_one_or_none()
    after_total = len(db.execute(select(Order)).scalars().all())
    passed = (
        stored_order is not None
        and after_total == before_total + 1
        and stored_order.status == "PENDING_PROVIDER_SELECTION"
    )
    return CheckResult(
        "DB_WRITE",
        passed,
        f"order_ref={payload['order_ref']}, status={stored_order.status if stored_order else 'missing'}",
    )


def verify_investor_projection() -> CheckResult:
    db = SessionLocal()
    try:
        admin_user = db.execute(select(User).where(User.email == "admin.e2e@mydarrin.local")).scalar_one_or_none()
        if admin_user is None:
            admin_user = User(
                email="admin.e2e@mydarrin.local",
                hashed_password=hash_password("AdminE2E!2026"),
                full_name="Admin E2E",
                role=UserRole.ADMIN.value,
                verification_status="APPROVED",
            )
            db.add(admin_user)
            db.commit()
            db.refresh(admin_user)

        token = create_access_token({"sub": str(admin_user.id), "role": admin_user.role})
        client = TestClient(app)
        response = client.get(
            "/api/v1/backoffice/orders/projected-revenue",
            headers={"Authorization": f"Bearer {token}"},
        )
        if response.status_code != 200:
            return CheckResult("INVESTOR", False, f"projected-revenue returned {response.status_code}: {response.text}")

        payload = response.json()
        metric = get_projected_revenue_metric(db)
        passed = (
            round(float(payload["projected_revenue_total"]), 2) == round(float(metric.projected_revenue_total), 2)
            and int(payload["projected_order_count"]) >= 1
        )
        return CheckResult(
            "INVESTOR",
            passed,
            (
                f"projected_revenue_total={float(payload['projected_revenue_total']):.2f}, "
                f"projected_order_count={int(payload['projected_order_count'])}"
            ),
        )
    finally:
        db.close()


def main() -> None:
    ensure_sqlite_runtime_schema(engine)
    geo_result = verify_geo_detection()

    db = SessionLocal()
    try:
        tax_result = verify_tax_rule(db)
        price_result = verify_price_logic(db)
        deviz_result = verify_deviz_persistence(db)
        db_write_result = verify_order_write(db)
        investor_result = verify_investor_projection()
    finally:
        db.close()

    results = [
        geo_result,
        tax_result,
        price_result,
        deviz_result,
        db_write_result,
        investor_result,
    ]

    for result in results:
        print(f"[{result.key}: {result.label}] {result.details}")

    summary_keys = ["GEO", "TAX", "PRICE", "DB_WRITE"]
    summary = " ".join(f"[{result.key}: {result.label}]" for result in results if result.key in summary_keys)
    print(summary)

    if not all(result.passed for result in results if result.key in summary_keys):
        raise SystemExit(1)


if __name__ == "__main__":
    main()
