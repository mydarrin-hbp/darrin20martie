from __future__ import annotations

from datetime import datetime
from enum import Enum

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


def _normalize_dict(value) -> dict:
    if value in (None, "", {}):
        return {}
    if isinstance(value, dict):
        return value
    raise ValueError("technical_specs must be a JSON object")


def _normalize_string_list(value) -> list[str]:
    if value in (None, "", []):
        return []
    if isinstance(value, list):
        return [str(item).strip() for item in value if str(item).strip()]
    raise ValueError("attachments must be provided as a list of URLs")


def _normalize_coefficients(value) -> dict:
    if value in (None, "", {}):
        return {}
    if isinstance(value, dict):
        return {str(key).upper(): float(item) for key, item in value.items()}
    raise ValueError("level_coefficients must be a JSON object")


class ResourceType(str, Enum):
    LABOR = "LABOR"
    MATERIAL = "MATERIAL"
    EQUIPMENT = "EQUIPMENT"
    TRANSPORT = "TRANSPORT"


class RecipeLevelName(str, Enum):
    BRONZ = "BRONZ"
    ARGINT = "ARGINT"
    AUR = "AUR"
    PLATINUM = "PLATINUM"


class CatalogActivityBase(BaseModel):
    uniclass_code: str = Field(min_length=2, max_length=64)
    name_ro: str = Field(min_length=2, max_length=255)
    name_en: str = Field(min_length=2, max_length=255)
    uom: str = Field(min_length=1, max_length=24)
    domain_id: int
    category_id: int
    subcategory_id: int
    description: str | None = None
    description_extended: str | None = None
    is_active: bool = True
    images: list[str] = Field(default_factory=list)
    documents: list[str] = Field(default_factory=list)
    videos: list[str] = Field(default_factory=list)
    level_attachments: dict = Field(default_factory=dict)

    @field_validator("images", "documents", "videos", mode="before")
    @classmethod
    def normalize_attachment_lists(cls, value):
        return _normalize_string_list(value)

    @field_validator("level_attachments", mode="before")
    @classmethod
    def normalize_activity_dicts(cls, value):
        if value is None:
            return {}
        if isinstance(value, dict):
            return value
        return {}


class CatalogActivityCreate(CatalogActivityBase):
    pass


class CatalogActivityUpdate(BaseModel):
    uniclass_code: str | None = Field(default=None, min_length=2, max_length=64)
    name_ro: str | None = Field(default=None, min_length=2, max_length=255)
    name_en: str | None = Field(default=None, min_length=2, max_length=255)
    uom: str | None = Field(default=None, min_length=1, max_length=24)
    domain_id: int | None = None
    category_id: int | None = None
    subcategory_id: int | None = None
    description: str | None = None
    description_extended: str | None = None
    is_active: bool | None = None
    images: list[str] | None = None
    documents: list[str] | None = None
    videos: list[str] | None = None
    level_attachments: dict | None = None

    @field_validator("images", "documents", "videos", mode="before")
    @classmethod
    def normalize_optional_attachment_lists(cls, value):
        if value is None:
            return None
        return _normalize_string_list(value)

    @field_validator("level_attachments", mode="before")
    @classmethod
    def normalize_optional_activity_dicts(cls, value):
        if value is None:
            return None
        if isinstance(value, dict):
            return value
        return {}


