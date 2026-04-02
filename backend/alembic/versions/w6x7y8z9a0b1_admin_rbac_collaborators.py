"""add admin rbac collaborators

Revision ID: w6x7y8z9a0b1
Revises: v5w6x7y8z9a0
Create Date: 2026-03-29 23:05:00.000000
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "w6x7y8z9a0b1"
down_revision = "v5w6x7y8z9a0"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "admins",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("role_key", sa.String(length=64), nullable=False),
        sa.Column("country_access", sa.JSON(), nullable=False),
        sa.Column("module_access", sa.JSON(), nullable=False),
        sa.Column("invitation_token", sa.String(length=255), nullable=True),
        sa.Column("invitation_status", sa.String(length=32), nullable=False, server_default="PENDING"),
        sa.Column("invited_by_user_id", sa.Integer(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["invited_by_user_id"], ["users.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id"),
        sa.UniqueConstraint("invitation_token"),
    )
    op.create_index(op.f("ix_admins_user_id"), "admins", ["user_id"], unique=True)
    op.create_index(op.f("ix_admins_role_key"), "admins", ["role_key"], unique=False)
    op.create_index(op.f("ix_admins_invitation_status"), "admins", ["invitation_status"], unique=False)
    op.create_index(op.f("ix_admins_invitation_token"), "admins", ["invitation_token"], unique=True)
    op.create_index(op.f("ix_admins_invited_by_user_id"), "admins", ["invited_by_user_id"], unique=False)

    op.create_table(
        "admin_permissions",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("admin_id", sa.Integer(), nullable=False),
        sa.Column("permission_code", sa.String(length=120), nullable=False),
        sa.Column("module_key", sa.String(length=64), nullable=False),
        sa.Column("country_code", sa.String(length=3), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["admin_id"], ["admins.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("admin_id", "permission_code", "country_code", name="uq_admin_permission_scope"),
    )
    op.create_index(op.f("ix_admin_permissions_admin_id"), "admin_permissions", ["admin_id"], unique=False)
    op.create_index(op.f("ix_admin_permissions_permission_code"), "admin_permissions", ["permission_code"], unique=False)
    op.create_index(op.f("ix_admin_permissions_module_key"), "admin_permissions", ["module_key"], unique=False)
    op.create_index(op.f("ix_admin_permissions_country_code"), "admin_permissions", ["country_code"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_admin_permissions_country_code"), table_name="admin_permissions")
    op.drop_index(op.f("ix_admin_permissions_module_key"), table_name="admin_permissions")
    op.drop_index(op.f("ix_admin_permissions_permission_code"), table_name="admin_permissions")
    op.drop_index(op.f("ix_admin_permissions_admin_id"), table_name="admin_permissions")
    op.drop_table("admin_permissions")

    op.drop_index(op.f("ix_admins_invited_by_user_id"), table_name="admins")
    op.drop_index(op.f("ix_admins_invitation_token"), table_name="admins")
    op.drop_index(op.f("ix_admins_invitation_status"), table_name="admins")
    op.drop_index(op.f("ix_admins_role_key"), table_name="admins")
    op.drop_index(op.f("ix_admins_user_id"), table_name="admins")
    op.drop_table("admins")
