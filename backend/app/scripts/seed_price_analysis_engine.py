from __future__ import annotations

import argparse
from pathlib import Path

from sqlalchemy import select

from app.db.session import SessionLocal
from app.models.category import Category
from app.models.domain import Domain
from app.models.subcategory import SubCategory
from app.schemas.price_analysis import (
    AdminResourcePriceConfigCreate,
    CatalogActivityCreate,
    CatalogResourceCreate,
    PriceAnalysisRecipeCreate,
    ResourceType,
)
from app.services.attachment_service import seed_attachment_file
from app.services.price_analysis_service import (
    create_activity,
    create_recipe,
    create_resource,
    create_resource_price_config,
    get_activity_by_uniclass_code,
    import_historical_indicators,
    import_resource_prices,
    import_uniclass_activities,
    parse_indicator_import_file,
    parse_uniclass_import_file,
)


SEED_RESOURCES = [
    {
        "key": "labor_construction",
        "esco_code": "http://data.europa.eu/esco/skill/592525ab-b517-4c55-8c65-17e0f5d99205",
        "name_ro": "Echipa montaj structuri",
        "name_en": "Structure installation crew",
        "resource_type": ResourceType.LABOR,
        "base_price": 145.0,
        "unit": "ora",
        "technical_specs": {"source": "ESCO", "seniority": "mid"},
    },
    {
        "key": "material_concrete",
        "esco_code": None,
        "name_ro": "Beton C25/30",
        "name_en": "Concrete C25/30",
        "resource_type": ResourceType.MATERIAL,
        "base_price": 540.0,
        "unit": "mc",
        "technical_specs": {"class": "C25/30"},
    },
    {
        "key": "labor_smart",
        "esco_code": "http://data.europa.eu/esco/skill/74fc4291-203e-4082-9f22-8499f584861c",
        "name_ro": "Tehnician smart home",
        "name_en": "Smart home technician",
        "resource_type": ResourceType.LABOR,
        "base_price": 180.0,
        "unit": "ora",
        "technical_specs": {"source": "ESCO"},
    },
    {
        "key": "equipment_drill",
        "esco_code": None,
        "name_ro": "Scule instalare si configurare",
        "name_en": "Installation and configuration tools",
        "resource_type": ResourceType.EQUIPMENT,
        "base_price": 65.0,
        "unit": "ora",
        "technical_specs": {"bundle": "smart-home-kit"},
    },
    {
        "key": "labor_pv",
        "esco_code": "http://data.europa.eu/esco/skill/6d53015b-6867-408f-8f3a-4eb9d5dae101",
        "name_ro": "Echipa montaj fotovoltaic",
        "name_en": "Photovoltaic installation crew",
        "resource_type": ResourceType.LABOR,
        "base_price": 170.0,
        "unit": "ora",
        "technical_specs": {"source": "ESCO"},
    },
    {
        "key": "material_panel",
        "esco_code": None,
        "name_ro": "Panou fotovoltaic monocristalin",
        "name_en": "Monocrystalline photovoltaic panel",
        "resource_type": ResourceType.MATERIAL,
        "base_price": 720.0,
        "unit": "buc",
        "technical_specs": {"power_w": 450},
    },
    {
        "key": "labor_logistics",
        "esco_code": "http://data.europa.eu/esco/skill/0332f526-6dc0-4f09-8a7c-2b9473c50736",
        "name_ro": "Coordonator logistica",
        "name_en": "Logistics coordinator",
        "resource_type": ResourceType.LABOR,
        "base_price": 130.0,
        "unit": "ora",
        "technical_specs": {"source": "ESCO"},
    },
    {
        "key": "transport_van",
        "esco_code": None,
        "name_ro": "Transport van marfa",
        "name_en": "Freight van transport",
        "resource_type": ResourceType.TRANSPORT,
        "base_price": 4.8,
        "unit": "km",
        "technical_specs": {"vehicle_type": "van"},
    },
    {
        "key": "material_calorifer_fonta",
        "esco_code": None,
        "name_ro": "Calorifer fonta",
        "name_en": "Cast iron radiator",
        "resource_type": ResourceType.MATERIAL,
        "base_price": 980.0,
        "unit": "buc",
        "technical_specs": {
            "object_kind": "TECH_OBJECT",
            "equipment_type": "radiator",
            "brand": "Generic",
            "weight_category": "heavy",
            "weight_kg": 140,
            "height_m": 1.2,
            "pivot_actions": ["Reparatie", "Mentenanta", "Inlocuire", "Montaj"],
            "auto_activity": ["Manipulare", "Inlocuire"],
        },
    },
    {
        "key": "material_calorifer_aluminiu",
        "esco_code": None,
        "name_ro": "Calorifer aluminiu",
        "name_en": "Aluminium radiator",
        "resource_type": ResourceType.MATERIAL,
        "base_price": 620.0,
        "unit": "buc",
        "technical_specs": {
            "object_kind": "TECH_OBJECT",
            "equipment_type": "radiator",
            "brand": "Generic",
            "weight_kg": 42,
            "pivot_actions": ["Reparatie", "Mentenanta", "Inlocuire", "Montaj"],
        },
    },
    {
        "key": "material_usi_interioare",
        "esco_code": None,
        "name_ro": "Usi interioare",
        "name_en": "Interior doors",
        "resource_type": ResourceType.MATERIAL,
        "base_price": 880.0,
        "unit": "buc",
        "technical_specs": {
            "object_kind": "TECH_OBJECT",
            "equipment_type": "door",
            "pivot_actions": ["Reparatie", "Mentenanta", "Inlocuire", "Montaj"],
        },
    },
    {
        "key": "material_obiecte_sanitare",
        "esco_code": None,
        "name_ro": "Obiecte sanitare",
        "name_en": "Sanitary objects",
        "resource_type": ResourceType.MATERIAL,
        "base_price": 760.0,
        "unit": "buc",
        "technical_specs": {
            "object_kind": "TECH_OBJECT",
            "equipment_type": "sanitary",
            "pivot_actions": ["Reparatie", "Mentenanta", "Inlocuire", "Montaj"],
        },
    },
    {
        "key": "material_aer_conditionat",
        "esco_code": None,
        "name_ro": "Aer conditionat",
        "name_en": "Air conditioning unit",
        "resource_type": ResourceType.MATERIAL,
        "base_price": 1850.0,
        "unit": "buc",
        "technical_specs": {
            "object_kind": "TECH_OBJECT",
            "equipment_type": "ac",
            "height_m": 3.4,
            "pivot_actions": ["Reparatie", "Mentenanta", "Inlocuire", "Montaj"],
        },
    },
    {
        "key": "material_parchet_gresie",
        "esco_code": None,
        "name_ro": "Parchet / Gresie",
        "name_en": "Parquet / Tiles",
        "resource_type": ResourceType.MATERIAL,
        "base_price": 110.0,
        "unit": "mp",
        "technical_specs": {
            "object_kind": "TECH_OBJECT",
            "equipment_type": "finishes",
            "pivot_actions": ["Reparatie", "Mentenanta", "Inlocuire", "Montaj"],
        },
    },
    {
        "key": "material_ciment",
        "esco_code": None,
        "name_ro": "Ciment",
        "name_en": "Cement",
        "resource_type": ResourceType.MATERIAL,
        "base_price": 28.0,
        "unit": "sac",
        "technical_specs": {
            "object_kind": "CONSUMABLE",
            "equipment_type": "material",
            "pivot_actions": ["Material suport (fara mentenanta)"],
            "support_material": True,
        },
    },
    {
        "key": "rental_nacela",
        "esco_code": None,
        "name_ro": "Nacela",
        "name_en": "Boom lift",
        "resource_type": ResourceType.EQUIPMENT,
        "base_price": 420.0,
        "unit": "zi",
        "technical_specs": {
            "object_kind": "RENTAL",
            "equipment_type": "nacela",
            "brand": "JLG",
            "pivot_actions": ["Utilaj necesar pentru nivel AUR/PLATINA"],
        },
    },
    {
        "key": "labor_service",
        "esco_code": "http://data.europa.eu/esco/skill/0b4d52be-fb79-4a6c-8177-799f1214aae5",
        "name_ro": "Mecanic diagnoza utilaje",
        "name_en": "Equipment diagnostics mechanic",
        "resource_type": ResourceType.LABOR,
        "base_price": 165.0,
        "unit": "ora",
        "technical_specs": {"source": "ESCO"},
    },
]


