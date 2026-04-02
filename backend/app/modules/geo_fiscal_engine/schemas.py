from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field


class TaxRuleBase(BaseModel):
    country_code: str = Field(min_length=2, max_length=3)
    locality_slug: str | None = Field(default=None, max_length=150)
    service_type: str = Field(min_length=2, max_length=64)
    vat_percentage: float = Field(ge=0, default=0.19)
    is_active: bool = True


class TaxRuleCreate(TaxRuleBase):
    pass


class TaxRuleUpdate(BaseModel):
    country_code: str | None = Field(default=None, min_length=2, max_length=3)
    locality_slug: str | None = Field(default=None, max_length=150)
    service_type: str | None = Field(default=None, min_length=2, max_length=64)
    vat_percentage: float | None = Field(default=None, ge=0)
    is_active: bool | None = None


class TaxRuleResponse(TaxRuleBase):
    id: int

    model_config = ConfigDict(from_attributes=True)
