"""add labor rates matrix

Revision ID: v5w6x7y8z9a0
Revises: u4v5w6x7y8z9
Create Date: 2026-03-29 19:30:00.000000
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "v5w6x7y8z9a0"
down_revision = "u4v5w6x7y8z9"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "labor_rates",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("country_id", sa.Integer(), nullable=True),
        sa.Column("zone_id", sa.Integer(), nullable=True),
        sa.Column("locality_id", sa.Integer(), nullable=True),
        sa.Column("skill_code", sa.String(length=120), nullable=False),
        sa.Column("skill_label", sa.String(length=255), nullable=False),
        sa.Column("currency", sa.String(length=3), nullable=False, server_default="RON"),
        sa.Column("base_rate", sa.Float(), nullable=False, server_default="0"),
        sa.Column("weekend_multiplier", sa.Float(), nullable=False, server_default="1"),
        sa.Column("holiday_multiplier", sa.Float(), nullable=False, server_default="1"),
        sa.Column("night_multiplier", sa.Float(), nullable=False, server_default="1"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["country_id"], ["countries.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["zone_id"], ["zones.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["locality_id"], ["localities.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("country_id", "zone_id", "locality_id", "skill_code", name="uq_labor_rate_scope"),
    )
    op.create_index(op.f("ix_labor_rates_country_id"), "labor_rates", ["country_id"], unique=False)
    op.create_index(op.f("ix_labor_rates_zone_id"), "labor_rates", ["zone_id"], unique=False)
    op.create_index(op.f("ix_labor_rates_locality_id"), "labor_rates", ["locality_id"], unique=False)
    op.create_index(op.f("ix_labor_rates_skill_code"), "labor_rates", ["skill_code"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_labor_rates_skill_code"), table_name="labor_rates")
    op.drop_index(op.f("ix_labor_rates_locality_id"), table_name="labor_rates")
    op.drop_index(op.f("ix_labor_rates_zone_id"), table_name="labor_rates")
    op.drop_index(op.f("ix_labor_rates_country_id"), table_name="labor_rates")
    op.drop_table("labor_rates")
