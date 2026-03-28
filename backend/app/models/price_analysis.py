from __future__ import annotations

from typing import TYPE_CHECKING

from datetime import datetime

from sqlalchemy import JSON, Boolean, DateTime, Float, ForeignKey, Index, String, Text, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
import app.modules.geography.models  # noqa: F401


if TYPE_CHECKING:
    from app.models.category import Category
    from app.models.domain import Domain
    from app.models.service import Service
    from app.models.subcategory import SubCategory
    from app.modules.geography.models import Country, Locality, Zone


class CatalogActivity(Base):
    __tablename__ = "catalog_activities"
    __table_args__ = (
        UniqueConstraint("uniclass_code", name="uq_catalog_activities_uniclass_code"),
        Index("ix_catalog_activities_taxonomy", "domain_id", "category_id", "subcategory_id"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    uniclass_code: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    name_ro: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    name_en: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    uom: Mapped[str] = mapped_column(String(24), nullable=False)
    domain_id: Mapped[int] = mapped_column(ForeignKey("domains.id", ondelete="CASCADE"), nullable=False, index=True)
    category_id: Mapped[int] = mapped_column(
        ForeignKey("categories.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    subcategory_id: Mapped[int] = mapped_column(
        ForeignKey("subcategories.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    description_extended: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    images: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    documents: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    videos: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    level_attachments: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)

    domain: Mapped["Domain"] = relationship("Domain")
    category: Mapped["Category"] = relationship("Category")
    subcategory: Mapped["SubCategory"] = relationship("SubCategory")
    recipes: Mapped[list["PriceAnalysisRecipe"]] = relationship(
        back_populates="activity",
        cascade="all, delete-orphan",
    )  


class Supplier(Base):
    __tablename__ = "suppliers"
    __table_args__ = (
        Index("ix_suppliers_name_active", "name", "is_active"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    rating: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    location_geo: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    resources: Mapped[list["CatalogResource"]] = relationship(back_populates="supplier")


class TaxRule(Base):
    __tablename__ = "tax_rules"
    __table_args__ = (
        UniqueConstraint("country_code", "locality_slug", "service_type", name="uq_tax_rules_scope"),
        Index("ix_tax_rules_lookup", "country_code", "locality_slug", "service_type", "is_active"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    country_code: Mapped[str] = mapped_column(String(3), nullable=False, index=True)
    locality_slug: Mapped[str | None] = mapped_column(String(150), nullable=True, index=True)
    service_type: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    vat_percentage: Mapped[float] = mapped_column(Float, nullable=False, default=0.19)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)


class CatalogResource(Base):
    __tablename__ = "catalog_resources"
    __table_args__ = (
        Index("ix_catalog_resources_type_price", "resource_type", "base_price"),
        Index("ix_catalog_resources_supplier_availability", "supplier_id", "availability_status", "stock_qty"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    supplier_id: Mapped[int | None] = mapped_column(ForeignKey("suppliers.id", ondelete="SET NULL"), nullable=True, index=True)
    esco_code: Mapped[str | None] = mapped_column(String(255), nullable=True, index=True)
    name_ro: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    name_en: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    resource_type: Mapped[str] = mapped_column(String(32), nullable=False, index=True)
    base_price: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    unit: Mapped[str] = mapped_column(String(24), nullable=False)
    lead_time_days: Mapped[int | None] = mapped_column(nullable=True)
    stock_qty: Mapped[float | None] = mapped_column(Float, nullable=True)
    availability_status: Mapped[str] = mapped_column(String(32), nullable=False, default="IN_STOCK")
    technical_specs: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    supplier: Mapped["Supplier | None"] = relationship(back_populates="resources")
    recipes: Mapped[list["PriceAnalysisRecipe"]] = relationship(
        back_populates="resource",
        cascade="all, delete-orphan",
    )
    price_configs: Mapped[list["AdminResourcePriceConfig"]] = relationship(
        back_populates="resource",
        cascade="all, delete-orphan",
    )


class AdminResourcePriceConfig(Base):
    __tablename__ = "admin_resource_price_configs"
    __table_args__ = (
        UniqueConstraint(
            "resource_id",
            "country_id",
            "zone_id",
            "locality_id",
            "currency",
            "legislation_code",
            name="uq_admin_resource_price_config_context",
        ),
        Index("ix_admin_resource_price_configs_context", "resource_id", "country_id", "zone_id", "locality_id"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    resource_id: Mapped[int] = mapped_column(
        ForeignKey("catalog_resources.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    country_id: Mapped[int] = mapped_column(ForeignKey("countries.id", ondelete="CASCADE"), nullable=False, index=True)
    zone_id: Mapped[int | None] = mapped_column(ForeignKey("zones.id", ondelete="CASCADE"), nullable=True, index=True)
    locality_id: Mapped[int | None] = mapped_column(
        ForeignKey("localities.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )
    currency: Mapped[str] = mapped_column(String(3), nullable=False, index=True)
    base_price: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    zone_multiplier: Mapped[float] = mapped_column(Float, nullable=False, default=1.0)
    legislation_code: Mapped[str] = mapped_column(String(32), nullable=False, index=True)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    resource: Mapped[CatalogResource] = relationship(back_populates="price_configs")
    country: Mapped["Country"] = relationship("Country")
    zone: Mapped["Zone | None"] = relationship("Zone")
    locality: Mapped["Locality | None"] = relationship("Locality")


class PriceAnalysisRecipe(Base):
    __tablename__ = "price_analysis_recipes"
    __table_args__ = (
        UniqueConstraint("activity_id", "resource_id", name="uq_price_analysis_recipe_activity_resource"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    activity_id: Mapped[int] = mapped_column(
        ForeignKey("catalog_activities.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    resource_id: Mapped[int] = mapped_column(
        ForeignKey("catalog_resources.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    specific_consumption: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    productivity_norm: Mapped[float | None] = mapped_column(Float, nullable=True)
    indicator_code: Mapped[str | None] = mapped_column(String(64), nullable=True, index=True)
    consumption_unit: Mapped[str | None] = mapped_column(String(24), nullable=True)
    waste_percentage: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    waste_formula: Mapped[str | None] = mapped_column(String(255), nullable=True)
    coefficient_bronz: Mapped[float] = mapped_column(Float, nullable=False, default=1.0)
    coefficient_argint: Mapped[float] = mapped_column(Float, nullable=False, default=1.1)
    coefficient_aur: Mapped[float] = mapped_column(Float, nullable=False, default=1.2)
    coefficient_platinum: Mapped[float] = mapped_column(Float, nullable=False, default=1.35)
    level_coefficients: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    caen_nace_link: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    is_essential: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    activity: Mapped[CatalogActivity] = relationship(back_populates="recipes")
    resource: Mapped[CatalogResource] = relationship(back_populates="recipes")


class EntityAttachment(Base):
    __tablename__ = "entity_attachments"
    __table_args__ = (
        Index("ix_entity_attachments_entity", "entity_type", "entity_id"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    entity_type: Mapped[str] = mapped_column(String(32), nullable=False, index=True)
    entity_id: Mapped[int] = mapped_column(nullable=False, index=True)
    attachment_type: Mapped[str] = mapped_column(String(16), nullable=False, index=True)
    level_name: Mapped[str | None] = mapped_column(String(16), nullable=True, index=True)
    file_name: Mapped[str] = mapped_column(String(255), nullable=False)
    mime_type: Mapped[str] = mapped_column(String(255), nullable=False)
    storage_key: Mapped[str] = mapped_column(String(512), nullable=False, unique=True)
    secure_url: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
