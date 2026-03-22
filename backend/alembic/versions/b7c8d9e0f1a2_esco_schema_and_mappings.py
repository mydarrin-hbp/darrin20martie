"""esco schema and catalog mappings

Revision ID: b7c8d9e0f1a2
Revises: a7b9c2d4e5f6
Create Date: 2026-03-22 12:20:00.000000
"""

from alembic import op
import sqlalchemy as sa


revision = "b7c8d9e0f1a2"
down_revision = "a7b9c2d4e5f6"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("domains", sa.Column("esco_concept_uri", sa.String(length=255), nullable=True))
    op.create_index(op.f("ix_domains_esco_concept_uri"), "domains", ["esco_concept_uri"], unique=False)
    op.add_column("categories", sa.Column("esco_concept_uri", sa.String(length=255), nullable=True))
    op.create_index(op.f("ix_categories_esco_concept_uri"), "categories", ["esco_concept_uri"], unique=False)
    op.add_column("subcategories", sa.Column("esco_concept_uri", sa.String(length=255), nullable=True))
    op.create_index(op.f("ix_subcategories_esco_concept_uri"), "subcategories", ["esco_concept_uri"], unique=False)
    op.add_column("services", sa.Column("esco_concept_uri", sa.String(length=255), nullable=True))
    op.create_index(op.f("ix_services_esco_concept_uri"), "services", ["esco_concept_uri"], unique=False)
    op.add_column("activities", sa.Column("esco_concept_uri", sa.String(length=255), nullable=True))
    op.create_index(op.f("ix_activities_esco_concept_uri"), "activities", ["esco_concept_uri"], unique=False)

    op.create_table(
        "esco_dictionary_entries",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("filename", sa.String(length=255), nullable=False),
        sa.Column("data_header", sa.String(length=255), nullable=False),
        sa.Column("property_name", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_esco_dictionary_entries_filename"), "esco_dictionary_entries", ["filename"], unique=False)

    op.create_table(
        "esco_skill_groups",
        sa.Column("concept_uri", sa.String(length=255), nullable=False),
        sa.Column("concept_type", sa.String(length=80), nullable=True),
        sa.Column("preferred_label", sa.String(length=500), nullable=True),
        sa.Column("alt_labels", sa.JSON(), nullable=False),
        sa.Column("hidden_labels", sa.JSON(), nullable=False),
        sa.Column("status", sa.String(length=80), nullable=True),
        sa.Column("modified_date", sa.String(length=80), nullable=True),
        sa.Column("scope_note", sa.Text(), nullable=True),
        sa.Column("in_scheme", sa.String(length=255), nullable=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("code", sa.String(length=80), nullable=True),
        sa.PrimaryKeyConstraint("concept_uri"),
    )
    op.create_index(op.f("ix_esco_skill_groups_preferred_label"), "esco_skill_groups", ["preferred_label"], unique=False)

    op.create_table(
        "esco_isco_groups",
        sa.Column("concept_uri", sa.String(length=255), nullable=False),
        sa.Column("concept_type", sa.String(length=80), nullable=True),
        sa.Column("code", sa.String(length=80), nullable=True),
        sa.Column("preferred_label", sa.String(length=500), nullable=True),
        sa.Column("status", sa.String(length=80), nullable=True),
        sa.Column("alt_labels", sa.JSON(), nullable=False),
        sa.Column("in_scheme", sa.String(length=255), nullable=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.PrimaryKeyConstraint("concept_uri"),
    )
    op.create_index(op.f("ix_esco_isco_groups_code"), "esco_isco_groups", ["code"], unique=False)
    op.create_index(op.f("ix_esco_isco_groups_preferred_label"), "esco_isco_groups", ["preferred_label"], unique=False)

    op.create_table(
        "esco_skills",
        sa.Column("concept_uri", sa.String(length=255), nullable=False),
        sa.Column("concept_type", sa.String(length=80), nullable=True),
        sa.Column("preferred_label", sa.String(length=500), nullable=True),
        sa.Column("status", sa.String(length=80), nullable=True),
        sa.Column("skill_types", sa.JSON(), nullable=False),
        sa.Column("reuse_level", sa.String(length=80), nullable=True),
        sa.Column("alt_labels", sa.JSON(), nullable=False),
        sa.Column("hidden_labels", sa.JSON(), nullable=False),
        sa.Column("definition", sa.Text(), nullable=True),
        sa.Column("scope_note", sa.Text(), nullable=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("in_scheme", sa.String(length=255), nullable=True),
        sa.Column("broader_concept_uris", sa.JSON(), nullable=False),
        sa.Column("thematic_tags", sa.JSON(), nullable=False),
        sa.Column("source_collections", sa.JSON(), nullable=False),
        sa.PrimaryKeyConstraint("concept_uri"),
    )
    op.create_index(op.f("ix_esco_skills_preferred_label"), "esco_skills", ["preferred_label"], unique=False)
    op.create_index(op.f("ix_esco_skills_reuse_level"), "esco_skills", ["reuse_level"], unique=False)

    op.create_table(
        "esco_skill_hierarchy",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("level_0_uri", sa.String(length=255), nullable=True),
        sa.Column("level_0_preferred_term", sa.String(length=500), nullable=True),
        sa.Column("level_1_uri", sa.String(length=255), nullable=True),
        sa.Column("level_1_preferred_term", sa.String(length=500), nullable=True),
        sa.Column("level_2_uri", sa.String(length=255), nullable=True),
        sa.Column("level_2_preferred_term", sa.String(length=500), nullable=True),
        sa.Column("level_3_uri", sa.String(length=255), nullable=True),
        sa.Column("level_3_preferred_term", sa.String(length=500), nullable=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("scope_note", sa.Text(), nullable=True),
        sa.Column("level_0_code", sa.String(length=80), nullable=True),
        sa.Column("level_1_code", sa.String(length=80), nullable=True),
        sa.Column("level_2_code", sa.String(length=80), nullable=True),
        sa.Column("level_3_code", sa.String(length=80), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    for idx in ["level_0_uri", "level_1_uri", "level_2_uri", "level_3_uri"]:
        op.create_index(f"ix_esco_skill_hierarchy_{idx}", "esco_skill_hierarchy", [idx], unique=False)

    op.create_table(
        "esco_skill_broader_relations",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("concept_type", sa.String(length=80), nullable=True),
        sa.Column("concept_uri", sa.String(length=255), nullable=False),
        sa.Column("concept_label", sa.String(length=500), nullable=True),
        sa.Column("broader_type", sa.String(length=80), nullable=True),
        sa.Column("broader_uri", sa.String(length=255), nullable=False),
        sa.Column("broader_label", sa.String(length=500), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("concept_uri", "broader_uri", name="uq_esco_skill_broader_relation"),
    )
    op.create_index(op.f("ix_esco_skill_broader_relations_concept_uri"), "esco_skill_broader_relations", ["concept_uri"], unique=False)
    op.create_index(op.f("ix_esco_skill_broader_relations_broader_uri"), "esco_skill_broader_relations", ["broader_uri"], unique=False)

    op.create_table(
        "esco_skill_relations",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("original_skill_uri", sa.String(length=255), nullable=False),
        sa.Column("original_skill_type", sa.String(length=80), nullable=True),
        sa.Column("relation_type", sa.String(length=80), nullable=False),
        sa.Column("related_skill_type", sa.String(length=80), nullable=True),
        sa.Column("related_skill_uri", sa.String(length=255), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("original_skill_uri", "relation_type", "related_skill_uri", name="uq_esco_skill_relation"),
    )
    op.create_index(op.f("ix_esco_skill_relations_original_skill_uri"), "esco_skill_relations", ["original_skill_uri"], unique=False)
    op.create_index(op.f("ix_esco_skill_relations_relation_type"), "esco_skill_relations", ["relation_type"], unique=False)
    op.create_index(op.f("ix_esco_skill_relations_related_skill_uri"), "esco_skill_relations", ["related_skill_uri"], unique=False)

    op.create_table(
        "esco_occupations",
        sa.Column("concept_uri", sa.String(length=255), nullable=False),
        sa.Column("concept_type", sa.String(length=80), nullable=True),
        sa.Column("isco_group", sa.String(length=255), nullable=True),
        sa.Column("preferred_label", sa.String(length=500), nullable=True),
        sa.Column("alt_labels", sa.JSON(), nullable=False),
        sa.Column("hidden_labels", sa.JSON(), nullable=False),
        sa.Column("status", sa.String(length=80), nullable=True),
        sa.Column("modified_date", sa.String(length=80), nullable=True),
        sa.Column("regulated_profession_note", sa.Text(), nullable=True),
        sa.Column("scope_note", sa.Text(), nullable=True),
        sa.Column("definition", sa.Text(), nullable=True),
        sa.Column("in_scheme", sa.String(length=255), nullable=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("code", sa.String(length=80), nullable=True),
        sa.Column("nace_code", sa.String(length=80), nullable=True),
        sa.Column("research_occupation", sa.Boolean(), nullable=False),
        sa.Column("green_share", sa.Float(), nullable=True),
        sa.PrimaryKeyConstraint("concept_uri"),
    )
    op.create_index(op.f("ix_esco_occupations_isco_group"), "esco_occupations", ["isco_group"], unique=False)
    op.create_index(op.f("ix_esco_occupations_preferred_label"), "esco_occupations", ["preferred_label"], unique=False)

    op.create_table(
        "esco_occupation_broader_relations",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("concept_type", sa.String(length=80), nullable=True),
        sa.Column("concept_uri", sa.String(length=255), nullable=False),
        sa.Column("concept_label", sa.String(length=500), nullable=True),
        sa.Column("broader_type", sa.String(length=80), nullable=True),
        sa.Column("broader_uri", sa.String(length=255), nullable=False),
        sa.Column("broader_label", sa.String(length=500), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("concept_uri", "broader_uri", name="uq_esco_occ_broader_relation"),
    )
    op.create_index(op.f("ix_esco_occupation_broader_relations_concept_uri"), "esco_occupation_broader_relations", ["concept_uri"], unique=False)
    op.create_index(op.f("ix_esco_occupation_broader_relations_broader_uri"), "esco_occupation_broader_relations", ["broader_uri"], unique=False)

    op.create_table(
        "esco_occupation_skill_relations",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("occupation_uri", sa.String(length=255), nullable=False),
        sa.Column("occupation_label", sa.String(length=500), nullable=True),
        sa.Column("relation_type", sa.String(length=80), nullable=False),
        sa.Column("skill_type", sa.String(length=80), nullable=True),
        sa.Column("skill_uri", sa.String(length=255), nullable=False),
        sa.Column("skill_label", sa.String(length=500), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("occupation_uri", "relation_type", "skill_uri", name="uq_esco_occupation_skill_relation"),
    )
    op.create_index(op.f("ix_esco_occupation_skill_relations_occupation_uri"), "esco_occupation_skill_relations", ["occupation_uri"], unique=False)
    op.create_index(op.f("ix_esco_occupation_skill_relations_relation_type"), "esco_occupation_skill_relations", ["relation_type"], unique=False)
    op.create_index(op.f("ix_esco_occupation_skill_relations_skill_uri"), "esco_occupation_skill_relations", ["skill_uri"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_esco_occupation_skill_relations_skill_uri"), table_name="esco_occupation_skill_relations")
    op.drop_index(op.f("ix_esco_occupation_skill_relations_relation_type"), table_name="esco_occupation_skill_relations")
    op.drop_index(op.f("ix_esco_occupation_skill_relations_occupation_uri"), table_name="esco_occupation_skill_relations")
    op.drop_table("esco_occupation_skill_relations")
    op.drop_index(op.f("ix_esco_occupation_broader_relations_broader_uri"), table_name="esco_occupation_broader_relations")
    op.drop_index(op.f("ix_esco_occupation_broader_relations_concept_uri"), table_name="esco_occupation_broader_relations")
    op.drop_table("esco_occupation_broader_relations")
    op.drop_index(op.f("ix_esco_occupations_preferred_label"), table_name="esco_occupations")
    op.drop_index(op.f("ix_esco_occupations_isco_group"), table_name="esco_occupations")
    op.drop_table("esco_occupations")
    op.drop_index(op.f("ix_esco_skill_relations_related_skill_uri"), table_name="esco_skill_relations")
    op.drop_index(op.f("ix_esco_skill_relations_relation_type"), table_name="esco_skill_relations")
    op.drop_index(op.f("ix_esco_skill_relations_original_skill_uri"), table_name="esco_skill_relations")
    op.drop_table("esco_skill_relations")
    op.drop_index(op.f("ix_esco_skill_broader_relations_broader_uri"), table_name="esco_skill_broader_relations")
    op.drop_index(op.f("ix_esco_skill_broader_relations_concept_uri"), table_name="esco_skill_broader_relations")
    op.drop_table("esco_skill_broader_relations")
    op.drop_index("ix_esco_skill_hierarchy_level_3_uri", table_name="esco_skill_hierarchy")
    op.drop_index("ix_esco_skill_hierarchy_level_2_uri", table_name="esco_skill_hierarchy")
    op.drop_index("ix_esco_skill_hierarchy_level_1_uri", table_name="esco_skill_hierarchy")
    op.drop_index("ix_esco_skill_hierarchy_level_0_uri", table_name="esco_skill_hierarchy")
    op.drop_table("esco_skill_hierarchy")
    op.drop_index(op.f("ix_esco_skills_reuse_level"), table_name="esco_skills")
    op.drop_index(op.f("ix_esco_skills_preferred_label"), table_name="esco_skills")
    op.drop_table("esco_skills")
    op.drop_index(op.f("ix_esco_isco_groups_preferred_label"), table_name="esco_isco_groups")
    op.drop_index(op.f("ix_esco_isco_groups_code"), table_name="esco_isco_groups")
    op.drop_table("esco_isco_groups")
    op.drop_index(op.f("ix_esco_skill_groups_preferred_label"), table_name="esco_skill_groups")
    op.drop_table("esco_skill_groups")
    op.drop_index(op.f("ix_esco_dictionary_entries_filename"), table_name="esco_dictionary_entries")
    op.drop_table("esco_dictionary_entries")
    op.drop_index(op.f("ix_activities_esco_concept_uri"), table_name="activities")
    op.drop_column("activities", "esco_concept_uri")
    op.drop_index(op.f("ix_services_esco_concept_uri"), table_name="services")
    op.drop_column("services", "esco_concept_uri")
    op.drop_index(op.f("ix_subcategories_esco_concept_uri"), table_name="subcategories")
    op.drop_column("subcategories", "esco_concept_uri")
    op.drop_index(op.f("ix_categories_esco_concept_uri"), table_name="categories")
    op.drop_column("categories", "esco_concept_uri")
    op.drop_index(op.f("ix_domains_esco_concept_uri"), table_name="domains")
    op.drop_column("domains", "esco_concept_uri")
