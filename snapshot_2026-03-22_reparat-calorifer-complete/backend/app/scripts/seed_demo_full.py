from sqlalchemy.orm import Session

from app.core.auth import hash_password
from app.db.session import SessionLocal
from app.models.category import Category
from app.models.domain import Domain
from app.models.service import Service
from app.models.subcategory import SubCategory
from app.models.user import User, UserRole
from app.modules.cost_engine.models import AdminPriceConfig
from app.modules.deviz_engine.models import AdminDevizRule
from app.modules.geography.models import Country, Zone


DOMAIN_DATA = [
    {"slug": "home-services", "name_ro": "Home Services", "name_en": "Home Services"},
]

CATEGORY_DATA = [
    {"slug": "instalatii", "name_ro": "Instalatii", "name_en": "Installations", "domain_slug": "home-services"},
    {"slug": "renovari", "name_ro": "Renovari", "name_en": "Renovations", "domain_slug": "home-services"},
]

SUBCATEGORY_DATA = [
    {"slug": "termice", "name_ro": "Termice", "name_en": "Thermal", "category_slug": "instalatii"},
    {"slug": "electrice", "name_ro": "Electrice", "name_en": "Electrical", "category_slug": "instalatii"},
    {"slug": "sanitare", "name_ro": "Sanitare", "name_en": "Sanitary", "category_slug": "instalatii"},
    {"slug": "finisaje", "name_ro": "Finisaje", "name_en": "Finishes", "category_slug": "renovari"},
]

SERVICE_DATA = [
    {
        "slug": "montaj-centrala-termica",
        "name": "Montaj centrala termica",
        "description": "Serviciu demo pentru instalare si punere in functiune",
        "subcategory_slugs": ["termice", "sanitare"],
    },
    {
        "slug": "renovare-baie-la-cheie",
        "name": "Renovare baie La Cheie",
        "description": "Serviciu demo complet pentru renovare baie",
        "subcategory_slugs": ["sanitare", "finisaje"],
    },
    {
        "slug": "refacere-instalatie-electrica",
        "name": "Refacere instalatie electrica",
        "description": "Serviciu demo pentru modernizare instalatie electrica",
        "subcategory_slugs": ["electrice"],
    },
]

COUNTRY_DATA = [
    {
        "code": "RO",
        "name": "Romania",
        "currency": "RON",
        "zones": [
            {"name": "Urban", "multiplier": 1.10},
            {"name": "Metro", "multiplier": 1.25},
            {"name": "Rural", "multiplier": 0.95},
        ],
    },
    {
        "code": "DE",
        "name": "Germany",
        "currency": "EUR",
        "zones": [
            {"name": "Urban", "multiplier": 1.20},
            {"name": "Metro", "multiplier": 1.35},
        ],
    },
]

PRICE_MATRIX = [
    {
        "service_slug": "montaj-centrala-termica",
        "country_code": "RO",
        "zone_name": "Urban",
        "legislation_code": "RO-STD",
        "base_price": 850.0,
        "zone_override": None,
    },
    {
        "service_slug": "montaj-centrala-termica",
        "country_code": "RO",
        "zone_name": "Metro",
        "legislation_code": "RO-PREM",
        "base_price": 1100.0,
        "zone_override": 1.30,
    },
    {
        "service_slug": "renovare-baie-la-cheie",
        "country_code": "RO",
        "zone_name": "Urban",
        "legislation_code": "RO-REN",
        "base_price": 5400.0,
        "zone_override": None,
    },
    {
        "service_slug": "refacere-instalatie-electrica",
        "country_code": "RO",
        "zone_name": "Urban",
        "legislation_code": "RO-ELEC",
        "base_price": 2100.0,
        "zone_override": None,
    },
    {
        "service_slug": "montaj-centrala-termica",
        "country_code": "DE",
        "zone_name": "Urban",
        "legislation_code": "DE-STD",
        "base_price": 1400.0,
        "zone_override": None,
    },
]

DEVIZ_RULES = [
    ("BRONZ", "Bronz", 1.00, "Pachet esential La Cheie", 1),
    ("ARGINT", "Argint", 1.12, "Pachet echilibrat cu coordonare extinsa", 2),
    ("AUR", "Aur", 1.25, "Pachet premium cu control operational superior", 3),
    ("PLATINUM", "Platinum", 1.45, "Pachet executiv complet, prioritar si personalizat", 4),
]

