from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class SiteContentPageBase(BaseModel):
    slug: str
    title: str
    status: str = "published"
    content: dict[str, Any] = Field(default_factory=dict)
    notes: str | None = None


class SiteContentPageUpdate(BaseModel):
    title: str
    status: str = "published"
    content: dict[str, Any] = Field(default_factory=dict)
    notes: str | None = None


class SiteContentPatchRequest(BaseModel):
    slug: str
    path: str = Field(min_length=3, max_length=255)
    value: Any


class SiteContentPageListItem(BaseModel):
    slug: str
    title: str
    status: str
    updated_at: datetime | None = None

    model_config = {"from_attributes": True}


class SiteContentPageResponse(SiteContentPageBase):
    updated_at: datetime | None = None

    model_config = {"from_attributes": True}


class PublicServiceTaxonomyResponse(BaseModel):
    slug: str
    service_name: str
    domain: str | None = None
    category: str | None = None
    subcategories: list[str] = Field(default_factory=list)
    caen_codes: list[str] = Field(default_factory=list)
    uniclass_codes: list[str] = Field(default_factory=list)
    esco_codes: list[str] = Field(default_factory=list)
    indicator_codes: list[str] = Field(default_factory=list)
