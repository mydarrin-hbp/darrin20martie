from __future__ import annotations

from sqlalchemy import select

from app.db.session import SessionLocal
from app.models.assets import Asset, AssetType, ProviderAvailabilitySlot
from app.models.category import Category
from app.models.domain import Domain
from app.models.price_analysis import Supplier
from app.modules.cost_engine.models import FinancialConfig
from app.modules.orders.models import WorkPackage
from app.scripts.seed_production_assets import (
    _get_or_create_asset,
    _get_or_create_asset_type,
    _get_or_create_category,
    _get_or_create_domain,
    _get_or_create_subcategory,
    _get_or_create_supplier,
    _get_or_create_service,
)


def _get_or_create_financial_config(db, *, country_id: int | None, zone_id: int | None, locality_id: int | None, service_family: str, mydarrin: float, platform: float, indirect: float, escrow: float):
    config = db.execute(
        select(FinancialConfig).where(
            FinancialConfig.country_id == country_id,
            FinancialConfig.zone_id == zone_id,
            FinancialConfig.locality_id == locality_id,
            FinancialConfig.service_family == service_family,
        )
    ).scalar_one_or_none()
    if config is None:
        config = FinancialConfig(
            country_id=country_id,
            zone_id=zone_id,
            locality_id=locality_id,
            service_family=service_family,
            mydarrin_commission_percentage=mydarrin,
            platform_fee_percentage=platform,
            indirect_cost_percentage=indirect,
            escrow_guarantee_percentage=escrow,
            is_active=True,
        )
        db.add(config)
    else:
        config.mydarrin_commission_percentage = mydarrin
        config.platform_fee_percentage = platform
        config.indirect_cost_percentage = indirect
        config.escrow_guarantee_percentage = escrow
        config.is_active = True
    db.flush()
    return config


def _get_or_create_slot(db, *, supplier_id: int, locality_slug: str, scheduled_slot: str, slot_role: str):
    slot = db.execute(
        select(ProviderAvailabilitySlot).where(
            ProviderAvailabilitySlot.supplier_id == supplier_id,
            ProviderAvailabilitySlot.locality_slug == locality_slug,
            ProviderAvailabilitySlot.scheduled_slot == scheduled_slot,
        )
    ).scalar_one_or_none()
    if slot is None:
        slot = ProviderAvailabilitySlot(
            supplier_id=supplier_id,
            locality_slug=locality_slug,
            scheduled_slot=scheduled_slot,
            slot_role=slot_role,
            is_available=True,
        )
        db.add(slot)
    else:
        slot.slot_role = slot_role
        slot.is_available = True
    db.flush()
    return slot


