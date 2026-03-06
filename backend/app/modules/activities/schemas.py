from pydantic import BaseModel


class DomainResponse(BaseModel):
    id: int
    name: str
    slug: str
    description: str | None = None


class CategoryResponse(BaseModel):
    id: int
    name: str
    slug: str
    domain_id: int


class SubCategoryResponse(BaseModel):
    id: int
    name: str
    slug: str
    category_id: int


class ServiceResponse(BaseModel):
    id: int
    name: str
    slug: str
    description: str | None = None
    subcategory_id: int