"""indicator recipe extensions

Revision ID: h2c3d4e5f6g7
Revises: g1b2c3d4e5f6
Create Date: 2026-03-22 19:15:00.000000
"""

from alembic import op
import sqlalchemy as sa


revision = "h2c3d4e5f6g7"
down_revision = "g1b2c3d4e5f6"
branch_labels = None
depends_on = None


def upgrade() -> None:
    with op.batch_alter_table("price_analysis_recipes") as batch_op:
        batch_op.add_column(sa.Column("consumption_unit", sa.String(length=24), nullable=True))
        batch_op.add_column(sa.Column("waste_formula", sa.String(length=255), nullable=True))
        batch_op.add_column(sa.Column("level_coefficients", sa.JSON(), nullable=True))
        batch_op.add_column(sa.Column("caen_nace_link", sa.JSON(), nullable=True))

    op.execute(
        sa.text(
            """
            UPDATE price_analysis_recipes
            SET level_coefficients = json_build_object(
                'BRONZ', coefficient_bronz,
                'ARGINT', coefficient_argint,
                'AUR', coefficient_aur,
                'PLATINUM', coefficient_platinum
            )
            """
        )
    )
    op.execute(sa.text("UPDATE price_analysis_recipes SET caen_nace_link = '{}'::json WHERE caen_nace_link IS NULL"))

    with op.batch_alter_table("price_analysis_recipes") as batch_op:
        batch_op.alter_column("level_coefficients", existing_type=sa.JSON(), nullable=False)
        batch_op.alter_column("caen_nace_link", existing_type=sa.JSON(), nullable=False)


def downgrade() -> None:
    raise NotImplementedError("Downgrade is not supported for indicator recipe extensions.")
