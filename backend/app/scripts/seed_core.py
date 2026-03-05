from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.modules.geography.models import Country, Zone
from app.modules.catalog.models import Domain, Category, SubCategory, Service
from app.modules.activities.models import Unit, Activity, ServiceActivity


def seed():
    db: Session = SessionLocal()

    # COUNTRY
    romania = Country(name="Romania", code="RO", currency="RON")
    db.add(romania)
    db.flush()

    # ZONE
    zona_iasi = Zone(
        name="Iasi",
        country_id=romania.id,
        multiplier=1.0,
    )
    db.add(zona_iasi)
    db.flush()

    # DOMAIN
    domain = Domain(
        name="Home Services",
        slug="home-services",
        description="Home repair, installation and maintenance services",
    )
    db.add(domain)
    db.flush()

    # CATEGORY
    category = Category(
        name="Lucrari santier",
        slug="lucrari-santier",
        domain_id=domain.id,
    )
    db.add(category)
    db.flush()

    # SUBCATEGORY
    subcategory = SubCategory(
        name="Excavatii",
        slug="excavatii",
        category_id=category.id,
    )
    db.add(subcategory)
    db.flush()

    # SERVICE
    service = Service(
        name="Montaj instalatie apa",
        slug="montaj-instalatie-apa",
        subcategory_id=subcategory.id,
        description="Serviciu demo",
    )
    db.add(service)
    db.flush()

    # UNIT
    unit = Unit(code="MC", name="Metru cub")
    db.add(unit)
    db.flush()

    # ACTIVITY
    activity = Activity(
        name="Sapatura",
        subcategory_id=subcategory.id,
        unit_id=unit.id,
    )
    db.add(activity)
    db.flush()

    # SERVICE_ACTIVITY
    link = ServiceActivity(
        service_id=service.id,
        activity_id=activity.id,
        sort_order=1,
    )
    db.add(link)

    db.commit()
    db.close()

    print("Seed completed successfully")


if __name__ == "__main__":
    seed()