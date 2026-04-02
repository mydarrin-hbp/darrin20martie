from __future__ import annotations

from datetime import UTC, datetime, timedelta

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.models.assets import Asset, AssetTaskRule, AssetType, ProviderCapability, TaskType
from app.models.category import Category
from app.models.domain import Domain
from app.models.price_analysis import Supplier
from app.models.service import Service
from app.models.subcategory import SubCategory


def _future_date(days: int) -> datetime:
    return datetime.now(UTC) + timedelta(days=days)


def _get_or_create_domain(db: Session, *, slug: str, name_ro: str, name_en: str) -> Domain:
    domain = db.execute(select(Domain).where(Domain.slug == slug)).scalar_one_or_none()
    if domain is None:
        domain = Domain(name_ro=name_ro, name_en=name_en, slug=slug, is_active=True)
        db.add(domain)
        db.flush()
    return domain


def _get_or_create_category(
    db: Session,
    *,
    domain: Domain,
    slug: str,
    name_ro: str,
    name_en: str,
) -> Category:
    category = db.execute(select(Category).where(Category.slug == slug)).scalar_one_or_none()
    if category is None:
        category = Category(
            domain_id=domain.id,
            name_ro=name_ro,
            name_en=name_en,
            slug=slug,
            is_active=True,
        )
        db.add(category)
        db.flush()
    return category


def _get_or_create_subcategory(
    db: Session,
    *,
    category: Category,
    slug: str,
    name_ro: str,
    name_en: str,
) -> SubCategory:
    subcategory = db.execute(select(SubCategory).where(SubCategory.slug == slug)).scalar_one_or_none()
    if subcategory is None:
        subcategory = SubCategory(
            category_id=category.id,
            name_ro=name_ro,
            name_en=name_en,
            slug=slug,
            is_active=True,
        )
        db.add(subcategory)
        db.flush()
    return subcategory


def _get_or_create_service(
    db: Session,
    *,
    subcategory: SubCategory,
    slug: str,
    name: str,
    description: str,
) -> Service:
    service = db.execute(select(Service).where(Service.slug == slug)).scalar_one_or_none()
    if service is None:
        service = Service(
            name=name,
            slug=slug,
            description=description,
            description_extended=description,
            is_active=True,
        )
        service.subcategories = [subcategory]
        db.add(service)
        db.flush()
    elif subcategory not in service.subcategories:
        service.subcategories.append(subcategory)
        db.flush()
    return service


def _get_or_create_asset_type(
    db: Session,
    *,
    slug: str,
    name_ro: str,
    name_en: str,
    asset_family: str,
    technical_schema: dict,
) -> AssetType:
    asset_type = db.execute(select(AssetType).where(AssetType.slug == slug)).scalar_one_or_none()
    if asset_type is None:
        asset_type = AssetType(
            slug=slug,
            name_ro=name_ro,
            name_en=name_en,
            asset_family=asset_family,
            technical_schema=technical_schema,
            is_active=True,
        )
        db.add(asset_type)
        db.flush()
    else:
        asset_type.name_ro = name_ro
        asset_type.name_en = name_en
        asset_type.asset_family = asset_family
        asset_type.technical_schema = technical_schema
        asset_type.is_active = True
        db.flush()
    return asset_type


def _get_or_create_task_type(
    db: Session,
    *,
    slug: str,
    name_ro: str,
    name_en: str,
    operation_kind: str,
    required_caen_code: str | None,
    required_certification_codes: list[str],
) -> TaskType:
    task_type = db.execute(select(TaskType).where(TaskType.slug == slug)).scalar_one_or_none()
    if task_type is None:
        task_type = TaskType(
            slug=slug,
            name_ro=name_ro,
            name_en=name_en,
            operation_kind=operation_kind,
            required_caen_code=required_caen_code,
            required_certification_codes=required_certification_codes,
            requires_certification=bool(required_certification_codes),
            is_active=True,
        )
        db.add(task_type)
        db.flush()
    else:
        task_type.name_ro = name_ro
        task_type.name_en = name_en
        task_type.operation_kind = operation_kind
        task_type.required_caen_code = required_caen_code
        task_type.required_certification_codes = required_certification_codes
        task_type.requires_certification = bool(required_certification_codes)
        task_type.is_active = True
        db.flush()
    return task_type