SEED_ACTIVITIES = [
    {
        "uniclass_code": "Ac_05_10",
        "name_ro": "Executie fundatii si structuri",
        "name_en": "Foundations and structures execution",
        "uom": "mc",
        "subcategory_slug": "executie-structuri-fundatii",
        "description": "Activitate initiala aliniata la Uniclass pentru lucrari structurale.",
        "recipes": [
            {"resource_key": "labor_construction", "specific_consumption": 3.4, "waste_percentage": 0, "coefficient_bronz": 0.85, "coefficient_argint": 1.0, "coefficient_aur": 1.15, "coefficient_platinum": 1.25, "is_essential": True},
            {"resource_key": "material_concrete", "specific_consumption": 1.0, "waste_percentage": 4, "coefficient_bronz": 1.0, "coefficient_argint": 1.0, "coefficient_aur": 1.05, "coefficient_platinum": 1.1, "is_essential": True},
        ],
    },
    {
        "uniclass_code": "TE_70_80_85",
        "name_ro": "Instalare si configurare smart home",
        "name_en": "Smart home installation and configuration",
        "uom": "sistem",
        "subcategory_slug": "sisteme-smart-home",
        "description": "Activitate Uniclass pentru sisteme smart home rezidentiale.",
        "recipes": [
            {"resource_key": "labor_smart", "specific_consumption": 6.0, "waste_percentage": 0, "coefficient_bronz": 0.75, "coefficient_argint": 1.0, "coefficient_aur": 1.15, "coefficient_platinum": 1.3, "is_essential": True},
            {"resource_key": "equipment_drill", "specific_consumption": 2.5, "waste_percentage": 0, "coefficient_bronz": 0.6, "coefficient_argint": 1.0, "coefficient_aur": 1.1, "coefficient_platinum": 1.2, "is_essential": False},
        ],
    },
    {
        "uniclass_code": "EF_70_20",
        "name_ro": "Montaj panouri fotovoltaice",
        "name_en": "Photovoltaic panel installation",
        "uom": "sistem",
        "subcategory_slug": "montaj-panouri-invertoare",
        "description": "Activitate pentru montaj panouri si invertoare.",
        "recipes": [
            {"resource_key": "labor_pv", "specific_consumption": 8.5, "waste_percentage": 0, "coefficient_bronz": 0.85, "coefficient_argint": 1.0, "coefficient_aur": 1.12, "coefficient_platinum": 1.22, "is_essential": True},
            {"resource_key": "material_panel", "specific_consumption": 10, "waste_percentage": 2, "coefficient_bronz": 0.8, "coefficient_argint": 1.0, "coefficient_aur": 1.0, "coefficient_platinum": 1.1, "is_essential": True},
        ],
    },
    {
        "uniclass_code": "Ac_15_10_46",
        "name_ro": "Operare logistica last mile",
        "name_en": "Last mile logistics operation",
        "uom": "cursa",
        "subcategory_slug": "logistica-last-mile",
        "description": "Activitate operationala pentru livrari si coordonare last mile.",
        "recipes": [
            {"resource_key": "labor_logistics", "specific_consumption": 1.8, "waste_percentage": 0, "coefficient_bronz": 0.8, "coefficient_argint": 1.0, "coefficient_aur": 1.1, "coefficient_platinum": 1.2, "is_essential": True},
            {"resource_key": "transport_van", "specific_consumption": 35, "waste_percentage": 0, "coefficient_bronz": 0.9, "coefficient_argint": 1.0, "coefficient_aur": 1.05, "coefficient_platinum": 1.1, "is_essential": True},
        ],
    },
    {
        "uniclass_code": "Ma_15_10_25",
        "name_ro": "Diagnoza si mentenanta utilaje",
        "name_en": "Equipment diagnostics and maintenance",
        "uom": "interventie",
        "subcategory_slug": "diagnoza-mentenanta-utilaje",
        "description": "Activitate pentru diagnostic si mentenanta in service utilaje.",
        "recipes": [
            {"resource_key": "labor_service", "specific_consumption": 4.0, "waste_percentage": 0, "coefficient_bronz": 0.85, "coefficient_argint": 1.0, "coefficient_aur": 1.1, "coefficient_platinum": 1.25, "is_essential": True},
            {"resource_key": "equipment_drill", "specific_consumption": 1.2, "waste_percentage": 0, "coefficient_bronz": 0.5, "coefficient_argint": 0.8, "coefficient_aur": 1.0, "coefficient_platinum": 1.1, "is_essential": False},
        ],
    },
]

