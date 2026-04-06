"""marketplace commissions

Revision ID: b0c1d2e3f4g5
Revises: aa1b2c3d4e5f
Create Date: 2026-04-03 20:30:00
"""

from alembic import op
import sqlalchemy as sa


revision = "b0c1d2e3f4g5"
down_revision = "aa1b2c3d4e5f"
depends_on = None


def upgrade():
    op.create_table(
        "marketplace_commissions",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("category", sa.String(length=32), nullable=False, unique=True),
        sa.Column("min_percentage", sa.Float(), nullable=False, server_default="0"),
        sa.Column("max_percentage", sa.Float(), nullable=False, server_default="0"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("1")),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP")),
    )
    op.create_index("ix_marketplace_commissions_category", "marketplace_commissions", ["category"])
    op.execute(
        "INSERT INTO marketplace_commissions (category, min_percentage, max_percentage, is_active) VALUES "
        "('MATERIAL', 7, 15, 1),"
        "('RENTAL', 10, 15, 1),"
        "('LABOR', 10, 15, 1)"
    )


def downgrade():
    op.drop_index("ix_marketplace_commissions_category", table_name="marketplace_commissions")
    op.drop_table("marketplace_commissions")
