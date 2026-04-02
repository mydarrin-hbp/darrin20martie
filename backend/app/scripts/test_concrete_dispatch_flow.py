from __future__ import annotations

import asyncio
import os
import secrets
from dataclasses import dataclass

os.environ.setdefault("JWT_SECRET", "verify-local-secret-2026")
os.environ.setdefault("DATABASE_URL", "sqlite:///backend/mydarrin.db")

from sqlalchemy import inspect, select
from sqlalchemy.orm import Session

from app.db.session import SessionLocal, engine
from app.db.sqlite_compat import ensure_sqlite_runtime_schema
from app.models.price_analysis import CatalogResource, Supplier
from app.models.service import Service
from app.modules.concrete_dispatch.schemas import ConcreteDispatchRequest
from app.modules.concrete_dispatch.service import ConcreteDispatchService
from app.modules.cost_engine.models import FinancialConfig
from app.modules.orders.document_service import generate_proforma_document
from app.modules.orders.models import Order, OrderDocument, WorkPackage
from app.scripts.seed_v2_production import seed_construction_vertical


SERVICE_SLUG = "livrare-beton-c20-25"
LOCALITY_SLUG = "bucuresti-sud"
SCHEDULED_SLOT = "2026-04-01T08:00"
TARGET_ADDRESS = "Sos. Giurgiului 17, Bucuresti Sud"
VOLUME = 6.0

MATERIAL_SUPPLIER_NAME = "Statie Beton Bucuresti"
PUMP_SUPPLIER_NAME = "Pompist Bucuresti"

MATERIAL_PRICE_PER_MC = 345.0
TRANSPORT_FEE = 180.0
PUMP_RESOURCE_PRICE_PER_MC = 85.0
PUMP_CONFIG_PRICE_PER_MC = 95.0
PUMP_MOBILIZATION_FEE = 250.0
INCOMPLETE_LOAD_FEE_FULL_TRUCK = 270.0
MY_DARRIN_PERCENT = 0.10
PLATFORM_PERCENT = 0.03
INDIRECT_PERCENT = 0.04
INSURANCE_PERCENT = 0.01
ESCROW_PERCENT = 0.05


@dataclass
class CheckResult:
    name: str
    passed: bool
    details: str


def _round_amount(value: float) -> float:
    return round(value, 2)


def _require_tables() -> None:
    required_tables = {
        "services",
        "suppliers",
        "catalog_resources",
        "provider_availability_slots",
        "financial_configs",
        "orders",
        "work_packages",
        "order_documents",
    }
    existing_tables = set(inspect(engine).get_table_names())
    missing = sorted(required_tables - existing_tables)
    if missing:
        raise RuntimeError(f"Missing required tables for concrete flow test: {', '.join(missing)}")


def _get_service(db: Session) -> Service:
    service = db.execute(select(Service).where(Service.slug == SERVICE_SLUG)).scalar_one_or_none()
    if service is None:
        seed_construction_vertical(db)
        db.commit()
        service = db.execute(select(Service).where(Service.slug == SERVICE_SLUG)).scalar_one_or_none()
    if service is None:
        raise RuntimeError(f"Service not found after seed: {SERVICE_SLUG}")
    return service


def _get_supplier(db: Session, name: str) -> Supplier:
    supplier = db.execute(select(Supplier).where(Supplier.name == name)).scalar_one_or_none()
    if supplier is None:
        seed_construction_vertical(db)
        db.commit()
        supplier = db.execute(select(Supplier).where(Supplier.name == name)).scalar_one_or_none()
    if supplier is None:
        raise RuntimeError(f"Supplier not found after seed: {name}")
    return supplier


def _get_or_create_resource(
    db: Session,
    *,
    supplier_id: int,
    name_ro: str,
    name_en: str,
    resource_type: str,
    base_price: float,
    unit: str,
    stock_qty: float,
    technical_specs: dict,
) -> CatalogResource:
    resource = db.execute(
        select(CatalogResource).where(
            CatalogResource.supplier_id == supplier_id,
            CatalogResource.name_ro == name_ro,
            CatalogResource.resource_type == resource_type,
        )
    ).scalar_one_or_none()
    if resource is None:
        resource = CatalogResource(
            supplier_id=supplier_id,
            name_ro=name_ro,
            name_en=name_en,
            resource_type=resource_type,
            base_price=base_price,
            unit=unit,
            stock_qty=stock_qty,
            availability_status="IN_STOCK",
            lead_time_days=1,
            technical_specs=technical_specs,
            is_active=True,
        )
        db.add(resource)
        db.flush()
    else:
        resource.name_en = name_en
        resource.base_price = base_price
        resource.unit = unit
        resource.stock_qty = stock_qty
        resource.availability_status = "IN_STOCK"
        resource.lead_time_days = 1
        resource.technical_specs = technical_specs
        resource.is_active = True
        db.flush()
    return resource


