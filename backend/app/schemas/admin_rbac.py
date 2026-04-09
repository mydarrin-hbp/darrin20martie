from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class InviteAdminRequest(BaseModel):
    email: EmailStr
    full_name: str | None = Field(default=None, max_length=255)
    role_key: str = Field(min_length=2, max_length=64)
    country_access: list[str] = Field(default_factory=list)
    module_access: list[str] = Field(default_factory=list)
    design_edit: bool = False


class AdminInviteAcceptRequest(BaseModel):
    token: str = Field(min_length=10, max_length=255)
    password: str = Field(min_length=8, max_length=255)
    full_name: str | None = Field(default=None, max_length=255)


class AdminPermissionResponse(BaseModel):
    id: int
    permission_code: str
    module_key: str
    country_code: str | None = None
    is_active: bool

    model_config = ConfigDict(from_attributes=True)


class AdminProfileResponse(BaseModel):
    id: int
    user_id: int
    email: EmailStr
    full_name: str | None = None
    role_key: str
    country_access: list[str]
    module_access: list[str]
    invitation_status: str
    is_active: bool
    design_edit: bool = False
    invitation_url: str | None = None
    created_at: datetime
    permissions: list[AdminPermissionResponse] = Field(default_factory=list)


class AdminInviteResponse(AdminProfileResponse):
    pass