HISTORICAL_INDICATOR_FILES = [
    r"c:\Users\admin\Desktop\INDICATORI DEVIZ\RPGD - Lucrari diverse.xlsx",
    r"c:\Users\admin\Desktop\INDICATORI DEVIZ\RPGC - Armaturi si accesorii.xlsx",
    r"c:\Users\admin\Desktop\INDICATORI DEVIZ\RPGB - Aparate de utilizare.xlsx",
    r"c:\Users\admin\Desktop\INDICATORI DEVIZ\RPGA - Conducte si accesorii.xlsx",
]
HISTORICAL_SEED_ROW_LIMIT = 180

DEMO_RESOURCE_PRICE_CONFIGS = [
    {"resource_key": "material_concrete", "country_code": "RO", "zone_name": None, "currency": "RON", "base_price": 560.0, "zone_multiplier": 1.0, "legislation_code": "RO"},
    {"resource_key": "material_panel", "country_code": "RO", "zone_name": "Bucuresti-Ilfov", "currency": "RON", "base_price": 745.0, "zone_multiplier": 1.08, "legislation_code": "RO"},
    {"resource_key": "equipment_drill", "country_code": "RO", "zone_name": "Bucuresti-Ilfov", "currency": "RON", "base_price": 72.0, "zone_multiplier": 1.05, "legislation_code": "RO"},
    {"resource_key": "transport_van", "country_code": "RO", "zone_name": None, "currency": "RON", "base_price": 5.2, "zone_multiplier": 1.0, "legislation_code": "RO"},
]

