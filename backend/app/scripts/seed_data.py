from __future__ import annotations

from decimal import Decimal
import json

from sqlalchemy import select, text
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.models.category import Category
from app.models.domain import Domain
from app.models.price_analysis import (
    AdminResourcePriceConfig,
    CatalogActivity,
    CatalogResource,
    PriceAnalysisRecipe,
    Supplier,
    TaxRule,
)
from app.models.service import Service
from app.models.subcategory import SubCategory
from app.modules.cost_engine.models import AdminPriceConfig
from app.modules.geography.models import Country, Locality, Zone
from app.schemas.price_analysis import ResourceType


ROMANIA = {
    "code": "RO",
    "name": "Romania",
    "slug": "romania",
    "currency": "RON",
}

BUCHAREST_ILFOV_ZONE = {
    "name": "Bucuresti-Ilfov",
    "slug": "bucuresti-ilfov",
    "multiplier": Decimal("1.00"),
}

LOCALITIES = [
    {
        "name_ro": "Bucuresti Sud",
        "name_en": "Bucharest South",
        "slug": "bucuresti-sud",
        "latitude": 44.38,
        "longitude": 26.12,
    },
    {
        "name_ro": "Bucuresti Nord",
        "name_en": "Bucharest North",
        "slug": "bucuresti-nord",
        "latitude": 44.50,
        "longitude": 26.08,
    },
    {
        "name_ro": "Ilfov",
        "name_en": "Ilfov",
        "slug": "ilfov",
        "latitude": 44.55,
        "longitude": 26.20,
    },
]

SUPPLIERS = [
    {
        "name": "Furnizor A (Bucuresti Nord)",
        "rating": 4.8,
        "location_geo": {
            "lat": 44.50,
            "lng": 26.08,
            "country_codes": ["RO"],
            "zone_slugs": ["bucuresti-ilfov"],
            "locality_slugs": ["bucuresti-nord", "bucuresti-sud", "ilfov"],
            "specializations": ["MATERIAL", "BETON", "CIMENT"],
        },
    },
    {
        "name": "Furnizor B (Bucuresti Sud)",
        "rating": 4.5,
        "location_geo": {
            "lat": 44.38,
            "lng": 26.12,
            "country_codes": ["RO"],
            "zone_slugs": ["bucuresti-ilfov"],
            "locality_slugs": ["bucuresti-sud", "bucuresti-nord"],
            "specializations": ["LABOR", "EQUIPMENT", "CENTRALE"],
        },
    },
    {
        "name": "Furnizor C (Ilfov)",
        "rating": 4.2,
        "location_geo": {
            "lat": 44.55,
            "lng": 26.20,
            "country_codes": ["RO"],
            "zone_slugs": ["bucuresti-ilfov"],
            "locality_slugs": ["ilfov", "bucuresti-nord", "bucuresti-sud"],
            "specializations": ["TRANSPORT", "AUTOBASCULANTE"],
        },
    },
]

TAX_RULES = [
    {"country_code": "RO", "locality_slug": None, "service_type": "SERVICE", "vat_percentage": 0.19},
    {"country_code": "RO", "locality_slug": None, "service_type": "LANDSCAPING", "vat_percentage": 0.19},
    {"country_code": "RO", "locality_slug": None, "service_type": "CONSTRUCTION_MATERIAL", "vat_percentage": 0.19},
    {"country_code": "GR", "locality_slug": None, "service_type": "SERVICE", "vat_percentage": 0.24},
]


def _round_amount(value: float | Decimal) -> float:
    return float(Decimal(str(value)).quantize(Decimal("0.01")))


def _normalize_location_geo(location_geo: dict) -> dict:
    if not isinstance(location_geo, dict):
        return {}
    normalized: dict[str, object] = {}
    for key, value in location_geo.items():
        if isinstance(value, list):
            normalized[key] = [str(item).strip() for item in value if str(item).strip()]
        elif isinstance(value, (int, float)):
            normalized[key] = float(value)
        elif value is None:
            continue
        else:
            normalized[key] = str(value).strip()
    # Round-trip through JSON so PostgreSQL JSONB and SQLite JSON receive plain serializable payloads.
    return json.loads(json.dumps(normalized, ensure_ascii=True))


