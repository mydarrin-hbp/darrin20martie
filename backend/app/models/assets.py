from __future__ import annotations

from datetime import datetime

from sqlalchemy import JSON, Boolean, DateTime, ForeignKey, Index, String, Text, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class AssetType(Base):
    __tablename__ = "asset_types"
    __table_args__ = (
        Index("ix_asset_types_family_active", "asset_family", "is_active"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(120), unique=True, index=True, nullable=False)
    name_ro: Mapped[str] = mapped_column(String(150), nullable=False, index=True)
    name_en: Mapped[str] = mapped_column(String(150), nullable=False, index=True)
    asset_family: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    technical_schema: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    assets: Mapped[list["Asset"]] = relationship(back_populates="asset_type")
    task_rules: Mapped[list["AssetTaskRule"]] = relationship(
        back_populates="asset_type",
        cascade="all, delete-orphan",
    )
    provider_capabilities: Mapped[list["ProviderCapability"]] = relationship(back_populates="asset_type")


class Asset(Base):
    __tablename__ = "assets"
    __table_args__ = (
        Index("ix_assets_asset_type_warranty", "asset_type_id", "warranty_status"),
        Index("ix_assets_category_external_ref", "category_id", "external_ref"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    asset_id: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)
    asset_type_id: Mapped[int] = mapped_column(
        ForeignKey("asset_types.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    category_id: Mapped[int] = mapped_column(
        ForeignKey("categories.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    service_id: Mapped[int | None] = mapped_column(
        ForeignKey("services.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    external_ref: Mapped[str | None] = mapped_column(String(128), nullable=True, index=True)
    display_name: Mapped[str] = mapped_column(String(255), nullable=False)
    technical_specs: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    maintenance_history_id: Mapped[str | None] = mapped_column(String(64), nullable=True, index=True)
    warranty_status: Mapped[str] = mapped_column(String(32), nullable=False, default="UNKNOWN")
    manufacturer: Mapped[str | None] = mapped_column(String(255), nullable=True)
    model: Mapped[str | None] = mapped_column(String(255), nullable=True)
    serial_number: Mapped[str | None] = mapped_column(String(255), nullable=True, index=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )

    asset_type: Mapped["AssetType"] = relationship(back_populates="assets")


class TaskType(Base):
    __tablename__ = "task_types"
    __table_args__ = (
        Index("ix_task_types_operation_active", "operation_kind", "is_active"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(120), unique=True, index=True, nullable=False)
    name_ro: Mapped[str] = mapped_column(String(150), nullable=False, index=True)
    name_en: Mapped[str] = mapped_column(String(150), nullable=False, index=True)
    operation_kind: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    required_caen_code: Mapped[str | None] = mapped_column(String(16), nullable=True, index=True)
    required_certification_codes: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    requires_certification: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    task_rules: Mapped[list["AssetTaskRule"]] = relationship(
        back_populates="task_type",
        cascade="all, delete-orphan",
    )
    provider_capabilities: Mapped[list["ProviderCapability"]] = relationship(back_populates="task_type")


class AssetTaskRule(Base):
    __tablename__ = "asset_task_rules"
    __table_args__ = (
        UniqueConstraint("asset_type_id", "task_type_id", name="uq_asset_task_rule_pair"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    asset_type_id: Mapped[int] = mapped_column(
        ForeignKey("asset_types.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    task_type_id: Mapped[int] = mapped_column(
        ForeignKey("task_types.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    service_id: Mapped[int | None] = mapped_column(
        ForeignKey("services.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    activity_id: Mapped[int | None] = mapped_column(
        ForeignKey("catalog_activities.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    is_default: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    rule_payload: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)

    asset_type: Mapped["AssetType"] = relationship(back_populates="task_rules")
    task_type: Mapped["TaskType"] = relationship(back_populates="task_rules")


class ProviderCapability(Base):
    __tablename__ = "provider_capabilities"
    __table_args__ = (
        UniqueConstraint("supplier_id", "task_type_id", "asset_type_id", "caen_code", name="uq_provider_capability_scope"),
        Index("ix_provider_capabilities_active", "supplier_id", "task_type_id", "is_active"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    supplier_id: Mapped[int] = mapped_column(
        ForeignKey("suppliers.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    task_type_id: Mapped[int] = mapped_column(
        ForeignKey("task_types.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    asset_type_id: Mapped[int | None] = mapped_column(
        ForeignKey("asset_types.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    caen_code: Mapped[str] = mapped_column(String(16), nullable=False, index=True)
    certification_codes: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    can_lead_package: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    supplier = relationship("Supplier", back_populates="capabilities")
    task_type: Mapped["TaskType"] = relationship(back_populates="provider_capabilities")
    asset_type: Mapped["AssetType | None"] = relationship(back_populates="provider_capabilities")


class ProviderAvailabilitySlot(Base):
    __tablename__ = "provider_availability_slots"
    __table_args__ = (
        UniqueConstraint("supplier_id", "scheduled_slot", "locality_slug", name="uq_provider_slot_locality"),
        Index("ix_provider_availability_lookup", "supplier_id", "scheduled_slot", "locality_slug", "is_available"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    supplier_id: Mapped[int] = mapped_column(
        ForeignKey("suppliers.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    locality_slug: Mapped[str | None] = mapped_column(String(150), nullable=True, index=True)
    scheduled_slot: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    slot_role: Mapped[str] = mapped_column(String(32), nullable=False, index=True)
    is_available: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    supplier = relationship("Supplier", back_populates="availability_slots")
