from pydantic import BaseModel, ConfigDict


class SubcategoryBase(BaseModel):
    category_id: int
    name: str
    slug: str
    is_active: bool = True


class SubcategoryCreate(SubcategoryBase):
    pass


class SubcategoryUpdate(BaseModel):
    category_id: int | None = None
    name: str | None = None
    slug: str | None = None
    is_active: bool | None = None


class SubcategoryResponse(SubcategoryBase):
    id: int

    model_config = ConfigDict(from_attributes=True)