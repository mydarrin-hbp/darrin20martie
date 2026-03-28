"""add signup leads flow

Revision ID: m1n2o3p4q5r6
Revises: l6g7h8i9j0k1
Create Date: 2026-03-28 14:10:00.000000
"""

from alembic import op
import sqlalchemy as sa


revision = "m1n2o3p4q5r6"
down_revision = "l6g7h8i9j0k1"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "signup_leads",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("first_name", sa.String(length=120), nullable=False),
        sa.Column("last_name", sa.String(length=120), nullable=False),
        sa.Column("phone", sa.String(length=50), nullable=False),
        sa.Column("city", sa.String(length=120), nullable=True),
        sa.Column("status", sa.String(length=50), nullable=False),
        sa.Column("selected_role", sa.String(length=50), nullable=True),
        sa.Column("sms_code", sa.String(length=12), nullable=True),
        sa.Column("sms_code_expires_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("phone_verified_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email", name="uq_signup_leads_email"),
    )
    op.create_index(op.f("ix_signup_leads_id"), "signup_leads", ["id"], unique=False)
    op.create_index(op.f("ix_signup_leads_email"), "signup_leads", ["email"], unique=True)


def downgrade() -> None:
    op.drop_index(op.f("ix_signup_leads_email"), table_name="signup_leads")
    op.drop_index(op.f("ix_signup_leads_id"), table_name="signup_leads")
    op.drop_table("signup_leads")
