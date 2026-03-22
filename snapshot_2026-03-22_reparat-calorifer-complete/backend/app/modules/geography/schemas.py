from pydantic import BaseModel, ConfigDict, Field


class CountryResponse(BaseModel):
    id: int
    name: str
    name_ro: str
    name_en: str
    slug: str
    code: str
    currency: str
    is_active: bool

    model_config = ConfigDict(from_attributes=True)


class ZoneResponse(BaseModel):
    id: int
    name: str
    name_ro: str
    name_en: str
    slug: str
    country_id: int
    multiplier: float
    is_active: bool

    model_config = ConfigDict(from_attributes=True)


class LocalityBase(BaseModel):
    country_id: int
    zone_id: int
    name_ro: str = Field(min_length=2, max_length=120)
    name_en: str = Field(min_length=2, max_length=120)
    slug: str = Field(min_length=2, max_length=150)
    latitude: float | None = None
    longitude: float | None = None
    is_active: bool = True


class LocalityCreate(LocalityBase):
    pass


class LocalityUpdate(BaseModel):
    zone_id: int | None = None
    name_ro: str | None = Field(default=None, min_length=2, max_length=120)
    name_en: str | None = Field(default=None, min_length=2, max_length=120)
    slug: str | None = Field(default=None, min_length=2, max_length=150)
    latitude: float | None = None
    longitude: float | None = None
    is_active: bool | None = None


class LocalityResponse(LocalityBase):
    id: int
    country_name_ro: str
    zone_name_ro: str

    model_config = ConfigDict(from_attributes=True)
