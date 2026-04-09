"""ai robot darrin rag full

Revision ID: d4e5f6a7b8c9
Revises: c9d1e2f3a4b5
Create Date: 2026-03-21 00:30:00.000000
"""

from alembic import op
import sqlalchemy as sa


revision = "d4e5f6a7b8c9"
down_revision = "c9d1e2f3a4b5"
branch_labels = None
depends_on = None


def _get_columns(inspector: sa.Inspector, table_name: str) -> set[str]:
    return {column["name"] for column in inspector.get_columns(table_name)}


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    tables = set(inspector.get_table_names())

    if "ai_robot_darrin_documents" not in tables:
        op.create_table(
            "ai_robot_darrin_documents",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("source_type", sa.String(length=32), nullable=False),
            sa.Column("source_key", sa.String(length=120), nullable=False),
            sa.Column("title", sa.String(length=255), nullable=False),
            sa.Column("content", sa.Text(), nullable=False),
            sa.Column("metadata_json", sa.Text(), nullable=True),
            sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
            sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
            sa.PrimaryKeyConstraint("id"),
            sa.UniqueConstraint("source_type", "source_key", name="uq_ai_robot_darrin_document_source"),
        )
        op.create_index(op.f("ix_ai_robot_darrin_documents_source_type"), "ai_robot_darrin_documents", ["source_type"], unique=False)

    if "ai_robot_darrin_feedback" in tables:
        columns = _get_columns(inspector, "ai_robot_darrin_feedback")
        with op.batch_alter_table("ai_robot_darrin_feedback") as batch_op:
            if "resolution_notes" not in columns:
                batch_op.add_column(sa.Column("resolution_notes", sa.String(length=1000), nullable=True))
            if "prompt_snapshot" not in columns:
                batch_op.add_column(sa.Column("prompt_snapshot", sa.Text(), nullable=True))
            if "rag_sources" not in columns:
                batch_op.add_column(sa.Column("rag_sources", sa.Text(), nullable=True))
            if "used_in_learning" not in columns:
                batch_op.add_column(
                    sa.Column("used_in_learning", sa.Boolean(), nullable=False, server_default=sa.false())
                )

    if bind.dialect.name == "sqlite":
        op.execute(
            """
            CREATE VIRTUAL TABLE IF NOT EXISTS ai_robot_darrin_documents_fts
            USING fts5(title, content, source_type, source_key, content='ai_robot_darrin_documents', content_rowid='id')
            """
        )
        op.execute(
            """
            CREATE TRIGGER IF NOT EXISTS ai_robot_darrin_documents_ai
            AFTER INSERT ON ai_robot_darrin_documents
            BEGIN
                INSERT INTO ai_robot_darrin_documents_fts(rowid, title, content, source_type, source_key)
                VALUES (new.id, new.title, new.content, new.source_type, new.source_key);
            END
            """
        )
        op.execute(
            """
            CREATE TRIGGER IF NOT EXISTS ai_robot_darrin_documents_ad
            AFTER DELETE ON ai_robot_darrin_documents
            BEGIN
                INSERT INTO ai_robot_darrin_documents_fts(ai_robot_darrin_documents_fts, rowid, title, content, source_type, source_key)
                VALUES('delete', old.id, old.title, old.content, old.source_type, old.source_key);
            END
            """
        )
        op.execute(
            """
            CREATE TRIGGER IF NOT EXISTS ai_robot_darrin_documents_au
            AFTER UPDATE ON ai_robot_darrin_documents
            BEGIN
                INSERT INTO ai_robot_darrin_documents_fts(ai_robot_darrin_documents_fts, rowid, title, content, source_type, source_key)
                VALUES('delete', old.id, old.title, old.content, old.source_type, old.source_key);
                INSERT INTO ai_robot_darrin_documents_fts(rowid, title, content, source_type, source_key)
                VALUES (new.id, new.title, new.content, new.source_type, new.source_key);
            END
            """
        )


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    tables = set(inspector.get_table_names())

    if bind.dialect.name == "sqlite":
        op.execute("DROP TRIGGER IF EXISTS ai_robot_darrin_documents_au")
        op.execute("DROP TRIGGER IF EXISTS ai_robot_darrin_documents_ad")
        op.execute("DROP TRIGGER IF EXISTS ai_robot_darrin_documents_ai")
        op.execute("DROP TABLE IF EXISTS ai_robot_darrin_documents_fts")

    if "ai_robot_darrin_feedback" in tables:
        columns = _get_columns(inspector, "ai_robot_darrin_feedback")
        with op.batch_alter_table("ai_robot_darrin_feedback") as batch_op:
            if "used_in_learning" in columns:
                batch_op.drop_column("used_in_learning")
            if "rag_sources" in columns:
                batch_op.drop_column("rag_sources")
            if "prompt_snapshot" in columns:
                batch_op.drop_column("prompt_snapshot")
            if "resolution_notes" in columns:
                batch_op.drop_column("resolution_notes")

    if "ai_robot_darrin_documents" in tables:
        op.drop_index(op.f("ix_ai_robot_darrin_documents_source_type"), table_name="ai_robot_darrin_documents")
        op.drop_table("ai_robot_darrin_documents")
