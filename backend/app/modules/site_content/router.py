from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_db
from app.core.security import ensure_module_access, get_current_admin_profile, get_current_admin_user
from app.modules.site_content.schemas import (
    PublicServiceTaxonomyResponse,
    SiteContentPageListItem,
    SiteContentPageResponse,
    SiteContentPageUpdate,
)
from app.modules.site_content.service import get_or_create_page, get_public_service_taxonomy, list_pages, update_page
from app.services.cache_service import get_or_set

public_router = APIRouter(prefix="/public/pages", tags=["PublicSiteContent"])
admin_router = APIRouter(prefix="/backoffice/site-content", tags=["AdminSiteContent"])


@public_router.get("/{slug}", response_model=SiteContentPageResponse)
def get_public_page(slug: str, db: Session = Depends(get_db)):
    cache_key = f"site_content:page:{slug}"
    return get_or_set(cache_key, lambda: get_or_create_page(db, slug), ttl_seconds=60)


@public_router.get("/homepage", response_model=SiteContentPageResponse)
def get_public_homepage(db: Session = Depends(get_db)):
    cache_key = "site_content:page:homepage"
    return get_or_set(cache_key, lambda: get_or_create_page(db, "homepage"), ttl_seconds=60)


@public_router.get("/service-taxonomy/{slug}", response_model=PublicServiceTaxonomyResponse)
def get_public_service_taxonomy_route(slug: str, db: Session = Depends(get_db)):
    cache_key = f"service_taxonomy:{slug}"
    taxonomy = get_or_set(cache_key, lambda: get_public_service_taxonomy(db, slug), ttl_seconds=120)
    if not taxonomy:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service taxonomy not found")
    return taxonomy


@admin_router.get("", response_model=list[SiteContentPageListItem], dependencies=[Depends(get_current_admin_user)])
def get_admin_pages(
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin_user),
    admin_profile=Depends(get_current_admin_profile),
):
    ensure_module_access(current_admin, admin_profile, "site_content")
    return list_pages(db)


@admin_router.get("/{slug}", response_model=SiteContentPageResponse, dependencies=[Depends(get_current_admin_user)])
def get_admin_page(
    slug: str,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin_user),
    admin_profile=Depends(get_current_admin_profile),
):
    ensure_module_access(current_admin, admin_profile, "site_content")
    return get_or_create_page(db, slug)


@admin_router.put("/{slug}", response_model=SiteContentPageResponse, dependencies=[Depends(get_current_admin_user)])
def put_admin_page(
    slug: str,
    payload: SiteContentPageUpdate,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin_user),
    admin_profile=Depends(get_current_admin_profile),
):
    ensure_module_access(current_admin, admin_profile, "site_content")
    return update_page(db, slug, payload)


@admin_router.get("/homepage", response_model=SiteContentPageResponse, dependencies=[Depends(get_current_admin_user)])
def get_admin_homepage(
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin_user),
    admin_profile=Depends(get_current_admin_profile),
):
    ensure_module_access(current_admin, admin_profile, "site_content")
    return get_or_create_page(db, "homepage")


@admin_router.put("/homepage", response_model=SiteContentPageResponse, dependencies=[Depends(get_current_admin_user)])
def put_admin_homepage(
    payload: SiteContentPageUpdate,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin_user),
    admin_profile=Depends(get_current_admin_profile),
):
    ensure_module_access(current_admin, admin_profile, "site_content")
    return update_page(db, "homepage", payload)
