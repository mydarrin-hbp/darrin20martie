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
        name_ro="Home Services",
        name_en="Home Services",
        slug="home-services",
    )
    db.add(domain)
    db.flush()

    # CATEGORY
    category = Category(
        name_ro="Lucrari santier",
        name_en="Site Works",
        slug="lucrari-santier",
        domain_id=domain.id,
    )
    db.add(category)
    db.flush()

    # SUBCATEGORY
    subcategory = SubCategory(
        name_ro="Excavatii",
        name_en="Excavations",
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
    )
    service.subcategories = [subcategory]
    db.add(service)

    db.commit()
    db.close()

    print("Seed completed successfully")


if __name__ == "__main__":
    seed()