def _ensure_concrete_resources(db: Session) -> tuple[Supplier, Supplier]:
    material_supplier = _get_supplier(db, MATERIAL_SUPPLIER_NAME)
    pump_supplier = _get_supplier(db, PUMP_SUPPLIER_NAME)

    _get_or_create_resource(
        db,
        supplier_id=material_supplier.id,
        name_ro="Beton C20/25",
        name_en="Concrete C20/25",
        resource_type="MATERIAL",
        base_price=MATERIAL_PRICE_PER_MC,
        unit="mc",
        stock_qty=500.0,
        technical_specs={"clasa_beton": "C20/25"},
    )
    _get_or_create_resource(
        db,
        supplier_id=material_supplier.id,
        name_ro="Transport beton standard",
        name_en="Standard concrete transport",
        resource_type="TRANSPORT",
        base_price=TRANSPORT_FEE,
        unit="cursa",
        stock_qty=20.0,
        technical_specs={"truck_capacity_mc": 9},
    )
    _get_or_create_resource(
        db,
        supplier_id=pump_supplier.id,
        name_ro="Pompa brat 24m",
        name_en="24m concrete pump",
        resource_type="EQUIPMENT",
        base_price=PUMP_RESOURCE_PRICE_PER_MC,
        unit="mc",
        stock_qty=5.0,
        technical_specs={"reach_m": 24},
    )
    db.commit()
    return material_supplier, pump_supplier


def _ensure_financial_config(db: Session) -> FinancialConfig:
    config = db.execute(
        select(FinancialConfig).where(
            FinancialConfig.service_family == "CONCRETE",
            FinancialConfig.is_active.is_(True),
        )
    ).scalars().first()
    if config is None:
        config = FinancialConfig(
            service_family="CONCRETE",
            mydarrin_commission_percentage=MY_DARRIN_PERCENT,
            platform_fee_percentage=PLATFORM_PERCENT,
            indirect_cost_percentage=INDIRECT_PERCENT,
            escrow_guarantee_percentage=ESCROW_PERCENT,
            insurance_percentage=INSURANCE_PERCENT,
            insurance_fixed_amount=0.0,
            incomplete_load_fee=INCOMPLETE_LOAD_FEE_FULL_TRUCK,
            pump_mobilization_fee=PUMP_MOBILIZATION_FEE,
            pump_price_per_m3=PUMP_CONFIG_PRICE_PER_MC,
            is_active=True,
        )
        db.add(config)
    else:
        config.mydarrin_commission_percentage = MY_DARRIN_PERCENT
        config.platform_fee_percentage = PLATFORM_PERCENT
        config.indirect_cost_percentage = INDIRECT_PERCENT
        config.escrow_guarantee_percentage = ESCROW_PERCENT
        config.insurance_percentage = INSURANCE_PERCENT
        config.insurance_fixed_amount = 0.0
        config.incomplete_load_fee = INCOMPLETE_LOAD_FEE_FULL_TRUCK
        config.pump_mobilization_fee = PUMP_MOBILIZATION_FEE
        config.pump_price_per_m3 = PUMP_CONFIG_PRICE_PER_MC
        config.is_active = True
    db.commit()
    db.refresh(config)
    return config


def _create_order(db: Session, service: Service) -> Order:
    order = Order(
        order_ref=f"ORD-CONCRETE-{secrets.token_hex(4).upper()}",
        service_id=service.id,
        status="PENDING_PROVIDER_SELECTION",
        target_address=TARGET_ADDRESS,
        country_code="RO",
        zone_slug="bucuresti-ilfov",
        locality_slug=LOCALITY_SLUG,
        requested_quantity=VOLUME,
        currency="RON",
        currency_symbol="RON",
        cost_direct=0.0,
        cost_regie=0.0,
        mentenanta_platforma=0.0,
        venit_platforma=0.0,
        garantie_buna_executie=0.0,
        insurance_premium=0.0,
        darrin_management_fee=0.0,
        tva=0.0,
        total_facturabil=0.0,
        escrow_status="NOT_REQUIRED",
        escrow_blocked_amount=0.0,
    )
    db.add(order)
    db.commit()
    db.refresh(order)
    generate_proforma_document(db, order)
    db.commit()
    db.refresh(order)
    return order


