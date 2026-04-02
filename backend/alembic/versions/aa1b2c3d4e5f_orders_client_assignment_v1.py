"""orders client assignment + provider fields

Revision ID: aa1b2c3d4e5f
Revises: z9a0b1c2d3e4
Create Date: 2026-04-02 09:30:00
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "aa1b2c3d4e5f"
down_revision = "z9a0b1c2d3e4"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("orders", sa.Column("client_user_id", sa.Integer(), nullable=True))
    op.add_column("orders", sa.Column("provider_ref", sa.String(length=120), nullable=True))
    op.add_column("orders", sa.Column("provider_name", sa.String(length=255), nullable=True))
    op.add_column(
        "orders",
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_orders_client_user_id", "orders", ["client_user_id"], unique=False)
    op.create_foreign_key(
        "fk_orders_client_user_id_users",
        "orders",
        "users",
        ["client_user_id"],
        ["id"],
        ondelete="SET NULL",
    )


def downgrade() -> None:
    op.drop_constraint("fk_orders_client_user_id_users", "orders", type_="foreignkey")
    op.drop_index("ix_orders_client_user_id", table_name="orders")
    op.drop_column("orders", "updated_at")
    op.drop_column("orders", "provider_name")
    op.drop_column("orders", "provider_ref")
    op.drop_column("orders", "client_user_id")
