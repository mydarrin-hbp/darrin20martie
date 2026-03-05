from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.modules.catalog.models import Domain, Category, SubCategory, Service

router = APIRouter(prefix="/catalog", tags=["catalog"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/domains")
def list_domains(db: Session = Depends(get_db)):
    rows = db.execute(select(Domain).order_by(Domain.id)).scalars().all()
    return [
        {"id": d.id, "name": d.name, "slug": d.slug, "description": d.description}
        for d in rows
    ]


@router.get("/categories")
def list_categories(
    domain_id: int = Query(..., description="Domain ID (ex: 1)"),
    db: Session = Depends(get_db),
):
    rows = (
        db.execute(
            select(Category)
            .where(Category.domain_id == domain_id)
            .order_by(Category.id)
        )
        .scalars()
        .all()
    )
    return [
        {"id": c.id, "name": c.name, "slug": c.slug, "domain_id": c.domain_id}
        for c in rows
    ]


@router.get("/subcategories")
def list_subcategories(
    category_id: int = Query(..., description="Category ID"),
    db: Session = Depends(get_db),
):
    rows = (
        db.execute(
            select(SubCategory)
            .where(SubCategory.category_id == category_id)
            .order_by(SubCategory.id)
        )
        .scalars()
        .all()
    )
    return [
        {"id": s.id, "name": s.name, "slug": s.slug, "category_id": s.category_id}
        for s in rows
    ]


@router.get("/services")
def list_services(
    subcategory_id: int = Query(..., description="SubCategory ID"),
    db: Session = Depends(get_db),
):
    rows = (
        db.execute(
            select(Service)
            .where(Service.subcategory_id == subcategory_id)
            .order_by(Service.id)
        )
        .scalars()
        .all()
    )
    return [
        {
            "id": s.id,
            "name": s.name,
            "slug": s.slug,
            "subcategory_id": s.subcategory_id,
            "description": s.description,
        }
        for s in rows
    ]