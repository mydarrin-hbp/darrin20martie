from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.modules.catalog.models import Domain, Category, SubCategory, Service
from app.modules.activities.models import Activity, ServiceActivity

from app.modules.catalog.schemas import (
    DomainResponse,
    CategoryResponse,
    SubCategoryResponse,
    ServiceResponse,
    ServiceDetailResponse,
)

router = APIRouter(prefix="/catalog", tags=["catalog"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/domains", response_model=list[DomainResponse])
def list_domains(db: Session = Depends(get_db)):
    rows = db.execute(select(Domain).order_by(Domain.id)).scalars().all()
    return rows


@router.get("/categories", response_model=list[CategoryResponse])
def list_categories(
    domain_id: int = Query(...),
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
    return rows


@router.get("/subcategories", response_model=list[SubCategoryResponse])
def list_subcategories(
    category_id: int = Query(...),
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
    return rows


@router.get("/services", response_model=list[ServiceResponse])
def list_services(
    subcategory_id: int = Query(...),
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
    return rows


@router.get("/service/{service_id}", response_model=ServiceDetailResponse)
def get_service_detail(service_id: int, db: Session = Depends(get_db)):
    service = db.execute(
        select(Service).where(Service.id == service_id)
    ).scalar_one_or_none()

    if not service:
        return {
            "id": 0,
            "name": "Not found",
            "slug": "not-found",
            "description": None,
            "subcategory_id": 0,
            "activities": [],
        }

    activities = (
        db.execute(
            select(Activity)
            .join(ServiceActivity, ServiceActivity.activity_id == Activity.id)
            .where(ServiceActivity.service_id == service_id)
        )
        .scalars()
        .all()
    )

    return {
        "id": service.id,
        "name": service.name,
        "slug": service.slug,
        "description": service.description,
        "subcategory_id": service.subcategory_id,
        "activities": activities,
    }