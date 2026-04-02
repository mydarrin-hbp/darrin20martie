"""financial margin matrix v57

Revision ID: y8z9a0b1c2d3
Revises: x7y8z9a0b1c2
Create Date: 2026-03-30 18:50:00.000000
"""

from alembic import op
import sqlalchemy as sa


revision = "y8z9a0b1c2d3"
down_revision = "x7y8z9a0b1c2"
branch_labels = None
depends_on = None


def _has_column(inspector, table_name: str, column_name: str) -> bool:
    return column_name in {column["name"] for column in inspector.get_columns(table_name)}


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if not _has_column(inspector, "financial_configs", "labor_margin_percentage"):
        op.add_column("financial_configs", sa.Column("labor_margin_percentage", sa.Float(), nullable=False, server_default="0.15"))
    if not _has_column(inspector, "financial_configs", "material_margin_percentage"):
        op.add_column("financial_configs", sa.Column("material_margin_percentage", sa.Float(), nullable=False, server_default="0.10"))
    if not _has_column(inspector, "financial_configs", "rental_margin_percentage"):
        op.add_column("financial_configs", sa.Column("rental_margin_percentage", sa.Float(), nullable=False, server_default="0.15"))


def downgrade() -> None:
    op.drop_column("financial_configs", "rental_margin_percentage")
    op.drop_column("financial_configs", "material_margin_percentage")
    op.drop_column("financial_configs", "labor_margin_percentage")