def _get_or_create_asset_task_rule(
    db: Session,
    *,
    asset_type: AssetType,
    task_type: TaskType,
    service: Service | None,
    rule_payload: dict,
) -> AssetTaskRule:
    rule = db.execute(
        select(AssetTaskRule).where(
            AssetTaskRule.asset_type_id == asset_type.id,
            AssetTaskRule.task_type_id == task_type.id,
        )
    ).scalar_one_or_none()
    if rule is None:
        rule = AssetTaskRule(
            asset_type_id=asset_type.id,
            task_type_id=task_type.id,
            service_id=service.id if service else None,
            activity_id=None,
            is_default=True,
            rule_payload=rule_payload,
        )
        db.add(rule)
        db.flush()
    else:
        rule.service_id = service.id if service else None
        rule.rule_payload = rule_payload
        rule.is_default = True
        db.flush()
    return rule


def _get_or_create_supplier(
    db: Session,
    *,
    name: str,
    rating: float,
    location_geo: dict,
    insurance_policy_no: str,
) -> Supplier:
    supplier = db.execute(select(Supplier).where(Supplier.name == name)).scalar_one_or_none()
    if supplier is None:
        supplier = Supplier(
            name=name,
            rating=rating,
            location_geo=location_geo,
            insurance_status="ACTIVE",
            insurance_policy_no=insurance_policy_no,
            insurance_valid_until=_future_date(365),
            is_active=True,
        )
        db.add(supplier)
        db.flush()
    else:
        supplier.rating = rating
        supplier.location_geo = location_geo
        supplier.insurance_status = "ACTIVE"
        supplier.insurance_policy_no = insurance_policy_no
        supplier.insurance_valid_until = _future_date(365)
        supplier.is_active = True
        db.flush()
    return supplier


def _get_or_create_provider_capability(
    db: Session,
    *,
    supplier: Supplier,
    task_type: TaskType,
    asset_type: AssetType | None,
    caen_code: str,
    certification_codes: list[str],
    can_lead_package: bool,
) -> ProviderCapability:
    capability = db.execute(
        select(ProviderCapability).where(
            ProviderCapability.supplier_id == supplier.id,
            ProviderCapability.task_type_id == task_type.id,
            ProviderCapability.asset_type_id == (asset_type.id if asset_type else None),
            ProviderCapability.caen_code == caen_code,
        )
    ).scalar_one_or_none()
    if capability is None:
        capability = ProviderCapability(
            supplier_id=supplier.id,
            task_type_id=task_type.id,
            asset_type_id=asset_type.id if asset_type else None,
            caen_code=caen_code,
            certification_codes=certification_codes,
            can_lead_package=can_lead_package,
            is_active=True,
        )
        db.add(capability)
        db.flush()
    else:
        capability.certification_codes = certification_codes
        capability.can_lead_package = can_lead_package
        capability.is_active = True
        db.flush()
    return capability


def _get_or_create_asset(
    db: Session,
    *,
    asset_id: str,
    asset_type: AssetType,
    category: Category,
    service: Service | None,
    display_name: str,
    technical_specs: dict,
    maintenance_history_id: str,
    warranty_status: str,
    manufacturer: str,
    model: str,
    serial_number: str,
) -> Asset:
    asset = db.execute(select(Asset).where(Asset.asset_id == asset_id)).scalar_one_or_none()
    if asset is None:
        asset = Asset(
            asset_id=asset_id,
            asset_type_id=asset_type.id,
            category_id=category.id,
            service_id=service.id if service else None,
            display_name=display_name,
            technical_specs=technical_specs,
            maintenance_history_id=maintenance_history_id,
            warranty_status=warranty_status,
            manufacturer=manufacturer,
            model=model,
            serial_number=serial_number,
            is_active=True,
        )
        db.add(asset)
        db.flush()
    else:
        asset.asset_type_id = asset_type.id
        asset.category_id = category.id
        asset.service_id = service.id if service else None
        asset.display_name = display_name
        asset.technical_specs = technical_specs
        asset.maintenance_history_id = maintenance_history_id
        asset.warranty_status = warranty_status
        asset.manufacturer = manufacturer
        asset.model = model
        asset.serial_number = serial_number
        asset.is_active = True
        db.flush()
    return asset


