from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_db
from app.modules.public_catalog.schemas import (
    PublicCatalogCategoryListResponse,
    PublicCatalogServiceCard,
    PublicCatalogServiceListResponse,
    PublicServiceTechnicalSpecsResponse,
)
from app.modules.public_catalog.service import (
    list_public_catalog_categories,
    get_public_catalog_service_by_slug,
    get_public_service_technical_specs,
    list_public_catalog_services,
)
from app.services.cache_service import get_or_set

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
    resource_types = resource_type or []
    equipment_types = equipment_type or []
    brands = brand or []
    cache_key = (
        "public_catalog:services:"
        f"{domain or ''}:{category or ''}:{subcategory or ''}:"
        f"{','.join(sorted(resource_types))}:{','.join(sorted(equipment_types))}:{','.join(sorted(brands))}"
    )

    items = get_or_set(
        cache_key,
        lambda: list_public_catalog_services(
            db,
            domain_slug=domain,
            category_slug=category,
            subcategory_slug=subcategory,
            resource_types=resource_types,
            equipment_types=equipment_types,
            brands=brands,
        ),
        ttl_seconds=60,
    )
    return PublicCatalogServiceListResponse(items=items)


@public_router.get("/services/{slug}", response_model=PublicCatalogServiceCard)
def get_public_service(slug: str, db: Session = Depends(get_db)):
    cache_key = f"public_catalog:service:{slug}"
    service = get_or_set(
        cache_key,
        lambda: get_public_catalog_service_by_slug(db, slug=slug),
        ttl_seconds=60,
    )
    if service is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="service_not_found")
    return service


@public_router.get("/services/{slug}/technical-specs", response_model=PublicServiceTechnicalSpecsResponse)
def get_service_specs(slug: str, db: Session = Depends(get_db)):
    cache_key = f"public_catalog:service_specs:{slug}"
    result = get_or_set(
        cache_key,
        lambda: get_public_service_technical_specs(db, slug=slug),
        ttl_seconds=120,
    )
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="service_not_found")
    return result


@public_router.get("/categories", response_model=PublicCatalogCategoryListResponse)
def list_public_categories(db: Session = Depends(get_db)):
    cache_key = "public_catalog:categories"
    items = get_or_set(cache_key, lambda: list_public_catalog_categories(db), ttl_seconds=120)
    return PublicCatalogCategoryListResponse(items=items)
