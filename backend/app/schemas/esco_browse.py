from __future__ import annotations

from pydantic import BaseModel, Field


class EscoIscoGroupRecord(BaseModel):
    concept_uri: str
    concept_type: str | None = None
    code: str | None = None
    preferred_label: str | None = None
    alt_labels: list[str] = Field(default_factory=list)
    status: str | None = None
    in_scheme: str | None = None
    description: str | None = None


class EscoSkillRecord(BaseModel):
    concept_uri: str
    concept_type: str | None = None
    preferred_label: str | None = None
    alt_labels: list[str] = Field(default_factory=list)
    status: str | None = None
    reuse_level: str | None = None
    skill_types: list[str] = Field(default_factory=list)
    in_scheme: str | None = None
    description: str | None = None


class EscoOccupationRecord(BaseModel):
    concept_uri: str
    concept_type: str | None = None
    isco_group: str | None = None
    code: str | None = None
    preferred_label: str | None = None
    alt_labels: list[str] = Field(default_factory=list)
    status: str | None = None
    in_scheme: str | None = None
    nace_code: str | None = None
    research_occupation: bool
    green_share: float | None = None
    description: str | None = None


class EscoBrowseResponse(BaseModel):
    query: str | None = None
    count: int
    items: list[EscoIscoGroupRecord | EscoSkillRecord | EscoOccupationRecord]
