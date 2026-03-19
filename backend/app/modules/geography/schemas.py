from pydantic import BaseModel


class CountryResponse(BaseModel):
    id: int
    name: str
    code: str
    currency: str

    class Config:
        from_attributes = True


class ZoneResponse(BaseModel):
    id: int
    name: str
    country_id: int
    multiplier: float

    class Config:
        from_attributes = True