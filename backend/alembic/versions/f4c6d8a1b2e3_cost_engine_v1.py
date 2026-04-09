"""cost engine v1

Revision ID: f4c6d8a1b2e3
Revises: e1a2f8c9b7d1
Create Date: 2026-03-21 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa


revision = "f4c6d8a1b2e3"
down_revision = "e1a2f8c9b7d1"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    tables = set(inspector.get_table_names())

    if "admin_price_configs" not in tables:
        op.create_table(
            "admin_price_configs",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("service_id", sa.Integer(), nullable=False),
            sa.Column("country_id", sa.Integer(), nullable=False),
            sa.Column("zone_id", sa.Integer(), nullable=True),
            sa.Column("currency", sa.String(length=3), nullable=False),
            sa.Column("legislation_code", sa.String(length=32), nullable=False),
            sa.Column("base_price", sa.Float(), nullable=False),
            sa.Column("legislation_coefficient", sa.Float(), nullable=False),
            sa.Column("zone_coefficient_override", sa.Float(), nullable=True),
            sa.Column("urgency_coefficient", sa.Float(), nullable=False),
            sa.Column("basic_level_coefficient", sa.Float(), nullable=False),
            sa.Column("standard_level_coefficient", sa.Float(), nullable=False),
            sa.Column("premium_level_coefficient", sa.Float(), nullable=False),
            sa.Column("platform_margin_coefficient", sa.Float(), nullable=False),
            sa.Column("vat_coefficient", sa.Float(), nullable=False),
            sa.Column("is_active", sa.Boolean(), nullable=False),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
            sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
            sa.ForeignKeyConstraint(["country_id"], ["countries.id"], ondelete="CASCADE"),
            sa.ForeignKeyConstraint(["service_id"], ["services.id"], ondelete="CASCADE"),
            sa.ForeignKeyConstraint(["zone_id"], ["zones.id"], ondelete="CASCADE"),
            sa.PrimaryKeyConstraint("id"),
            sa.UniqueConstraint(
                "service_id",
                "country_id",
                "zone_id",
                "currency",
                "legislation_code",
                name="uq_admin_price_config_context",
            ),
        )
        op.create_index(op.f("ix_admin_price_configs_country_id"), "admin_price_configs", ["country_id"], unique=False)
        op.create_index(op.f("ix_admin_price_configs_currency"), "admin_price_configs", ["currency"], unique=False)
        op.create_index(op.f("ix_admin_price_configs_legislation_code"), "admin_price_configs", ["legislation_code"], unique=False)
        op.create_index(op.f("ix_admin_price_configs_service_id"), "admin_price_configs", ["service_id"], unique=False)
        op.create_index(op.f("ix_admin_price_configs_zone_id"), "admin_price_configs", ["zone_id"], unique=False)

    if "price_analyses" not in tables:
        op.create_table(
            "price_analyses",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("service_id", sa.Integer(), nullable=False),
            sa.Column("admin_price_config_id", sa.Integer(), nullable=False),
            sa.Column("country_id", sa.Integer(), nullable=False),
            sa.Column("zone_id", sa.Integer(), nullable=False),
            sa.Column("currency", sa.String(length=3), nullable=False),
            sa.Column("legislation_code", sa.String(length=32), nullable=False),
            sa.Column("service_level", sa.String(length=16), nullable=False),
            sa.Column("urgency", sa.Boolean(), nullable=False),
            sa.Column("subcategory_count", sa.Integer(), nullable=False),
            sa.Column("resource_subtotal", sa.Float(), nullable=False),
            sa.Column("base_price", sa.Float(), nullable=False),
            sa.Column("zone_coefficient", sa.Float(), nullable=False),
            sa.Column("urgency_coefficient", sa.Float(), nullable=False),
            sa.Column("service_level_coefficient", sa.Float(), nullable=False),
            sa.Column("legislation_coefficient", sa.Float(), nullable=False),
            sa.Column("platform_margin_coefficient", sa.Float(), nullable=False),
            sa.Column("vat_coefficient", sa.Float(), nullable=False),
            sa.Column("adjusted_subtotal", sa.Float(), nullable=False),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
            sa.ForeignKeyConstraint(["admin_price_config_id"], ["admin_price_configs.id"], ondelete="CASCADE"),
            sa.ForeignKeyConstraint(["country_id"], ["countries.id"], ondelete="CASCADE"),
            sa.ForeignKeyConstraint(["service_id"], ["services.id"], ondelete="CASCADE"),
            sa.ForeignKeyConstraint(["zone_id"], ["zones.id"], ondelete="CASCADE"),
            sa.PrimaryKeyConstraint("id"),
        )
        op.create_index(op.f("ix_price_analyses_admin_price_config_id"), "price_analyses", ["admin_price_config_id"], unique=False)
        op.create_index(op.f("ix_price_analyses_country_id"), "price_analyses", ["country_id"], unique=False)
        op.create_index(op.f("ix_price_analyses_service_id"), "price_analyses", ["service_id"], unique=False)
        op.create_index(op.f("ix_price_analyses_zone_id"), "price_analyses", ["zone_id"], unique=False)

    if "cost_calculations" not in tables:
        op.create_table(
            "cost_calculations",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("price_analysis_id", sa.Integer(), nullable=False),
            sa.Column("service_id", sa.Integer(), nullable=False),
            sa.Column("net_total", sa.Float(), nullable=False),
            sa.Column("platform_margin_value", sa.Float(), nullable=False),
            sa.Column("vat_value", sa.Float(), nullable=False),
            sa.Column("gross_total", sa.Float(), nullable=False),
            sa.Column("currency", sa.String(length=3), nullable=False),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
            sa.ForeignKeyConstraint(["price_analysis_id"], ["price_analyses.id"], ondelete="CASCADE"),
            sa.ForeignKeyConstraint(["service_id"], ["services.id"], ondelete="CASCADE"),
            sa.PrimaryKeyConstraint("id"),
        )
        op.create_index(op.f("ix_cost_calculations_price_analysis_id"), "cost_calculations", ["price_analysis_id"], unique=False)
        op.create_index(op.f("ix_cost_calculations_service_id"), "cost_calculations", ["service_id"], unique=False)

    if "resources" not in tables:
        op.create_table(
            "resources",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("cost_calculation_id", sa.Integer(), nullable=False),
            sa.Column("resource_type", sa.String(length=32), nullable=False),
            sa.Column("name", sa.String(length=120), nullable=False),
            sa.Column("unit", sa.String(length=24), nullable=False),
            sa.Column("quantity", sa.Float(), nullable=False),
            sa.Column("unit_cost", sa.Float(), nullable=False),
            sa.Column("total_cost", sa.Float(), nullable=False),
            sa.ForeignKeyConstraint(["cost_calculation_id"], ["cost_calculations.id"], ondelete="CASCADE"),
            sa.PrimaryKeyConstraint("id"),
        )
        op.create_index(op.f("ix_resources_cost_calculation_id"), "resources", ["cost_calculation_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_resources_cost_calculation_id"), table_name="resources")
    op.drop_table("resources")
    op.drop_index(op.f("ix_cost_calculations_service_id"), table_name="cost_calculations")
    op.drop_index(op.f("ix_cost_calculations_price_analysis_id"), table_name="cost_calculations")
    op.drop_table("cost_calculations")
    op.drop_index(op.f("ix_price_analyses_zone_id"), table_name="price_analyses")
    op.drop_index(op.f("ix_price_analyses_service_id"), table_name="price_analyses")
    op.drop_index(op.f("ix_price_analyses_country_id"), table_name="price_analyses")
    op.drop_index(op.f("ix_price_analyses_admin_price_config_id"), table_name="price_analyses")
    op.drop_table("price_analyses")
    op.drop_index(op.f("ix_admin_price_configs_zone_id"), table_name="admin_price_configs")
    op.drop_index(op.f("ix_admin_price_configs_service_id"), table_name="admin_price_configs")
    op.drop_index(op.f("ix_admin_price_configs_legislation_code"), table_name="admin_price_configs")
    op.drop_index(op.f("ix_admin_price_configs_currency"), table_name="admin_price_configs")
    op.drop_index(op.f("ix_admin_price_configs_country_id"), table_name="admin_price_configs")
    op.drop_table("admin_price_configs")
