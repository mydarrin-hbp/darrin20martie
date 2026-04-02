"""partner supplier documents v575

Revision ID: z9a0b1c2d3e4
Revises: y8z9a0b1c2d3
Create Date: 2026-03-30 19:20:00.000000
"""

from alembic import op
import sqlalchemy as sa


revision = "z9a0b1c2d3e4"
down_revision = "y8z9a0b1c2d3"
branch_labels = None
depends_on = None


def _has_column(inspector, table_name: str, column_name: str) -> bool:
    return column_name in {column["name"] for column in inspector.get_columns(table_name)}


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    additions = [
        ("user_id", sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True)),
        ("contact_email", sa.Column("contact_email", sa.String(length=255), nullable=True)),
        ("criminal_record_status", sa.Column("criminal_record_status", sa.String(length=32), nullable=False, server_default="PENDING")),
        ("criminal_record_valid_until", sa.Column("criminal_record_valid_until", sa.DateTime(timezone=True), nullable=True)),
        ("integrity_declaration_status", sa.Column("integrity_declaration_status", sa.String(length=32), nullable=False, server_default="PENDING")),
    ]
    for column_name, column in additions:
        if not _has_column(inspector, "suppliers", column_name):
            op.add_column("suppliers", column)


def downgrade() -> None:
    op.drop_column("suppliers", "integrity_declaration_status")
    op.drop_column("suppliers", "criminal_record_valid_until")
    op.drop_column("suppliers", "criminal_record_status")
    op.drop_column("suppliers", "contact_email")
    op.drop_column("suppliers", "user_id")
