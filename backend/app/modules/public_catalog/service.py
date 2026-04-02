from __future__ import annotations

from typing import Iterable

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models.category import Category
from app.models.price_analysis import CatalogResource
from app.models.service import Service
from app.models.subcategory import SubCategory
from app.modules.cost_engine.models import AdminPriceConfig
from app.modules.public_catalog.schemas import (
    PublicCatalogCategoryItem,
    PublicCatalogSubcategoryItem,
    PublicCatalogServiceCard,
    PublicRateCardSummary,
    PublicServiceTechnicalSpecsResponse,
    PublicTechnicalSpecItem,
)
from app.services.price_analysis_service import get_recipe_rows_for_activities, get_service_recipe_activities


def _unique_sorted(values: Iterable[str]) -> list[str]:
    cleaned = [value.strip() for value in values if value and str(value).strip()]
    return sorted(set(cleaned), key=lambda item: item.lower())


def _extract_spec_values(resource: CatalogResource) -> tuple[str | None, str | None]:
    specs = resource.technical_specs or {}
    equipment_type = (
        specs.get("equipment_type")
        or specs.get("utilaj")
        or specs.get("category")
        or specs.get("type")
    )
    brand = specs.get("brand") or specs.get("manufacturer") or specs.get("brand_name")
    return (
        str(equipment_type).strip() if equipment_type else None,
        str(brand).strip() if brand else None,
    )


def _resource_matches(
    resource: CatalogResource,
    *,
    resource_types: list[str] | None = None,
    equipment_types: list[str] | None = None,
    brands: list[str] | None = None,
) -> bool:
    if resource_types:
        if resource.resource_type.upper() not in {item.upper() for item in resource_types}:
            return False

    equipment_type, brand = _extract_spec_values(resource)
    if equipment_types:
        if not equipment_type or equipment_type.upper() not in {item.upper() for item in equipment_types}:
            return False
    if brands:
        if not brand or brand.upper() not in {item.upper() for item in brands}:
            return False

    return True


def _collect_service_resources(db: Session, service: Service) -> list[CatalogResource]:
    activities = get_service_recipe_activities(db, service.id)
    activity_ids = [activity.id for activity in activities]
    recipes = get_recipe_rows_for_activities(db, activity_ids)
    resources: list[CatalogResource] = []
    for recipe in recipes:
        resource = recipe.resource
        if resource is not None:
            resources.append(resource)
    return resources


def _build_public_catalog_card(
    *,
    service: Service,
    resources: list[CatalogResource],
    ratecard: AdminPriceConfig | None,
    domain_name: str | None,
    category_name: str | None,
    subcategory_names: list[str],
) -> PublicCatalogServiceCard:
    equipment_types_collected: list[str] = []
    brands_collected: list[str] = []
    resource_types_collected: list[str] = []
    availability_status = None
    for resource in resources:
        equipment_type, brand = _extract_spec_values(resource)
        if equipment_type:
            equipment_types_collected.append(equipment_type)
        if brand:
            brands_collected.append(brand)
        if resource.resource_type:
            resource_types_collected.append(resource.resource_type)
        if availability_status is None:
            availability_status = resource.availability_status
        elif resource.availability_status and resource.availability_status != "IN_STOCK":
            availability_status = resource.availability_status

    return PublicCatalogServiceCard(
        id=service.id,
        slug=service.slug,
        name=service.name,
        description=service.description,
        description_extended=service.description_extended,
        domain=domain_name,
        category=category_name,
        subcategories=subcategory_names,
        availability_status=availability_status,
        rate_card=(
            PublicRateCardSummary(
                currency=ratecard.currency,
                base_price=ratecard.base_price,
                legislation_code=ratecard.legislation_code,
                country_id=ratecard.country_id,
                zone_id=ratecard.zone_id,
                is_active=ratecard.is_active,
            )
            if ratecard
            else None
        ),
        images=service.images or [],
        videos=service.videos or [],
        documents=service.documents or [],
        level_attachments=service.level_attachments or {},
        equipment_types=_unique_sorted(equipment_types_collected),
        brands=_unique_sorted(brands_collected),
        resource_types=_unique_sorted(resource_types_collected),
    )


