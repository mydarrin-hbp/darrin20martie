"""orders flow v1

Revision ID: s2t3u4v5w6x7
Revises: r1s2t3u4v5w6
Create Date: 2026-03-29 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa


revision = "s2t3u4v5w6x7"
down_revision = "r1s2t3u4v5w6"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    tables = set(inspector.get_table_names())

    if "orders" not in tables:
        op.create_table(
            "orders",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("order_ref", sa.String(length=64), nullable=False),
            sa.Column("service_id", sa.Integer(), nullable=False),
            sa.Column("deviz_draft_id", sa.Integer(), nullable=True),
            sa.Column("status", sa.String(length=64), nullable=False),
            sa.Column("target_address", sa.String(length=255), nullable=False),
            sa.Column("country_code", sa.String(length=8), nullable=False),
            sa.Column("zone_slug", sa.String(length=150), nullable=False),
            sa.Column("locality_slug", sa.String(length=150), nullable=True),
            sa.Column("requested_quantity", sa.Float(), nullable=True),
            sa.Column("currency", sa.String(length=8), nullable=False),
            sa.Column("currency_symbol", sa.String(length=16), nullable=True),
            sa.Column("cost_direct", sa.Float(), nullable=False, server_default="0"),
            sa.Column("cost_regie", sa.Float(), nullable=False, server_default="0"),
            sa.Column("mentenanta_platforma", sa.Float(), nullable=False, server_default="0"),
            sa.Column("venit_platforma", sa.Float(), nullable=False, server_default="0"),
            sa.Column("garantie_buna_executie", sa.Float(), nullable=False, server_default="0"),
            sa.Column("tva", sa.Float(), nullable=False, server_default="0"),
            sa.Column("total_facturabil", sa.Float(), nullable=False, server_default="0"),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
            sa.ForeignKeyConstraint(["service_id"], ["services.id"], ondelete="CASCADE"),
            sa.ForeignKeyConstraint(["deviz_draft_id"], ["deviz_drafts.id"], ondelete="SET NULL"),
            sa.PrimaryKeyConstraint("id"),
            sa.UniqueConstraint("order_ref"),
        )
        op.create_index(op.f("ix_orders_country_code"), "orders", ["country_code"], unique=False)
        op.create_index(op.f("ix_orders_deviz_draft_id"), "orders", ["deviz_draft_id"], unique=False)
        op.create_index(op.f("ix_orders_id"), "orders", ["id"], unique=False)
        op.create_index(op.f("ix_orders_locality_slug"), "orders", ["locality_slug"], unique=False)
        op.create_index(op.f("ix_orders_order_ref"), "orders", ["order_ref"], unique=False)
        op.create_index(op.f("ix_orders_service_id"), "orders", ["service_id"], unique=False)
        op.create_index(op.f("ix_orders_status"), "orders", ["status"], unique=False)
        op.create_index(op.f("ix_orders_zone_slug"), "orders", ["zone_slug"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_orders_zone_slug"), table_name="orders")
    op.drop_index(op.f("ix_orders_status"), table_name="orders")
    op.drop_index(op.f("ix_orders_service_id"), table_name="orders")
    op.drop_index(op.f("ix_orders_order_ref"), table_name="orders")
    op.drop_index(op.f("ix_orders_locality_slug"), table_name="orders")
    op.drop_index(op.f("ix_orders_id"), table_name="orders")
    op.drop_index(op.f("ix_orders_deviz_draft_id"), table_name="orders")
    op.drop_index(op.f("ix_orders_country_code"), table_name="orders")
    op.drop_table("orders")
