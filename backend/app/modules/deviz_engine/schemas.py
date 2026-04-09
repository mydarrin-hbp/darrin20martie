from datetime import datetime
from enum import Enum

from pydantic import BaseModel, ConfigDict, Field

from app.modules.cost_engine.schemas import CostDraftRequest


class DevizLevelName(str, Enum):
    BRONZ = "BRONZ"
    ARGINT = "ARGINT"
    AUR = "AUR"
    PLATINUM = "PLATINUM"


class DevizRequest(CostDraftRequest):
    source_message: str | None = Field(default=None, max_length=500)


class DevizLevelRuleBase(BaseModel):
    service_id: int | None = None
    country_id: int | None = None
    level_name: DevizLevelName
    label: str
    multiplier: float = Field(gt=0)
    description: str | None = None
    sort_order: int = 0
    is_active: bool = True


class DevizLevelRuleCreate(DevizLevelRuleBase):
    pass


class DevizLevelRuleUpdate(BaseModel):
    label: str | None = None
    multiplier: float | None = Field(default=None, gt=0)
    description: str | None = None
    sort_order: int | None = None
    is_active: bool | None = None


class DevizLevelRuleResponse(DevizLevelRuleBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class DevizLevelResponse(BaseModel):
    id: int
    level_name: DevizLevelName
    label: str
    description: str | None
    multiplier: float
    cost_direct_per_nivel: float
    indirecte: float
    platform_maintenance: float
    mydarrin_platform: float
    net_total: float
    vat_value: float
    gross_total: float
    pret_final_net: float
    pret_final_gross: float
    recommended: bool
    sort_order: int

    model_config = ConfigDict(from_attributes=True)


class DevizCalculationResponse(BaseModel):
    id: int
    cost_calculation_id: int
    recommended_level_name: DevizLevelName
    cost_direct_total: float
    indirect_costs: float
    platform_maintenance: float
    mydarrin_platform: float
    base_net_total: float
    base_vat_value: float
    base_gross_total: float
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class DevizResponse(BaseModel):
    id: int
    service_id: int
    country_id: int
    zone_id: int
    locality_id: int | None = None
    currency: str
    legislation_code: str
    urgency: bool
    source_message: str | None
    created_at: datetime
    levels: list[DevizLevelResponse]
    calculation: DevizCalculationResponse

    model_config = ConfigDict(from_attributes=True)
