from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field


class CartSessionResponse(BaseModel):
    session_token: str
    expires_at: datetime


class CartItemResponse(BaseModel):
    id: int
    item_type: str
    slug: str
    title: str
    category: str | None = None
    quantity: float
    wants_installation: bool
    wants_delivery: bool
    metadata: str | None = None


class CartResponse(BaseModel):
    session_token: str
    expires_at: datetime
    rideshare_eligible: bool
    rideshare_providers: int
    items: list[CartItemResponse] = Field(default_factory=list)


class CartItemUpsertRequest(BaseModel):
    session_token: str
    item_type: str = Field(default="SERVICE")
    slug: str
    title: str
    category: str | None = None
    quantity: float = Field(default=1.0, gt=0)
    wants_installation: bool = False
    wants_delivery: bool = False
    metadata: str | None = None


class CartItemUpdateRequest(BaseModel):
    quantity: float | None = Field(default=None, gt=0)
    wants_installation: bool | None = None
    wants_delivery: bool | None = None
    metadata: str | None = None


class CartDevizPreviewRequest(BaseModel):
    service_id: int
    country_id: int
    zone_id: int
    currency: str
    legislation_code: str
    requested_quantity: float | None = Field(default=None, gt=0)
    target_address: str | None = None


class CartDevizResource(BaseModel):
    resource_type: str
    name: str
    unit: str
    quantity: float
    unit_cost: float
    total_cost: float
    esco_code: str | None = None


class CartDevizPreviewResponse(BaseModel):
    service_id: int
    currency: str
    cost_direct_total: float
    indirect_costs: float
    platform_maintenance: float
    mydarrin_platform: float
    vat_value: float
    gross_total: float
    resources: dict[str, list[CartDevizResource]] = Field(default_factory=dict)
