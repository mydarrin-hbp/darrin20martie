"""supplier resource availability and indicator metadata

Revision ID: n7o8p9q0r1s2
Revises: m1n2o3p4q5r6
Create Date: 2026-03-28 18:55:00.000000
"""

from alembic import op
import sqlalchemy as sa


revision = "n7o8p9q0r1s2"
down_revision = "m1n2o3p4q5r6"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "suppliers",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("rating", sa.Float(), nullable=False, server_default="0"),
        sa.Column("location_geo", sa.JSON(), nullable=False, server_default=sa.text("'{}'::json")),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_suppliers_id"), "suppliers", ["id"], unique=False)
    op.create_index("ix_suppliers_name_active", "suppliers", ["name", "is_active"], unique=False)

    op.add_column("catalog_resources", sa.Column("supplier_id", sa.Integer(), nullable=True))
    op.add_column("catalog_resources", sa.Column("lead_time_days", sa.Integer(), nullable=True))
    op.add_column("catalog_resources", sa.Column("stock_qty", sa.Float(), nullable=True))
    op.add_column("catalog_resources", sa.Column("availability_status", sa.String(length=32), nullable=False, server_default="IN_STOCK"))
    op.create_index(op.f("ix_catalog_resources_supplier_id"), "catalog_resources", ["supplier_id"], unique=False)
    op.create_index(
        "ix_catalog_resources_supplier_availability",
        "catalog_resources",
        ["supplier_id", "availability_status", "stock_qty"],
        unique=False,
    )
    op.create_foreign_key(
        "fk_catalog_resources_supplier_id",
        "catalog_resources",
        "suppliers",
        ["supplier_id"],
        ["id"],
        ondelete="SET NULL",
    )

    op.add_column("price_analysis_recipes", sa.Column("productivity_norm", sa.Float(), nullable=True))
    op.add_column("price_analysis_recipes", sa.Column("indicator_code", sa.String(length=64), nullable=True))
    op.create_index(op.f("ix_price_analysis_recipes_indicator_code"), "price_analysis_recipes", ["indicator_code"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_price_analysis_recipes_indicator_code"), table_name="price_analysis_recipes")
    op.drop_column("price_analysis_recipes", "indicator_code")
    op.drop_column("price_analysis_recipes", "productivity_norm")

    op.drop_constraint("fk_catalog_resources_supplier_id", "catalog_resources", type_="foreignkey")
    op.drop_index("ix_catalog_resources_supplier_availability", table_name="catalog_resources")
    op.drop_index(op.f("ix_catalog_resources_supplier_id"), table_name="catalog_resources")
    op.drop_column("catalog_resources", "availability_status")
    op.drop_column("catalog_resources", "stock_qty")
    op.drop_column("catalog_resources", "lead_time_days")
    op.drop_column("catalog_resources", "supplier_id")

    op.drop_index("ix_suppliers_name_active", table_name="suppliers")
    op.drop_index(op.f("ix_suppliers_id"), table_name="suppliers")
    op.drop_table("suppliers")
