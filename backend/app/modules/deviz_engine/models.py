from __future__ import annotations

from datetime import datetime

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class AdminDevizRule(Base):
    __tablename__ = "admin_deviz_rules"
    __table_args__ = (
        UniqueConstraint(
            "service_id",
            "country_id",
            "level_name",
            name="uq_admin_deviz_rule_context",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    service_id: Mapped[int | None] = mapped_column(
        ForeignKey("services.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )
    country_id: Mapped[int | None] = mapped_column(
        ForeignKey("countries.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )
    level_name: Mapped[str] = mapped_column(String(16), nullable=False, index=True)
    label: Mapped[str] = mapped_column(String(40), nullable=False)
    multiplier: Mapped[float] = mapped_column(Float, nullable=False)
    description: Mapped[str | None] = mapped_column(String(255), nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )


class DevizDraft(Base):
    __tablename__ = "deviz_drafts"

    id: Mapped[int] = mapped_column(primary_key=True)
    service_id: Mapped[int] = mapped_column(ForeignKey("services.id", ondelete="CASCADE"), index=True)
    country_id: Mapped[int] = mapped_column(ForeignKey("countries.id", ondelete="CASCADE"), index=True)
    zone_id: Mapped[int] = mapped_column(ForeignKey("zones.id", ondelete="CASCADE"), index=True)
    locality_id: Mapped[int | None] = mapped_column(ForeignKey("localities.id", ondelete="SET NULL"), index=True, nullable=True)
    currency: Mapped[str] = mapped_column(String(3), nullable=False)
    legislation_code: Mapped[str] = mapped_column(String(32), nullable=False)
    urgency: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    source_message: Mapped[str | None] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())

    levels: Mapped[list["DevizLevel"]] = relationship(
        back_populates="draft",
        cascade="all, delete-orphan",
        order_by="DevizLevel.sort_order",
    )
    calculations: Mapped[list["DevizCalculation"]] = relationship(
        back_populates="draft",
        cascade="all, delete-orphan",
    )


class DevizLevel(Base):
    __tablename__ = "deviz_levels"

    id: Mapped[int] = mapped_column(primary_key=True)
    draft_id: Mapped[int] = mapped_column(ForeignKey("deviz_drafts.id", ondelete="CASCADE"), index=True)
    level_name: Mapped[str] = mapped_column(String(16), nullable=False)
    label: Mapped[str] = mapped_column(String(40), nullable=False)
    description: Mapped[str | None] = mapped_column(String(255), nullable=True)
    multiplier: Mapped[float] = mapped_column(Float, nullable=False)
    cost_direct_total: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    indirect_cost_value: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    platform_maintenance_value: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    mydarrin_platform_value: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    net_total: Mapped[float] = mapped_column(Float, nullable=False)
    vat_value: Mapped[float] = mapped_column(Float, nullable=False)
    gross_total: Mapped[float] = mapped_column(Float, nullable=False)
    recommended: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    draft: Mapped[DevizDraft] = relationship(back_populates="levels")


class DevizCalculation(Base):
    __tablename__ = "deviz_calculations"

    id: Mapped[int] = mapped_column(primary_key=True)
    draft_id: Mapped[int] = mapped_column(ForeignKey("deviz_drafts.id", ondelete="CASCADE"), index=True)
    cost_calculation_id: Mapped[int] = mapped_column(
        ForeignKey("cost_calculations.id", ondelete="CASCADE"),
        index=True,
    )
    recommended_level_name: Mapped[str] = mapped_column(String(16), nullable=False)
    cost_direct_total: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    indirect_cost_value: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    platform_maintenance_value: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    mydarrin_platform_value: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    base_net_total: Mapped[float] = mapped_column(Float, nullable=False)
    base_vat_value: Mapped[float] = mapped_column(Float, nullable=False)
    base_gross_total: Mapped[float] = mapped_column(Float, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())

    draft: Mapped[DevizDraft] = relationship(back_populates="calculations")
