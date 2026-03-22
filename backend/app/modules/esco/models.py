from __future__ import annotations

from sqlalchemy import Boolean, Float, JSON, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class EscoDictionaryEntry(Base):
    __tablename__ = "esco_dictionary_entries"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    filename: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    data_header: Mapped[str] = mapped_column(String(255), nullable=False)
    property_name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)


class EscoSkillGroup(Base):
    __tablename__ = "esco_skill_groups"

    concept_uri: Mapped[str] = mapped_column(String(255), primary_key=True)
    concept_type: Mapped[str | None] = mapped_column(String(80), nullable=True)
    preferred_label: Mapped[str | None] = mapped_column(String(500), nullable=True, index=True)
    alt_labels: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    hidden_labels: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    status: Mapped[str | None] = mapped_column(String(80), nullable=True)
    modified_date: Mapped[str | None] = mapped_column(String(80), nullable=True)
    scope_note: Mapped[str | None] = mapped_column(Text, nullable=True)
    in_scheme: Mapped[str | None] = mapped_column(String(255), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    code: Mapped[str | None] = mapped_column(String(80), nullable=True)


class EscoIscoGroup(Base):
    __tablename__ = "esco_isco_groups"

    concept_uri: Mapped[str] = mapped_column(String(255), primary_key=True)
    concept_type: Mapped[str | None] = mapped_column(String(80), nullable=True)
    code: Mapped[str | None] = mapped_column(String(80), nullable=True, index=True)
    preferred_label: Mapped[str | None] = mapped_column(String(500), nullable=True, index=True)
    status: Mapped[str | None] = mapped_column(String(80), nullable=True)
    alt_labels: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    in_scheme: Mapped[str | None] = mapped_column(String(255), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)


class EscoSkill(Base):
    __tablename__ = "esco_skills"

    concept_uri: Mapped[str] = mapped_column(String(255), primary_key=True)
    concept_type: Mapped[str | None] = mapped_column(String(80), nullable=True)
    preferred_label: Mapped[str | None] = mapped_column(String(500), nullable=True, index=True)
    status: Mapped[str | None] = mapped_column(String(80), nullable=True)
    skill_types: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    reuse_level: Mapped[str | None] = mapped_column(String(80), nullable=True, index=True)
    alt_labels: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    hidden_labels: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    definition: Mapped[str | None] = mapped_column(Text, nullable=True)
    scope_note: Mapped[str | None] = mapped_column(Text, nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    in_scheme: Mapped[str | None] = mapped_column(String(255), nullable=True)
    broader_concept_uris: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    thematic_tags: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    source_collections: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)


class EscoSkillHierarchy(Base):
    __tablename__ = "esco_skill_hierarchy"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    level_0_uri: Mapped[str | None] = mapped_column(String(255), nullable=True, index=True)
    level_0_preferred_term: Mapped[str | None] = mapped_column(String(500), nullable=True)
    level_1_uri: Mapped[str | None] = mapped_column(String(255), nullable=True, index=True)
    level_1_preferred_term: Mapped[str | None] = mapped_column(String(500), nullable=True)
    level_2_uri: Mapped[str | None] = mapped_column(String(255), nullable=True, index=True)
    level_2_preferred_term: Mapped[str | None] = mapped_column(String(500), nullable=True)
    level_3_uri: Mapped[str | None] = mapped_column(String(255), nullable=True, index=True)
    level_3_preferred_term: Mapped[str | None] = mapped_column(String(500), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    scope_note: Mapped[str | None] = mapped_column(Text, nullable=True)
    level_0_code: Mapped[str | None] = mapped_column(String(80), nullable=True)
    level_1_code: Mapped[str | None] = mapped_column(String(80), nullable=True)
    level_2_code: Mapped[str | None] = mapped_column(String(80), nullable=True)
    level_3_code: Mapped[str | None] = mapped_column(String(80), nullable=True)


class EscoSkillBroaderRelation(Base):
    __tablename__ = "esco_skill_broader_relations"
    __table_args__ = (
        UniqueConstraint("concept_uri", "broader_uri", name="uq_esco_skill_broader_relation"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    concept_type: Mapped[str | None] = mapped_column(String(80), nullable=True)
    concept_uri: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    concept_label: Mapped[str | None] = mapped_column(String(500), nullable=True)
    broader_type: Mapped[str | None] = mapped_column(String(80), nullable=True)
    broader_uri: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    broader_label: Mapped[str | None] = mapped_column(String(500), nullable=True)


class EscoSkillRelation(Base):
    __tablename__ = "esco_skill_relations"
    __table_args__ = (
        UniqueConstraint("original_skill_uri", "relation_type", "related_skill_uri", name="uq_esco_skill_relation"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    original_skill_uri: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    original_skill_type: Mapped[str | None] = mapped_column(String(80), nullable=True)
    relation_type: Mapped[str] = mapped_column(String(80), nullable=False, index=True)
    related_skill_type: Mapped[str | None] = mapped_column(String(80), nullable=True)
    related_skill_uri: Mapped[str] = mapped_column(String(255), nullable=False, index=True)


class EscoOccupation(Base):
    __tablename__ = "esco_occupations"

    concept_uri: Mapped[str] = mapped_column(String(255), primary_key=True)
    concept_type: Mapped[str | None] = mapped_column(String(80), nullable=True)
    isco_group: Mapped[str | None] = mapped_column(String(255), nullable=True, index=True)
    preferred_label: Mapped[str | None] = mapped_column(String(500), nullable=True, index=True)
    alt_labels: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    hidden_labels: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    status: Mapped[str | None] = mapped_column(String(80), nullable=True)
    modified_date: Mapped[str | None] = mapped_column(String(80), nullable=True)
    regulated_profession_note: Mapped[str | None] = mapped_column(Text, nullable=True)
    scope_note: Mapped[str | None] = mapped_column(Text, nullable=True)
    definition: Mapped[str | None] = mapped_column(Text, nullable=True)
    in_scheme: Mapped[str | None] = mapped_column(String(255), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    code: Mapped[str | None] = mapped_column(String(80), nullable=True)
    nace_code: Mapped[str | None] = mapped_column(String(80), nullable=True)
    research_occupation: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    green_share: Mapped[float | None] = mapped_column(Float, nullable=True)


class EscoOccupationBroaderRelation(Base):
    __tablename__ = "esco_occupation_broader_relations"
    __table_args__ = (
        UniqueConstraint("concept_uri", "broader_uri", name="uq_esco_occ_broader_relation"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    concept_type: Mapped[str | None] = mapped_column(String(80), nullable=True)
    concept_uri: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    concept_label: Mapped[str | None] = mapped_column(String(500), nullable=True)
    broader_type: Mapped[str | None] = mapped_column(String(80), nullable=True)
    broader_uri: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    broader_label: Mapped[str | None] = mapped_column(String(500), nullable=True)


class EscoOccupationSkillRelation(Base):
    __tablename__ = "esco_occupation_skill_relations"
    __table_args__ = (
        UniqueConstraint("occupation_uri", "relation_type", "skill_uri", name="uq_esco_occupation_skill_relation"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    occupation_uri: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    occupation_label: Mapped[str | None] = mapped_column(String(500), nullable=True)
    relation_type: Mapped[str] = mapped_column(String(80), nullable=False, index=True)
    skill_type: Mapped[str | None] = mapped_column(String(80), nullable=True)
    skill_uri: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    skill_label: Mapped[str | None] = mapped_column(String(500), nullable=True)
