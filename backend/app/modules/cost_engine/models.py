from __future__ import annotations

from datetime import datetime

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, String, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class AdminPriceConfig(Base):
    __tablename__ = "admin_price_configs"
    __table_args__ = (
        UniqueConstraint(
            "service_id",
            "country_id",
            "zone_id",
            "currency",
            "legislation_code",
            name="uq_admin_price_config_context",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    service_id: Mapped[int] = mapped_column(ForeignKey("services.id", ondelete="CASCADE"), index=True)
    country_id: Mapped[int] = mapped_column(ForeignKey("countries.id", ondelete="CASCADE"), index=True)
    zone_id: Mapped[int | None] = mapped_column(
        ForeignKey("zones.id", ondelete="CASCADE"),
        index=True,
        nullable=True,
    )
    currency: Mapped[str] = mapped_column(String(3), nullable=False, index=True)
    legislation_code: Mapped[str] = mapped_column(String(32), nullable=False, index=True)
    base_price: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    legislation_coefficient: Mapped[float] = mapped_column(Float, nullable=False, default=1.0)
    zone_coefficient_override: Mapped[float | None] = mapped_column(Float, nullable=True)
    urgency_coefficient: Mapped[float] = mapped_column(Float, nullable=False, default=1.2)
    basic_level_coefficient: Mapped[float] = mapped_column(Float, nullable=False, default=1.0)
    standard_level_coefficient: Mapped[float] = mapped_column(Float, nullable=False, default=1.15)
    premium_level_coefficient: Mapped[float] = mapped_column(Float, nullable=False, default=1.3)
    indirect_cost_percentage: Mapped[float] = mapped_column(Float, nullable=False, default=0.10)
    platform_maintenance_percentage: Mapped[float] = mapped_column(Float, nullable=False, default=0.03)
    mydarrin_platform_percentage: Mapped[float] = mapped_column(Float, nullable=False, default=0.15)
    escrow_retention_percentage: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    insurance_premium_fixed: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    insurance_premium_percentage: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    darrin_management_fee_fixed: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    darrin_management_fee_percentage: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    vat_percentage: Mapped[float] = mapped_column(Float, nullable=False, default=0.21)
    minimum_order_value: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    minimum_quantity_threshold: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    platform_margin_coefficient: Mapped[float] = mapped_column(Float, nullable=False, default=0.15)
    vat_coefficient: Mapped[float] = mapped_column(Float, nullable=False, default=0.19)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )

    price_analyses: Mapped[list["PriceAnalysis"]] = relationship(back_populates="admin_price_config")


class FinancialConfig(Base):
    __tablename__ = "financial_configs"
    __table_args__ = (
        UniqueConstraint(
            "country_id",
            "zone_id",
            "locality_id",
            "service_family",
            name="uq_financial_config_scope",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    country_id: Mapped[int | None] = mapped_column(ForeignKey("countries.id", ondelete="CASCADE"), nullable=True, index=True)
    zone_id: Mapped[int | None] = mapped_column(ForeignKey("zones.id", ondelete="CASCADE"), nullable=True, index=True)
    locality_id: Mapped[int | None] = mapped_column(ForeignKey("localities.id", ondelete="SET NULL"), nullable=True, index=True)
    service_family: Mapped[str | None] = mapped_column(String(64), nullable=True, index=True)
    mydarrin_commission_percentage: Mapped[float] = mapped_column(Float, nullable=False, default=0.10)
    labor_margin_percentage: Mapped[float] = mapped_column(Float, nullable=False, default=0.15)
    material_margin_percentage: Mapped[float] = mapped_column(Float, nullable=False, default=0.10)
    rental_margin_percentage: Mapped[float] = mapped_column(Float, nullable=False, default=0.15)
    platform_fee_percentage: Mapped[float] = mapped_column(Float, nullable=False, default=0.03)
    indirect_cost_percentage: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    escrow_guarantee_percentage: Mapped[float] = mapped_column(Float, nullable=False, default=0.05)
    insurance_percentage: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    insurance_fixed_amount: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    incomplete_load_fee: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    pump_mobilization_fee: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    pump_price_per_m3: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )


class LaborRate(Base):
    __tablename__ = "labor_rates"
    __table_args__ = (
        UniqueConstraint(
            "country_id",
            "zone_id",
            "locality_id",
            "skill_code",
            name="uq_labor_rate_scope",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    country_id: Mapped[int | None] = mapped_column(ForeignKey("countries.id", ondelete="CASCADE"), nullable=True, index=True)
    zone_id: Mapped[int | None] = mapped_column(ForeignKey("zones.id", ondelete="CASCADE"), nullable=True, index=True)
    locality_id: Mapped[int | None] = mapped_column(ForeignKey("localities.id", ondelete="SET NULL"), nullable=True, index=True)
    skill_code: Mapped[str] = mapped_column(String(120), nullable=False, index=True)
    skill_label: Mapped[str] = mapped_column(String(255), nullable=False)
    ro_skill_code: Mapped[str | None] = mapped_column(String(64), nullable=True)
    esco_code: Mapped[str | None] = mapped_column(String(64), nullable=True)
    uniclass_code: Mapped[str | None] = mapped_column(String(64), nullable=True)
    deviz_indicator_series: Mapped[str | None] = mapped_column(String(32), nullable=True)
    currency: Mapped[str] = mapped_column(String(3), nullable=False, default="RON")
    base_rate: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    weekend_multiplier: Mapped[float] = mapped_column(Float, nullable=False, default=1.0)
    holiday_multiplier: Mapped[float] = mapped_column(Float, nullable=False, default=1.0)
    night_multiplier: Mapped[float] = mapped_column(Float, nullable=False, default=1.0)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )


class PriceAnalysis(Base):
    __tablename__ = "price_analyses"

    id: Mapped[int] = mapped_column(primary_key=True)
    service_id: Mapped[int] = mapped_column(ForeignKey("services.id", ondelete="CASCADE"), index=True)
    admin_price_config_id: Mapped[int] = mapped_column(
        ForeignKey("admin_price_configs.id", ondelete="CASCADE"),
        index=True,
    )
    country_id: Mapped[int] = mapped_column(ForeignKey("countries.id", ondelete="CASCADE"), index=True)
    zone_id: Mapped[int] = mapped_column(ForeignKey("zones.id", ondelete="CASCADE"), index=True)
    locality_id: Mapped[int | None] = mapped_column(ForeignKey("localities.id", ondelete="SET NULL"), index=True, nullable=True)
    currency: Mapped[str] = mapped_column(String(3), nullable=False)
    legislation_code: Mapped[str] = mapped_column(String(32), nullable=False)
    service_level: Mapped[str] = mapped_column(String(16), nullable=False)
    recipe_level: Mapped[str] = mapped_column(String(16), nullable=False, default="ARGINT")
    urgency: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    activity_count: Mapped[int] = mapped_column(nullable=False, default=0)
    subcategory_count: Mapped[int] = mapped_column(nullable=False, default=0)
    uses_recipe_engine: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    resource_subtotal: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    base_price: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    zone_coefficient: Mapped[float] = mapped_column(Float, nullable=False, default=1.0)
    urgency_coefficient: Mapped[float] = mapped_column(Float, nullable=False, default=1.0)
    service_level_coefficient: Mapped[float] = mapped_column(Float, nullable=False, default=1.0)
    legislation_coefficient: Mapped[float] = mapped_column(Float, nullable=False, default=1.0)
    indirect_cost_percentage: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    platform_maintenance_percentage: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    mydarrin_platform_percentage: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    escrow_retention_percentage: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    insurance_premium_fixed: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    insurance_premium_percentage: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    darrin_management_fee_fixed: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    darrin_management_fee_percentage: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    vat_percentage: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    platform_margin_coefficient: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    vat_coefficient: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    cost_direct_total: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    indirect_cost_value: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    platform_maintenance_value: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    mydarrin_platform_value: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    escrow_retention_value: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    insurance_premium_value: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    darrin_management_fee_value: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    adjusted_subtotal: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())

    admin_price_config: Mapped[AdminPriceConfig] = relationship(back_populates="price_analyses")
    cost_calculations: Mapped[list["CostCalculation"]] = relationship(back_populates="price_analysis")


class CostCalculation(Base):
    __tablename__ = "cost_calculations"

    id: Mapped[int] = mapped_column(primary_key=True)
    price_analysis_id: Mapped[int] = mapped_column(
        ForeignKey("price_analyses.id", ondelete="CASCADE"),
        index=True,
    )
    service_id: Mapped[int] = mapped_column(ForeignKey("services.id", ondelete="CASCADE"), index=True)
    cost_direct_total: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    indirect_cost_value: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    platform_maintenance_value: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    mydarrin_platform_value: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    escrow_retention_value: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    insurance_premium_value: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    darrin_management_fee_value: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    net_total: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    platform_margin_value: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    vat_value: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    gross_total: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    currency: Mapped[str] = mapped_column(String(3), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())

    price_analysis: Mapped[PriceAnalysis] = relationship(back_populates="cost_calculations")
    resources: Mapped[list["Resource"]] = relationship(
        back_populates="cost_calculation",
        cascade="all, delete-orphan",
    )


class Resource(Base):
    __tablename__ = "resources"

    id: Mapped[int] = mapped_column(primary_key=True)
    cost_calculation_id: Mapped[int] = mapped_column(
        ForeignKey("cost_calculations.id", ondelete="CASCADE"),
        index=True,
    )
    catalog_resource_id: Mapped[int | None] = mapped_column(nullable=True, index=True)
    activity_id: Mapped[int | None] = mapped_column(nullable=True, index=True)
    activity_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    esco_code: Mapped[str | None] = mapped_column(String(255), nullable=True)
    is_essential: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    resource_type: Mapped[str] = mapped_column(String(32), nullable=False)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    unit: Mapped[str] = mapped_column(String(24), nullable=False)
    quantity: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    unit_cost: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    total_cost: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)

    cost_calculation: Mapped[CostCalculation] = relationship(back_populates="resources")
