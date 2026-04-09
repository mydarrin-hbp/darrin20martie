from typing import Any

from pydantic import BaseModel, ConfigDict, Field, field_validator


def _normalize_string_list(value):
    if value in (None, "", []):
        return []
    if isinstance(value, list):
        return [str(item).strip() for item in value if str(item).strip()]
    raise ValueError("attachments must be provided as a list of URLs")


def _normalize_dict(value):
    if value in (None, "", {}):
        return {}
    if isinstance(value, dict):
        return value
    raise ValueError("level_attachments must be a JSON object")


class ServiceBase(BaseModel):
    name: str
    slug: str
    description: str | None = None
    description_extended: str | None = None
    is_active: bool = True
    esco_concept_uri: str | None = None
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
    def normalize_level_attachments(cls, value):
        return _normalize_dict(value)


class ServiceCreate(ServiceBase):
    subcategory_ids: list[int] = Field(min_length=1)


class ServiceUpdate(BaseModel):
    subcategory_ids: list[int] | None = Field(default=None, min_length=1)
    name: str | None = None
    slug: str | None = None
    description: str | None = None
    description_extended: str | None = None
    is_active: bool | None = None
    esco_concept_uri: str | None = None
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
    def normalize_optional_level_attachments(cls, value):
        if value is None:
            return None
        return _normalize_dict(value)


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
            description_extended=service.description_extended,
            is_active=service.is_active,
            esco_concept_uri=service.esco_concept_uri,
            images=service.images or [],
            documents=service.documents or [],
            videos=service.videos or [],
            level_attachments=service.level_attachments or {},
            subcategory_ids=service.subcategory_ids,
        )
