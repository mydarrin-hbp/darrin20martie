from datetime import datetime
from enum import Enum

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.price_analysis import RecipeLevelName


class ResourceType(str, Enum):
    LABOR = "LABOR"
    MATERIAL = "MATERIAL"
    EQUIPMENT = "EQUIPMENT"
    TRANSPORT = "TRANSPORT"
    OTHER = "OTHER"


class ServiceLevel(str, Enum):
    BASIC = "BASIC"
    STANDARD = "STANDARD"
    PREMIUM = "PREMIUM"


class ResourceBase(BaseModel):
    resource_type: ResourceType
    name: str
    unit: str
    quantity: float = Field(gt=0)
    unit_cost: float = Field(ge=0)
    catalog_resource_id: int | None = None
    activity_id: int | None = None
    activity_name: str | None = None
    esco_code: str | None = None
    is_essential: bool = True


class ResourceCreate(ResourceBase):
    pass


class ResourceResponse(ResourceBase):
    id: int
    total_cost: float

    model_config = ConfigDict(from_attributes=True)


class AdminPriceConfigBase(BaseModel):
    service_id: int
    country_id: int
    zone_id: int | None = None
    currency: str = Field(min_length=3, max_length=3)
    legislation_code: str = Field(min_length=2, max_length=32)
    base_price: float = Field(ge=0)
    legislation_coefficient: float = Field(gt=0, default=1.0)
    zone_coefficient_override: float | None = Field(default=None, gt=0)
    urgency_coefficient: float = Field(gt=0, default=1.2)
    basic_level_coefficient: float = Field(gt=0, default=1.0)
    standard_level_coefficient: float = Field(gt=0, default=1.15)
    premium_level_coefficient: float = Field(gt=0, default=1.3)
    indirect_cost_percentage: float = Field(ge=0, default=0.10)
    platform_maintenance_percentage: float = Field(ge=0, default=0.03)
    mydarrin_platform_percentage: float = Field(ge=0, default=0.15)
    vat_percentage: float = Field(ge=0, default=0.21)
    minimum_order_value: float = Field(ge=0, default=0)
    minimum_quantity_threshold: float = Field(ge=0, default=0)
    platform_margin_coefficient: float = Field(ge=0, default=0.15)
    vat_coefficient: float = Field(ge=0, default=0.19)
    is_active: bool = True


class AdminPriceConfigCreate(AdminPriceConfigBase):
    pass


class AdminPriceConfigUpdate(BaseModel):
    currency: str | None = Field(default=None, min_length=3, max_length=3)
    legislation_code: str | None = Field(default=None, min_length=2, max_length=32)
    base_price: float | None = Field(default=None, ge=0)
    legislation_coefficient: float | None = Field(default=None, gt=0)
    zone_coefficient_override: float | None = Field(default=None, gt=0)
    urgency_coefficient: float | None = Field(default=None, gt=0)
    basic_level_coefficient: float | None = Field(default=None, gt=0)
    standard_level_coefficient: float | None = Field(default=None, gt=0)
    premium_level_coefficient: float | None = Field(default=None, gt=0)
    indirect_cost_percentage: float | None = Field(default=None, ge=0)
    platform_maintenance_percentage: float | None = Field(default=None, ge=0)
    mydarrin_platform_percentage: float | None = Field(default=None, ge=0)
    vat_percentage: float | None = Field(default=None, ge=0)
    minimum_order_value: float | None = Field(default=None, ge=0)
    minimum_quantity_threshold: float | None = Field(default=None, ge=0)
    platform_margin_coefficient: float | None = Field(default=None, ge=0)
    vat_coefficient: float | None = Field(default=None, ge=0)
    is_active: bool | None = None
    zone_id: int | None = None


class AdminPriceConfigResponse(AdminPriceConfigBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CostDraftRequest(BaseModel):
    service_id: int
    country_id: int
    zone_id: int
    locality_id: int | None = None
    currency: str = Field(min_length=3, max_length=3)
    legislation_code: str = Field(min_length=2, max_length=32)
    urgency: bool = False
    service_level: ServiceLevel = ServiceLevel.STANDARD
    recipe_level: RecipeLevelName = RecipeLevelName.ARGINT
    requested_quantity: float | None = Field(default=None, gt=0)
    target_address: str | None = None
    activity_ids: list[int] = Field(default_factory=list)
    resources: list[ResourceCreate] = Field(default_factory=list)


class PartialAvailabilityResponse(BaseModel):
    status: str
    service_id: int
    service_name: str
    service_slug: str
    country_id: int
    zone_id: int
    locality_id: int | None = None
    currency: str
    legislation_code: str
    message: str
    available_resource_types: list[str]
    missing_resource_types: list[str]
    target_address: str | None = None


class PriceAnalysisResponse(BaseModel):
    id: int
    admin_price_config_id: int
    service_id: int
    country_id: int
    zone_id: int
    locality_id: int | None = None
    currency: str
    legislation_code: str
    service_level: ServiceLevel
    recipe_level: RecipeLevelName
    urgency: bool
    activity_count: int
    subcategory_count: int
    uses_recipe_engine: bool
    resource_subtotal: float
    base_price: float
    zone_coefficient: float
    urgency_coefficient: float
    service_level_coefficient: float
    legislation_coefficient: float
    indirect_cost_percentage: float
    platform_maintenance_percentage: float
    mydarrin_platform_percentage: float
    vat_percentage: float
    platform_margin_coefficient: float
    vat_coefficient: float
    cost_direct_total: float
    cost_direct: float
    indirect_cost_value: float
    indirect_costs: float
    platform_maintenance_value: float
    platform_maintenance_costs: float
    mydarrin_platform_value: float
    platform_costs: float
    adjusted_subtotal: float
    final_price: float
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CostCalculationResponse(BaseModel):
    id: int
    price_analysis_id: int
    service_id: int
    cost_direct_total: float
    cost_direct: float
    indirect_cost_value: float
    indirect_costs: float
    platform_maintenance_value: float
    platform_maintenance_costs: float
    mydarrin_platform_value: float
    platform_costs: float
    net_total: float
    platform_margin_value: float
    vat_value: float
    gross_total: float
    final_price_net: float
    final_price_gross: float
    final_price: float
    currency: str
    created_at: datetime
    resources: list[ResourceResponse]

    model_config = ConfigDict(from_attributes=True)


class CostDraftResponse(BaseModel):
    service_id: int
    service_name: str
    service_slug: str
    subcategory_ids: list[int]
    activity_ids: list[int]
    country_id: int
    zone_id: int
    locality_id: int | None = None
    currency: str
    legislation_code: str
    service_level: ServiceLevel
    urgency: bool
    requested_quantity: float | None = None
    target_address: str | None = None
    minimum_order_applied: bool = False
    availability_status: str = "available"
    price_analysis: PriceAnalysisResponse
    calculation: CostCalculationResponse
