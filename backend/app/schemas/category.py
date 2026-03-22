from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.schemas.domain import _normalize_codes


class CategoryPublicBase(BaseModel):
    domain_id: int
    name_ro: str
    name_en: str
    slug: str
    is_active: bool = True


class CategoryBase(CategoryPublicBase):
    caen_codes: list[str] = Field(default_factory=list)
    uniclass_codes: list[str] = Field(default_factory=list)
    esco_codes: list[str] = Field(default_factory=list)

    @field_validator("caen_codes", "uniclass_codes", "esco_codes", mode="before")
    @classmethod
    def normalize_codes(cls, value):
        if value is None:
            return []
        if isinstance(value, str):
            return _normalize_codes([item.strip() for item in value.split(",")])
        return _normalize_codes(list(value))


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    domain_id: int | None = None
    name_ro: str | None = None
    name_en: str | None = None
    slug: str | None = None
    is_active: bool | None = None
    caen_codes: list[str] | None = None
    uniclass_codes: list[str] | None = None
    esco_codes: list[str] | None = None

    @field_validator("caen_codes", "uniclass_codes", "esco_codes", mode="before")
    @classmethod
    def normalize_optional_codes(cls, value):
        if value is None:
            return None
        if isinstance(value, str):
            return _normalize_codes([item.strip() for item in value.split(",")])
        return _normalize_codes(list(value))


class CategoryResponse(CategoryPublicBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


class CategoryBackofficeResponse(CategoryBase):
    id: int

    model_config = ConfigDict(from_attributes=True)