DEMO_ADMIN_EMAIL = "control.admin@mydarrin.ro"
DEMO_ADMIN_PASSWORD = "ControlRoom2026!Admin"


def get_or_create_domain(db: Session, *, slug: str, name_ro: str, name_en: str) -> Domain:
    domain = db.query(Domain).filter(Domain.slug == slug).first()
    if domain:
        return domain
    domain = Domain(name_ro=name_ro, name_en=name_en, slug=slug, is_active=True)
    db.add(domain)
    db.flush()
    return domain


def get_or_create_category(db: Session, *, domain_id: int, slug: str, name_ro: str, name_en: str) -> Category:
    category = db.query(Category).filter(Category.slug == slug).first()
    if category:
        return category
    category = Category(domain_id=domain_id, name_ro=name_ro, name_en=name_en, slug=slug, is_active=True)
    db.add(category)
    db.flush()
    return category


def get_or_create_subcategory(db: Session, *, category_id: int, slug: str, name_ro: str, name_en: str) -> SubCategory:
    subcategory = db.query(SubCategory).filter(SubCategory.slug == slug).first()
    if subcategory:
        return subcategory
    subcategory = SubCategory(category_id=category_id, name_ro=name_ro, name_en=name_en, slug=slug, is_active=True)
    db.add(subcategory)
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
    service = db.query(Service).filter(Service.slug == slug).first()
    if service is None:
        service = Service(name=name, slug=slug, description=description, is_active=True)
        db.add(service)
        db.flush()

    service.name = name
    service.description = description
    service.is_active = True
    service.subcategories = subcategories
    db.flush()
    return service


def get_or_create_country(db: Session, *, code: str, name: str, currency: str) -> Country:
    country = db.query(Country).filter(Country.code == code).first()
    if country:
        return country
    country = Country(name=name, code=code, currency=currency)
    db.add(country)
    db.flush()
    return country


def get_or_create_zone(db: Session, *, country_id: int, name: str, multiplier: float) -> Zone:
    zone = db.query(Zone).filter(Zone.country_id == country_id, Zone.name == name).first()
    if zone:
        zone.multiplier = multiplier
        db.flush()
        return zone
    zone = Zone(country_id=country_id, name=name, multiplier=multiplier)
    db.add(zone)
    db.flush()
    return zone


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
    if config is None:
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

    config.base_price = base_price
    config.zone_coefficient_override = zone_override
    config.legislation_coefficient = 1.05
    config.urgency_coefficient = 1.20
    config.basic_level_coefficient = 1.00
    config.standard_level_coefficient = 1.15
    config.premium_level_coefficient = 1.35
    config.indirect_cost_percentage = 0.10
    config.platform_maintenance_percentage = 0.03
    config.mydarrin_platform_percentage = 0.15
    config.vat_percentage = 0.21
    config.platform_margin_coefficient = 0.15
    config.vat_coefficient = 0.21
    config.is_active = True
    db.flush()
    return config


def get_or_create_deviz_rule(
    db: Session,
    *,
    service_id: int,
    country_id: int,
    level_name: str,
    label: str,
    multiplier: float,
    description: str,
    sort_order: int,
) -> AdminDevizRule:
    rule = db.query(AdminDevizRule).filter(
        AdminDevizRule.service_id == service_id,
        AdminDevizRule.country_id == country_id,
        AdminDevizRule.level_name == level_name,
    ).first()
    if rule is None:
        rule = AdminDevizRule(
            service_id=service_id,
            country_id=country_id,
            level_name=level_name,
            label=label,
            multiplier=multiplier,
            description=description,
            sort_order=sort_order,
            is_active=True,
        )
        db.add(rule)
        db.flush()
        return rule

    rule.label = label
    rule.multiplier = multiplier
    rule.description = description
    rule.sort_order = sort_order
    rule.is_active = True
    db.flush()
    return rule


