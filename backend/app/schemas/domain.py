from pydantic import BaseModel


class DomainBase(BaseModel):
    name: str
    slug: str
    is_active: bool = True


class DomainCreate(DomainBase):
    pass


class DomainUpdate(BaseModel):
    name: str | None = None
    slug: str | None = None
    is_active: bool | None = None


class DomainResponse(DomainBase):
    id: int

    class Config:
        from_attributes = True