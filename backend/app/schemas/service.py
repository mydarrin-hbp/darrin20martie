from pydantic import BaseModel


class ServiceBase(BaseModel):
    subcategory_id: int
    name: str
    slug: str
    description: str | None = None
    is_active: bool = True


class ServiceCreate(ServiceBase):
    pass


class ServiceUpdate(BaseModel):
    subcategory_id: int | None = None
    name: str | None = None
    slug: str | None = None
    description: str | None = None
    is_active: bool | None = None


class ServiceResponse(ServiceBase):
    id: int

    class Config:
        from_attributes = True