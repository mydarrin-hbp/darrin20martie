from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class ServiceBase(BaseModel):
    name: str
    slug: str
    description: str | None = None
    is_active: bool = True


class ServiceCreate(ServiceBase):
    subcategory_ids: list[int] = Field(min_length=1)


class ServiceUpdate(BaseModel):
    subcategory_ids: list[int] | None = Field(default=None, min_length=1)
    name: str | None = None
    slug: str | None = None
    description: str | None = None
    is_active: bool | None = None


class ServiceResponse(ServiceBase):
    id: int
    subcategory_ids: list[int]

    model_config = ConfigDict(from_attributes=True)

    @classmethod
    def from_service(cls, service: Any) -> "ServiceResponse":
        return cls(
            id=service.id,
            name=service.name,
            slug=service.slug,
            description=service.description,
            is_active=service.is_active,
            subcategory_ids=service.subcategory_ids,
        )
