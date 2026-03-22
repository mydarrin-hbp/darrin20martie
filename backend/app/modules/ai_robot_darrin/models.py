from __future__ import annotations

from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, String, Text, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class AIRobotDarrinDocument(Base):
    __tablename__ = "ai_robot_darrin_documents"
    __table_args__ = (
        UniqueConstraint("source_type", "source_key", name="uq_ai_robot_darrin_document_source"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    source_type: Mapped[str] = mapped_column(String(32), nullable=False, index=True)
    source_key: Mapped[str] = mapped_column(String(120), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    metadata_json: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )


class AIRobotDarrinFeedback(Base):
    __tablename__ = "ai_robot_darrin_feedback"

    id: Mapped[int] = mapped_column(primary_key=True)
    service_id: Mapped[int | None] = mapped_column(ForeignKey("services.id", ondelete="SET NULL"), nullable=True, index=True)
    deviz_id: Mapped[int | None] = mapped_column(ForeignKey("deviz_drafts.id", ondelete="SET NULL"), nullable=True, index=True)
    rating: Mapped[int] = mapped_column(nullable=False, default=0)
    accepted: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    user_message: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    ai_summary: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    suggested_level: Mapped[str | None] = mapped_column(String(16), nullable=True)
    resolution_notes: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    prompt_snapshot: Mapped[str | None] = mapped_column(Text, nullable=True)
    rag_sources: Mapped[str | None] = mapped_column(Text, nullable=True)
    used_in_learning: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
