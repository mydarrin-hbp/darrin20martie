from pydantic import BaseModel


class EstimateRequest(BaseModel):
    service_id: int
    quantity: float
    unit_price: float
    zone_id: int
    urgency: bool = False


class EstimateResponse(BaseModel):
    service_id: int
    quantity: float
    unit_price: float
    zone_id: int
    urgency: bool
    base_cost: float
    zone_multiplier: float
    urgency_multiplier: float
    platform_fee: float
    total: float