from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field


class MarketplaceCommissionBase(BaseModel):
    category: str = Field(min_length=2)
    min_percentage: float = Field(ge=0, le=100)
    max_percentage: float = Field(ge=0, le=100)
    is_active: bool = True


class MarketplaceCommissionCreate(MarketplaceCommissionBase):
    pass


class MarketplaceCommissionUpdate(BaseModel):
    min_percentage: float | None = Field(default=None, ge=0, le=100)
    max_percentage: float | None = Field(default=None, ge=0, le=100)
    is_active: bool | None = None


class MarketplaceCommissionResponse(MarketplaceCommissionBase):
    id: int

    model_config = ConfigDict(from_attributes=True)
