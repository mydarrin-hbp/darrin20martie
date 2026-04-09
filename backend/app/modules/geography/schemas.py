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


class CountryBase(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    name_ro: str = Field(min_length=2, max_length=100)
    name_en: str = Field(min_length=2, max_length=100)
    slug: str = Field(min_length=2, max_length=120)
    code: str = Field(min_length=2, max_length=3)
    currency: str = Field(min_length=3, max_length=3)
    is_active: bool = True


class CountryCreate(CountryBase):
    pass


class CountryUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=100)
    name_ro: str | None = Field(default=None, min_length=2, max_length=100)
    name_en: str | None = Field(default=None, min_length=2, max_length=100)
    slug: str | None = Field(default=None, min_length=2, max_length=120)
    code: str | None = Field(default=None, min_length=2, max_length=3)
    currency: str | None = Field(default=None, min_length=3, max_length=3)
    is_active: bool | None = None


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


class ZoneBase(BaseModel):
    country_id: int
    name: str = Field(min_length=2, max_length=100)
    name_ro: str = Field(min_length=2, max_length=100)
    name_en: str = Field(min_length=2, max_length=100)
    slug: str = Field(min_length=2, max_length=120)
    multiplier: float = 1.0
    is_active: bool = True


class ZoneCreate(ZoneBase):
    pass


class ZoneUpdate(BaseModel):
    country_id: int | None = None
    name: str | None = Field(default=None, min_length=2, max_length=100)
    name_ro: str | None = Field(default=None, min_length=2, max_length=100)
    name_en: str | None = Field(default=None, min_length=2, max_length=100)
    slug: str | None = Field(default=None, min_length=2, max_length=120)
    multiplier: float | None = None
    is_active: bool | None = None


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
