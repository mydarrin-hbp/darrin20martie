"""minimum order thresholds for admin price configs

Revision ID: p8q9r0s1t2u3
Revises: n7o8p9q0r1s2
Create Date: 2026-03-28 20:10:00.000000
"""

from alembic import op
import sqlalchemy as sa


revision = "p8q9r0s1t2u3"
down_revision = "n7o8p9q0r1s2"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "admin_price_configs",
        sa.Column("minimum_order_value", sa.Float(), nullable=False, server_default="0"),
    )
    op.add_column(
        "admin_price_configs",
        sa.Column("minimum_quantity_threshold", sa.Float(), nullable=False, server_default="0"),
    )


def downgrade() -> None:
    op.drop_column("admin_price_configs", "minimum_quantity_threshold")
    op.drop_column("admin_price_configs", "minimum_order_value")
