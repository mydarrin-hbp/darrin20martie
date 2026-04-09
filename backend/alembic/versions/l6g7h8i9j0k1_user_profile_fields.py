"""add user profile fields

Revision ID: l6g7h8i9j0k1
Revises: k5f6g7h8i9j0
Create Date: 2026-03-28 10:15:00.000000
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "l6g7h8i9j0k1"
down_revision = "k5f6g7h8i9j0"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("users", sa.Column("full_name", sa.String(length=255), nullable=True))
    op.add_column("users", sa.Column("phone", sa.String(length=50), nullable=True))
    op.add_column("users", sa.Column("city", sa.String(length=120), nullable=True))


def downgrade() -> None:
    op.drop_column("users", "city")
    op.drop_column("users", "phone")
    op.drop_column("users", "full_name")
