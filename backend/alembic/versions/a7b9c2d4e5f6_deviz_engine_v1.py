"""deviz engine v1

Revision ID: a7b9c2d4e5f6
Revises: f4c6d8a1b2e3
Create Date: 2026-03-21 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa


revision = "a7b9c2d4e5f6"
down_revision = "f4c6d8a1b2e3"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    tables = set(inspector.get_table_names())

    if "admin_deviz_rules" not in tables:
        op.create_table(
        "admin_deviz_rules",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("service_id", sa.Integer(), nullable=True),
        sa.Column("country_id", sa.Integer(), nullable=True),
        sa.Column("level_name", sa.String(length=16), nullable=False),
        sa.Column("label", sa.String(length=40), nullable=False),
        sa.Column("multiplier", sa.Float(), nullable=False),
        sa.Column("description", sa.String(length=255), nullable=True),
        sa.Column("sort_order", sa.Integer(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["country_id"], ["countries.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["service_id"], ["services.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("service_id", "country_id", "level_name", name="uq_admin_deviz_rule_context"),
    )
        op.create_index(op.f("ix_admin_deviz_rules_country_id"), "admin_deviz_rules", ["country_id"], unique=False)
        op.create_index(op.f("ix_admin_deviz_rules_level_name"), "admin_deviz_rules", ["level_name"], unique=False)
        op.create_index(op.f("ix_admin_deviz_rules_service_id"), "admin_deviz_rules", ["service_id"], unique=False)

    if "deviz_drafts" not in tables:
        op.create_table(
        "deviz_drafts",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("service_id", sa.Integer(), nullable=False),
        sa.Column("country_id", sa.Integer(), nullable=False),
        sa.Column("zone_id", sa.Integer(), nullable=False),
        sa.Column("currency", sa.String(length=3), nullable=False),
        sa.Column("legislation_code", sa.String(length=32), nullable=False),
        sa.Column("urgency", sa.Boolean(), nullable=False),
        sa.Column("source_message", sa.String(length=500), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["country_id"], ["countries.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["service_id"], ["services.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["zone_id"], ["zones.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
        op.create_index(op.f("ix_deviz_drafts_country_id"), "deviz_drafts", ["country_id"], unique=False)
        op.create_index(op.f("ix_deviz_drafts_service_id"), "deviz_drafts", ["service_id"], unique=False)
        op.create_index(op.f("ix_deviz_drafts_zone_id"), "deviz_drafts", ["zone_id"], unique=False)

    if "deviz_levels" not in tables:
        op.create_table(
        "deviz_levels",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("draft_id", sa.Integer(), nullable=False),
        sa.Column("level_name", sa.String(length=16), nullable=False),
        sa.Column("label", sa.String(length=40), nullable=False),
        sa.Column("description", sa.String(length=255), nullable=True),
        sa.Column("multiplier", sa.Float(), nullable=False),
        sa.Column("net_total", sa.Float(), nullable=False),
        sa.Column("vat_value", sa.Float(), nullable=False),
        sa.Column("gross_total", sa.Float(), nullable=False),
        sa.Column("recommended", sa.Boolean(), nullable=False),
        sa.Column("sort_order", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["draft_id"], ["deviz_drafts.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
        op.create_index(op.f("ix_deviz_levels_draft_id"), "deviz_levels", ["draft_id"], unique=False)

    if "deviz_calculations" not in tables:
        op.create_table(
        "deviz_calculations",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("draft_id", sa.Integer(), nullable=False),
        sa.Column("cost_calculation_id", sa.Integer(), nullable=False),
        sa.Column("recommended_level_name", sa.String(length=16), nullable=False),
        sa.Column("base_net_total", sa.Float(), nullable=False),
        sa.Column("base_vat_value", sa.Float(), nullable=False),
        sa.Column("base_gross_total", sa.Float(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["cost_calculation_id"], ["cost_calculations.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["draft_id"], ["deviz_drafts.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
        op.create_index(op.f("ix_deviz_calculations_cost_calculation_id"), "deviz_calculations", ["cost_calculation_id"], unique=False)
        op.create_index(op.f("ix_deviz_calculations_draft_id"), "deviz_calculations", ["draft_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_deviz_calculations_draft_id"), table_name="deviz_calculations")
    op.drop_index(op.f("ix_deviz_calculations_cost_calculation_id"), table_name="deviz_calculations")
    op.drop_table("deviz_calculations")
    op.drop_index(op.f("ix_deviz_levels_draft_id"), table_name="deviz_levels")
    op.drop_table("deviz_levels")
    op.drop_index(op.f("ix_deviz_drafts_zone_id"), table_name="deviz_drafts")
    op.drop_index(op.f("ix_deviz_drafts_service_id"), table_name="deviz_drafts")
    op.drop_index(op.f("ix_deviz_drafts_country_id"), table_name="deviz_drafts")
    op.drop_table("deviz_drafts")
    op.drop_index(op.f("ix_admin_deviz_rules_service_id"), table_name="admin_deviz_rules")
    op.drop_index(op.f("ix_admin_deviz_rules_level_name"), table_name="admin_deviz_rules")
    op.drop_index(op.f("ix_admin_deviz_rules_country_id"), table_name="admin_deviz_rules")
    op.drop_table("admin_deviz_rules")
