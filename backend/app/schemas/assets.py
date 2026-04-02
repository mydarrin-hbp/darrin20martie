from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class AssetTypeCreate(BaseModel):
    slug: str
    name_ro: str
    name_en: str
    asset_family: str
    technical_schema: dict[str, Any] = Field(default_factory=dict)
    is_active: bool = True


class AssetCreate(BaseModel):
    asset_id: str
    asset_type_id: int
    category_id: int
    service_id: int | None = None
    external_ref: str | None = None
    display_name: str
    technical_specs: dict[str, Any] = Field(default_factory=dict)
    maintenance_history_id: str | None = None
    warranty_status: str = "UNKNOWN"
    manufacturer: str | None = None
    model: str | None = None
    serial_number: str | None = None
    notes: str | None = None
    is_active: bool = True


class TaskTypeCreate(BaseModel):
    slug: str
    name_ro: str
    name_en: str
    operation_kind: str
    required_caen_code: str | None = None
    required_certification_codes: list[str] = Field(default_factory=list)
    requires_certification: bool = False
    is_active: bool = True


class AssetTaskRuleCreate(BaseModel):
    asset_type_id: int
    task_type_id: int
    service_id: int | None = None
    activity_id: int | None = None
    is_default: bool = True
    rule_payload: dict[str, Any] = Field(default_factory=dict)


class ProviderCapabilityCreate(BaseModel):
    supplier_id: int
    task_type_id: int
    asset_type_id: int | None = None
    caen_code: str
    certification_codes: list[str] = Field(default_factory=list)
    can_lead_package: bool = False
    is_active: bool = True


class AssetResponse(AssetCreate):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
