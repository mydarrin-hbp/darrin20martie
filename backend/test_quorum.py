import os
import sys

sys.path.append(os.getcwd())

from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.models.category import Category
from app.models.domain import Domain
from app.models.service import Service
from app.models.subcategory import SubCategory


def run_quorum_smoke() -> None:
    """
    Smoke check for the current prerequisites around quorum.

    Real quorum automation per service + zone remains DE VALIDAT IN COD.
    This script only verifies that the active catalog models can be created
    coherently in the current backend.
    """

    db: Session = SessionLocal()
    try:
        print("\n--- [MY DARRIN] QUORUM SMOKE CHECK ---")

        domain = db.query(Domain).filter(Domain.slug == "constructii").first()
        if not domain:
            domain = Domain(name="Constructii", slug="constructii", is_active=True)
            db.add(domain)
            db.flush()

        category = db.query(Category).filter(Category.slug == "instalatii").first()
        if not category:
            category = Category(
                domain_id=domain.id,
                name="Instalatii",
                slug="instalatii",
                is_active=True,
            )
            db.add(category)
            db.flush()

        subcategory = db.query(SubCategory).filter(SubCategory.slug == "sanitare").first()
        if not subcategory:
            subcategory = SubCategory(
                category_id=category.id,
                name="Sanitare",
                slug="sanitare",
                is_active=True,
            )
            db.add(subcategory)
            db.flush()

        service = db.query(Service).filter(Service.slug == "montaj-centrala-termica").first()
        if not service:
            service = Service(
                name="Montaj centrala termica",
                slug="montaj-centrala-termica",
                description="Smoke service for quorum prerequisites",
                is_active=False,
                legacy_subcategory_id=subcategory.id,
            )
            service.subcategories = [subcategory]
            db.add(service)
            db.commit()
            db.refresh(service)

        print(f"Domain: {domain.slug}")
        print(f"Category: {category.slug}")
        print(f"SubCategory: {subcategory.slug}")
        print(f"Service: {service.slug}")
        print(f"Linked subcategories: {service.subcategory_ids}")
        print("Quorum automat per serviciu + zona: DE VALIDAT IN COD")
        print("--- SMOKE CHECK FINALIZAT ---")
    except Exception as exc:
        db.rollback()
        print(f"[EROARE] {exc}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    run_quorum_smoke()