def _sqlite_has_column(db: Session, table_name: str, column_name: str) -> bool:
    if db.bind is None or db.bind.dialect.name != "sqlite":
        return False
    rows = db.execute(text(f"PRAGMA table_info({table_name})")).all()
    return any(row[1] == column_name for row in rows)


def _ensure_sqlite_tax_rules_table(db: Session) -> None:
    if db.bind is None or db.bind.dialect.name != "sqlite":
        return
    db.execute(
        text(
            """
            CREATE TABLE IF NOT EXISTS tax_rules (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                country_code VARCHAR(3) NOT NULL,
                locality_slug VARCHAR(150),
                service_type VARCHAR(64) NOT NULL,
                vat_percentage FLOAT NOT NULL DEFAULT 0.19,
                is_active BOOLEAN NOT NULL DEFAULT 1
            )
            """
        )
    )
    db.execute(
        text(
            """
            CREATE UNIQUE INDEX IF NOT EXISTS uq_tax_rules_scope
            ON tax_rules (country_code, locality_slug, service_type)
            """
        )
    )
    db.flush()


def get_or_create_country(db: Session) -> Country:
    country = db.execute(select(Country).where(Country.code == ROMANIA["code"])).scalar_one_or_none()
    if country is None:
        country = Country(
            name=ROMANIA["name"],
            name_ro=ROMANIA["name"],
            name_en=ROMANIA["name"],
            slug=ROMANIA["slug"],
            code=ROMANIA["code"],
            currency=ROMANIA["currency"],
            is_active=True,
        )
        db.add(country)
        db.flush()
    else:
        country.name = ROMANIA["name"]
        country.name_ro = ROMANIA["name"]
        country.name_en = ROMANIA["name"]
        country.slug = ROMANIA["slug"]
        country.currency = ROMANIA["currency"]
        country.is_active = True
        db.flush()
    return country


def get_or_create_zone(db: Session, country_id: int) -> Zone:
    zone = db.execute(
        select(Zone).where(
            Zone.country_id == country_id,
            Zone.slug == BUCHAREST_ILFOV_ZONE["slug"],
        )
    ).scalar_one_or_none()
    if zone is None:
        zone = Zone(
            country_id=country_id,
            name=BUCHAREST_ILFOV_ZONE["name"],
            name_ro=BUCHAREST_ILFOV_ZONE["name"],
            name_en="Bucharest-Ilfov",
            slug=BUCHAREST_ILFOV_ZONE["slug"],
            multiplier=float(BUCHAREST_ILFOV_ZONE["multiplier"]),
            is_active=True,
        )
        db.add(zone)
        db.flush()
    else:
        zone.name = BUCHAREST_ILFOV_ZONE["name"]
        zone.name_ro = BUCHAREST_ILFOV_ZONE["name"]
        zone.name_en = "Bucharest-Ilfov"
        zone.multiplier = float(BUCHAREST_ILFOV_ZONE["multiplier"])
        zone.is_active = True
        db.flush()
    return zone


def get_or_create_locality(db: Session, *, country_id: int, zone_id: int, data: dict) -> Locality:
    locality = db.execute(
        select(Locality).where(
            Locality.country_id == country_id,
            Locality.zone_id == zone_id,
            Locality.slug == data["slug"],
        )
    ).scalar_one_or_none()
    if locality is None:
        locality = Locality(
            country_id=country_id,
            zone_id=zone_id,
            name_ro=data["name_ro"],
            name_en=data["name_en"],
            slug=data["slug"],
            latitude=data["latitude"],
            longitude=data["longitude"],
            is_active=True,
        )
        db.add(locality)
        db.flush()
    else:
        locality.name_ro = data["name_ro"]
        locality.name_en = data["name_en"]
        locality.latitude = data["latitude"]
        locality.longitude = data["longitude"]
        locality.is_active = True
        db.flush()
    return locality


