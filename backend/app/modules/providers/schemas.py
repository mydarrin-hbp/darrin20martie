from __future__ import annotations

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class ProviderBase(BaseModel):
    name: str = Field(min_length=2)
    contact_email: EmailStr | None = None
    provider_type: str = Field(default="MATERIAL")
    is_active: bool = True


class ProviderCreate(ProviderBase):
    pass


class ProviderUpdate(BaseModel):
    name: str | None = None
    contact_email: EmailStr | None = None
    provider_type: str | None = None
    is_active: bool | None = None


class ProviderResponse(ProviderBase):
    id: int

    model_config = ConfigDict(from_attributes=True)
