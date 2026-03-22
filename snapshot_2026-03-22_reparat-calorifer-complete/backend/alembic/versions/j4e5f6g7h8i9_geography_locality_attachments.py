"""advanced geography, localities, and attachments

Revision ID: j4e5f6g7h8i9
Revises: i3d4e5f6g7h8
Create Date: 2026-03-22 18:30:00.000000
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "j4e5f6g7h8i9"
down_revision = "i3d4e5f6g7h8"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("countries", sa.Column("name_ro", sa.String(length=100), nullable=True))
    op.add_column("countries", sa.Column("name_en", sa.String(length=100), nullable=True))
    op.add_column("countries", sa.Column("slug", sa.String(length=120), nullable=True))
    op.add_column("countries", sa.Column("is_active", sa.Boolean(), nullable=True, server_default=sa.true()))
    op.execute("UPDATE countries SET name_ro = COALESCE(name_ro, name), name_en = COALESCE(name_en, name), slug = COALESCE(slug, lower(replace(name, ' ', '-'))), is_active = COALESCE(is_active, true)")
    op.alter_column("countries", "name_ro", nullable=False)
    op.alter_column("countries", "name_en", nullable=False)
    op.alter_column("countries", "slug", nullable=False)
    op.alter_column("countries", "is_active", nullable=False)
    op.create_index("ix_countries_slug", "countries", ["slug"], unique=True)

    op.add_column("zones", sa.Column("name_ro", sa.String(length=100), nullable=True))
    op.add_column("zones", sa.Column("name_en", sa.String(length=100), nullable=True))
    op.add_column("zones", sa.Column("slug", sa.String(length=120), nullable=True))
    op.add_column("zones", sa.Column("is_active", sa.Boolean(), nullable=True, server_default=sa.true()))
    op.execute("UPDATE zones SET name_ro = COALESCE(name_ro, name), name_en = COALESCE(name_en, name), slug = COALESCE(slug, lower(replace(name, ' ', '-'))), is_active = COALESCE(is_active, true)")
    op.alter_column("zones", "name_ro", nullable=False)
    op.alter_column("zones", "name_en", nullable=False)
    op.alter_column("zones", "slug", nullable=False)
    op.alter_column("zones", "is_active", nullable=False)
    op.create_index("ix_zones_slug", "zones", ["slug"], unique=False)
    op.create_unique_constraint("uq_zones_country_slug", "zones", ["country_id", "slug"])

    op.create_table(
        "localities",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("country_id", sa.Integer(), nullable=False),
        sa.Column("zone_id", sa.Integer(), nullable=False),
        sa.Column("name_ro", sa.String(length=120), nullable=False),
        sa.Column("name_en", sa.String(length=120), nullable=False),
        sa.Column("slug", sa.String(length=150), nullable=False),
        sa.Column("latitude", sa.Float(), nullable=True),
        sa.Column("longitude", sa.Float(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.ForeignKeyConstraint(["country_id"], ["countries.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["zone_id"], ["zones.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("country_id", "zone_id", "slug", name="uq_localities_geo_slug"),
    )
    op.create_index("ix_localities_country_id", "localities", ["country_id"], unique=False)
    op.create_index("ix_localities_zone_id", "localities", ["zone_id"], unique=False)
    op.create_index("ix_localities_slug", "localities", ["slug"], unique=False)

    op.add_column("admin_resource_price_configs", sa.Column("locality_id", sa.Integer(), nullable=True))
    op.create_foreign_key(
        "fk_admin_resource_price_configs_locality_id",
        "admin_resource_price_configs",
        "localities",
        ["locality_id"],
        ["id"],
        ondelete="CASCADE",
    )
    op.create_index("ix_admin_resource_price_configs_locality_id", "admin_resource_price_configs", ["locality_id"], unique=False)
    op.drop_constraint("uq_admin_resource_price_config_context", "admin_resource_price_configs", type_="unique")
    op.drop_index("ix_admin_resource_price_configs_context", table_name="admin_resource_price_configs")
    op.create_unique_constraint(
        "uq_admin_resource_price_config_context",
        "admin_resource_price_configs",
        ["resource_id", "country_id", "zone_id", "locality_id", "currency", "legislation_code"],
    )
    op.create_index(
        "ix_admin_resource_price_configs_context",
        "admin_resource_price_configs",
        ["resource_id", "country_id", "zone_id", "locality_id"],
        unique=False,
    )

    op.add_column("catalog_activities", sa.Column("description_extended", sa.Text(), nullable=True))
    op.add_column("catalog_activities", sa.Column("images", sa.JSON(), nullable=False, server_default=sa.text("'[]'")))
    op.add_column("catalog_activities", sa.Column("documents", sa.JSON(), nullable=False, server_default=sa.text("'[]'")))
    op.add_column("catalog_activities", sa.Column("videos", sa.JSON(), nullable=False, server_default=sa.text("'[]'")))
    op.add_column("catalog_activities", sa.Column("level_attachments", sa.JSON(), nullable=False, server_default=sa.text("'{}'")))

    op.add_column("services", sa.Column("description_extended", sa.Text(), nullable=True))
    op.add_column("services", sa.Column("images", sa.JSON(), nullable=False, server_default=sa.text("'[]'")))
    op.add_column("services", sa.Column("documents", sa.JSON(), nullable=False, server_default=sa.text("'[]'")))
    op.add_column("services", sa.Column("videos", sa.JSON(), nullable=False, server_default=sa.text("'[]'")))
    op.add_column("services", sa.Column("level_attachments", sa.JSON(), nullable=False, server_default=sa.text("'{}'")))

    op.create_table(
        "entity_attachments",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("entity_type", sa.String(length=32), nullable=False),
        sa.Column("entity_id", sa.Integer(), nullable=False),
        sa.Column("attachment_type", sa.String(length=16), nullable=False),
        sa.Column("level_name", sa.String(length=16), nullable=True),
        sa.Column("file_name", sa.String(length=255), nullable=False),
        sa.Column("mime_type", sa.String(length=255), nullable=False),
        sa.Column("storage_key", sa.String(length=512), nullable=False),
        sa.Column("secure_url", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("storage_key"),
    )
    op.create_index("ix_entity_attachments_entity", "entity_attachments", ["entity_type", "entity_id"], unique=False)
    op.create_index("ix_entity_attachments_entity_type", "entity_attachments", ["entity_type"], unique=False)
    op.create_index("ix_entity_attachments_attachment_type", "entity_attachments", ["attachment_type"], unique=False)
    op.create_index("ix_entity_attachments_level_name", "entity_attachments", ["level_name"], unique=False)

    op.add_column("price_analyses", sa.Column("locality_id", sa.Integer(), nullable=True))
    op.create_foreign_key("fk_price_analyses_locality_id", "price_analyses", "localities", ["locality_id"], ["id"], ondelete="SET NULL")
    op.create_index("ix_price_analyses_locality_id", "price_analyses", ["locality_id"], unique=False)

    op.add_column("deviz_drafts", sa.Column("locality_id", sa.Integer(), nullable=True))
    op.create_foreign_key("fk_deviz_drafts_locality_id", "deviz_drafts", "localities", ["locality_id"], ["id"], ondelete="SET NULL")
    op.create_index("ix_deviz_drafts_locality_id", "deviz_drafts", ["locality_id"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_deviz_drafts_locality_id", table_name="deviz_drafts")
    op.drop_constraint("fk_deviz_drafts_locality_id", "deviz_drafts", type_="foreignkey")
    op.drop_column("deviz_drafts", "locality_id")

    op.drop_index("ix_price_analyses_locality_id", table_name="price_analyses")
    op.drop_constraint("fk_price_analyses_locality_id", "price_analyses", type_="foreignkey")
    op.drop_column("price_analyses", "locality_id")

    op.drop_index("ix_entity_attachments_level_name", table_name="entity_attachments")
    op.drop_index("ix_entity_attachments_attachment_type", table_name="entity_attachments")
    op.drop_index("ix_entity_attachments_entity_type", table_name="entity_attachments")
    op.drop_index("ix_entity_attachments_entity", table_name="entity_attachments")
    op.drop_table("entity_attachments")

    op.drop_column("services", "level_attachments")
    op.drop_column("services", "videos")
    op.drop_column("services", "documents")
    op.drop_column("services", "images")
    op.drop_column("services", "description_extended")

    op.drop_column("catalog_activities", "level_attachments")
    op.drop_column("catalog_activities", "videos")
    op.drop_column("catalog_activities", "documents")
    op.drop_column("catalog_activities", "images")
    op.drop_column("catalog_activities", "description_extended")

    op.drop_index("ix_admin_resource_price_configs_context", table_name="admin_resource_price_configs")
    op.drop_constraint("uq_admin_resource_price_config_context", "admin_resource_price_configs", type_="unique")
    op.create_unique_constraint(
        "uq_admin_resource_price_config_context",
        "admin_resource_price_configs",
        ["resource_id", "country_id", "zone_id", "currency", "legislation_code"],
    )
    op.create_index(
        "ix_admin_resource_price_configs_context",
        "admin_resource_price_configs",
        ["resource_id", "country_id", "zone_id"],
        unique=False,
    )
    op.drop_index("ix_admin_resource_price_configs_locality_id", table_name="admin_resource_price_configs")
    op.drop_constraint("fk_admin_resource_price_configs_locality_id", "admin_resource_price_configs", type_="foreignkey")
    op.drop_column("admin_resource_price_configs", "locality_id")

    op.drop_index("ix_localities_slug", table_name="localities")
    op.drop_index("ix_localities_zone_id", table_name="localities")
    op.drop_index("ix_localities_country_id", table_name="localities")
    op.drop_table("localities")

    op.drop_constraint("uq_zones_country_slug", "zones", type_="unique")
    op.drop_index("ix_zones_slug", table_name="zones")
    op.drop_column("zones", "is_active")
    op.drop_column("zones", "slug")
    op.drop_column("zones", "name_en")
    op.drop_column("zones", "name_ro")

    op.drop_index("ix_countries_slug", table_name="countries")
    op.drop_column("countries", "is_active")
    op.drop_column("countries", "slug")
    op.drop_column("countries", "name_en")
    op.drop_column("countries", "name_ro")
