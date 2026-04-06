from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


class PublicRateCardSummary(BaseModel):
    currency: str
    base_price: float
    legislation_code: str | None = None
    country_id: int | None = None
    zone_id: int | None = None
    is_active: bool = True


class PublicCatalogServiceCard(BaseModel):
    id: int
    slug: str
    name: str
    description: str | None = None
    description_extended: str | None = None
    domain: str | None = None
    category: str | None = None
    subcategories: list[str] = Field(default_factory=list)
    rating_aipl: float | None = None
    availability_status: str | None = None
    rate_card: PublicRateCardSummary | None = None
    images: list[str] = Field(default_factory=list)
    videos: list[str] = Field(default_factory=list)
    documents: list[str] = Field(default_factory=list)
    level_attachments: dict[str, Any] = Field(default_factory=dict)
    equipment_types: list[str] = Field(default_factory=list)
    brands: list[str] = Field(default_factory=list)
    resource_types: list[str] = Field(default_factory=list)
    object_kind: str | None = None
    pivot_actions: list[str] = Field(default_factory=list)


class PublicCatalogServiceListResponse(BaseModel):
    items: list[PublicCatalogServiceCard]


class PublicCatalogSubcategoryItem(BaseModel):
    name: str
    slug: str


class PublicCatalogCategoryItem(BaseModel):
    domain: str
    domain_slug: str
    category: str
    category_slug: str
    subcategories: list[PublicCatalogSubcategoryItem] = Field(default_factory=list)


class PublicCatalogCategoryListResponse(BaseModel):
    items: list[PublicCatalogCategoryItem]


class PublicTechnicalSpecItem(BaseModel):
    resource_id: int
    resource_name: str
    resource_type: str
    technical_specs: dict[str, Any] = Field(default_factory=dict)


class PublicServiceTechnicalSpecsResponse(BaseModel):
    slug: str
    service_name: str
    items: list[PublicTechnicalSpecItem]
