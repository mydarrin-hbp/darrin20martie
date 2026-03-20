from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.models.category import Category
from app.models.domain import Domain
from app.models.service import Service
from app.models.subcategory import SubCategory


def seed():
    db: Session = SessionLocal()

    # DOMAIN
    domain = Domain(
        name="Home Services",
        slug="home-services",
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
        description="Serviciu demo",
        legacy_subcategory_id=subcategory.id,
    )
    service.subcategories = [subcategory]
    db.add(service)

    db.commit()
    db.close()

    print("Seed completed successfully")


if __name__ == "__main__":
    seed()
