"""service subcategories many to many

Revision ID: e1a2f8c9b7d1
Revises: dc1d51e2647d
Create Date: 2026-03-21 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa


revision = "e1a2f8c9b7d1"
down_revision = "dc1d51e2647d"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    table_names = inspector.get_table_names()

    if "service_subcategories" not in table_names:
        op.create_table(
            "service_subcategories",
            sa.Column("service_id", sa.Integer(), nullable=False),
            sa.Column("subcategory_id", sa.Integer(), nullable=False),
            sa.ForeignKeyConstraint(["service_id"], ["services.id"], ondelete="CASCADE"),
            sa.ForeignKeyConstraint(["subcategory_id"], ["subcategories.id"], ondelete="CASCADE"),
            sa.PrimaryKeyConstraint("service_id", "subcategory_id"),
        )

    service_columns = {column["name"] for column in inspector.get_columns("services")}
    if "subcategory_id" in service_columns:
        op.execute(
            """
            INSERT INTO service_subcategories (service_id, subcategory_id)
            SELECT id, subcategory_id
            FROM services
            WHERE subcategory_id IS NOT NULL
            """
        )

        service_indexes = {index["name"] for index in inspector.get_indexes("services")}
        with op.batch_alter_table("services") as batch_op:
            if "ix_services_subcategory_id" in service_indexes:
                batch_op.drop_index("ix_services_subcategory_id")
            batch_op.drop_column("subcategory_id")


def downgrade() -> None:
    with op.batch_alter_table("services") as batch_op:
        batch_op.add_column(sa.Column("subcategory_id", sa.Integer(), nullable=True))
        batch_op.create_foreign_key(
            "fk_services_subcategory_id_subcategories",
            "subcategories",
            ["subcategory_id"],
            ["id"],
            ondelete="SET NULL",
        )
        batch_op.create_index("ix_services_subcategory_id", ["subcategory_id"], unique=False)

    op.execute(
        """
        UPDATE services
        SET subcategory_id = (
            SELECT MIN(ss.subcategory_id)
            FROM service_subcategories ss
            WHERE ss.service_id = services.id
        )
        """
    )

    op.drop_table("service_subcategories")
