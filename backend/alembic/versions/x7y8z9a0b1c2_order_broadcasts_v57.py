"""order broadcasts v57

Revision ID: x7y8z9a0b1c2
Revises: u4v5w6x7y8z9
Create Date: 2026-03-30 18:30:00.000000
"""

from alembic import op
import sqlalchemy as sa


revision = "x7y8z9a0b1c2"
down_revision = "u4v5w6x7y8z9"
branch_labels = None
depends_on = None


def _has_table(inspector, table_name: str) -> bool:
    return table_name in inspector.get_table_names()


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if _has_table(inspector, "order_broadcasts"):
        return

    op.create_table(
        "order_broadcasts",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("order_id", sa.Integer(), sa.ForeignKey("orders.id", ondelete="CASCADE"), nullable=False),
        sa.Column("supplier_id", sa.Integer(), sa.ForeignKey("suppliers.id", ondelete="CASCADE"), nullable=False),
        sa.Column("task_scope", sa.String(length=64), nullable=False, server_default="GENERAL"),
        sa.Column("claim_status", sa.String(length=32), nullable=False, server_default="PENDING"),
        sa.Column("can_cover_full_package", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("locality_slug", sa.String(length=150), nullable=True),
        sa.Column("priority_expires_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("claimed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index(op.f("ix_order_broadcasts_order_id"), "order_broadcasts", ["order_id"], unique=False)
    op.create_index(op.f("ix_order_broadcasts_supplier_id"), "order_broadcasts", ["supplier_id"], unique=False)
    op.create_index(op.f("ix_order_broadcasts_claim_status"), "order_broadcasts", ["claim_status"], unique=False)
    op.create_index(op.f("ix_order_broadcasts_locality_slug"), "order_broadcasts", ["locality_slug"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_order_broadcasts_locality_slug"), table_name="order_broadcasts")
    op.drop_index(op.f("ix_order_broadcasts_claim_status"), table_name="order_broadcasts")
    op.drop_index(op.f("ix_order_broadcasts_supplier_id"), table_name="order_broadcasts")
    op.drop_index(op.f("ix_order_broadcasts_order_id"), table_name="order_broadcasts")
    op.drop_table("order_broadcasts")
