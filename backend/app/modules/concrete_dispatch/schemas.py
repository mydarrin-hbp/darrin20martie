from __future__ import annotations

from pydantic import BaseModel, Field


class ConcreteDispatchRequest(BaseModel):
    order_id: int | None = None
    locality_slug: str = Field(min_length=2, max_length=150)
    scheduled_slot: str = Field(min_length=3, max_length=64)
    volume: float = Field(gt=0)
    pump_required: bool = True
    material_supplier_id: int | None = None
    equipment_supplier_id: int | None = None
    target_address: str = Field(min_length=3, max_length=255)


class ConcreteDispatchResponse(BaseModel):
    package_ref: str
    status: str
    locality_slug: str
    scheduled_slot: str
    material_supplier_id: int
    equipment_supplier_id: int | None = None
    volume: float
    incomplete_load_fee: float
    financial_breakdown: dict
    message: str