class CatalogActivityResponse(CatalogActivityBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


class CatalogResourceBase(BaseModel):
    supplier_id: int | None = None
    esco_code: str | None = Field(default=None, max_length=255)
    name_ro: str = Field(min_length=2, max_length=255)
    name_en: str = Field(min_length=2, max_length=255)
    resource_type: ResourceType
    base_price: float = Field(ge=0)
    unit: str = Field(min_length=1, max_length=24)
    lead_time_days: int | None = Field(default=None, ge=0)
    stock_qty: float | None = Field(default=None, ge=0)
    availability_status: str = Field(default="IN_STOCK", min_length=2, max_length=32)
    technical_specs: dict = Field(default_factory=dict)
    is_active: bool = True

    @field_validator("technical_specs", mode="before")
    @classmethod
    def normalize_specs(cls, value):
        return _normalize_dict(value)

    @model_validator(mode="after")
    def validate_esco_for_labor(self):
        if self.resource_type == ResourceType.LABOR and not self.esco_code:
            raise ValueError("ESCO code is required for labor resources")
        return self


class CatalogResourceCreate(CatalogResourceBase):
    pass


class CatalogResourceUpdate(BaseModel):
    supplier_id: int | None = None
    esco_code: str | None = Field(default=None, max_length=255)
    name_ro: str | None = Field(default=None, min_length=2, max_length=255)
    name_en: str | None = Field(default=None, min_length=2, max_length=255)
    resource_type: ResourceType | None = None
    base_price: float | None = Field(default=None, ge=0)
    unit: str | None = Field(default=None, min_length=1, max_length=24)
    lead_time_days: int | None = Field(default=None, ge=0)
    stock_qty: float | None = Field(default=None, ge=0)
    availability_status: str | None = Field(default=None, min_length=2, max_length=32)
    technical_specs: dict | None = None
    is_active: bool | None = None

    @field_validator("technical_specs", mode="before")
    @classmethod
    def normalize_optional_specs(cls, value):
        if value is None:
            return None
        return _normalize_dict(value)


class CatalogResourceResponse(CatalogResourceBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


class AdminResourcePriceConfigBase(BaseModel):
    resource_id: int
    country_id: int
    zone_id: int | None = None
    locality_id: int | None = None
    currency: str = Field(min_length=3, max_length=3)
    base_price: float = Field(ge=0)
    zone_multiplier: float = Field(gt=0, default=1.0)
    legislation_code: str = Field(min_length=2, max_length=32)
    is_active: bool = True


class AdminResourcePriceConfigCreate(AdminResourcePriceConfigBase):
    pass


class AdminResourcePriceConfigUpdate(BaseModel):
    zone_id: int | None = None
    locality_id: int | None = None
    currency: str | None = Field(default=None, min_length=3, max_length=3)
    base_price: float | None = Field(default=None, ge=0)
    zone_multiplier: float | None = Field(default=None, gt=0)
    legislation_code: str | None = Field(default=None, min_length=2, max_length=32)
    is_active: bool | None = None


class AdminResourcePriceConfigResponse(AdminResourcePriceConfigBase):
    id: int
    resource_name_ro: str
    resource_type: ResourceType

    model_config = ConfigDict(from_attributes=True)


class PriceAnalysisRecipeBase(BaseModel):
    activity_id: int
    resource_id: int
    specific_consumption: float = Field(gt=0)
    productivity_norm: float | None = Field(default=None, gt=0)
    indicator_code: str | None = Field(default=None, min_length=2, max_length=64)
    consumption_unit: str | None = Field(default=None, min_length=1, max_length=24)
    waste_percentage: float = Field(ge=0)
    waste_formula: str | None = Field(default=None, max_length=255)
    coefficient_bronz: float = Field(gt=0, default=1.0)
    coefficient_argint: float = Field(gt=0, default=1.1)
    coefficient_aur: float = Field(gt=0, default=1.2)
    coefficient_platinum: float = Field(gt=0, default=1.35)
    level_coefficients: dict = Field(default_factory=dict)
    caen_nace_link: dict = Field(default_factory=dict)
    is_essential: bool = True

    @field_validator("level_coefficients", "caen_nace_link", mode="before")
    @classmethod
    def normalize_recipe_dicts(cls, value):
        if value is None:
            return {}
        if isinstance(value, dict):
            if value == {}:
                return {}
            return _normalize_coefficients(value) if "BRONZ" in {str(k).upper() for k in value.keys()} else value
        return {}


class PriceAnalysisRecipeCreate(PriceAnalysisRecipeBase):
    pass


class PriceAnalysisRecipeUpdate(BaseModel):
    activity_id: int | None = None
    resource_id: int | None = None
    specific_consumption: float | None = Field(default=None, gt=0)
    productivity_norm: float | None = Field(default=None, gt=0)
    indicator_code: str | None = Field(default=None, min_length=2, max_length=64)
    consumption_unit: str | None = Field(default=None, min_length=1, max_length=24)
    waste_percentage: float | None = Field(default=None, ge=0)
    waste_formula: str | None = Field(default=None, max_length=255)
    coefficient_bronz: float | None = Field(default=None, gt=0)
    coefficient_argint: float | None = Field(default=None, gt=0)
    coefficient_aur: float | None = Field(default=None, gt=0)
    coefficient_platinum: float | None = Field(default=None, gt=0)
    level_coefficients: dict | None = None
    caen_nace_link: dict | None = None
    is_essential: bool | None = None

    @field_validator("level_coefficients", "caen_nace_link", mode="before")
    @classmethod
    def normalize_optional_recipe_dicts(cls, value):
        if value is None:
            return None
        if isinstance(value, dict):
            if value == {}:
                return {}
            return _normalize_coefficients(value) if "BRONZ" in {str(k).upper() for k in value.keys()} else value
        return {}


class PriceAnalysisRecipeResponse(PriceAnalysisRecipeBase):
    id: int
    activity_name_ro: str
    resource_name_ro: str
    resource_type: ResourceType
    resource_unit: str
    resource_base_price: float
    esco_code: str | None = None


class IndicatorResourceRow(BaseModel):
    recipe_id: int
    resource_id: int
    resource_name_ro: str
    resource_type: ResourceType
    esco_code: str | None = None
    specific_consumption: float
    calculated_consumption: float
    consumption_unit: str
    waste_percentage: float
    waste_formula: str | None = None
    applied_coefficient: float
    level: RecipeLevelName
    base_price: float
    estimated_cost: float
    is_essential: bool


class IndicatorCalculationResponse(BaseModel):
    activity_id: int
    activity_name_ro: str
    level: RecipeLevelName
    domain_id: int
    category_id: int
    subcategory_id: int
    caen_nace_link: dict
    pricing_context: dict
    total_estimated_cost: float
    rows: list[IndicatorResourceRow]


class EntityAttachmentResponse(BaseModel):
    id: int
    entity_type: str
    entity_id: int
    attachment_type: str
    level_name: str | None = None
    file_name: str
    mime_type: str
    secure_url: str
    created_at: datetime


class EntityAttachmentListResponse(BaseModel):
    items: list[EntityAttachmentResponse]


class PriceAnalysisRecipeImportResponse(BaseModel):
    created: int = 0
    updated: int = 0
    skipped: int = 0


class ActivityImportResponse(BaseModel):
    created: int = 0
    updated: int = 0
    skipped: int = 0
