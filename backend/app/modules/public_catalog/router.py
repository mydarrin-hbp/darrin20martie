from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_db
from app.modules.public_catalog.schemas import (
    PublicCatalogServiceCard,
    PublicCatalogServiceListResponse,
    PublicServiceTechnicalSpecsResponse,
)
from app.modules.public_catalog.service import (
    get_public_catalog_service_by_slug,
    get_public_service_technical_specs,
    list_public_catalog_services,
)

public_router = APIRouter(prefix="/public/catalog", tags=["PublicCatalog"])


@public_router.get("/services", response_model=PublicCatalogServiceListResponse)
def list_public_services(
    db: Session = Depends(get_db),
    domain: str | None = Query(default=None),
    category: str | None = Query(default=None),
    subcategory: str | None = Query(default=None),
    resource_type: list[str] | None = Query(default=None),
    equipment_type: list[str] | None = Query(default=None),
    brand: list[str] | None = Query(default=None),
):
    items = list_public_catalog_services(
        db,
        domain_slug=domain,
        category_slug=category,
        subcategory_slug=subcategory,
        resource_types=resource_type,
        equipment_types=equipment_type,
        brands=brand,
    )
    return PublicCatalogServiceListResponse(items=items)


@public_router.get("/services/{slug}", response_model=PublicCatalogServiceCard)
def get_public_service(slug: str, db: Session = Depends(get_db)):
    service = get_public_catalog_service_by_slug(db, slug=slug)
    if service is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="service_not_found")
    return service


@public_router.get("/services/{slug}/technical-specs", response_model=PublicServiceTechnicalSpecsResponse)
def get_service_specs(slug: str, db: Session = Depends(get_db)):
    result = get_public_service_technical_specs(db, slug=slug)
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="service_not_found")
    return result
