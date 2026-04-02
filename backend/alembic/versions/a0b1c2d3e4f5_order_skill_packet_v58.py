"""order skill packet v58

Revision ID: a0b1c2d3e4f5
Revises: z9a0b1c2d3e4
Create Date: 2026-03-30 22:00:00.000000
"""

from alembic import op
import sqlalchemy as sa


revision = "a0b1c2d3e4f5"
down_revision = "z9a0b1c2d3e4"
branch_labels = None
depends_on = None


def _has_column(inspector, table_name: str, column_name: str) -> bool:
    return column_name in {column["name"] for column in inspector.get_columns(table_name)}


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    additions = [
        ("asset_label", sa.Column("asset_label", sa.String(length=150), nullable=True)),
        ("intervention_label", sa.Column("intervention_label", sa.String(length=120), nullable=True)),
        ("task_label", sa.Column("task_label", sa.String(length=255), nullable=True)),
        ("skill_label", sa.Column("skill_label", sa.String(length=150), nullable=True)),
        ("required_people", sa.Column("required_people", sa.Integer(), nullable=True)),
        ("esco_codes", sa.Column("esco_codes", sa.JSON(), nullable=False, server_default="[]")),
        ("nace_codes", sa.Column("nace_codes", sa.JSON(), nullable=False, server_default="[]")),
        ("required_certification_codes", sa.Column("required_certification_codes", sa.JSON(), nullable=False, server_default="[]")),
        ("standard_consumables", sa.Column("standard_consumables", sa.JSON(), nullable=False, server_default="[]")),
    ]
    for column_name, column in additions:
        if not _has_column(inspector, "orders", column_name):
            op.add_column("orders", column)


def downgrade() -> None:
    op.drop_column("orders", "standard_consumables")
    op.drop_column("orders", "required_certification_codes")
    op.drop_column("orders", "nace_codes")
    op.drop_column("orders", "esco_codes")
    op.drop_column("orders", "required_people")
    op.drop_column("orders", "skill_label")
    op.drop_column("orders", "task_label")
    op.drop_column("orders", "intervention_label")
    op.drop_column("orders", "asset_label")
