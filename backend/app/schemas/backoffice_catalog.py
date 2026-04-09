from pydantic import BaseModel, ConfigDict


class CatalogImportResponse(BaseModel):
    domains_created: int = 0
    domains_updated: int = 0
    categories_created: int = 0
    categories_updated: int = 0
    subcategories_created: int = 0
    subcategories_updated: int = 0


class CatalogImportRow(BaseModel):
    level: str
    slug: str
    name_ro: str
    name_en: str
    caen_codes: list[str]
    uniclass_codes: list[str]
    esco_codes: list[str]
    domain_slug: str | None = None
    category_slug: str | None = None

    model_config = ConfigDict(str_strip_whitespace=True)
