from pydantic import BaseModel, ConfigDict


class CategoryBase(BaseModel):
    domain_id: int
    name: str
    slug: str
    is_active: bool = True


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    domain_id: int | None = None
    name: str | None = None
    slug: str | None = None
    is_active: bool | None = None


class CategoryResponse(CategoryBase):
    id: int

    model_config = ConfigDict(from_attributes=True)