"""price analysis engine v2

Revision ID: g1b2c3d4e5f6
Revises: f7a8b9c0d1e2
Create Date: 2026-03-22 18:10:00.000000
"""

from alembic import op
import sqlalchemy as sa


revision = "g1b2c3d4e5f6"
down_revision = "f7a8b9c0d1e2"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "catalog_activities",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("uniclass_code", sa.String(length=64), nullable=False),
        sa.Column("name_ro", sa.String(length=255), nullable=False),
        sa.Column("name_en", sa.String(length=255), nullable=False),
        sa.Column("uom", sa.String(length=24), nullable=False),
        sa.Column("domain_id", sa.Integer(), nullable=False),
        sa.Column("category_id", sa.Integer(), nullable=False),
        sa.Column("subcategory_id", sa.Integer(), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.ForeignKeyConstraint(["category_id"], ["categories.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["domain_id"], ["domains.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["subcategory_id"], ["subcategories.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("uniclass_code", name="uq_catalog_activities_uniclass_code"),
    )
    op.create_index("ix_catalog_activities_id", "catalog_activities", ["id"], unique=False)
    op.create_index("ix_catalog_activities_uniclass_code", "catalog_activities", ["uniclass_code"], unique=False)
    op.create_index("ix_catalog_activities_name_ro", "catalog_activities", ["name_ro"], unique=False)
    op.create_index("ix_catalog_activities_name_en", "catalog_activities", ["name_en"], unique=False)
    op.create_index(
        "ix_catalog_activities_taxonomy",
        "catalog_activities",
        ["domain_id", "category_id", "subcategory_id"],
        unique=False,
    )

    op.create_table(
        "catalog_resources",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("esco_code", sa.String(length=255), nullable=True),
        sa.Column("name_ro", sa.String(length=255), nullable=False),
        sa.Column("name_en", sa.String(length=255), nullable=False),
        sa.Column("resource_type", sa.String(length=32), nullable=False),
        sa.Column("base_price", sa.Float(), nullable=False, server_default="0"),
        sa.Column("unit", sa.String(length=24), nullable=False),
        sa.Column("technical_specs", sa.JSON(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_catalog_resources_id", "catalog_resources", ["id"], unique=False)
    op.create_index("ix_catalog_resources_esco_code", "catalog_resources", ["esco_code"], unique=False)
    op.create_index("ix_catalog_resources_name_ro", "catalog_resources", ["name_ro"], unique=False)
    op.create_index("ix_catalog_resources_name_en", "catalog_resources", ["name_en"], unique=False)
    op.create_index("ix_catalog_resources_resource_type", "catalog_resources", ["resource_type"], unique=False)
    op.create_index(
        "ix_catalog_resources_type_price",
        "catalog_resources",
        ["resource_type", "base_price"],
        unique=False,
    )

    op.create_table(
        "price_analysis_recipes",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("activity_id", sa.Integer(), nullable=False),
        sa.Column("resource_id", sa.Integer(), nullable=False),
        sa.Column("specific_consumption", sa.Float(), nullable=False, server_default="0"),
        sa.Column("waste_percentage", sa.Float(), nullable=False, server_default="0"),
        sa.Column("coefficient_bronz", sa.Float(), nullable=False, server_default="1"),
        sa.Column("coefficient_argint", sa.Float(), nullable=False, server_default="1.1"),
        sa.Column("coefficient_aur", sa.Float(), nullable=False, server_default="1.2"),
        sa.Column("coefficient_platinum", sa.Float(), nullable=False, server_default="1.35"),
        sa.Column("is_essential", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.ForeignKeyConstraint(["activity_id"], ["catalog_activities.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["resource_id"], ["catalog_resources.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("activity_id", "resource_id", name="uq_price_analysis_recipe_activity_resource"),
    )
    op.create_index("ix_price_analysis_recipes_id", "price_analysis_recipes", ["id"], unique=False)
    op.create_index("ix_price_analysis_recipes_activity_id", "price_analysis_recipes", ["activity_id"], unique=False)
    op.create_index("ix_price_analysis_recipes_resource_id", "price_analysis_recipes", ["resource_id"], unique=False)

    with op.batch_alter_table("price_analyses") as batch_op:
        batch_op.add_column(sa.Column("recipe_level", sa.String(length=16), nullable=True))
        batch_op.add_column(sa.Column("activity_count", sa.Integer(), nullable=False, server_default="0"))
        batch_op.add_column(sa.Column("uses_recipe_engine", sa.Boolean(), nullable=False, server_default=sa.text("false")))

    op.execute(sa.text("UPDATE price_analyses SET recipe_level = COALESCE(recipe_level, 'ARGINT')"))

    with op.batch_alter_table("price_analyses") as batch_op:
        batch_op.alter_column("recipe_level", existing_type=sa.String(length=16), nullable=False)

    with op.batch_alter_table("resources") as batch_op:
        batch_op.add_column(sa.Column("catalog_resource_id", sa.Integer(), nullable=True))
        batch_op.add_column(sa.Column("activity_id", sa.Integer(), nullable=True))
        batch_op.add_column(sa.Column("activity_name", sa.String(length=255), nullable=True))
        batch_op.add_column(sa.Column("esco_code", sa.String(length=255), nullable=True))
        batch_op.add_column(sa.Column("is_essential", sa.Boolean(), nullable=False, server_default=sa.text("true")))
        batch_op.create_index("ix_resources_catalog_resource_id", ["catalog_resource_id"], unique=False)
        batch_op.create_index("ix_resources_activity_id", ["activity_id"], unique=False)


def downgrade() -> None:
    raise NotImplementedError("Downgrade is not supported for price analysis engine v2 migration.")