def list_public_catalog_services(
    db: Session,
    *,
    domain_slug: str | None = None,
    category_slug: str | None = None,
    subcategory_slug: str | None = None,
    resource_types: list[str] | None = None,
    equipment_types: list[str] | None = None,
    brands: list[str] | None = None,
) -> list[PublicCatalogServiceCard]:
    query = (
        select(Service)
        .options(
            selectinload(Service.subcategories)
            .selectinload(SubCategory.category)
            .selectinload(Category.domain)
        )
        .where(Service.is_active.is_(True))
        .order_by(Service.id)
    )

    services = db.execute(query).scalars().all()

    if domain_slug or category_slug or subcategory_slug:
        filtered_services: list[Service] = []
        for service in services:
            for subcategory in service.subcategories:
                category = subcategory.category
                domain = category.domain if category else None
                if domain_slug and domain and domain.slug != domain_slug:
                    continue
                if category_slug and category and category.slug != category_slug:
                    continue
                if subcategory_slug and subcategory.slug != subcategory_slug:
                    continue
                filtered_services.append(service)
                break
        services = filtered_services

    service_resources: dict[int, list[CatalogResource]] = {}
    if resource_types or equipment_types or brands:
        filtered: list[Service] = []
        for service in services:
            resources = _collect_service_resources(db, service)
            service_resources[service.id] = resources
            if any(
                _resource_matches(
                    resource,
                    resource_types=resource_types,
                    equipment_types=equipment_types,
                    brands=brands,
                )
                for resource in resources
            ):
                filtered.append(service)
        services = filtered

    if not service_resources:
        for service in services:
            service_resources[service.id] = _collect_service_resources(db, service)

    service_ids = [service.id for service in services]
    rate_configs = db.execute(
        select(AdminPriceConfig)
        .where(AdminPriceConfig.service_id.in_(service_ids))
        .where(AdminPriceConfig.is_active.is_(True))
        .order_by(AdminPriceConfig.base_price)
    ).scalars().all()

    ratecard_map: dict[int, AdminPriceConfig] = {}
    for config in rate_configs:
        if config.service_id not in ratecard_map:
            ratecard_map[config.service_id] = config

    cards: list[PublicCatalogServiceCard] = []
    for service in services:
        resources = service_resources.get(service.id, [])
        domain_name = None
        category_name = None
        subcategory_names: list[str] = []
        for subcategory in service.subcategories:
            subcategory_names.append(subcategory.name_ro)
            category = subcategory.category
            if category and category_name is None:
                category_name = category.name_ro
            domain = category.domain if category else None
            if domain and domain_name is None:
                domain_name = domain.name_ro

        ratecard = ratecard_map.get(service.id)
        cards.append(
            _build_public_catalog_card(
                service=service,
                resources=resources,
                ratecard=ratecard,
                domain_name=domain_name,
                category_name=category_name,
                subcategory_names=subcategory_names,
            )
        )

    return cards


def list_public_catalog_categories(db: Session) -> list[PublicCatalogCategoryItem]:
    rows = db.execute(
        select(SubCategory)
        .options(selectinload(SubCategory.category).selectinload(Category.domain))
        .where(SubCategory.is_active.is_(True))
        .order_by(SubCategory.id)
    ).scalars().all()

    grouped: dict[tuple[str, str, str, str], list[PublicCatalogSubcategoryItem]] = {}
    for subcategory in rows:
        category = subcategory.category
        domain = category.domain if category else None
        if not category or not domain:
            continue
        key = (domain.name_ro, domain.slug, category.name_ro, category.slug)
        grouped.setdefault(key, []).append(
            PublicCatalogSubcategoryItem(name=subcategory.name_ro, slug=subcategory.slug)
        )

    items: list[PublicCatalogCategoryItem] = []
    for (domain_name, domain_slug, category_name, category_slug), subs in grouped.items():
        items.append(
            PublicCatalogCategoryItem(
                domain=domain_name,
                domain_slug=domain_slug,
                category=category_name,
                category_slug=category_slug,
                subcategories=subs,
            )
        )

    items.sort(key=lambda item: (item.domain.lower(), item.category.lower()))
    return items


def get_public_catalog_service_by_slug(db: Session, *, slug: str) -> PublicCatalogServiceCard | None:
    service = (
        db.execute(
            select(Service)
            .options(
                selectinload(Service.subcategories)
                .selectinload(SubCategory.category)
                .selectinload(Category.domain)
            )
            .where(Service.slug == slug)
            .where(Service.is_active.is_(True))
        )
        .scalar_one_or_none()
    )
    if not service:
        return None

    resources = _collect_service_resources(db, service)
    domain_name = None
    category_name = None
    subcategory_names: list[str] = []
    for subcategory in service.subcategories:
        subcategory_names.append(subcategory.name_ro)
        category = subcategory.category
        if category and category_name is None:
            category_name = category.name_ro
        domain = category.domain if category else None
        if domain and domain_name is None:
            domain_name = domain.name_ro

    ratecard = (
        db.execute(
            select(AdminPriceConfig)
            .where(AdminPriceConfig.service_id == service.id)
            .where(AdminPriceConfig.is_active.is_(True))
            .order_by(AdminPriceConfig.base_price)
        )
        .scalars()
        .first()
    )
    return _build_public_catalog_card(
        service=service,
        resources=resources,
        ratecard=ratecard,
        domain_name=domain_name,
        category_name=category_name,
        subcategory_names=subcategory_names,
    )


def get_public_service_technical_specs(db: Session, *, slug: str) -> PublicServiceTechnicalSpecsResponse | None:
    service = db.execute(select(Service).where(Service.slug == slug)).scalar_one_or_none()
    if not service:
        return None

    resources = _collect_service_resources(db, service)
    items = [
        PublicTechnicalSpecItem(
            resource_id=resource.id,
            resource_name=resource.name_ro,
            resource_type=resource.resource_type,
            technical_specs=resource.technical_specs or {},
        )
        for resource in resources
    ]

    return PublicServiceTechnicalSpecsResponse(
        slug=service.slug,
        service_name=service.name,
        items=items,
    )
