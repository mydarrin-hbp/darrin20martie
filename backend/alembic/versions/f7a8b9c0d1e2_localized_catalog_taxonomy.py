"""localized catalog taxonomy

Revision ID: f7a8b9c0d1e2
Revises: e6f7a8b9c0d1
Create Date: 2026-03-22 15:10:00.000000
"""

from alembic import op
import sqlalchemy as sa


revision = "f7a8b9c0d1e2"
down_revision = "e6f7a8b9c0d1"
branch_labels = None
depends_on = None


def _empty_json(bind) -> str:
    return "'[]'::json" if bind.dialect.name == "postgresql" else "'[]'"


def _single_json(column_name: str, bind) -> str:
    if bind.dialect.name == "postgresql":
        return f"CASE WHEN {column_name} IS NULL OR {column_name} = '' THEN '[]'::json ELSE json_build_array({column_name}) END"
    return f"CASE WHEN {column_name} IS NULL OR {column_name} = '' THEN '[]' ELSE json_array({column_name}) END"


def _migrate_table(table_name: str, parent_column: str | None = None) -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    columns = {column["name"] for column in inspector.get_columns(table_name)}

    with op.batch_alter_table(table_name) as batch_op:
        if "name_ro" not in columns:
            batch_op.add_column(sa.Column("name_ro", sa.String(length=150), nullable=True))
        if "name_en" not in columns:
            batch_op.add_column(sa.Column("name_en", sa.String(length=150), nullable=True))
        if "caen_codes" not in columns:
            batch_op.add_column(sa.Column("caen_codes", sa.JSON(), nullable=True))
        if "uniclass_codes" not in columns:
            batch_op.add_column(sa.Column("uniclass_codes", sa.JSON(), nullable=True))
        if "esco_codes" not in columns:
            batch_op.add_column(sa.Column("esco_codes", sa.JSON(), nullable=True))

    if "name" in columns:
        op.execute(sa.text(f"UPDATE {table_name} SET name_ro = COALESCE(name_ro, name), name_en = COALESCE(name_en, name)"))
    op.execute(sa.text(f"UPDATE {table_name} SET caen_codes = COALESCE(caen_codes, {_empty_json(bind)})"))
    op.execute(sa.text(f"UPDATE {table_name} SET uniclass_codes = COALESCE(uniclass_codes, {_empty_json(bind)})"))
    if "esco_concept_uri" in columns:
        op.execute(sa.text(f"UPDATE {table_name} SET esco_codes = COALESCE(esco_codes, {_single_json('esco_concept_uri', bind)})"))
    else:
        op.execute(sa.text(f"UPDATE {table_name} SET esco_codes = COALESCE(esco_codes, {_empty_json(bind)})"))

    with op.batch_alter_table(table_name) as batch_op:
        batch_op.alter_column("name_ro", existing_type=sa.String(length=150), nullable=False)
        batch_op.alter_column("name_en", existing_type=sa.String(length=150), nullable=False)
        batch_op.alter_column("caen_codes", existing_type=sa.JSON(), nullable=False)
        batch_op.alter_column("uniclass_codes", existing_type=sa.JSON(), nullable=False)
        batch_op.alter_column("esco_codes", existing_type=sa.JSON(), nullable=False)

        indexes = {index["name"] for index in inspector.get_indexes(table_name)}
        if "ix_domains_name" in indexes:
            batch_op.drop_index("ix_domains_name")
        if "ix_categories_name" in indexes:
            batch_op.drop_index("ix_categories_name")
        if "ix_subcategories_name" in indexes:
            batch_op.drop_index("ix_subcategories_name")
        if "ix_domains_esco_concept_uri" in indexes:
            batch_op.drop_index("ix_domains_esco_concept_uri")
        if "ix_categories_esco_concept_uri" in indexes:
            batch_op.drop_index("ix_categories_esco_concept_uri")
        if "ix_subcategories_esco_concept_uri" in indexes:
            batch_op.drop_index("ix_subcategories_esco_concept_uri")

        if "name" in columns:
            batch_op.drop_column("name")
        if "esco_concept_uri" in columns:
            batch_op.drop_column("esco_concept_uri")

        batch_op.create_index(f"ix_{table_name}_name_ro", ["name_ro"], unique=False)
        batch_op.create_index(f"ix_{table_name}_name_en", ["name_en"], unique=False)


def upgrade() -> None:
    _migrate_table("domains")
    _migrate_table("categories", parent_column="domain_id")
    _migrate_table("subcategories", parent_column="category_id")


def downgrade() -> None:
    raise NotImplementedError("Downgrade is not supported for localized catalog taxonomy migration.")