def seed_construction_vertical(db) -> None:
    domain = _get_or_create_domain(
        db,
        slug="constructii",
        name_ro="Constructii",
        name_en="Construction",
    )
    category = _get_or_create_category(
        db,
        domain=domain,
        slug="materiale-beton-si-pompare",
        name_ro="Materiale, beton si pompare",
        name_en="Concrete and pumping",
    )
    subcategory = _get_or_create_subcategory(
        db,
        category=category,
        slug="livrari-beton",
        name_ro="Livrari beton",
        name_en="Concrete delivery",
    )
    service = _get_or_create_service(
        db,
        subcategory=subcategory,
        slug="livrare-beton-c20-25",
        name="Livrare beton C20/25",
        description="Pachet de livrare beton C20/25 cu transport si pompa.",
    )
    beton_type = _get_or_create_asset_type(
        db,
        slug="beton-c20-25",
        name_ro="Beton C20/25",
        name_en="Concrete C20/25",
        asset_family="CONCRETE",
        technical_schema={"clasa_beton": "string", "rezistenta": "string", "consistenta": "string"},
    )
    pompa_type = _get_or_create_asset_type(
        db,
        slug="pompa-brat-24m",
        name_ro="Pompa brat 24m",
        name_en="24m concrete pump",
        asset_family="CONCRETE_EQUIPMENT",
        technical_schema={"reach_m": "float", "debit_m3_h": "float"},
    )
    _get_or_create_asset(
        db,
        asset_id="ASSET-CONCRETE-0001",
        asset_type=beton_type,
        category=category,
        service=service,
        display_name="Beton C20/25",
        technical_specs={"clasa_beton": "C20/25", "rezistenta": "20MPa", "consistenta": "S3"},
        maintenance_history_id="QA-CONCRETE-0001",
        warranty_status="QUALITY_CERT_REQUIRED",
        manufacturer="Statie Beton My Darrin",
        model="C20/25 Batch",
        serial_number="BETON-C20-25-001",
    )
    _get_or_create_asset(
        db,
        asset_id="ASSET-PUMP-0001",
        asset_type=pompa_type,
        category=category,
        service=service,
        display_name="Pompa Brat 24m",
        technical_specs={"reach_m": 24, "debit_m3_h": 90},
        maintenance_history_id="MH-PUMP-0001",
        warranty_status="SERVICE_CONTRACT",
        manufacturer="Putzmeister",
        model="24m",
        serial_number="PUMP-24M-001",
    )

    station = _get_or_create_supplier(
        db,
        name="Statie Beton Bucuresti",
        rating=4.9,
        location_geo={"country_codes": ["RO"], "zone_slugs": ["bucuresti-ilfov"], "locality_slugs": ["bucuresti-sud", "bucuresti-nord"], "specializations": ["MATERIAL", "BETON"]},
        insurance_policy_no="POL-CONCRETE-001",
    )
    pumpist = _get_or_create_supplier(
        db,
        name="Pompist Bucuresti",
        rating=4.7,
        location_geo={"country_codes": ["RO"], "zone_slugs": ["bucuresti-ilfov"], "locality_slugs": ["bucuresti-sud", "bucuresti-nord"], "specializations": ["EQUIPMENT", "PUMP"]},
        insurance_policy_no="POL-PUMP-001",
    )
    _get_or_create_slot(db, supplier_id=station.id, locality_slug="bucuresti-sud", scheduled_slot="2026-04-01T08:00", slot_role="MATERIAL")
    _get_or_create_slot(db, supplier_id=pumpist.id, locality_slug="bucuresti-sud", scheduled_slot="2026-04-01T08:00", slot_role="EQUIPMENT")


def seed_naval_vertical(db) -> None:
    domain = _get_or_create_domain(db, slug="naval", name_ro="Naval", name_en="Naval")
    category = _get_or_create_category(db, domain=domain, slug="ambarcatiuni-agrement", name_ro="Ambarcatiuni agrement", name_en="Leisure vessels")
    subcategory = _get_or_create_subcategory(db, category=category, slug="service-ambarcatiuni", name_ro="Service ambarcatiuni", name_en="Boat service")
    service = _get_or_create_service(db, subcategory=subcategory, slug="service-ambarcatiune-agrement", name="Service ambarcatiune agrement", description="Mentenanta si reparatii pentru ambarcatiuni de agrement.")
    asset_type = _get_or_create_asset_type(
        db,
        slug="ambarcatiune-agrement",
        name_ro="Ambarcatiune agrement",
        name_en="Leisure vessel",
        asset_family="NAVAL",
        technical_schema={"ore_functionare_motor": "float", "serie_coca": "string", "certificat_expira_la": "date"},
    )
    _get_or_create_asset(
        db,
        asset_id="ASSET-NAVAL-AGREMENT-0001",
        asset_type=asset_type,
        category=category,
        service=service,
        display_name="Ambarcatiune Agrement",
        technical_specs={"ore_functionare_motor": 420, "serie_coca": "NAV-AGR-001", "certificat_expira_la": "2026-11-30"},
        maintenance_history_id="MH-NAVAL-AGR-001",
        warranty_status="OUT_OF_WARRANTY",
        manufacturer="Bayliner",
        model="VR5",
        serial_number="NAVAL-VR5-001",
    )


def main() -> None:
    db = SessionLocal()
    try:
        seed_construction_vertical(db)
        seed_naval_vertical(db)
        _get_or_create_financial_config(db, country_id=None, zone_id=None, locality_id=None, service_family="GENERAL", mydarrin=0.10, platform=0.03, indirect=0.00, escrow=0.05)
        _get_or_create_financial_config(db, country_id=None, zone_id=None, locality_id=None, service_family="CONCRETE", mydarrin=0.10, platform=0.03, indirect=0.00, escrow=0.05)
        db.commit()
        print("Seed v2 production complete.")
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