def get_or_create_domain(db: Session, *, slug: str, name_ro: str, name_en: str) -> Domain:
    domain = db.execute(select(Domain).where(Domain.slug == slug)).scalar_one_or_none()
    if domain is None:
        if _sqlite_has_column(db, "domains", "name"):
            db.execute(
                text(
                    """
                    INSERT INTO domains (name, name_ro, name_en, slug, is_active, caen_codes, uniclass_codes, esco_codes)
                    VALUES (:name, :name_ro, :name_en, :slug, :is_active, '[]', '[]', '[]')
                    """
                ),
                {
                    "name": name_ro,
                    "name_ro": name_ro,
                    "name_en": name_en,
                    "slug": slug,
                    "is_active": True,
                },
            )
            db.flush()
            domain = db.execute(select(Domain).where(Domain.slug == slug)).scalar_one()
        else:
            domain = Domain(name_ro=name_ro, name_en=name_en, slug=slug, is_active=True)
            db.add(domain)
            db.flush()
    else:
        domain.name_ro = name_ro
        domain.name_en = name_en
        domain.is_active = True
        if _sqlite_has_column(db, "domains", "name"):
            db.execute(
                text(
                    """
                    UPDATE domains
                    SET name = :name, name_ro = :name_ro, name_en = :name_en, is_active = :is_active
                    WHERE id = :id
                    """
                ),
                {
                    "id": domain.id,
                    "name": name_ro,
                    "name_ro": name_ro,
                    "name_en": name_en,
                    "is_active": True,
                },
            )
        db.flush()
    return domain


def get_or_create_category(db: Session, *, domain_id: int, slug: str, name_ro: str, name_en: str) -> Category:
    category = db.execute(select(Category).where(Category.slug == slug)).scalar_one_or_none()
    if category is None:
        if _sqlite_has_column(db, "categories", "name"):
            db.execute(
                text(
                    """
                    INSERT INTO categories (domain_id, name, name_ro, name_en, slug, is_active, caen_codes, uniclass_codes, esco_codes)
                    VALUES (:domain_id, :name, :name_ro, :name_en, :slug, :is_active, '[]', '[]', '[]')
                    """
                ),
                {
                    "domain_id": domain_id,
                    "name": name_ro,
                    "name_ro": name_ro,
                    "name_en": name_en,
                    "slug": slug,
                    "is_active": True,
                },
            )
            db.flush()
            category = db.execute(select(Category).where(Category.slug == slug)).scalar_one()
        else:
            category = Category(
                domain_id=domain_id,
                name_ro=name_ro,
                name_en=name_en,
                slug=slug,
                is_active=True,
            )
            db.add(category)
            db.flush()
    else:
        category.domain_id = domain_id
        category.name_ro = name_ro
        category.name_en = name_en
        category.is_active = True
        if _sqlite_has_column(db, "categories", "name"):
            db.execute(
                text(
                    """
                    UPDATE categories
                    SET domain_id = :domain_id, name = :name, name_ro = :name_ro, name_en = :name_en, is_active = :is_active
                    WHERE id = :id
                    """
                ),
                {
                    "id": category.id,
                    "domain_id": domain_id,
                    "name": name_ro,
                    "name_ro": name_ro,
                    "name_en": name_en,
                    "is_active": True,
                },
            )
        db.flush()
    return category


def get_or_create_subcategory(db: Session, *, category_id: int, slug: str, name_ro: str, name_en: str) -> SubCategory:
    subcategory = db.execute(select(SubCategory).where(SubCategory.slug == slug)).scalar_one_or_none()
    if subcategory is None:
        if _sqlite_has_column(db, "subcategories", "name"):
            db.execute(
                text(
                    """
                    INSERT INTO subcategories (category_id, name, name_ro, name_en, slug, is_active, caen_codes, uniclass_codes, esco_codes)
                    VALUES (:category_id, :name, :name_ro, :name_en, :slug, :is_active, '[]', '[]', '[]')
                    """
                ),
                {
                    "category_id": category_id,
                    "name": name_ro,
                    "name_ro": name_ro,
                    "name_en": name_en,
                    "slug": slug,
                    "is_active": True,
                },
            )
            db.flush()
            subcategory = db.execute(select(SubCategory).where(SubCategory.slug == slug)).scalar_one()
        else:
            subcategory = SubCategory(
                category_id=category_id,
                name_ro=name_ro,
                name_en=name_en,
                slug=slug,
                is_active=True,
            )
            db.add(subcategory)
            db.flush()
    else:
        subcategory.category_id = category_id
        subcategory.name_ro = name_ro
        subcategory.name_en = name_en
        subcategory.is_active = True
        if _sqlite_has_column(db, "subcategories", "name"):
            db.execute(
                text(
                    """
                    UPDATE subcategories
                    SET category_id = :category_id, name = :name, name_ro = :name_ro, name_en = :name_en, is_active = :is_active
                    WHERE id = :id
                    """
                ),
                {
                    "id": subcategory.id,
                    "category_id": category_id,
                    "name": name_ro,
                    "name_ro": name_ro,
                    "name_en": name_en,
                    "is_active": True,
                },
            )
        db.flush()
    return subcategory


