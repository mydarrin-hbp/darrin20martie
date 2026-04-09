"""production assets, financial flow and concrete dispatch v2

Revision ID: u4v5w6x7y8z9
Revises: t3u4v5w6x7y8
Create Date: 2026-03-29 16:00:00.000000
"""

from alembic import op
import sqlalchemy as sa


revision = "u4v5w6x7y8z9"
down_revision = "t3u4v5w6x7y8"
branch_labels = None
depends_on = None


def _has_table(inspector, table_name: str) -> bool:
    return table_name in set(inspector.get_table_names())


def _has_column(inspector, table_name: str, column_name: str) -> bool:
    return column_name in {column["name"] for column in inspector.get_columns(table_name)}


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if not _has_table(inspector, "financial_configs"):
        op.create_table(
            "financial_configs",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("country_id", sa.Integer(), nullable=True),
            sa.Column("zone_id", sa.Integer(), nullable=True),
            sa.Column("locality_id", sa.Integer(), nullable=True),
            sa.Column("service_family", sa.String(length=64), nullable=True),
            sa.Column("mydarrin_commission_percentage", sa.Float(), nullable=False, server_default="0.10"),
            sa.Column("platform_fee_percentage", sa.Float(), nullable=False, server_default="0.03"),
            sa.Column("indirect_cost_percentage", sa.Float(), nullable=False, server_default="0"),
            sa.Column("escrow_guarantee_percentage", sa.Float(), nullable=False, server_default="0.05"),
            sa.Column("insurance_percentage", sa.Float(), nullable=False, server_default="0"),
            sa.Column("insurance_fixed_amount", sa.Float(), nullable=False, server_default="0"),
            sa.Column("incomplete_load_fee", sa.Float(), nullable=False, server_default="0"),
            sa.Column("pump_mobilization_fee", sa.Float(), nullable=False, server_default="0"),
            sa.Column("pump_price_per_m3", sa.Float(), nullable=False, server_default="0"),
            sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
            sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
            sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
            sa.ForeignKeyConstraint(["country_id"], ["countries.id"], ondelete="CASCADE"),
            sa.ForeignKeyConstraint(["zone_id"], ["zones.id"], ondelete="CASCADE"),
            sa.ForeignKeyConstraint(["locality_id"], ["localities.id"], ondelete="SET NULL"),
            sa.PrimaryKeyConstraint("id"),
            sa.UniqueConstraint("country_id", "zone_id", "locality_id", "service_family", name="uq_financial_config_scope"),
        )
        op.create_index(op.f("ix_financial_configs_country_id"), "financial_configs", ["country_id"], unique=False)
        op.create_index(op.f("ix_financial_configs_zone_id"), "financial_configs", ["zone_id"], unique=False)
        op.create_index(op.f("ix_financial_configs_locality_id"), "financial_configs", ["locality_id"], unique=False)
        op.create_index(op.f("ix_financial_configs_service_family"), "financial_configs", ["service_family"], unique=False)

    if not _has_table(inspector, "provider_availability_slots"):
        op.create_table(
            "provider_availability_slots",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("supplier_id", sa.Integer(), nullable=False),
            sa.Column("locality_slug", sa.String(length=150), nullable=True),
            sa.Column("scheduled_slot", sa.String(length=64), nullable=False),
            sa.Column("slot_role", sa.String(length=32), nullable=False),
            sa.Column("is_available", sa.Boolean(), nullable=False, server_default=sa.text("true")),
            sa.ForeignKeyConstraint(["supplier_id"], ["suppliers.id"], ondelete="CASCADE"),
            sa.PrimaryKeyConstraint("id"),
            sa.UniqueConstraint("supplier_id", "scheduled_slot", "locality_slug", name="uq_provider_slot_locality"),
        )
        op.create_index(op.f("ix_provider_availability_slots_supplier_id"), "provider_availability_slots", ["supplier_id"], unique=False)
        op.create_index(op.f("ix_provider_availability_slots_locality_slug"), "provider_availability_slots", ["locality_slug"], unique=False)
        op.create_index(op.f("ix_provider_availability_slots_scheduled_slot"), "provider_availability_slots", ["scheduled_slot"], unique=False)
        op.create_index("ix_provider_availability_lookup", "provider_availability_slots", ["supplier_id", "scheduled_slot", "locality_slug", "is_available"], unique=False)

    if not _has_table(inspector, "work_packages"):
        op.create_table(
            "work_packages",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("package_ref", sa.String(length=64), nullable=False),
            sa.Column("package_type", sa.String(length=64), nullable=False),
            sa.Column("status", sa.String(length=64), nullable=False, server_default="DRAFT"),
            sa.Column("target_address", sa.String(length=255), nullable=False),
            sa.Column("locality_slug", sa.String(length=150), nullable=True),
            sa.Column("scheduled_slot", sa.String(length=64), nullable=False),
            sa.Column("material_supplier_id", sa.Integer(), nullable=True),
            sa.Column("equipment_supplier_id", sa.Integer(), nullable=True),
            sa.Column("umbrella_owner", sa.String(length=64), nullable=False, server_default="MY_DARRIN"),
            sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
            sa.ForeignKeyConstraint(["material_supplier_id"], ["suppliers.id"], ondelete="SET NULL"),
            sa.ForeignKeyConstraint(["equipment_supplier_id"], ["suppliers.id"], ondelete="SET NULL"),
            sa.PrimaryKeyConstraint("id"),
            sa.UniqueConstraint("package_ref"),
        )
        op.create_index(op.f("ix_work_packages_package_ref"), "work_packages", ["package_ref"], unique=False)
        op.create_index(op.f("ix_work_packages_package_type"), "work_packages", ["package_type"], unique=False)
        op.create_index(op.f("ix_work_packages_status"), "work_packages", ["status"], unique=False)
        op.create_index(op.f("ix_work_packages_locality_slug"), "work_packages", ["locality_slug"], unique=False)
        op.create_index(op.f("ix_work_packages_scheduled_slot"), "work_packages", ["scheduled_slot"], unique=False)
        op.create_index(op.f("ix_work_packages_material_supplier_id"), "work_packages", ["material_supplier_id"], unique=False)
        op.create_index(op.f("ix_work_packages_equipment_supplier_id"), "work_packages", ["equipment_supplier_id"], unique=False)

    if _has_table(inspector, "orders"):
        if not _has_column(inspector, "orders", "asset_id"):
            op.add_column("orders", sa.Column("asset_id", sa.Integer(), nullable=True))
            op.create_foreign_key("fk_orders_asset_id", "orders", "assets", ["asset_id"], ["id"], ondelete="SET NULL")
            op.create_index(op.f("ix_orders_asset_id"), "orders", ["asset_id"], unique=False)
        if not _has_column(inspector, "orders", "work_package_id"):
            op.add_column("orders", sa.Column("work_package_id", sa.Integer(), nullable=True))
            op.create_foreign_key("fk_orders_work_package_id", "orders", "work_packages", ["work_package_id"], ["id"], ondelete="SET NULL")
            op.create_index(op.f("ix_orders_work_package_id"), "orders", ["work_package_id"], unique=False)
        if not _has_column(inspector, "orders", "insurance_premium"):
            op.add_column("orders", sa.Column("insurance_premium", sa.Float(), nullable=False, server_default="0"))
        if not _has_column(inspector, "orders", "darrin_management_fee"):
            op.add_column("orders", sa.Column("darrin_management_fee", sa.Float(), nullable=False, server_default="0"))
        if not _has_column(inspector, "orders", "escrow_status"):
            op.add_column("orders", sa.Column("escrow_status", sa.String(length=32), nullable=False, server_default="NOT_REQUIRED"))
            op.create_index(op.f("ix_orders_escrow_status"), "orders", ["escrow_status"], unique=False)
        if not _has_column(inspector, "orders", "escrow_blocked_amount"):
            op.add_column("orders", sa.Column("escrow_blocked_amount", sa.Float(), nullable=False, server_default="0"))

    if not _has_table(inspector, "order_documents"):
        op.create_table(
            "order_documents",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("order_id", sa.Integer(), nullable=False),
            sa.Column("document_type", sa.String(length=64), nullable=False),
            sa.Column("status", sa.String(length=32), nullable=False, server_default="GENERATED"),
            sa.Column("mime_type", sa.String(length=120), nullable=False, server_default="application/pdf"),
            sa.Column("storage_key", sa.String(length=255), nullable=False),
            sa.Column("file_name", sa.String(length=255), nullable=False),
            sa.Column("placeholder_content", sa.Text(), nullable=False),
            sa.Column("generated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
            sa.ForeignKeyConstraint(["order_id"], ["orders.id"], ondelete="CASCADE"),
            sa.PrimaryKeyConstraint("id"),
            sa.UniqueConstraint("storage_key"),
        )
        op.create_index(op.f("ix_order_documents_order_id"), "order_documents", ["order_id"], unique=False)
        op.create_index(op.f("ix_order_documents_document_type"), "order_documents", ["document_type"], unique=False)
        op.create_index(op.f("ix_order_documents_status"), "order_documents", ["status"], unique=False)
        op.create_index(op.f("ix_order_documents_storage_key"), "order_documents", ["storage_key"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_order_documents_storage_key"), table_name="order_documents")
    op.drop_index(op.f("ix_order_documents_status"), table_name="order_documents")
    op.drop_index(op.f("ix_order_documents_order_id"), table_name="order_documents")
    op.drop_index(op.f("ix_order_documents_document_type"), table_name="order_documents")
    op.drop_table("order_documents")

    op.drop_index(op.f("ix_orders_escrow_status"), table_name="orders")
    op.drop_index(op.f("ix_orders_work_package_id"), table_name="orders")
    op.drop_constraint("fk_orders_work_package_id", "orders", type_="foreignkey")
    op.drop_index(op.f("ix_orders_asset_id"), table_name="orders")
    op.drop_constraint("fk_orders_asset_id", "orders", type_="foreignkey")
    op.drop_column("orders", "escrow_blocked_amount")
    op.drop_column("orders", "escrow_status")
    op.drop_column("orders", "darrin_management_fee")
    op.drop_column("orders", "insurance_premium")
    op.drop_column("orders", "work_package_id")
    op.drop_column("orders", "asset_id")

    op.drop_index(op.f("ix_work_packages_equipment_supplier_id"), table_name="work_packages")
    op.drop_index(op.f("ix_work_packages_material_supplier_id"), table_name="work_packages")
    op.drop_index(op.f("ix_work_packages_scheduled_slot"), table_name="work_packages")
    op.drop_index(op.f("ix_work_packages_locality_slug"), table_name="work_packages")
    op.drop_index(op.f("ix_work_packages_status"), table_name="work_packages")
    op.drop_index(op.f("ix_work_packages_package_type"), table_name="work_packages")
    op.drop_index(op.f("ix_work_packages_package_ref"), table_name="work_packages")
    op.drop_table("work_packages")

    op.drop_index("ix_provider_availability_lookup", table_name="provider_availability_slots")
    op.drop_index(op.f("ix_provider_availability_slots_scheduled_slot"), table_name="provider_availability_slots")
    op.drop_index(op.f("ix_provider_availability_slots_locality_slug"), table_name="provider_availability_slots")
    op.drop_index(op.f("ix_provider_availability_slots_supplier_id"), table_name="provider_availability_slots")
    op.drop_table("provider_availability_slots")

    op.drop_index(op.f("ix_financial_configs_service_family"), table_name="financial_configs")
    op.drop_index(op.f("ix_financial_configs_locality_id"), table_name="financial_configs")
    op.drop_index(op.f("ix_financial_configs_zone_id"), table_name="financial_configs")
    op.drop_index(op.f("ix_financial_configs_country_id"), table_name="financial_configs")
    op.drop_table("financial_configs")
