from pydantic import BaseModel, HttpUrl


class EscoResourceImportResponse(BaseModel):
    uri: str
    class_name: str
    resource_table: str | None
    relations_created: int
    skill_relations_created: int
    source_url: HttpUrl | None = None
    source_file_name: str | None = None