def get_or_create_service(
    db: Session,
    *,
    slug: str,
    name: str,
    description: str,
    subcategories: list[SubCategory],
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
        db.add(service)
        db.flush()
    service.name = name
    service.description = description
    service.description_extended = description
    service.is_active = True
    service.subcategories = subcategories
    db.flush()
    return service


def get_or_create_supplier(db: Session, *, name: str, rating: float, location_geo: dict) -> Supplier:
    normalized_location_geo = _normalize_location_geo(location_geo)
    supplier = db.execute(select(Supplier).where(Supplier.name == name)).scalar_one_or_none()
    if supplier is None:
        supplier = Supplier(name=name, rating=rating, location_geo=normalized_location_geo, is_active=True)
        db.add(supplier)
        db.flush()
    else:
        supplier.rating = rating
        supplier.location_geo = normalized_location_geo
        supplier.is_active = True
        db.flush()
    return supplier


def get_or_create_tax_rule(
    db: Session,
    *,
    country_code: str,
    locality_slug: str | None,
    service_type: str,
    vat_percentage: float,
) -> TaxRule:
    tax_rule = db.execute(
        select(TaxRule).where(
            TaxRule.country_code == country_code,
            TaxRule.locality_slug == locality_slug,
            TaxRule.service_type == service_type,
        )
    ).scalar_one_or_none()
    if tax_rule is None:
        tax_rule = TaxRule(
            country_code=country_code,
            locality_slug=locality_slug,
            service_type=service_type,
            vat_percentage=vat_percentage,
            is_active=True,
        )
        db.add(tax_rule)
        db.flush()
    else:
        tax_rule.vat_percentage = vat_percentage
        tax_rule.is_active = True
        db.flush()
    return tax_rule


def get_or_create_activity(
    db: Session,
    *,
    uniclass_code: str,
    name_ro: str,
    name_en: str,
    uom: str,
    domain_id: int,
    category_id: int,
    subcategory_id: int,
    description: str,
) -> CatalogActivity:
    activity = db.execute(select(CatalogActivity).where(CatalogActivity.uniclass_code == uniclass_code)).scalar_one_or_none()
    if activity is None:
        activity = CatalogActivity(
            uniclass_code=uniclass_code,
            name_ro=name_ro,
            name_en=name_en,
            uom=uom,
            domain_id=domain_id,
            category_id=category_id,
            subcategory_id=subcategory_id,
            description=description,
            description_extended=description,
            is_active=True,
        )
        db.add(activity)
        db.flush()
    else:
        activity.name_ro = name_ro
        activity.name_en = name_en
        activity.uom = uom
        activity.domain_id = domain_id
        activity.category_id = category_id
        activity.subcategory_id = subcategory_id
        activity.description = description
        activity.description_extended = description
        activity.is_active = True
        db.flush()
    return activity


def get_or_create_resource(
    db: Session,
    *,
    supplier_id: int,
    esco_code: str | None,
    name_ro: str,
    name_en: str,
    resource_type: ResourceType,
    base_price: float,
    unit: str,
    lead_time_days: int,
    stock_qty: float,
    availability_status: str,
    technical_specs: dict,
) -> CatalogResource:
    query = select(CatalogResource).where(
        CatalogResource.name_ro == name_ro,
        CatalogResource.resource_type == resource_type.value,
    )
    resource = db.execute(query).scalar_one_or_none()
    if resource is None:
        resource = CatalogResource(
            supplier_id=supplier_id,
            esco_code=esco_code,
            name_ro=name_ro,
            name_en=name_en,
            resource_type=resource_type.value,
            base_price=base_price,
            unit=unit,
            lead_time_days=lead_time_days,
            stock_qty=stock_qty,
            availability_status=availability_status,
            technical_specs=technical_specs,
            is_active=True,
        )
        db.add(resource)
        db.flush()
    else:
        resource.supplier_id = supplier_id
        resource.esco_code = esco_code
        resource.name_en = name_en
        resource.base_price = base_price
        resource.unit = unit
        resource.lead_time_days = lead_time_days
        resource.stock_qty = stock_qty
        resource.availability_status = availability_status
        resource.technical_specs = technical_specs
        resource.is_active = True
        db.flush()
    return resource


def get_or_create_recipe(
    db: Session,
    *,
    activity_id: int,
    resource_id: int,
    specific_consumption: float,
    productivity_norm: float | None,
    indicator_code: str,
    consumption_unit: str,
    waste_percentage: float,
    is_essential: bool,
    caen_nace_link: dict,
) -> PriceAnalysisRecipe:
    recipe = db.execute(
        select(PriceAnalysisRecipe).where(
            PriceAnalysisRecipe.activity_id == activity_id,
            PriceAnalysisRecipe.resource_id == resource_id,
        )
    ).scalar_one_or_none()
    if recipe is None:
        recipe = PriceAnalysisRecipe(
            activity_id=activity_id,
            resource_id=resource_id,
            specific_consumption=specific_consumption,
            productivity_norm=productivity_norm,
            indicator_code=indicator_code,
            consumption_unit=consumption_unit,
            waste_percentage=waste_percentage,
            coefficient_bronz=1.0,
            coefficient_argint=1.0,
            coefficient_aur=1.0,
            coefficient_platinum=1.0,
            level_coefficients={
                "BRONZ": 1.0,
                "ARGINT": 1.0,
                "AUR": 1.0,
                "PLATINUM": 1.0,
            },
            caen_nace_link=caen_nace_link,
            is_essential=is_essential,
        )
        db.add(recipe)
        db.flush()
    else:
        recipe.specific_consumption = specific_consumption
        recipe.productivity_norm = productivity_norm
        recipe.indicator_code = indicator_code
        recipe.consumption_unit = consumption_unit
        recipe.waste_percentage = waste_percentage
        recipe.coefficient_bronz = 1.0
        recipe.coefficient_argint = 1.0
        recipe.coefficient_aur = 1.0
        recipe.coefficient_platinum = 1.0
        recipe.level_coefficients = {
            "BRONZ": 1.0,
            "ARGINT": 1.0,
            "AUR": 1.0,
            "PLATINUM": 1.0,
        }
        recipe.caen_nace_link = caen_nace_link
        recipe.is_essential = is_essential
        db.flush()
    return recipe


def get_or_create_resource_price_config(
    db: Session,
    *,
    resource_id: int,
    country_id: int,
    zone_id: int,
    locality_id: int | None,
    currency: str,
    base_price: float,
    legislation_code: str,
) -> AdminResourcePriceConfig:
    config = db.execute(
        select(AdminResourcePriceConfig).where(
            AdminResourcePriceConfig.resource_id == resource_id,
            AdminResourcePriceConfig.country_id == country_id,
            AdminResourcePriceConfig.zone_id == zone_id,
            AdminResourcePriceConfig.locality_id == locality_id,
            AdminResourcePriceConfig.currency == currency,
            AdminResourcePriceConfig.legislation_code == legislation_code,
        )
    ).scalar_one_or_none()
    if config is None:
        config = AdminResourcePriceConfig(
            resource_id=resource_id,
            country_id=country_id,
            zone_id=zone_id,
            locality_id=locality_id,
            currency=currency,
            base_price=base_price,
            zone_multiplier=1.0,
            legislation_code=legislation_code,
            is_active=True,
        )
        db.add(config)
        db.flush()
    else:
        config.base_price = base_price
        config.zone_multiplier = 1.0
        config.is_active = True
        db.flush()
    return config


def get_or_create_admin_price_config(
    db: Session,
    *,
    service_id: int,
    country_id: int,
    zone_id: int,
    currency: str,
    legislation_code: str,
    base_price: float,
) -> AdminPriceConfig:
    config = db.execute(
        select(AdminPriceConfig).where(
            AdminPriceConfig.service_id == service_id,
            AdminPriceConfig.country_id == country_id,
            AdminPriceConfig.zone_id == zone_id,
            AdminPriceConfig.currency == currency,
            AdminPriceConfig.legislation_code == legislation_code,
        )
    ).scalar_one_or_none()

    # Current schema stores percentages, not fixed-value maintenance/platform fees.
    # These values approximate 20 RON and 50 RON on an 800 RON direct-cost baseline.
    maintenance_percentage = _round_amount(Decimal("20") / Decimal("800"))
    platform_percentage = _round_amount(Decimal("50") / Decimal("800"))

    if config is None:
        config = AdminPriceConfig(
            service_id=service_id,
            country_id=country_id,
            zone_id=zone_id,
            currency=currency,
            legislation_code=legislation_code,
            base_price=base_price,
            legislation_coefficient=1.0,
            zone_coefficient_override=1.0,
            urgency_coefficient=1.0,
            basic_level_coefficient=1.0,
            standard_level_coefficient=1.0,
            premium_level_coefficient=1.0,
            indirect_cost_percentage=0.05,
            platform_maintenance_percentage=maintenance_percentage,
            mydarrin_platform_percentage=platform_percentage,
            vat_percentage=0.19,
            minimum_order_value=150.0,
            minimum_quantity_threshold=30.0,
            platform_margin_coefficient=platform_percentage,
            vat_coefficient=0.19,
            is_active=True,
        )
        db.add(config)
        db.flush()
    else:
        config.base_price = base_price
        config.legislation_coefficient = 1.0
        config.zone_coefficient_override = 1.0
        config.urgency_coefficient = 1.0
        config.basic_level_coefficient = 1.0
        config.standard_level_coefficient = 1.0
        config.premium_level_coefficient = 1.0
        config.indirect_cost_percentage = 0.05
        config.platform_maintenance_percentage = maintenance_percentage
        config.mydarrin_platform_percentage = platform_percentage
        config.vat_percentage = 0.19
        config.minimum_order_value = 150.0
        config.minimum_quantity_threshold = 30.0
        config.platform_margin_coefficient = platform_percentage
        config.vat_coefficient = 0.19
        config.is_active = True
        db.flush()
    return config


def seed() -> None:
    db: Session = SessionLocal()
    try:
        _ensure_sqlite_tax_rules_table(db)
        country = get_or_create_country(db)
        zone = get_or_create_zone(db, country.id)
        localities = {
            item["slug"]: get_or_create_locality(db, country_id=country.id, zone_id=zone.id, data=item)
            for item in LOCALITIES
        }

        home_domain = get_or_create_domain(db, slug="home-services", name_ro="Home Services", name_en="Home Services")
        industrial_domain = get_or_create_domain(
            db,
            slug="industrial-materials",
            name_ro="Materiale industriale",
            name_en="Industrial materials",
        )

        instalatii = get_or_create_category(
            db,
            domain_id=home_domain.id,
            slug="instalatii",
            name_ro="Instalatii",
            name_en="Installations",
        )
        termice = get_or_create_subcategory(
            db,
            category_id=instalatii.id,
            slug="termice",
            name_ro="Termice",
            name_en="Thermal",
        )
        sanitare = get_or_create_subcategory(
            db,
            category_id=instalatii.id,
            slug="sanitare",
            name_ro="Sanitare",
            name_en="Sanitary",
        )

        materiale = get_or_create_category(
            db,
            domain_id=industrial_domain.id,
            slug="materiale-constructii",
            name_ro="Materiale constructii",
            name_en="Construction materials",
        )
        betoane = get_or_create_subcategory(
            db,
            category_id=materiale.id,
            slug="betoane",
            name_ro="Betoane",
            name_en="Concrete",
        )

        montaj_service = get_or_create_service(
            db,
            slug="montaj-centrala-termica",
            name="Montaj centrala termica",
            description="Serviciu sincronizat cu furnizor real pentru montaj centrala termica in Bucuresti Sud.",
            subcategories=[termice, sanitare],
        )
        beton_service = get_or_create_service(
            db,
            slug="livrare-beton-c25-30",
            name="Livrare beton C25/30",
            description="Serviciu special pentru materiale si betoane, cu stoc si transport sincronizate.",
            subcategories=[betoane],
        )
        gazon_service = get_or_create_service(
            db,
            slug="tuns-gazon",
            name="Tuns Gazon",
            description="Serviciu standardizat pentru tuns gazon, cu tarif minim si pret unitar peste prag.",
            subcategories=[sanitare],
        )

        suppliers = {
            item["name"]: get_or_create_supplier(
                db,
                name=item["name"],
                rating=item["rating"],
                location_geo=item["location_geo"],
            )
            for item in SUPPLIERS
        }

        montaj_activity = get_or_create_activity(
            db,
            uniclass_code="Ss_55_60_40_MCT",
            name_ro="Montaj centrala termica rezidentiala",
            name_en="Residential boiler installation",
            uom="interventie",
            domain_id=home_domain.id,
            category_id=instalatii.id,
            subcategory_id=termice.id,
            description="Activitate operationala pentru montaj si punere in functiune centrala termica.",
        )
        beton_activity = get_or_create_activity(
            db,
            uniclass_code="Pr_20_31_16_C2530",
            name_ro="Livrare si turnare beton C25/30",
            name_en="Concrete C25/30 delivery and pouring",
            uom="mc",
            domain_id=industrial_domain.id,
            category_id=materiale.id,
            subcategory_id=betoane.id,
            description="Activitate operationala pentru furnizare beton cu stoc si transport alocat.",
        )
        gazon_activity = get_or_create_activity(
            db,
            uniclass_code="Ss_80_10_90_TGZN",
            name_ro="Tuns gazon rezidential",
            name_en="Residential lawn mowing",
            uom="mp",
            domain_id=home_domain.id,
            category_id=instalatii.id,
            subcategory_id=sanitare.id,
            description="Activitate operationala pentru intretinere gazon cu prag minim de comanda.",
        )

        labor_resource = get_or_create_resource(
            db,
            supplier_id=suppliers["Furnizor B (Bucuresti Sud)"].id,
            esco_code="http://data.europa.eu/esco/occupation/6b3f6fd3-0c15-4d18-bfc9-9f4d70f2f32f",
            name_ro="Echipa montaj centrala termica",
            name_en="Boiler installation crew",
            resource_type=ResourceType.LABOR,
            base_price=800.0,
            unit="interventie",
            lead_time_days=1,
            stock_qty=10.0,
            availability_status="IN_STOCK",
            technical_specs={
                "service_slug": montaj_service.slug,
                "specialization": "instalatori-centrale",
                "coverage": "Bucuresti Sud",
            },
        )
        beton_resource = get_or_create_resource(
            db,
            supplier_id=suppliers["Furnizor A (Bucuresti Nord)"].id,
            esco_code=None,
            name_ro="Beton C25/30",
            name_en="Concrete C25/30",
            resource_type=ResourceType.MATERIAL,
            base_price=500.0,
            unit="mc",
            lead_time_days=1,
            stock_qty=500.0,
            availability_status="IN_STOCK",
            technical_specs={
                "service_slug": beton_service.slug,
                "material_family": "beton",
                "class": "C25/30",
            },
        )
        transport_resource = get_or_create_resource(
            db,
            supplier_id=suppliers["Furnizor C (Ilfov)"].id,
            esco_code=None,
            name_ro="Transport autobasculanta 8mc",
            name_en="8mc tipper truck transport",
            resource_type=ResourceType.TRANSPORT,
            base_price=120.0,
            unit="cursa",
            lead_time_days=1,
            stock_qty=6.0,
            availability_status="IN_STOCK",
            technical_specs={
                "service_slug": beton_service.slug,
                "vehicle_type": "autobasculanta",
                "coverage": "Bucuresti-Ilfov",
            },
        )
        gazon_resource = get_or_create_resource(
            db,
            supplier_id=suppliers["Furnizor B (Bucuresti Sud)"].id,
            esco_code=None,
            name_ro="Echipa tuns gazon",
            name_en="Lawn mowing crew",
            resource_type=ResourceType.LABOR,
            base_price=5.0,
            unit="mp",
            lead_time_days=1,
            stock_qty=50.0,
            availability_status="IN_STOCK",
            technical_specs={
                "service_slug": gazon_service.slug,
                "coverage": "Bucuresti Sud",
                "unit_pricing": "5 RON/mp",
            },
        )

        get_or_create_recipe(
            db,
            activity_id=montaj_activity.id,
            resource_id=labor_resource.id,
            specific_consumption=1.0,
            productivity_norm=1.0,
            indicator_code="MCT-LAB-001",
            consumption_unit="interventie",
            waste_percentage=0.0,
            is_essential=True,
            caen_nace_link={"caen": ["4322"], "esco": [labor_resource.esco_code], "uniclass": [montaj_activity.uniclass_code]},
        )
        get_or_create_recipe(
            db,
            activity_id=beton_activity.id,
            resource_id=beton_resource.id,
            specific_consumption=1.0,
            productivity_norm=1.0,
            indicator_code="BET-C2530-001",
            consumption_unit="mc",
            waste_percentage=0.0,
            is_essential=True,
            caen_nace_link={"caen": ["2363"], "uniclass": [beton_activity.uniclass_code]},
        )
        get_or_create_recipe(
            db,
            activity_id=beton_activity.id,
            resource_id=transport_resource.id,
            specific_consumption=1.0,
            productivity_norm=1.0,
            indicator_code="BET-TRN-001",
            consumption_unit="cursa",
            waste_percentage=0.0,
            is_essential=False,
            caen_nace_link={"caen": ["4941"], "uniclass": [beton_activity.uniclass_code]},
        )
        get_or_create_recipe(
            db,
            activity_id=gazon_activity.id,
            resource_id=gazon_resource.id,
            specific_consumption=1.0,
            productivity_norm=1.0,
            indicator_code="GAZON-LAB-001",
            consumption_unit="mp",
            waste_percentage=0.0,
            is_essential=True,
            caen_nace_link={"caen": ["8130"], "uniclass": [gazon_activity.uniclass_code]},
        )

        get_or_create_resource_price_config(
            db,
            resource_id=labor_resource.id,
            country_id=country.id,
            zone_id=zone.id,
            locality_id=localities["bucuresti-sud"].id,
            currency="RON",
            base_price=800.0,
            legislation_code="RO-STD",
        )
        get_or_create_resource_price_config(
            db,
            resource_id=beton_resource.id,
            country_id=country.id,
            zone_id=zone.id,
            locality_id=None,
            currency="RON",
            base_price=500.0,
            legislation_code="RO-BETON",
        )
        get_or_create_resource_price_config(
            db,
            resource_id=transport_resource.id,
            country_id=country.id,
            zone_id=zone.id,
            locality_id=None,
            currency="RON",
            base_price=120.0,
            legislation_code="RO-BETON",
        )
        get_or_create_resource_price_config(
            db,
            resource_id=gazon_resource.id,
            country_id=country.id,
            zone_id=zone.id,
            locality_id=localities["bucuresti-sud"].id,
            currency="RON",
            base_price=5.0,
            legislation_code="RO-SVC",
        )

        get_or_create_admin_price_config(
            db,
            service_id=montaj_service.id,
            country_id=country.id,
            zone_id=zone.id,
            currency="RON",
            legislation_code="RO-STD",
            base_price=0.0,
        )
        get_or_create_admin_price_config(
            db,
            service_id=beton_service.id,
            country_id=country.id,
            zone_id=zone.id,
            currency="RON",
            legislation_code="RO-BETON",
            base_price=300.0,
        )
        gazon_config = get_or_create_admin_price_config(
            db,
            service_id=gazon_service.id,
            country_id=country.id,
            zone_id=zone.id,
            currency="RON",
            legislation_code="RO-SVC",
            base_price=0.0,
        )
        gazon_config.indirect_cost_percentage = 0.0
        gazon_config.platform_maintenance_percentage = 0.0
        gazon_config.mydarrin_platform_percentage = 0.0
        gazon_config.vat_percentage = 0.19
        gazon_config.minimum_order_value = 150.0
        gazon_config.minimum_quantity_threshold = 30.0
        gazon_config.platform_margin_coefficient = 0.0
        gazon_config.vat_coefficient = 0.19

        for tax_rule_data in TAX_RULES:
            get_or_create_tax_rule(db, **tax_rule_data)

        db.commit()

        print("Seed completed successfully.")
        print(f"Country: {country.code} ({country.id})")
        print(f"Zone: {zone.slug} ({zone.id})")
        print(f"Services: {montaj_service.slug} ({montaj_service.id}), {beton_service.slug} ({beton_service.id}), {gazon_service.slug} ({gazon_service.id})")
        print("Suppliers:")
        for supplier in suppliers.values():
            print(f"  - {supplier.name} | rating={supplier.rating}")
        print("Resources:")
        print(f"  - {labor_resource.name_ro} | supplier={suppliers['Furnizor B (Bucuresti Sud)'].name} | stock={labor_resource.stock_qty}")
        print(f"  - {beton_resource.name_ro} | supplier={suppliers['Furnizor A (Bucuresti Nord)'].name} | stock={beton_resource.stock_qty}")
        print(f"  - {transport_resource.name_ro} | supplier={suppliers['Furnizor C (Ilfov)'].name} | stock={transport_resource.stock_qty}")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