ROMANIA_ZONES = [
    {"name": "Bucuresti-Ilfov", "name_ro": "Bucuresti-Ilfov", "name_en": "Bucharest-Ilfov", "slug": "bucuresti-ilfov", "multiplier": 1.08},
    {"name": "Nord-Vest", "name_ro": "Nord-Vest", "name_en": "North-West", "slug": "nord-vest", "multiplier": 1.03},
    {"name": "Nord-Est", "name_ro": "Nord-Est", "name_en": "North-East", "slug": "nord-est", "multiplier": 1.01},
    {"name": "Sud-Est", "name_ro": "Sud-Est", "name_en": "South-East", "slug": "sud-est", "multiplier": 1.02},
    {"name": "Vest", "name_ro": "Vest", "name_en": "West", "slug": "vest", "multiplier": 1.04},
]

ROMANIA_LOCALITIES = [
    {"zone_slug": "bucuresti-ilfov", "name_ro": "Bucuresti", "name_en": "Bucharest", "slug": "bucuresti", "latitude": 44.4268, "longitude": 26.1025},
    {"zone_slug": "nord-vest", "name_ro": "Cluj-Napoca", "name_en": "Cluj-Napoca", "slug": "cluj-napoca", "latitude": 46.7712, "longitude": 23.6236},
    {"zone_slug": "nord-est", "name_ro": "Iasi", "name_en": "Iasi", "slug": "iasi", "latitude": 47.1585, "longitude": 27.6014},
    {"zone_slug": "sud-est", "name_ro": "Constanta", "name_en": "Constanta", "slug": "constanta", "latitude": 44.1598, "longitude": 28.6348},
    {"zone_slug": "vest", "name_ro": "Timisoara", "name_en": "Timisoara", "slug": "timisoara", "latitude": 45.7489, "longitude": 21.2087},
]


