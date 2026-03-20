from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.db.base import Base
from app.models.category import Category
from app.models.domain import Domain
from app.models.service import Service
from app.models.subcategory import SubCategory
from app.schemas.service import ServiceCreate, ServiceResponse, ServiceUpdate
from app.services.catalog_service import create_service, get_service, update_service


def make_session():
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)
    return SessionLocal()


def seed_catalog(db):
    domain = Domain(name="Constructii", slug="constructii", is_active=True)
    db.add(domain)
    db.flush()

    category = Category(
        domain_id=domain.id,
        name="Instalatii",
        slug="instalatii",
        is_active=True,
    )
    db.add(category)
    db.flush()

    subcategory_one = SubCategory(
        category_id=category.id,
        name="Sanitare",
        slug="sanitare",
        is_active=True,
    )
    subcategory_two = SubCategory(
        category_id=category.id,
        name="Termice",
        slug="termice",
        is_active=True,
    )
    subcategory_three = SubCategory(
        category_id=category.id,
        name="Electrice",
        slug="electrice",
        is_active=True,
    )
    db.add_all([subcategory_one, subcategory_two, subcategory_three])
    db.commit()
    db.refresh(subcategory_one)
    db.refresh(subcategory_two)
    db.refresh(subcategory_three)
    return subcategory_one, subcategory_two, subcategory_three


def test_create_service_links_multiple_subcategories():
    db = make_session()
    try:
        sub_one, sub_two, _ = seed_catalog(db)

        created = create_service(
            db,
            ServiceCreate(
                name="Montaj centrala",
                slug="montaj-centrala",
                description="Serviciu complex",
                is_active=True,
                subcategory_ids=[sub_one.id, sub_two.id],
            ),
        )

        assert isinstance(created, Service)
        assert created.legacy_subcategory_id == sub_one.id
        assert created.subcategory_ids == [sub_one.id, sub_two.id]
    finally:
        db.close()


def test_update_service_replaces_subcategory_links():
    db = make_session()
    try:
        sub_one, sub_two, sub_three = seed_catalog(db)
        created = create_service(
            db,
            ServiceCreate(
                name="Montaj centrala",
                slug="montaj-centrala",
                description="Serviciu complex",
                is_active=True,
                subcategory_ids=[sub_one.id, sub_two.id],
            ),
        )

        updated = update_service(
            db,
            created.id,
            ServiceUpdate(subcategory_ids=[sub_three.id]),
        )

        assert isinstance(updated, Service)
        assert updated.legacy_subcategory_id == sub_three.id
        assert updated.subcategory_ids == [sub_three.id]
    finally:
        db.close()


def test_service_response_serializes_many_to_many_ids():
    db = make_session()
    try:
        sub_one, sub_two, _ = seed_catalog(db)
        created = create_service(
            db,
            ServiceCreate(
                name="Montaj centrala",
                slug="montaj-centrala",
                description="Serviciu complex",
                is_active=True,
                subcategory_ids=[sub_one.id, sub_two.id],
            ),
        )

        loaded = get_service(db, created.id)
        payload = ServiceResponse.from_service(loaded).model_dump()

        assert payload == {
            "id": created.id,
            "name": "Montaj centrala",
            "slug": "montaj-centrala",
            "description": "Serviciu complex",
            "is_active": True,
            "subcategory_ids": [sub_one.id, sub_two.id],
        }
    finally:
        db.close()
