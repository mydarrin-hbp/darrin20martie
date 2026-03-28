from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_db
from app.core.security import get_current_admin_user
from app.modules.site_content.schemas import (
    PublicServiceTaxonomyResponse,
    SiteContentPageListItem,
    SiteContentPageResponse,
    SiteContentPageUpdate,
)
from app.modules.site_content.service import get_or_create_page, get_public_service_taxonomy, list_pages, update_page

public_router = APIRouter(prefix="/public/pages", tags=["PublicSiteContent"])
admin_router = APIRouter(prefix="/backoffice/site-content", tags=["AdminSiteContent"])


@public_router.get("/{slug}", response_model=SiteContentPageResponse)
def get_public_page(slug: str, db: Session = Depends(get_db)):
    return get_or_create_page(db, slug)


@public_router.get("/homepage", response_model=SiteContentPageResponse)
def get_public_homepage(db: Session = Depends(get_db)):
    return get_or_create_page(db, "homepage")


@public_router.get("/service-taxonomy/{slug}", response_model=PublicServiceTaxonomyResponse)
def get_public_service_taxonomy_route(slug: str, db: Session = Depends(get_db)):
    taxonomy = get_public_service_taxonomy(db, slug)
    if not taxonomy:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service taxonomy not found")
    return taxonomy


@admin_router.get("", response_model=list[SiteContentPageListItem], dependencies=[Depends(get_current_admin_user)])
def get_admin_pages(db: Session = Depends(get_db)):
    return list_pages(db)


@admin_router.get("/{slug}", response_model=SiteContentPageResponse, dependencies=[Depends(get_current_admin_user)])
def get_admin_page(slug: str, db: Session = Depends(get_db)):
    return get_or_create_page(db, slug)


@admin_router.put("/{slug}", response_model=SiteContentPageResponse, dependencies=[Depends(get_current_admin_user)])
def put_admin_page(slug: str, payload: SiteContentPageUpdate, db: Session = Depends(get_db)):
    return update_page(db, slug, payload)


@admin_router.get("/homepage", response_model=SiteContentPageResponse, dependencies=[Depends(get_current_admin_user)])
def get_admin_homepage(db: Session = Depends(get_db)):
    return get_or_create_page(db, "homepage")


@admin_router.put("/homepage", response_model=SiteContentPageResponse, dependencies=[Depends(get_current_admin_user)])
def put_admin_homepage(payload: SiteContentPageUpdate, db: Session = Depends(get_db)):
    return update_page(db, "homepage", payload)
