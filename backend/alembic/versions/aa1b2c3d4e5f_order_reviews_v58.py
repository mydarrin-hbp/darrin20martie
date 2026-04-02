"""order reviews v58

Revision ID: aa1b2c3d4e5f
Revises: z9a0b1c2d3e4
Create Date: 2026-04-02 12:00:00
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "aa1b2c3d4e5f"
down_revision = "z9a0b1c2d3e4"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "order_reviews",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("order_id", sa.Integer(), sa.ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True),
        sa.Column("rating", sa.Integer(), nullable=False),
        sa.Column("feedback", sa.Text(), nullable=False),
        sa.Column("is_visible", sa.Boolean(), nullable=False, server_default=sa.text("1")),
        sa.Column("admin_note", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_order_reviews_order_id", "order_reviews", ["order_id"])
    op.create_index("ix_order_reviews_visible", "order_reviews", ["is_visible"])


def downgrade() -> None:
    op.drop_index("ix_order_reviews_visible", table_name="order_reviews")
    op.drop_index("ix_order_reviews_order_id", table_name="order_reviews")
    op.drop_table("order_reviews")