def _ensure_demo_geography(db) -> None:
    from app.modules.geography.models import Country, Zone

    country = db.execute(select(Country).where(Country.code == "RO")).scalar_one_or_none()
    if not country:
        country = Country(
            name="Romania",
            name_ro="Romania",
            name_en="Romania",
            slug="romania",
            code="RO",
            currency="RON",
            is_active=True,
        )
        db.add(country)
        db.commit()
        db.refresh(country)
    else:
        country.name_ro = country.name_ro or country.name
        country.name_en = country.name_en or country.name
        country.slug = country.slug or "romania"
        country.is_active = True
        db.commit()

    zone_ids: dict[str, int] = {}
    for item in ROMANIA_ZONES:
        zone = db.execute(
            select(Zone).where(Zone.country_id == country.id, Zone.slug == item["slug"])
        ).scalar_one_or_none()
        if not zone:
            zone = Zone(
                country_id=country.id,
                name=item["name"],
                name_ro=item["name_ro"],
                name_en=item["name_en"],
                slug=item["slug"],
                multiplier=item["multiplier"],
                is_active=True,
            )
            db.add(zone)
            db.commit()
            db.refresh(zone)
        else:
            zone.name = item["name"]
            zone.name_ro = item["name_ro"]
            zone.name_en = item["name_en"]
            zone.slug = item["slug"]
            zone.multiplier = item["multiplier"]
            zone.is_active = True
            db.commit()
        zone_ids[item["slug"]] = zone.id

    from app.modules.geography.models import Locality

    for item in ROMANIA_LOCALITIES:
        locality = db.execute(
            select(Locality).where(Locality.country_id == country.id, Locality.slug == item["slug"])
        ).scalar_one_or_none()
        if not locality:
            locality = Locality(
                country_id=country.id,
                zone_id=zone_ids[item["zone_slug"]],
                name_ro=item["name_ro"],
                name_en=item["name_en"],
                slug=item["slug"],
                latitude=item["latitude"],
                longitude=item["longitude"],
                is_active=True,
            )
            db.add(locality)
            db.commit()
        else:
            locality.zone_id = zone_ids[item["zone_slug"]]
            locality.name_ro = item["name_ro"]
            locality.name_en = item["name_en"]
            locality.latitude = item["latitude"]
            locality.longitude = item["longitude"]
            locality.is_active = True
            db.commit()