def seed_hvac(db: Session) -> None:
    domain = _get_or_create_domain(db, slug="home-services", name_ro="Home Services", name_en="Home Services")
    category = _get_or_create_category(db, domain=domain, slug="instalatii-termice", name_ro="Instalatii termice", name_en="Thermal installations")
    subcategory = _get_or_create_subcategory(
        db,
        category=category,
        slug="centrale-termice",
        name_ro="Centrale termice",
        name_en="Thermal boilers",
    )
    service = _get_or_create_service(
        db,
        subcategory=subcategory,
        slug="montaj-centrala-termica",
        name="Montaj centrala termica",
        description="Serviciu HVAC pentru montaj, punere in functiune si configurare centrala termica.",
    )
    asset_type = _get_or_create_asset_type(
        db,
        slug="centrala-termica",
        name_ro="Centrala termica",
        name_en="Thermal boiler",
        asset_family="HVAC",
        technical_schema={
            "putere_kw": "float",
            "tip_combustibil": "string",
            "tip_emisii": "string",
            "data_ultimei_revizii": "date",
        },
    )
    task_type = _get_or_create_task_type(
        db,
        slug="montaj-centrala",
        name_ro="Montaj centrala",
        name_en="Boiler installation",
        operation_kind="INSTALL",
        required_caen_code="4322",
        required_certification_codes=["GAS_AUTH"],
    )
    _get_or_create_asset_task_rule(db, asset_type=asset_type, task_type=task_type, service=service, rule_payload={"default_quantity": 1})
    supplier = _get_or_create_supplier(
        db,
        name="Furnizor B (Bucuresti Sud)",
        rating=4.5,
        location_geo={
            "country_codes": ["RO"],
            "zone_slugs": ["bucuresti-ilfov"],
            "locality_slugs": ["bucuresti-sud", "bucuresti-nord"],
            "specializations": ["LABOR", "EQUIPMENT", "HVAC"],
        },
        insurance_policy_no="POL-HVAC-001",
    )
    _get_or_create_provider_capability(
        db,
        supplier=supplier,
        task_type=task_type,
        asset_type=asset_type,
        caen_code="4322",
        certification_codes=["GAS_AUTH"],
        can_lead_package=True,
    )
    _get_or_create_asset(
        db,
        asset_id="ASSET-HVAC-0001",
        asset_type=asset_type,
        category=category,
        service=service,
        display_name="Centrala termica Bosch Condens 28kW",
        technical_specs={
            "putere_kw": 28,
            "tip_combustibil": "gaz",
            "tip_emisii": "condensare",
            "data_ultimei_revizii": "2025-10-12",
        },
        maintenance_history_id="MH-HVAC-0001",
        warranty_status="IN_WARRANTY",
        manufacturer="Bosch",
        model="Condens 7000i",
        serial_number="HVAC-7000I-28KW-001",
    )


def seed_naval(db: Session) -> None:
    domain = _get_or_create_domain(
        db,
        slug="naval-aviatic-operatiuni",
        name_ro="Naval si Aviatic",
        name_en="Naval and Aviation",
    )
    category = _get_or_create_category(db, domain=domain, slug="operatiuni-navale", name_ro="Operatiuni navale", name_en="Naval operations")
    subcategory = _get_or_create_subcategory(
        db,
        category=category,
        slug="mentenanta-ambarcatiuni",
        name_ro="Mentenanta ambarcatiuni",
        name_en="Boat maintenance",
    )
    service = _get_or_create_service(
        db,
        subcategory=subcategory,
        slug="reparatie-motor-naval",
        name="Reparatie motor naval",
        description="Diagnoza si reparatie pentru sisteme de propulsie navala.",
    )
    asset_type = _get_or_create_asset_type(
        db,
        slug="ambarcatiune-motor",
        name_ro="Ambarcatiune cu motor",
        name_en="Motorized vessel",
        asset_family="NAVAL",
        technical_schema={
            "ore_functionare_motor": "float",
            "serie_sasiu_coca": "string",
            "certificat_navigabilitate_expira_la": "date",
        },
    )
    task_type = _get_or_create_task_type(
        db,
        slug="reparatie-motor-naval",
        name_ro="Reparatie motor naval",
        name_en="Naval engine repair",
        operation_kind="REPAIR",
        required_caen_code="3315",
        required_certification_codes=["NAVAL_ENGINE_CERT"],
    )
    _get_or_create_asset_task_rule(db, asset_type=asset_type, task_type=task_type, service=service, rule_payload={"compliance_required": True})
    supplier = _get_or_create_supplier(
        db,
        name="Furnizor D (Port Constanta)",
        rating=4.7,
        location_geo={
            "country_codes": ["RO"],
            "zone_slugs": ["dobrogea"],
            "locality_slugs": ["constanta"],
            "specializations": ["NAVAL", "MARINE_ENGINE"],
        },
        insurance_policy_no="POL-NAVAL-001",
    )
    _get_or_create_provider_capability(
        db,
        supplier=supplier,
        task_type=task_type,
        asset_type=asset_type,
        caen_code="3315",
        certification_codes=["NAVAL_ENGINE_CERT"],
        can_lead_package=True,
    )
    _get_or_create_asset(
        db,
        asset_id="ASSET-NAVAL-0001",
        asset_type=asset_type,
        category=category,
        service=service,
        display_name="Ambarcatiune service 12m diesel",
        technical_specs={
            "ore_functionare_motor": 1820,
            "serie_sasiu_coca": "RO-BC-9081-MD",
            "certificat_navigabilitate_expira_la": "2026-08-31",
        },
        maintenance_history_id="MH-NAVAL-0001",
        warranty_status="OUT_OF_WARRANTY",
        manufacturer="Volvo Penta",
        model="D6 Marine",
        serial_number="NAVAL-D6-0001",
    )


