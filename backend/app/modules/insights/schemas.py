from __future__ import annotations

from pydantic import BaseModel


class OrdersByCategoryItem(BaseModel):
    category: str
    order_count: int
    gmv: float


class ProviderPerformanceItem(BaseModel):
    provider: str
    order_count: int
    gmv: float


class InsightsResponse(BaseModel):
    total_gmv: float
    total_orders: int
    currency: str
    paid_orders: int
    payment_conversion_rate: float
    orders_by_category: list[OrdersByCategoryItem]
    provider_performance: list[ProviderPerformanceItem]
