"""add supplier provider_type

Revision ID: aa1b2c3d4e5f
Revises: 
Create Date: 2026-04-03 12:00:00
"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "aa1b2c3d4e5f"
down_revision = "z9a0b1c2d3e4"
depends_on = None


def upgrade():
    with op.batch_alter_table("suppliers") as batch_op:
        batch_op.add_column(sa.Column("provider_type", sa.String(length=32), nullable=False, server_default="MATERIAL"))
    op.execute("UPDATE suppliers SET provider_type = 'MATERIAL' WHERE provider_type IS NULL")


def downgrade():
    with op.batch_alter_table("suppliers") as batch_op:
        batch_op.drop_column("provider_type")
