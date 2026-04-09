from pydantic import BaseModel, ConfigDict, Field, field_validator


def _normalize_codes(values: list[str] | None) -> list[str]:
    if not values:
        return []
    normalized: list[str] = []
    seen: set[str] = set()
    for item in values:
        value = str(item).strip()
        if not value or value in seen:
            continue
        seen.add(value)
        normalized.append(value)
    return normalized


class DomainPublicBase(BaseModel):
    name_ro: str
    name_en: str
    slug: str
    is_active: bool = True


class DomainBase(DomainPublicBase):
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


class DomainCreate(DomainBase):
    pass


class DomainUpdate(BaseModel):
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


class DomainResponse(DomainPublicBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


class DomainBackofficeResponse(DomainBase):
    id: int

    model_config = ConfigDict(from_attributes=True)
