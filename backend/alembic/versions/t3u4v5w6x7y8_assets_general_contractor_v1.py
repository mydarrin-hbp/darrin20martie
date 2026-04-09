"""assets ontology and general contractor pricing v1

Revision ID: t3u4v5w6x7y8
Revises: s2t3u4v5w6x7
Create Date: 2026-03-29 12:00:00.000000
"""

from alembic import op
import sqlalchemy as sa


revision = "t3u4v5w6x7y8"
down_revision = "s2t3u4v5w6x7"
branch_labels = None
depends_on = None


def _has_table(inspector, table_name: str) -> bool:
    return table_name in set(inspector.get_table_names())


def _has_column(inspector, table_name: str, column_name: str) -> bool:
    return column_name in {column["name"] for column in inspector.get_columns(table_name)}


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if not _has_table(inspector, "asset_types"):
        op.create_table(
            "asset_types",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("slug", sa.String(length=120), nullable=False),
            sa.Column("name_ro", sa.String(length=150), nullable=False),
            sa.Column("name_en", sa.String(length=150), nullable=False),
            sa.Column("asset_family", sa.String(length=64), nullable=False),
            sa.Column("technical_schema", sa.JSON(), nullable=False, server_default=sa.text("'{}'::json")),
            sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
            sa.PrimaryKeyConstraint("id"),
            sa.UniqueConstraint("slug"),
        )
        op.create_index(op.f("ix_asset_types_slug"), "asset_types", ["slug"], unique=False)
        op.create_index("ix_asset_types_family_active", "asset_types", ["asset_family", "is_active"], unique=False)

    if not _has_table(inspector, "task_types"):
        op.create_table(
            "task_types",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("slug", sa.String(length=120), nullable=False),
            sa.Column("name_ro", sa.String(length=150), nullable=False),
            sa.Column("name_en", sa.String(length=150), nullable=False),
            sa.Column("operation_kind", sa.String(length=64), nullable=False),
            sa.Column("required_caen_code", sa.String(length=16), nullable=True),
            sa.Column("required_certification_codes", sa.JSON(), nullable=False, server_default=sa.text("'[]'::json")),
            sa.Column("requires_certification", sa.Boolean(), nullable=False, server_default=sa.text("false")),
            sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
            sa.PrimaryKeyConstraint("id"),
            sa.UniqueConstraint("slug"),
        )
        op.create_index(op.f("ix_task_types_slug"), "task_types", ["slug"], unique=False)
        op.create_index("ix_task_types_operation_active", "task_types", ["operation_kind", "is_active"], unique=False)

    if not _has_table(inspector, "assets"):
        op.create_table(
            "assets",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("asset_id", sa.String(length=64), nullable=False),
            sa.Column("asset_type_id", sa.Integer(), nullable=False),
            sa.Column("category_id", sa.Integer(), nullable=False),
            sa.Column("service_id", sa.Integer(), nullable=True),
            sa.Column("external_ref", sa.String(length=128), nullable=True),
            sa.Column("display_name", sa.String(length=255), nullable=False),
            sa.Column("technical_specs", sa.JSON(), nullable=False, server_default=sa.text("'{}'::json")),
            sa.Column("maintenance_history_id", sa.String(length=64), nullable=True),
            sa.Column("warranty_status", sa.String(length=32), nullable=False, server_default="UNKNOWN"),
            sa.Column("manufacturer", sa.String(length=255), nullable=True),
            sa.Column("model", sa.String(length=255), nullable=True),
            sa.Column("serial_number", sa.String(length=255), nullable=True),
            sa.Column("notes", sa.Text(), nullable=True),
            sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
            sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
            sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
            sa.ForeignKeyConstraint(["asset_type_id"], ["asset_types.id"], ondelete="RESTRICT"),
            sa.ForeignKeyConstraint(["category_id"], ["categories.id"], ondelete="RESTRICT"),
            sa.ForeignKeyConstraint(["service_id"], ["services.id"], ondelete="SET NULL"),
            sa.PrimaryKeyConstraint("id"),
            sa.UniqueConstraint("asset_id"),
        )
        op.create_index(op.f("ix_assets_asset_id"), "assets", ["asset_id"], unique=False)
        op.create_index(op.f("ix_assets_asset_type_id"), "assets", ["asset_type_id"], unique=False)
        op.create_index(op.f("ix_assets_category_id"), "assets", ["category_id"], unique=False)
        op.create_index(op.f("ix_assets_external_ref"), "assets", ["external_ref"], unique=False)
        op.create_index(op.f("ix_assets_serial_number"), "assets", ["serial_number"], unique=False)
        op.create_index(op.f("ix_assets_service_id"), "assets", ["service_id"], unique=False)
        op.create_index("ix_assets_asset_type_warranty", "assets", ["asset_type_id", "warranty_status"], unique=False)
        op.create_index("ix_assets_category_external_ref", "assets", ["category_id", "external_ref"], unique=False)

    if not _has_table(inspector, "asset_task_rules"):
        op.create_table(
            "asset_task_rules",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("asset_type_id", sa.Integer(), nullable=False),
            sa.Column("task_type_id", sa.Integer(), nullable=False),
            sa.Column("service_id", sa.Integer(), nullable=True),
            sa.Column("activity_id", sa.Integer(), nullable=True),
            sa.Column("is_default", sa.Boolean(), nullable=False, server_default=sa.text("true")),
            sa.Column("rule_payload", sa.JSON(), nullable=False, server_default=sa.text("'{}'::json")),
            sa.ForeignKeyConstraint(["activity_id"], ["catalog_activities.id"], ondelete="SET NULL"),
            sa.ForeignKeyConstraint(["asset_type_id"], ["asset_types.id"], ondelete="CASCADE"),
            sa.ForeignKeyConstraint(["service_id"], ["services.id"], ondelete="SET NULL"),
            sa.ForeignKeyConstraint(["task_type_id"], ["task_types.id"], ondelete="CASCADE"),
            sa.PrimaryKeyConstraint("id"),
            sa.UniqueConstraint("asset_type_id", "task_type_id", name="uq_asset_task_rule_pair"),
        )
        op.create_index(op.f("ix_asset_task_rules_activity_id"), "asset_task_rules", ["activity_id"], unique=False)
        op.create_index(op.f("ix_asset_task_rules_asset_type_id"), "asset_task_rules", ["asset_type_id"], unique=False)
        op.create_index(op.f("ix_asset_task_rules_service_id"), "asset_task_rules", ["service_id"], unique=False)
        op.create_index(op.f("ix_asset_task_rules_task_type_id"), "asset_task_rules", ["task_type_id"], unique=False)

    if not _has_table(inspector, "provider_capabilities"):
        op.create_table(
            "provider_capabilities",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("supplier_id", sa.Integer(), nullable=False),
            sa.Column("task_type_id", sa.Integer(), nullable=False),
            sa.Column("asset_type_id", sa.Integer(), nullable=True),
            sa.Column("caen_code", sa.String(length=16), nullable=False),
            sa.Column("certification_codes", sa.JSON(), nullable=False, server_default=sa.text("'[]'::json")),
            sa.Column("can_lead_package", sa.Boolean(), nullable=False, server_default=sa.text("false")),
            sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
            sa.ForeignKeyConstraint(["asset_type_id"], ["asset_types.id"], ondelete="SET NULL"),
            sa.ForeignKeyConstraint(["supplier_id"], ["suppliers.id"], ondelete="CASCADE"),
            sa.ForeignKeyConstraint(["task_type_id"], ["task_types.id"], ondelete="CASCADE"),
            sa.PrimaryKeyConstraint("id"),
            sa.UniqueConstraint("supplier_id", "task_type_id", "asset_type_id", "caen_code", name="uq_provider_capability_scope"),
        )
        op.create_index(op.f("ix_provider_capabilities_asset_type_id"), "provider_capabilities", ["asset_type_id"], unique=False)
        op.create_index("ix_provider_capabilities_active", "provider_capabilities", ["supplier_id", "task_type_id", "is_active"], unique=False)
        op.create_index(op.f("ix_provider_capabilities_caen_code"), "provider_capabilities", ["caen_code"], unique=False)
        op.create_index(op.f("ix_provider_capabilities_supplier_id"), "provider_capabilities", ["supplier_id"], unique=False)
        op.create_index(op.f("ix_provider_capabilities_task_type_id"), "provider_capabilities", ["task_type_id"], unique=False)

    if _has_table(inspector, "suppliers"):
        if not _has_column(inspector, "suppliers", "insurance_status"):
            op.add_column("suppliers", sa.Column("insurance_status", sa.String(length=32), nullable=False, server_default="PENDING"))
        if not _has_column(inspector, "suppliers", "insurance_policy_no"):
            op.add_column("suppliers", sa.Column("insurance_policy_no", sa.String(length=120), nullable=True))
        if not _has_column(inspector, "suppliers", "insurance_valid_until"):
            op.add_column("suppliers", sa.Column("insurance_valid_until", sa.DateTime(timezone=True), nullable=True))
            op.create_index(op.f("ix_suppliers_insurance_policy_no"), "suppliers", ["insurance_policy_no"], unique=False)

    for column_name, column in (
        ("escrow_retention_percentage", sa.Column("escrow_retention_percentage", sa.Float(), nullable=False, server_default="0")),
        ("insurance_premium_fixed", sa.Column("insurance_premium_fixed", sa.Float(), nullable=False, server_default="0")),
        ("insurance_premium_percentage", sa.Column("insurance_premium_percentage", sa.Float(), nullable=False, server_default="0")),
        ("darrin_management_fee_fixed", sa.Column("darrin_management_fee_fixed", sa.Float(), nullable=False, server_default="0")),
        ("darrin_management_fee_percentage", sa.Column("darrin_management_fee_percentage", sa.Float(), nullable=False, server_default="0")),
    ):
        if not _has_column(inspector, "admin_price_configs", column_name):
            op.add_column("admin_price_configs", column)

    for column_name, column in (
        ("escrow_retention_percentage", sa.Column("escrow_retention_percentage", sa.Float(), nullable=False, server_default="0")),
        ("insurance_premium_fixed", sa.Column("insurance_premium_fixed", sa.Float(), nullable=False, server_default="0")),
        ("insurance_premium_percentage", sa.Column("insurance_premium_percentage", sa.Float(), nullable=False, server_default="0")),
        ("darrin_management_fee_fixed", sa.Column("darrin_management_fee_fixed", sa.Float(), nullable=False, server_default="0")),
        ("darrin_management_fee_percentage", sa.Column("darrin_management_fee_percentage", sa.Float(), nullable=False, server_default="0")),
        ("escrow_retention_value", sa.Column("escrow_retention_value", sa.Float(), nullable=False, server_default="0")),
        ("insurance_premium_value", sa.Column("insurance_premium_value", sa.Float(), nullable=False, server_default="0")),
        ("darrin_management_fee_value", sa.Column("darrin_management_fee_value", sa.Float(), nullable=False, server_default="0")),
    ):
        if not _has_column(inspector, "price_analyses", column_name):
            op.add_column("price_analyses", column)

    for column_name, column in (
        ("escrow_retention_value", sa.Column("escrow_retention_value", sa.Float(), nullable=False, server_default="0")),
        ("insurance_premium_value", sa.Column("insurance_premium_value", sa.Float(), nullable=False, server_default="0")),
        ("darrin_management_fee_value", sa.Column("darrin_management_fee_value", sa.Float(), nullable=False, server_default="0")),
    ):
        if not _has_column(inspector, "cost_calculations", column_name):
            op.add_column("cost_calculations", column)