def get_or_create_demo_admin(db: Session) -> User:
    user = db.query(User).filter(User.email == DEMO_ADMIN_EMAIL).first()
    if user is None:
        user = User(
            email=DEMO_ADMIN_EMAIL,
            hashed_password=hash_password(DEMO_ADMIN_PASSWORD),
            role=UserRole.ADMIN.value,
            verification_status="APPROVED",
        )
        db.add(user)
        db.flush()
        return user

    user.hashed_password = hash_password(DEMO_ADMIN_PASSWORD)
    user.role = UserRole.ADMIN.value
    user.verification_status = "APPROVED"
    db.flush()
    return user


def seed() -> None:
    db: Session = SessionLocal()
    try:
        domains: dict[str, Domain] = {}
        categories: dict[str, Category] = {}
        subcategories: dict[str, SubCategory] = {}
        services: dict[str, Service] = {}
        countries: dict[str, Country] = {}
        zones: dict[tuple[str, str], Zone] = {}
        configs: list[AdminPriceConfig] = []
        rules: list[AdminDevizRule] = []
        admin_user = get_or_create_demo_admin(db)

        for item in DOMAIN_DATA:
            domains[item["slug"]] = get_or_create_domain(db, slug=item["slug"], name_ro=item["name_ro"], name_en=item["name_en"])

        for item in CATEGORY_DATA:
            domain = domains[item["domain_slug"]]
            categories[item["slug"]] = get_or_create_category(
                db,
                domain_id=domain.id,
                slug=item["slug"],
                name_ro=item["name_ro"],
                name_en=item["name_en"],
            )

        for item in SUBCATEGORY_DATA:
            category = categories[item["category_slug"]]
            subcategories[item["slug"]] = get_or_create_subcategory(
                db,
                category_id=category.id,
                slug=item["slug"],
                name_ro=item["name_ro"],
                name_en=item["name_en"],
            )

        for item in SERVICE_DATA:
            related_subcategories = [subcategories[slug] for slug in item["subcategory_slugs"]]
            services[item["slug"]] = get_or_create_service(
                db,
                slug=item["slug"],
                name=item["name"],
                description=item["description"],
                subcategories=related_subcategories,
            )

        for item in COUNTRY_DATA:
            country = get_or_create_country(
                db,
                code=item["code"],
                name=item["name"],
                currency=item["currency"],
            )
            countries[item["code"]] = country
            for zone_item in item["zones"]:
                zones[(item["code"], zone_item["name"])] = get_or_create_zone(
                    db,
                    country_id=country.id,
                    name=zone_item["name"],
                    multiplier=zone_item["multiplier"],
                )

        for item in PRICE_MATRIX:
            service = services[item["service_slug"]]
            country = countries[item["country_code"]]
            zone = zones[(item["country_code"], item["zone_name"])]
            configs.append(
                get_or_create_price_config(
                    db,
                    service_id=service.id,
                    country_id=country.id,
                    zone_id=zone.id,
                    currency=country.currency,
                    legislation_code=item["legislation_code"],
                    base_price=item["base_price"],
                    zone_override=item["zone_override"],
                )
            )

        for service_slug, service in services.items():
            for country_code, country in countries.items():
                for level_name, label, multiplier, description, sort_order in DEVIZ_RULES:
                    rules.append(
                        get_or_create_deviz_rule(
                            db,
                            service_id=service.id,
                            country_id=country.id,
                            level_name=level_name,
                            label=label,
                            multiplier=multiplier,
                            description=f"{description} [{service_slug}/{country_code}]",
                            sort_order=sort_order,
                        )
                    )

        db.commit()

        print("Full demo seed completed successfully")
        print(f"Domains: {len(domains)}")
        print(f"Categories: {len(categories)}")
        print(f"SubCategories: {len(subcategories)}")
        print(f"Services: {len(services)}")
        print(f"Countries: {len(countries)}")
        print(f"Zones: {len(zones)}")
        print(f"AdminPriceConfigs: {len(configs)}")
        print(f"AdminDevizRules: {len(rules)}")
        print(f"Demo admin: {admin_user.email} / {DEMO_ADMIN_PASSWORD}")
        for slug, service in services.items():
            print(f"Service demo: {slug} -> id={service.id}, subcategories={service.subcategory_ids}")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
