from __future__ import annotations

from enum import Enum

from pydantic import BaseModel, Field, field_validator


def _slugify(value: str) -> str:
    cleaned = "".join(char.lower() if char.isalnum() else "-" for char in value.strip())
    while "--" in cleaned:
        cleaned = cleaned.replace("--", "-")
    return cleaned.strip("-") or "serviciu-nou"


def _normalize_string_list(value) -> list[str]:
    if value in (None, "", []):
        return []
    if isinstance(value, list):
        return [str(item).strip() for item in value if str(item).strip()]
    if isinstance(value, str):
        return [item.strip() for item in value.split(",") if item.strip()]
    raise ValueError("Expected a list of strings")


class ServiceRecipeResourceType(str, Enum):
    MANOPERA = "MANOPERA"
    MATERIAL = "MATERIAL"
    UTILAJ = "UTILAJ"
    TRANSPORT = "TRANSPORT"
    CONSUMABIL = "CONSUMABIL"
    ALTELE = "ALTELE"


class ServiceRecipeDraftItem(BaseModel):
    resource_type: ServiceRecipeResourceType
    resource_id: int
    activity_id: int | None = None
    specific_consumption: float = Field(gt=0)
    consumption_unit: str = Field(min_length=1, max_length=24)
    waste_percentage: float = Field(ge=0, default=0)
    level_coefficients: dict[str, float] = Field(
        default_factory=lambda: {
            "BRONZ": 1.0,
            "ARGINT": 1.0,
            "AUR": 1.0,
            "PLATINUM": 1.0,
        }
    )

    @field_validator("level_coefficients", mode="before")
    @classmethod
    def normalize_level_coefficients(cls, value):
        if not value:
            return {"BRONZ": 1.0, "ARGINT": 1.0, "AUR": 1.0, "PLATINUM": 1.0}
        if not isinstance(value, dict):
            raise ValueError("level_coefficients must be an object")
        normalized = {str(key).upper(): float(item) for key, item in value.items()}
        return {
            "BRONZ": normalized.get("BRONZ", 1.0),
            "ARGINT": normalized.get("ARGINT", 1.0),
            "AUR": normalized.get("AUR", 1.0),
            "PLATINUM": normalized.get("PLATINUM", 1.0),
        }


class ServiceDefaultCostsDraft(BaseModel):
    labor_hourly_rate: float = Field(default=75, ge=0)
    indirect_cost_percentage: float = Field(default=0.10, ge=0)
    platform_maintenance_percentage: float = Field(default=0.03, ge=0)
    mydarrin_platform_percentage: float = Field(default=0.15, ge=0)
    vat_percentage: float = Field(default=0.21, ge=0)


class BackofficeServiceCreateRequest(BaseModel):
    domain_id: int
    category_id: int
    subcategory_id: int
    service_name_ro: str = Field(min_length=2, max_length=255)
    service_name_en: str | None = Field(default=None, max_length=255)
    service_slug: str | None = Field(default=None, max_length=255)
    service_code: str | None = Field(default=None, max_length=64)
    short_description_ro: str | None = None
    short_description_en: str | None = None
    is_active: bool = True
    caen_codes: list[str] = Field(default_factory=list)
    uniclass_activity_ids: list[int] = Field(default_factory=list)
    esco_occupations: list[str] = Field(default_factory=list)
    recipe_items: list[ServiceRecipeDraftItem] = Field(default_factory=list)
    default_costs: ServiceDefaultCostsDraft = Field(default_factory=ServiceDefaultCostsDraft)

    @field_validator("service_slug", mode="before")
    @classmethod
    def normalize_slug(cls, value):
        if value in (None, ""):
            return None
        return _slugify(str(value))

    @field_validator("service_code", mode="before")
    @classmethod
    def normalize_service_code(cls, value):
        if value in (None, ""):
            return None
        return str(value).strip().upper()

    @field_validator("caen_codes", "esco_occupations", mode="before")
    @classmethod
    def normalize_string_lists(cls, value):
        return _normalize_string_list(value)


class ServiceRecipeDraftItemResponse(BaseModel):
    recipe_id: int
    activity_id: int
    activity_name_ro: str
    resource_id: int
    resource_name_ro: str
    resource_type: str
    requested_resource_type: ServiceRecipeResourceType
    specific_consumption: float
    consumption_unit: str
    waste_percentage: float
    level_coefficients: dict[str, float]


class CreatedServiceAttachmentResponse(BaseModel):
    attachment_type: str
    file_name: str
    secure_url: str


class BackofficeServiceCreateResponse(BaseModel):
    service_id: int
    service_code: str
    service_name_ro: str
    service_name_en: str | None = None
    service_slug: str
    hierarchy: dict
    classifications: dict
    service: dict
    default_costs: dict
    price_analysis_recipes: list[ServiceRecipeDraftItemResponse]
    attachments: list[CreatedServiceAttachmentResponse]
