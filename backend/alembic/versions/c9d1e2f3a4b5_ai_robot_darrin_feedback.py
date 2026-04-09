"""ai robot darrin feedback

Revision ID: c9d1e2f3a4b5
Revises: a7b9c2d4e5f6
Create Date: 2026-03-21 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa


revision = "c9d1e2f3a4b5"
down_revision = "a7b9c2d4e5f6"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    tables = set(inspector.get_table_names())

    if "ai_robot_darrin_feedback" not in tables:
        op.create_table(
        "ai_robot_darrin_feedback",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("service_id", sa.Integer(), nullable=True),
        sa.Column("deviz_id", sa.Integer(), nullable=True),
        sa.Column("rating", sa.Integer(), nullable=False),
        sa.Column("accepted", sa.Boolean(), nullable=False),
        sa.Column("user_message", sa.String(length=1000), nullable=True),
        sa.Column("ai_summary", sa.String(length=1000), nullable=True),
        sa.Column("suggested_level", sa.String(length=16), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["deviz_id"], ["deviz_drafts.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["service_id"], ["services.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )
        op.create_index(op.f("ix_ai_robot_darrin_feedback_deviz_id"), "ai_robot_darrin_feedback", ["deviz_id"], unique=False)
        op.create_index(op.f("ix_ai_robot_darrin_feedback_service_id"), "ai_robot_darrin_feedback", ["service_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_ai_robot_darrin_feedback_service_id"), table_name="ai_robot_darrin_feedback")
    op.drop_index(op.f("ix_ai_robot_darrin_feedback_deviz_id"), table_name="ai_robot_darrin_feedback")
    op.drop_table("ai_robot_darrin_feedback")
