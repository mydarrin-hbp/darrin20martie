"""catalog add slug fields baseline

Revision ID: dc1d51e2647d
Revises:
Create Date: 2026-03-21 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa


revision = "dc1d51e2647d"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    tables = set(inspector.get_table_names())

    if "users" not in tables:
        op.create_table(
            "users",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("email", sa.String(length=255), nullable=False),
            sa.Column("hashed_password", sa.String(length=255), nullable=False),
            sa.Column("role", sa.String(length=50), nullable=True),
            sa.Column("verification_status", sa.String(length=50), nullable=True),
            sa.PrimaryKeyConstraint("id"),
            sa.UniqueConstraint("email", name="uq_users_email"),
        )
        op.create_index("ix_users_id", "users", ["id"], unique=False)
        op.create_index("ix_users_email", "users", ["email"], unique=True)

    if "domains" not in tables:
        op.create_table(
            "domains",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("name", sa.String(length=150), nullable=False),
            sa.Column("slug", sa.String(length=180), nullable=False),
            sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
            sa.PrimaryKeyConstraint("id"),
            sa.UniqueConstraint("slug", name="uq_domains_slug"),
        )
        op.create_index("ix_domains_id", "domains", ["id"], unique=False)
        op.create_index("ix_domains_name", "domains", ["name"], unique=False)
        op.create_index("ix_domains_slug", "domains", ["slug"], unique=True)

    if "categories" not in tables:
        op.create_table(
            "categories",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("domain_id", sa.Integer(), nullable=False),
            sa.Column("name", sa.String(length=150), nullable=False),
            sa.Column("slug", sa.String(length=180), nullable=False),
            sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
            sa.ForeignKeyConstraint(["domain_id"], ["domains.id"], ondelete="CASCADE"),
            sa.PrimaryKeyConstraint("id"),
            sa.UniqueConstraint("slug", name="uq_categories_slug"),
        )
        op.create_index("ix_categories_id", "categories", ["id"], unique=False)
        op.create_index("ix_categories_domain_id", "categories", ["domain_id"], unique=False)
        op.create_index("ix_categories_name", "categories", ["name"], unique=False)
        op.create_index("ix_categories_slug", "categories", ["slug"], unique=True)

    if "subcategories" not in tables:
        op.create_table(
            "subcategories",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("category_id", sa.Integer(), nullable=False),
            sa.Column("name", sa.String(length=150), nullable=False),
            sa.Column("slug", sa.String(length=180), nullable=False),
            sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
            sa.ForeignKeyConstraint(["category_id"], ["categories.id"], ondelete="CASCADE"),
            sa.PrimaryKeyConstraint("id"),
            sa.UniqueConstraint("slug", name="uq_subcategories_slug"),
        )
        op.create_index("ix_subcategories_id", "subcategories", ["id"], unique=False)
        op.create_index("ix_subcategories_category_id", "subcategories", ["category_id"], unique=False)
        op.create_index("ix_subcategories_name", "subcategories", ["name"], unique=False)
        op.create_index("ix_subcategories_slug", "subcategories", ["slug"], unique=True)

    if "services" not in tables:
        op.create_table(
            "services",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("name", sa.String(length=255), nullable=False),
            sa.Column("slug", sa.String(length=255), nullable=False),
            sa.Column("description", sa.Text(), nullable=True),
            sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
            sa.PrimaryKeyConstraint("id"),
            sa.UniqueConstraint("slug", name="uq_services_slug"),
        )
        op.create_index("ix_services_id", "services", ["id"], unique=False)
        op.create_index("ix_services_name", "services", ["name"], unique=False)
        op.create_index("ix_services_slug", "services", ["slug"], unique=True)

    if "countries" not in tables:
        op.create_table(
            "countries",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("name", sa.String(length=100), nullable=False),
            sa.Column("code", sa.String(length=3), nullable=False),
            sa.Column("currency", sa.String(length=3), nullable=False),
            sa.PrimaryKeyConstraint("id"),
            sa.UniqueConstraint("code", name="uq_countries_code"),
        )
        op.create_index("ix_countries_code", "countries", ["code"], unique=True)

    if "zones" not in tables:
        op.create_table(
            "zones",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("country_id", sa.Integer(), nullable=False),
            sa.Column("name", sa.String(length=100), nullable=False),
            sa.Column("multiplier", sa.Numeric(10, 4), nullable=False, server_default="1.0"),
            sa.ForeignKeyConstraint(["country_id"], ["countries.id"]),
            sa.PrimaryKeyConstraint("id"),
        )
        op.create_index("ix_zones_country_id", "zones", ["country_id"], unique=False)

    if "units" not in tables:
        op.create_table(
            "units",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("code", sa.String(length=20), nullable=False),
            sa.Column("name", sa.String(length=80), nullable=False),
            sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
            sa.PrimaryKeyConstraint("id"),
            sa.UniqueConstraint("code", name="uq_units_code"),
        )

    if "activities" not in tables:
        op.create_table(
            "activities",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("subcategory_id", sa.Integer(), nullable=False),
            sa.Column("name", sa.String(length=255), nullable=False),
            sa.Column("code", sa.String(length=50), nullable=True),
            sa.Column("unit_id", sa.Integer(), nullable=False),
            sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
            sa.ForeignKeyConstraint(["subcategory_id"], ["subcategories.id"]),
            sa.ForeignKeyConstraint(["unit_id"], ["units.id"]),
            sa.PrimaryKeyConstraint("id"),
        )
        op.create_index("ix_activities_subcategory_id", "activities", ["subcategory_id"], unique=False)
        op.create_index("ix_activities_code", "activities", ["code"], unique=False)
        op.create_index("ix_activities_unit_id", "activities", ["unit_id"], unique=False)

    if "service_activities" not in tables:
        op.create_table(
            "service_activities",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("service_id", sa.Integer(), nullable=False),
            sa.Column("activity_id", sa.Integer(), nullable=False),
            sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
            sa.Column("is_required", sa.Boolean(), nullable=False, server_default=sa.true()),
            sa.ForeignKeyConstraint(["activity_id"], ["activities.id"]),
            sa.ForeignKeyConstraint(["service_id"], ["services.id"]),
            sa.PrimaryKeyConstraint("id"),
            sa.UniqueConstraint("service_id", "activity_id", name="uq_service_activity"),
        )
        op.create_index("ix_service_activities_service_id", "service_activities", ["service_id"], unique=False)
        op.create_index("ix_service_activities_activity_id", "service_activities", ["activity_id"], unique=False)
        op.create_index("ix_service_activities_service_activity", "service_activities", ["service_id", "activity_id"], unique=False)


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    tables = set(inspector.get_table_names())

    if "service_activities" in tables:
        op.drop_index("ix_service_activities_service_activity", table_name="service_activities")
        op.drop_index("ix_service_activities_activity_id", table_name="service_activities")
        op.drop_index("ix_service_activities_service_id", table_name="service_activities")
        op.drop_table("service_activities")

    if "activities" in tables:
        op.drop_index("ix_activities_unit_id", table_name="activities")
        op.drop_index("ix_activities_code", table_name="activities")
        op.drop_index("ix_activities_subcategory_id", table_name="activities")
        op.drop_table("activities")

    if "units" in tables:
        op.drop_table("units")

    if "zones" in tables:
        op.drop_index("ix_zones_country_id", table_name="zones")
        op.drop_table("zones")

    if "countries" in tables:
        op.drop_index("ix_countries_code", table_name="countries")
        op.drop_table("countries")

    if "services" in tables:
        op.drop_index("ix_services_slug", table_name="services")
        op.drop_index("ix_services_name", table_name="services")
        op.drop_index("ix_services_id", table_name="services")
        op.drop_table("services")

    if "subcategories" in tables:
        op.drop_index("ix_subcategories_slug", table_name="subcategories")
        op.drop_index("ix_subcategories_name", table_name="subcategories")
        op.drop_index("ix_subcategories_category_id", table_name="subcategories")
        op.drop_index("ix_subcategories_id", table_name="subcategories")
        op.drop_table("subcategories")

    if "categories" in tables:
        op.drop_index("ix_categories_slug", table_name="categories")
        op.drop_index("ix_categories_name", table_name="categories")
        op.drop_index("ix_categories_domain_id", table_name="categories")
        op.drop_index("ix_categories_id", table_name="categories")
        op.drop_table("categories")

    if "domains" in tables:
        op.drop_index("ix_domains_slug", table_name="domains")
        op.drop_index("ix_domains_name", table_name="domains")
        op.drop_index("ix_domains_id", table_name="domains")
        op.drop_table("domains")

    if "users" in tables:
        op.drop_index("ix_users_email", table_name="users")
        op.drop_index("ix_users_id", table_name="users")
        op.drop_table("users")
