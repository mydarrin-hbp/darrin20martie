from __future__ import annotations

from datetime import datetime

from sqlalchemy import JSON, Boolean, DateTime, Float, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Order(Base):
    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(primary_key=True)
    order_ref: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)
    service_id: Mapped[int] = mapped_column(ForeignKey("services.id", ondelete="CASCADE"), index=True)
    client_user_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"),
        index=True,
        nullable=True,
    )
    deviz_draft_id: Mapped[int | None] = mapped_column(
        ForeignKey("deviz_drafts.id", ondelete="SET NULL"),
        index=True,
        nullable=True,
    )
    asset_id: Mapped[int | None] = mapped_column(ForeignKey("assets.id", ondelete="SET NULL"), index=True, nullable=True)
    work_package_id: Mapped[int | None] = mapped_column(
        ForeignKey("work_packages.id", ondelete="SET NULL"),
        index=True,
        nullable=True,
    )
    status: Mapped[str] = mapped_column(String(64), nullable=False, default="PENDING_PROVIDER_SELECTION", index=True)
    target_address: Mapped[str] = mapped_column(String(255), nullable=False)
    country_code: Mapped[str] = mapped_column(String(8), nullable=False, index=True)
    zone_slug: Mapped[str] = mapped_column(String(150), nullable=False, index=True)
    locality_slug: Mapped[str | None] = mapped_column(String(150), nullable=True, index=True)
    requested_quantity: Mapped[float | None] = mapped_column(Float, nullable=True)
    asset_label: Mapped[str | None] = mapped_column(String(150), nullable=True)
    intervention_label: Mapped[str | None] = mapped_column(String(120), nullable=True)
    task_label: Mapped[str | None] = mapped_column(String(255), nullable=True)
    skill_label: Mapped[str | None] = mapped_column(String(150), nullable=True)
    required_people: Mapped[int | None] = mapped_column(Integer, nullable=True)
    esco_codes: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    nace_codes: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    required_certification_codes: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    standard_consumables: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    currency: Mapped[str] = mapped_column(String(8), nullable=False)
    currency_symbol: Mapped[str | None] = mapped_column(String(16), nullable=True)
    cost_direct: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    cost_regie: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    mentenanta_platforma: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    venit_platforma: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    garantie_buna_executie: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    insurance_premium: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    darrin_management_fee: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    tva: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    total_facturabil: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    escrow_status: Mapped[str] = mapped_column(String(32), nullable=False, default="NOT_REQUIRED", index=True)
    escrow_blocked_amount: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )
    provider_ref: Mapped[str | None] = mapped_column(String(120), nullable=True)
    provider_name: Mapped[str | None] = mapped_column(String(255), nullable=True)

    documents: Mapped[list["OrderDocument"]] = relationship(
        back_populates="order",
        cascade="all, delete-orphan",
    )
    reviews: Mapped[list["OrderReview"]] = relationship(
        back_populates="order",
        cascade="all, delete-orphan",
    )
    broadcasts: Mapped[list["OrderBroadcast"]] = relationship(
        back_populates="order",
        cascade="all, delete-orphan",
    )
    work_package: Mapped["WorkPackage | None"] = relationship(back_populates="orders")


class WorkPackage(Base):
    __tablename__ = "work_packages"

    id: Mapped[int] = mapped_column(primary_key=True)
    package_ref: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)
    package_type: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    status: Mapped[str] = mapped_column(String(64), nullable=False, default="DRAFT", index=True)
    target_address: Mapped[str] = mapped_column(String(255), nullable=False)
    locality_slug: Mapped[str | None] = mapped_column(String(150), nullable=True, index=True)
    scheduled_slot: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    material_supplier_id: Mapped[int | None] = mapped_column(ForeignKey("suppliers.id", ondelete="SET NULL"), nullable=True, index=True)
    equipment_supplier_id: Mapped[int | None] = mapped_column(ForeignKey("suppliers.id", ondelete="SET NULL"), nullable=True, index=True)
    umbrella_owner: Mapped[str] = mapped_column(String(64), nullable=False, default="MY_DARRIN")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())

    orders: Mapped[list["Order"]] = relationship(back_populates="work_package")


class OrderDocument(Base):
    __tablename__ = "order_documents"

    id: Mapped[int] = mapped_column(primary_key=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id", ondelete="CASCADE"), index=True, nullable=False)
    document_type: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    status: Mapped[str] = mapped_column(String(32), nullable=False, default="GENERATED", index=True)
    mime_type: Mapped[str] = mapped_column(String(120), nullable=False, default="application/pdf")
    storage_key: Mapped[str] = mapped_column(String(255), nullable=False, unique=True, index=True)
    file_name: Mapped[str] = mapped_column(String(255), nullable=False)
    placeholder_content: Mapped[str] = mapped_column(Text, nullable=False)
    generated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())

    order: Mapped["Order"] = relationship(back_populates="documents")


class OrderBroadcast(Base):
    __tablename__ = "order_broadcasts"

    id: Mapped[int] = mapped_column(primary_key=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id", ondelete="CASCADE"), index=True, nullable=False)
    supplier_id: Mapped[int] = mapped_column(ForeignKey("suppliers.id", ondelete="CASCADE"), index=True, nullable=False)
    task_scope: Mapped[str] = mapped_column(String(64), nullable=False, default="GENERAL")
    claim_status: Mapped[str] = mapped_column(String(32), nullable=False, default="PENDING", index=True)
    can_cover_full_package: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    locality_slug: Mapped[str | None] = mapped_column(String(150), nullable=True, index=True)
    priority_expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    claimed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())

    order: Mapped["Order"] = relationship(back_populates="broadcasts")


class OrderReview(Base):
    __tablename__ = "order_reviews"

    id: Mapped[int] = mapped_column(primary_key=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id", ondelete="CASCADE"), index=True, nullable=False)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), index=True, nullable=True)
    rating: Mapped[int] = mapped_column(Integer, nullable=False)
    feedback: Mapped[str] = mapped_column(Text, nullable=False)
    is_visible: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, index=True)
    admin_note: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())

    order: Mapped["Order"] = relationship(back_populates="reviews")