def _expected_breakdown() -> dict:
    incomplete_load_fee = (ConcreteDispatchService.STANDARD_TRUCK_CAPACITY_MC - VOLUME) * (
        INCOMPLETE_LOAD_FEE_FULL_TRUCK / ConcreteDispatchService.STANDARD_TRUCK_CAPACITY_MC
    )
    material = VOLUME * MATERIAL_PRICE_PER_MC
    transport = TRANSPORT_FEE + incomplete_load_fee
    pumping = PUMP_MOBILIZATION_FEE + (VOLUME * PUMP_CONFIG_PRICE_PER_MC)
    direct_costs = material + transport + pumping
    indirecte = direct_costs * INDIRECT_PERCENT
    management_fee = direct_costs * MY_DARRIN_PERCENT
    platform_fee_base = direct_costs + indirecte + management_fee
    platform_fee = platform_fee_base * PLATFORM_PERCENT
    insurance = direct_costs * INSURANCE_PERCENT
    escrow = direct_costs * ESCROW_PERCENT
    total = platform_fee_base + platform_fee + insurance + escrow
    return {
        "material": _round_amount(material),
        "transport": _round_amount(transport),
        "pumping": _round_amount(pumping),
        "direct_costs": _round_amount(direct_costs),
        "indirecte": _round_amount(indirecte),
        "management_fee": _round_amount(management_fee),
        "platform_fee": _round_amount(platform_fee),
        "insurance": _round_amount(insurance),
        "escrow_warranty": _round_amount(escrow),
        "incomplete_load_fee": _round_amount(incomplete_load_fee),
        "total": _round_amount(total),
    }


def verify_dispatch_flow(db: Session) -> list[CheckResult]:
    service = _get_service(db)
    material_supplier, pump_supplier = _ensure_concrete_resources(db)
    _ensure_financial_config(db)
    order = _create_order(db, service)

    payload = ConcreteDispatchRequest(
        order_id=order.id,
        locality_slug=LOCALITY_SLUG,
        scheduled_slot=SCHEDULED_SLOT,
        volume=VOLUME,
        pump_required=True,
        target_address=TARGET_ADDRESS,
    )
    response = asyncio.run(ConcreteDispatchService.create_work_package(db, payload))

    if isinstance(response, str):
        return [CheckResult(name="Dispatch Flow", passed=False, details=f"dispatch returned {response!r}")]

    db.refresh(order)
    work_package = db.get(WorkPackage, order.work_package_id) if order.work_package_id else None
    proforma = db.execute(
        select(OrderDocument).where(
            OrderDocument.order_id == order.id,
            OrderDocument.document_type == "PROFORMA",
        )
    ).scalar_one_or_none()

    expected = _expected_breakdown()
    financial_breakdown = response.financial_breakdown

    results = [
        CheckResult(
            name="Order Created",
            passed=order.id is not None and order.status == "PENDING_PROVIDER_SELECTION",
            details=f"order_ref={order.order_ref}, status={order.status}",
        ),
        CheckResult(
            name="Suppliers Matched",
            passed=(
                response.material_supplier_id == material_supplier.id
                and response.equipment_supplier_id == pump_supplier.id
            ),
            details=(
                f"material_supplier_id={response.material_supplier_id}, "
                f"equipment_supplier_id={response.equipment_supplier_id}"
            ),
        ),
        CheckResult(
            name="Work Package Linked",
            passed=work_package is not None and work_package.package_ref == response.package_ref,
            details=(
                f"order_work_package_id={order.work_package_id}, "
                f"package_ref={response.package_ref}, "
                f"status={response.status}"
            ),
        ),
        CheckResult(
            name="Proforma Exists",
            passed=proforma is not None and proforma.status == "GENERATED",
            details=(
                f"document_id={getattr(proforma, 'id', None)}, "
                f"storage_key={getattr(proforma, 'storage_key', None)}"
            ),
        ),
        CheckResult(
            name="Financial Breakdown",
            passed=all(
                _round_amount(float(financial_breakdown[key])) == expected[key]
                for key in expected
            ),
            details=(
                f"expected_total={expected['total']:.2f}, "
                f"actual_total={_round_amount(float(financial_breakdown['total'])):.2f}, "
                f"incomplete_load_fee={_round_amount(float(financial_breakdown['incomplete_load_fee'])):.2f}"
            ),
        ),
    ]
    return results


def main() -> None:
    ensure_sqlite_runtime_schema(engine)
    _require_tables()
    db = SessionLocal()
    try:
        results = verify_dispatch_flow(db)
    finally:
        db.close()

    print("Concrete dispatch verification results:")
    for result in results:
        status = "PASS" if result.passed else "FAIL"
        print(f"- [{status}] {result.name}: {result.details}")

    if not all(result.passed for result in results):
        raise SystemExit(1)


if __name__ == "__main__":
    main()
