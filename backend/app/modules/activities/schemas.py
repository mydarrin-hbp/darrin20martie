from pydantic import BaseModel


class UnitResponse(BaseModel):
    id: int
    code: str
    name: str

    class Config:
        from_attributes = True


class ActivityResponse(BaseModel):
    id: int
    name: str
    subcategory_id: int
    unit_id: int

    class Config:
        from_attributes = True


class ServiceActivityResponse(BaseModel):
    id: int
    service_id: int
    activity_id: int
    sort_order: int

    class Config:
        from_attributes = True