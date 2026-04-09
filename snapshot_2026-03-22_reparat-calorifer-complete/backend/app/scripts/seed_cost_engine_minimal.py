from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.models.category import Category
from app.models.domain import Domain
from app.models.service import Service
from app.models.subcategory import SubCategory
from app.modules.cost_engine.models import AdminPriceConfig
from app.modules.deviz_engine.models import AdminDevizRule
from app.modules.geography.models import Country, Zone


def get_or_create_domain(db: Session) -> Domain:
    domain = db.query(Domain).filter(Domain.slug == "home-services").first()
    if domain:
        return domain

    domain = Domain(name_ro="Home Services", name_en="Home Services", slug="home-services", is_active=True)
    db.add(domain)
    db.flush()
    return domain


def get_or_create_category(db: Session, domain_id: int) -> Category:
    category = db.query(Category).filter(Category.slug == "instalatii").first()
    if category:
        return category

    category = Category(
        domain_id=domain_id,
        name_ro="Instalatii",
        name_en="Installations",
        slug="instalatii",
        is_active=True,
    )
    db.add(category)
    db.flush()
    return category


def get_or_create_subcategories(db: Session, category_id: int) -> tuple[SubCategory, SubCategory]:
    sanitare = db.query(SubCategory).filter(SubCategory.slug == "sanitare").first()
    if not sanitare:
        sanitare = SubCategory(
            category_id=category_id,
            name_ro="Sanitare",
            name_en="Sanitary",
            slug="sanitare",
            is_active=True,
        )
        db.add(sanitare)
        db.flush()

    termice = db.query(SubCategory).filter(SubCategory.slug == "termice").first()
    if not termice:
        termice = SubCategory(
            category_id=category_id,
            name_ro="Termice",
            name_en="Thermal",
            slug="termice",
            is_active=True,
        )
        db.add(termice)
        db.flush()

    return sanitare, termice


def get_or_create_service(db: Session, subcategories: tuple[SubCategory, SubCategory]) -> Service:
    service = db.query(Service).filter(Service.slug == "montaj-centrala-termica").first()
    if service:
        return service

    service = Service(
        name="Montaj centrala termica",
        slug="montaj-centrala-termica",
        description="Serviciu demo pentru validare Cost Engine",
        is_active=True,
    )
    service.subcategories = list(subcategories)
    db.add(service)
    db.flush()
    return service


def get_or_create_country_and_zones(db: Session) -> tuple[Country, Zone, Zone]:
    country = db.query(Country).filter(Country.code == "RO").first()
    if not country:
        country = Country(name="Romania", code="RO", currency="RON")
        db.add(country)
        db.flush()

    urban_zone = db.query(Zone).filter(Zone.country_id == country.id, Zone.name == "Urban").first()
    if not urban_zone:
        urban_zone = Zone(country_id=country.id, name="Urban", multiplier=1.10)
        db.add(urban_zone)
        db.flush()

    metro_zone = db.query(Zone).filter(Zone.country_id == country.id, Zone.name == "Metro").first()
    if not metro_zone:
        metro_zone = Zone(country_id=country.id, name="Metro", multiplier=1.25)
        db.add(metro_zone)
        db.flush()

    return country, urban_zone, metro_zone


def get_or_create_price_config(
    db: Session,
    *,
    service_id: int,
    country_id: int,
    zone_id: int,
    currency: str,
    legislation_code: str,
    base_price: float,
    zone_override: float | None,
) -> AdminPriceConfig:
    config = db.query(AdminPriceConfig).filter(
        AdminPriceConfig.service_id == service_id,
        AdminPriceConfig.country_id == country_id,
        AdminPriceConfig.zone_id == zone_id,
        AdminPriceConfig.currency == currency,
        AdminPriceConfig.legislation_code == legislation_code,
    ).first()
    if config:
        return config

    config = AdminPriceConfig(
        service_id=service_id,
        country_id=country_id,
        zone_id=zone_id,
        currency=currency,
        legislation_code=legislation_code,
        base_price=base_price,
        legislation_coefficient=1.05,
        zone_coefficient_override=zone_override,
        urgency_coefficient=1.20,
        basic_level_coefficient=1.00,
        standard_level_coefficient=1.15,
        premium_level_coefficient=1.35,
        indirect_cost_percentage=0.10,
        platform_maintenance_percentage=0.03,
        mydarrin_platform_percentage=0.15,
        vat_percentage=0.21,
        platform_margin_coefficient=0.15,
        vat_coefficient=0.21,
        is_active=True,
    )
    db.add(config)
    db.flush()
    return config


def seed() -> None:
    db: Session = SessionLocal()
    try:
        domain = get_or_create_domain(db)
        category = get_or_create_category(db, domain.id)
        subcategories = get_or_create_subcategories(db, category.id)
        service = get_or_create_service(db, subcategories)
        country, urban_zone, metro_zone = get_or_create_country_and_zones(db)

        config_one = get_or_create_price_config(
            db,
            service_id=service.id,
            country_id=country.id,
            zone_id=urban_zone.id,
            currency="RON",
            legislation_code="RO-STD",
            base_price=850.0,
            zone_override=None,
        )
        config_two = get_or_create_price_config(
            db,
            service_id=service.id,
            country_id=country.id,
            zone_id=metro_zone.id,
            currency="RON",
            legislation_code="RO-PREM",
            base_price=1100.0,
            zone_override=1.30,
        )

        existing_rules = db.query(AdminDevizRule).filter(AdminDevizRule.service_id == service.id).all()
        if not existing_rules:
            db.add_all(
                [
                    AdminDevizRule(
                        service_id=service.id,
                        country_id=country.id,
                        level_name="BRONZ",
                        label="Bronz",
                        multiplier=1.00,
                        description="Pachet esential La Cheie",
                        sort_order=1,
                        is_active=True,
                    ),
                    AdminDevizRule(
                        service_id=service.id,
                        country_id=country.id,
                        level_name="ARGINT",
                        label="Argint",
                        multiplier=1.12,
                        description="Pachet echilibrat",
                        sort_order=2,
                        is_active=True,
                    ),
                    AdminDevizRule(
                        service_id=service.id,
                        country_id=country.id,
                        level_name="AUR",
                        label="Aur",
                        multiplier=1.25,
                        description="Pachet premium",
                        sort_order=3,
                        is_active=True,
                    ),
                    AdminDevizRule(
                        service_id=service.id,
                        country_id=country.id,
                        level_name="PLATINUM",
                        label="Platinum",
                        multiplier=1.45,
                        description="Pachet executiv complet",
                        sort_order=4,
                        is_active=True,
                    ),
                ]
            )

        db.commit()

        print("Seed completed successfully")
        print(f"Country: {country.code} ({country.id})")
        print(f"Zones: Urban={urban_zone.id}, Metro={metro_zone.id}")
        print(f"Service: {service.slug} ({service.id})")
        print(f"AdminPriceConfig IDs: {config_one.id}, {config_two.id}")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