def seed_rental(db: Session) -> None:
    domain = _get_or_create_domain(
        db,
        slug="inchirieri-utilaje-si-logistica",
        name_ro="Inchirieri utilaje si logistica",
        name_en="Rental equipment and logistics",
    )
    category = _get_or_create_category(
        db,
        domain=domain,
        slug="generatoare-si-energie-mobila",
        name_ro="Generatoare si energie mobila",
        name_en="Generators and mobile power",
    )
    subcategory = _get_or_create_subcategory(
        db,
        category=category,
        slug="generatoare-mobile",
        name_ro="Generatoare mobile",
        name_en="Mobile generators",
    )
    service = _get_or_create_service(
        db,
        subcategory=subcategory,
        slug="inchiriere-generator-mobil",
        name="Inchiriere generator mobil",
        description="Serviciu de inchiriere pentru generatoare mobile cu livrare si retur.",
    )
    asset_type = _get_or_create_asset_type(
        db,
        slug="generator-mobil",
        name_ro="Generator mobil",
        name_en="Mobile generator",
        asset_family="RENTAL",
        technical_schema={
            "putere_nominala_kva": "float",
            "tip_consumabile": "array",
            "interval_mentenanta_ore": "int",
            "stoc_disponibil_real_time": "int",
        },
    )
    task_type = _get_or_create_task_type(
        db,
        slug="inchiriere-generator",
        name_ro="Inchiriere generator",
        name_en="Generator rental",
        operation_kind="RENT",
        required_caen_code="7732",
        required_certification_codes=[],
    )
    _get_or_create_asset_task_rule(db, asset_type=asset_type, task_type=task_type, service=service, rule_payload={"reservation_required": True})
    supplier = _get_or_create_supplier(
        db,
        name="Furnizor E (Utilaje Mobile)",
        rating=4.6,
        location_geo={
            "country_codes": ["RO"],
            "zone_slugs": ["bucuresti-ilfov"],
            "locality_slugs": ["bucuresti-sud", "bucuresti-nord", "ilfov"],
            "specializations": ["RENTAL", "GENERATOR", "EQUIPMENT"],
        },
        insurance_policy_no="POL-RENTAL-001",
    )
    _get_or_create_provider_capability(
        db,
        supplier=supplier,
        task_type=task_type,
        asset_type=asset_type,
        caen_code="7732",
        certification_codes=[],
        can_lead_package=False,
    )
    _get_or_create_asset(
        db,
        asset_id="ASSET-RENTAL-0001",
        asset_type=asset_type,
        category=category,
        service=service,
        display_name="Generator mobil 35 kVA",
        technical_specs={
            "putere_nominala_kva": 35,
            "tip_consumabile": ["ulei 10W40", "filtru aer", "motorina"],
            "interval_mentenanta_ore": 250,
            "stoc_disponibil_real_time": 4,
        },
        maintenance_history_id="MH-RENTAL-0001",
        warranty_status="SERVICE_CONTRACT",
        manufacturer="Atlas Copco",
        model="QES 35",
        serial_number="GEN-35KVA-0001",
    )


def main() -> None:
    db = SessionLocal()
    try:
        seed_hvac(db)
        seed_naval(db)
        seed_rental(db)
        db.commit()
        print("Seed production assets complete.")
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