def downgrade() -> None:
    op.drop_column("cost_calculations", "darrin_management_fee_value")
    op.drop_column("cost_calculations", "insurance_premium_value")
    op.drop_column("cost_calculations", "escrow_retention_value")

    op.drop_column("price_analyses", "darrin_management_fee_value")
    op.drop_column("price_analyses", "insurance_premium_value")
    op.drop_column("price_analyses", "escrow_retention_value")
    op.drop_column("price_analyses", "darrin_management_fee_percentage")
    op.drop_column("price_analyses", "darrin_management_fee_fixed")
    op.drop_column("price_analyses", "insurance_premium_percentage")
    op.drop_column("price_analyses", "insurance_premium_fixed")
    op.drop_column("price_analyses", "escrow_retention_percentage")

    op.drop_column("admin_price_configs", "darrin_management_fee_percentage")
    op.drop_column("admin_price_configs", "darrin_management_fee_fixed")
    op.drop_column("admin_price_configs", "insurance_premium_percentage")
    op.drop_column("admin_price_configs", "insurance_premium_fixed")
    op.drop_column("admin_price_configs", "escrow_retention_percentage")

    op.drop_index(op.f("ix_suppliers_insurance_policy_no"), table_name="suppliers")
    op.drop_column("suppliers", "insurance_valid_until")
    op.drop_column("suppliers", "insurance_policy_no")
    op.drop_column("suppliers", "insurance_status")

    op.drop_index(op.f("ix_provider_capabilities_task_type_id"), table_name="provider_capabilities")
    op.drop_index(op.f("ix_provider_capabilities_supplier_id"), table_name="provider_capabilities")
    op.drop_index(op.f("ix_provider_capabilities_caen_code"), table_name="provider_capabilities")
    op.drop_index("ix_provider_capabilities_active", table_name="provider_capabilities")
    op.drop_index(op.f("ix_provider_capabilities_asset_type_id"), table_name="provider_capabilities")
    op.drop_table("provider_capabilities")

    op.drop_index(op.f("ix_asset_task_rules_task_type_id"), table_name="asset_task_rules")
    op.drop_index(op.f("ix_asset_task_rules_service_id"), table_name="asset_task_rules")
    op.drop_index(op.f("ix_asset_task_rules_asset_type_id"), table_name="asset_task_rules")
    op.drop_index(op.f("ix_asset_task_rules_activity_id"), table_name="asset_task_rules")
    op.drop_table("asset_task_rules")

    op.drop_index("ix_assets_category_external_ref", table_name="assets")
    op.drop_index("ix_assets_asset_type_warranty", table_name="assets")
    op.drop_index(op.f("ix_assets_service_id"), table_name="assets")
    op.drop_index(op.f("ix_assets_serial_number"), table_name="assets")
    op.drop_index(op.f("ix_assets_external_ref"), table_name="assets")
    op.drop_index(op.f("ix_assets_category_id"), table_name="assets")
    op.drop_index(op.f("ix_assets_asset_type_id"), table_name="assets")
    op.drop_index(op.f("ix_assets_asset_id"), table_name="assets")
    op.drop_table("assets")

    op.drop_index("ix_task_types_operation_active", table_name="task_types")
    op.drop_index(op.f("ix_task_types_slug"), table_name="task_types")
    op.drop_table("task_types")

    op.drop_index("ix_asset_types_family_active", table_name="asset_types")
    op.drop_index(op.f("ix_asset_types_slug"), table_name="asset_types")
    op.drop_table("asset_types")
