from __future__ import annotations

from datetime import datetime

from sqlalchemy import Boolean, DateTime, Float, Index, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class MarketplaceCommission(Base):
    __tablename__ = "marketplace_commissions"
    __table_args__ = (
        Index("ix_marketplace_commissions_category", "category"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    category: Mapped[str] = mapped_column(String(32), nullable=False, unique=True, index=True)
    min_percentage: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    max_percentage: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
