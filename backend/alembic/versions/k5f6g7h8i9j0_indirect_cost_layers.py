"""indirect cost layers

Revision ID: k5f6g7h8i9j0
Revises: j4e5f6g7h8i9
Create Date: 2026-03-22 20:05:00.000000
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "k5f6g7h8i9j0"
down_revision = "j4e5f6g7h8i9"
branch_labels = None
depends_on = None


def upgrade() -> None:
    for table_name in ("admin_price_configs",):
        op.add_column(table_name, sa.Column("indirect_cost_percentage", sa.Float(), nullable=False, server_default="0.10"))
        op.add_column(table_name, sa.Column("platform_maintenance_percentage", sa.Float(), nullable=False, server_default="0.03"))
        op.add_column(table_name, sa.Column("mydarrin_platform_percentage", sa.Float(), nullable=False, server_default="0.15"))
        op.add_column(table_name, sa.Column("vat_percentage", sa.Float(), nullable=False, server_default="0.21"))

    for table_name in ("price_analyses",):
        op.add_column(table_name, sa.Column("indirect_cost_percentage", sa.Float(), nullable=False, server_default="0"))
        op.add_column(table_name, sa.Column("platform_maintenance_percentage", sa.Float(), nullable=False, server_default="0"))
        op.add_column(table_name, sa.Column("mydarrin_platform_percentage", sa.Float(), nullable=False, server_default="0"))
        op.add_column(table_name, sa.Column("vat_percentage", sa.Float(), nullable=False, server_default="0"))
        op.add_column(table_name, sa.Column("cost_direct_total", sa.Float(), nullable=False, server_default="0"))
        op.add_column(table_name, sa.Column("indirect_cost_value", sa.Float(), nullable=False, server_default="0"))
        op.add_column(table_name, sa.Column("platform_maintenance_value", sa.Float(), nullable=False, server_default="0"))
        op.add_column(table_name, sa.Column("mydarrin_platform_value", sa.Float(), nullable=False, server_default="0"))

    for table_name in ("cost_calculations",):
        op.add_column(table_name, sa.Column("cost_direct_total", sa.Float(), nullable=False, server_default="0"))
        op.add_column(table_name, sa.Column("indirect_cost_value", sa.Float(), nullable=False, server_default="0"))
        op.add_column(table_name, sa.Column("platform_maintenance_value", sa.Float(), nullable=False, server_default="0"))
        op.add_column(table_name, sa.Column("mydarrin_platform_value", sa.Float(), nullable=False, server_default="0"))

    for table_name in ("deviz_levels",):
        op.add_column(table_name, sa.Column("cost_direct_total", sa.Float(), nullable=False, server_default="0"))
        op.add_column(table_name, sa.Column("indirect_cost_value", sa.Float(), nullable=False, server_default="0"))
        op.add_column(table_name, sa.Column("platform_maintenance_value", sa.Float(), nullable=False, server_default="0"))
        op.add_column(table_name, sa.Column("mydarrin_platform_value", sa.Float(), nullable=False, server_default="0"))

    for table_name in ("deviz_calculations",):
        op.add_column(table_name, sa.Column("cost_direct_total", sa.Float(), nullable=False, server_default="0"))
        op.add_column(table_name, sa.Column("indirect_cost_value", sa.Float(), nullable=False, server_default="0"))
        op.add_column(table_name, sa.Column("platform_maintenance_value", sa.Float(), nullable=False, server_default="0"))
        op.add_column(table_name, sa.Column("mydarrin_platform_value", sa.Float(), nullable=False, server_default="0"))

    op.execute(
        """
        UPDATE admin_price_configs
        SET indirect_cost_percentage = 0.10,
            platform_maintenance_percentage = 0.03,
            mydarrin_platform_percentage = 0.15,
            vat_percentage = 0.21,
            platform_margin_coefficient = 0.15,
            vat_coefficient = 0.21
        """
    )
    op.execute(
        """
        UPDATE price_analyses
        SET indirect_cost_percentage = 0.10,
            platform_maintenance_percentage = 0.03,
            mydarrin_platform_percentage = 0.15,
            vat_percentage = 0.21,
            cost_direct_total = adjusted_subtotal,
            indirect_cost_value = ROUND(CAST(adjusted_subtotal * 0.10 AS numeric), 2),
            platform_maintenance_value = ROUND(CAST(adjusted_subtotal * 0.03 AS numeric), 2),
            mydarrin_platform_value = ROUND(CAST(adjusted_subtotal * 0.15 AS numeric), 2),
            platform_margin_coefficient = 0.15,
            vat_coefficient = 0.21
        """
    )
    op.execute(
        """
        UPDATE cost_calculations c
        SET cost_direct_total = p.adjusted_subtotal,
            indirect_cost_value = ROUND(CAST(p.adjusted_subtotal * 0.10 AS numeric), 2),
            platform_maintenance_value = ROUND(CAST(p.adjusted_subtotal * 0.03 AS numeric), 2),
            mydarrin_platform_value = ROUND(CAST(p.adjusted_subtotal * 0.15 AS numeric), 2),
            platform_margin_value = ROUND(CAST(p.adjusted_subtotal * 0.15 AS numeric), 2),
            net_total = ROUND(CAST(p.adjusted_subtotal + p.adjusted_subtotal * 0.10 + p.adjusted_subtotal * 0.03 + p.adjusted_subtotal * 0.15 AS numeric), 2),
            vat_value = ROUND(CAST((p.adjusted_subtotal + p.adjusted_subtotal * 0.10 + p.adjusted_subtotal * 0.03 + p.adjusted_subtotal * 0.15) * 0.21 AS numeric), 2),
            gross_total = ROUND(CAST((p.adjusted_subtotal + p.adjusted_subtotal * 0.10 + p.adjusted_subtotal * 0.03 + p.adjusted_subtotal * 0.15) * 1.21 AS numeric), 2)
        FROM price_analyses p
        WHERE c.price_analysis_id = p.id
        """
    )
    op.execute(
        """
        UPDATE deviz_levels
        SET cost_direct_total = ROUND(CAST(net_total / 1.28 AS numeric), 2),
            indirect_cost_value = ROUND(CAST((net_total / 1.28) * 0.10 AS numeric), 2),
            platform_maintenance_value = ROUND(CAST((net_total / 1.28) * 0.03 AS numeric), 2),
            mydarrin_platform_value = ROUND(CAST((net_total / 1.28) * 0.15 AS numeric), 2)
        """
    )
    op.execute(
        """
        UPDATE deviz_calculations
        SET cost_direct_total = ROUND(CAST(base_net_total / 1.28 AS numeric), 2),
            indirect_cost_value = ROUND(CAST((base_net_total / 1.28) * 0.10 AS numeric), 2),
            platform_maintenance_value = ROUND(CAST((base_net_total / 1.28) * 0.03 AS numeric), 2),
            mydarrin_platform_value = ROUND(CAST((base_net_total / 1.28) * 0.15 AS numeric), 2)
        """
    )


def downgrade() -> None:
    for table_name, columns in (
        ("deviz_calculations", ["mydarrin_platform_value", "platform_maintenance_value", "indirect_cost_value", "cost_direct_total"]),
        ("deviz_levels", ["mydarrin_platform_value", "platform_maintenance_value", "indirect_cost_value", "cost_direct_total"]),
        ("cost_calculations", ["mydarrin_platform_value", "platform_maintenance_value", "indirect_cost_value", "cost_direct_total"]),
        ("price_analyses", ["mydarrin_platform_value", "platform_maintenance_value", "indirect_cost_value", "cost_direct_total", "vat_percentage", "mydarrin_platform_percentage", "platform_maintenance_percentage", "indirect_cost_percentage"]),
        ("admin_price_configs", ["vat_percentage", "mydarrin_platform_percentage", "platform_maintenance_percentage", "indirect_cost_percentage"]),
    ):
        for column in columns:
            op.drop_column(table_name, column)
