"""create tax rules table

Revision ID: r1s2t3u4v5w6
Revises: p8q9r0s1t2u3
Create Date: 2026-03-28 18:10:00.000000
"""

from alembic import op
import sqlalchemy as sa


revision = "r1s2t3u4v5w6"
down_revision = "p8q9r0s1t2u3"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "tax_rules",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("country_code", sa.String(length=3), nullable=False),
        sa.Column("locality_slug", sa.String(length=150), nullable=True),
        sa.Column("service_type", sa.String(length=64), nullable=False),
        sa.Column("vat_percentage", sa.Float(), nullable=False, server_default="0.19"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("country_code", "locality_slug", "service_type", name="uq_tax_rules_scope"),
    )
    op.create_index("ix_tax_rules_country_code", "tax_rules", ["country_code"], unique=False)
    op.create_index("ix_tax_rules_locality_slug", "tax_rules", ["locality_slug"], unique=False)
    op.create_index("ix_tax_rules_service_type", "tax_rules", ["service_type"], unique=False)
    op.create_index(
        "ix_tax_rules_lookup",
        "tax_rules",
        ["country_code", "locality_slug", "service_type", "is_active"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index("ix_tax_rules_lookup", table_name="tax_rules")
    op.drop_index("ix_tax_rules_service_type", table_name="tax_rules")
    op.drop_index("ix_tax_rules_locality_slug", table_name="tax_rules")
    op.drop_index("ix_tax_rules_country_code", table_name="tax_rules")
    op.drop_table("tax_rules")