def _get_taxonomy_context(db, subcategory_slug: str) -> tuple[int, int, int]:
    subcategory = db.execute(select(SubCategory).where(SubCategory.slug == subcategory_slug)).scalar_one()
    category = db.get(Category, subcategory.category_id)
    domain = db.get(Domain, category.domain_id)
    return domain.id, category.id, subcategory.id


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--uniclass-file", default=None)
    parser.add_argument("--skip-historical-indicators", action="store_true")
    args = parser.parse_args()

    db = SessionLocal()
    try:
        from app.models.price_analysis import CatalogActivity, CatalogResource, EntityAttachment, PriceAnalysisRecipe
        from app.modules.geography.models import Country, Locality, Zone

        _ensure_demo_geography(db)

        resource_ids: dict[str, int] = {}
        for item in SEED_RESOURCES:
            existing = db.execute(select(CatalogResource).where(CatalogResource.name_ro == item["name_ro"])).scalar_one_or_none()
            if not existing:
                created = create_resource(
                    db,
                    CatalogResourceCreate(
                        esco_code=item["esco_code"],
                        name_ro=item["name_ro"],
                        name_en=item["name_en"],
                        resource_type=item["resource_type"],
                        base_price=item["base_price"],
                        unit=item["unit"],
                        technical_specs=item["technical_specs"],
                    ),
                )
                resource_ids[item["key"]] = created.id
            else:
                resource_ids[item["key"]] = existing.id

        for activity_data in SEED_ACTIVITIES:
            domain_id, category_id, subcategory_id = _get_taxonomy_context(db, activity_data["subcategory_slug"])
            existing = get_activity_by_uniclass_code(db, activity_data["uniclass_code"])
            if not existing:
                created = create_activity(
                    db,
                    CatalogActivityCreate(
                        uniclass_code=activity_data["uniclass_code"],
                        name_ro=activity_data["name_ro"],
                        name_en=activity_data["name_en"],
                        uom=activity_data["uom"],
                        domain_id=domain_id,
                        category_id=category_id,
                        subcategory_id=subcategory_id,
                        description=activity_data["description"],
                    ),
                )
                activity_id = created.id
            else:
                activity_id = existing.id

            for recipe_data in activity_data["recipes"]:
                exists = db.execute(
                    select(PriceAnalysisRecipe).where(
                        PriceAnalysisRecipe.activity_id == activity_id,
                        PriceAnalysisRecipe.resource_id == resource_ids[recipe_data["resource_key"]],
                    )
                ).scalar_one_or_none()
                if exists:
                    continue
                create_recipe(
                    db,
                    PriceAnalysisRecipeCreate(
                        activity_id=activity_id,
                        resource_id=resource_ids[recipe_data["resource_key"]],
                        specific_consumption=recipe_data["specific_consumption"],
                        waste_percentage=recipe_data["waste_percentage"],
                        coefficient_bronz=recipe_data["coefficient_bronz"],
                        coefficient_argint=recipe_data["coefficient_argint"],
                        coefficient_aur=recipe_data["coefficient_aur"],
                        coefficient_platinum=recipe_data["coefficient_platinum"],
                        is_essential=recipe_data["is_essential"],
                    ),
                )

        if args.uniclass_file:
            path = Path(args.uniclass_file)
            content = path.read_bytes()
            rows = parse_uniclass_import_file(path.name, content)
            import_uniclass_activities(db, rows, default_uom="unit")

        for config in DEMO_RESOURCE_PRICE_CONFIGS:
            country = db.execute(select(Country).where(Country.code == config["country_code"])).scalar_one_or_none()
            if not country:
                continue
            zone = None
            if config["zone_name"]:
                zone = db.execute(
                    select(Zone).where(Zone.country_id == country.id, Zone.name == config["zone_name"])
                ).scalar_one_or_none()
            create_resource_price_config(
                db,
                AdminResourcePriceConfigCreate(
                    resource_id=resource_ids[config["resource_key"]],
                    country_id=country.id,
                    zone_id=zone.id if zone else None,
                    currency=config["currency"],
                    base_price=config["base_price"],
                    zone_multiplier=config["zone_multiplier"],
                    legislation_code=config["legislation_code"],
                    is_active=True,
                ),
            )

        if not args.skip_historical_indicators:
            for indicator_file in HISTORICAL_INDICATOR_FILES:
                path = Path(indicator_file)
                if not path.exists():
                    continue
                rows = parse_indicator_import_file(path.name, path.read_bytes())
                import_historical_indicators(db, rows[:HISTORICAL_SEED_ROW_LIMIT], source_name=path.name)
                country = db.execute(select(Country).where(Country.code == "RO")).scalar_one_or_none()
                if country:
                    import_resource_prices(
                        db,
                        rows[:HISTORICAL_SEED_ROW_LIMIT],
                        source_name=path.name,
                        country_id=country.id,
                        currency=country.currency,
                        legislation_code="RO",
                    )

        first_activity = db.execute(select(CatalogActivity).order_by(CatalogActivity.id)).scalar_one_or_none()
        first_service = db.execute(select(Service).order_by(Service.id)).scalar_one_or_none()
        bucharest = db.execute(select(Locality).where(Locality.slug == "bucuresti")).scalar_one_or_none()
        if first_activity and not db.execute(
            select(EntityAttachment).where(EntityAttachment.entity_type == "activity", EntityAttachment.entity_id == first_activity.id)
        ).scalar_one_or_none():
            seed_attachment_file(
                db,
                entity_type="activity",
                entity_id=first_activity.id,
                attachment_type="IMAGE",
                file_name="demo-activity.svg",
                content=b"<svg xmlns='http://www.w3.org/2000/svg' width='800' height='400'><rect width='100%' height='100%' fill='#f5efe3'/><text x='40' y='200' font-size='42'>My Darrin Activity Demo</text></svg>",
                mime_type="image/svg+xml",
                level_name="ARGINT",
            )
            seed_attachment_file(
                db,
                entity_type="activity",
                entity_id=first_activity.id,
                attachment_type="DOCUMENT",
                file_name="demo-activity.pdf",
                content=b"%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF",
                mime_type="application/pdf",
            )
        if first_service and not db.execute(
            select(EntityAttachment).where(EntityAttachment.entity_type == "service", EntityAttachment.entity_id == first_service.id)
        ).scalar_one_or_none():
            seed_attachment_file(
                db,
                entity_type="service",
                entity_id=first_service.id,
                attachment_type="IMAGE",
                file_name="demo-service.svg",
                content=b"<svg xmlns='http://www.w3.org/2000/svg' width='800' height='400'><rect width='100%' height='100%' fill='#e8f1f7'/><text x='40' y='200' font-size='42'>My Darrin Service Demo</text></svg>",
                mime_type="image/svg+xml",
                level_name="AUR",
            )
            seed_attachment_file(
                db,
                entity_type="service",
                entity_id=first_service.id,
                attachment_type="VIDEO",
                file_name="demo-service.mp4",
                content=b"Demo video placeholder for My Darrin",
                mime_type="video/mp4",
            )
    finally:
        db.close()


if __name__ == "__main__":
    main()
