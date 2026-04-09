"""resource price configs

Revision ID: i3d4e5f6g7h8
Revises: h2c3d4e5f6g7
Create Date: 2026-03-22 20:30:00.000000
"""

from alembic import op
import sqlalchemy as sa


revision = "i3d4e5f6g7h8"
down_revision = "h2c3d4e5f6g7"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "admin_resource_price_configs",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("resource_id", sa.Integer(), nullable=False),
        sa.Column("country_id", sa.Integer(), nullable=False),
        sa.Column("zone_id", sa.Integer(), nullable=True),
        sa.Column("currency", sa.String(length=3), nullable=False),
        sa.Column("base_price", sa.Float(), nullable=False, server_default="0"),
        sa.Column("zone_multiplier", sa.Float(), nullable=False, server_default="1"),
        sa.Column("legislation_code", sa.String(length=32), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.ForeignKeyConstraint(["country_id"], ["countries.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["resource_id"], ["catalog_resources.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["zone_id"], ["zones.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "resource_id",
            "country_id",
            "zone_id",
            "currency",
            "legislation_code",
            name="uq_admin_resource_price_config_context",
        ),
    )
    op.create_index("ix_admin_resource_price_configs_id", "admin_resource_price_configs", ["id"], unique=False)
    op.create_index("ix_admin_resource_price_configs_resource_id", "admin_resource_price_configs", ["resource_id"], unique=False)
    op.create_index("ix_admin_resource_price_configs_country_id", "admin_resource_price_configs", ["country_id"], unique=False)
    op.create_index("ix_admin_resource_price_configs_zone_id", "admin_resource_price_configs", ["zone_id"], unique=False)
    op.create_index("ix_admin_resource_price_configs_currency", "admin_resource_price_configs", ["currency"], unique=False)
    op.create_index("ix_admin_resource_price_configs_legislation_code", "admin_resource_price_configs", ["legislation_code"], unique=False)
    op.create_index(
        "ix_admin_resource_price_configs_context",
        "admin_resource_price_configs",
        ["resource_id", "country_id", "zone_id"],
        unique=False,
    )


def downgrade() -> None:
    raise NotImplementedError("Downgrade is not supported for resource price configs.")
