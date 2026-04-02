from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel


class PublicSyncManifestResponse(BaseModel):
    content_version: str
    content_updated_at: datetime | None = None
    tracked_pages: list[str]
    dynamic_pricing_enabled: bool = True
    status_stream_enabled: bool = True


class PublicCatalogPriceLevelResponse(BaseModel):
    level_name: str
    label: str
    description: str | None = None
    net_total: float
    gross_total: float
    recommended: bool
    sort_order: int


class PublicCatalogPriceResponse(BaseModel):
    slug: str
    service_name: str
    currency: str
    currency_symbol: str | None = None
    legislation_code: str
    country_code: str
    zone_slug: str
    locality_slug: str | None = None
    availability_status: str = "available"
    partial_availability: dict | None = None
    minimum_order_applied: bool = False
    minimum_order_note: str | None = None
    recommended_level: str
    base_gross_total: float
    delivery_badge: str | None = None
    delivery_lead_time_days: int | None = None
    levels: list[PublicCatalogPriceLevelResponse]
    last_calculated_at: datetime
    source: str = "deviz_engine"


class PublicPriceBreakdownResponse(BaseModel):
    slug: str
    service_name: str
    currency: str
    currency_symbol: str | None = None
    legislation_code: str
    country_code: str
    zone_slug: str
    locality_slug: str | None = None
    availability_status: str = "available"
    partial_availability: dict | None = None
    minimum_order_applied: bool = False
    minimum_order_note: str | None = None
    service_level: str
    recipe_level: str
    urgency: bool
    distributie_furnizori: float
    cost_direct: float
    cost_regie: float
    mentenanta_platforma: float
    venit_platforma: float
    garantie_buna_executie: float
    insurance_premium: float = 0.0
    darrin_management_fee: float = 0.0
    taxe_si_garantii: float
    tva: float
    total_facturabil: float
    package_label: str | None = None
    package_unit: str | None = None
    included_components: list[str] = []
    delivery_badge: str | None = None
    delivery_lead_time_days: int | None = None
    last_calculated_at: datetime
    source: str = "syncPublicPrices"


class OrderStatusSnapshotResponse(BaseModel):
    order_ref: str
    status: str
    provider_ref: str | None = None
    provider_name: str | None = None
    message: str | None = None
    updated_at: datetime
    source: str = "backoffice.sync"


class OrderStatusUpdateRequest(BaseModel):
    status: str
    provider_ref: str | None = None
    provider_name: str | None = None
    message: str | None = None
