from sqlalchemy import Boolean, Float, ForeignKey, Numeric, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Country(Base):
    __tablename__ = "countries"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    name_ro: Mapped[str] = mapped_column(String(100), nullable=False, default="")
    name_en: Mapped[str] = mapped_column(String(100), nullable=False, default="")
    slug: Mapped[str] = mapped_column(String(120), unique=True, index=True, nullable=False, default="")
    code: Mapped[str] = mapped_column(String(3), unique=True, index=True, nullable=False)
    currency: Mapped[str] = mapped_column(String(3), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    zones: Mapped[list["Zone"]] = relationship(back_populates="country")
    localities: Mapped[list["Locality"]] = relationship(back_populates="country")


class Zone(Base):
    __tablename__ = "zones"
    __table_args__ = (UniqueConstraint("country_id", "slug", name="uq_zones_country_slug"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    country_id: Mapped[int] = mapped_column(ForeignKey("countries.id"), index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    name_ro: Mapped[str] = mapped_column(String(100), nullable=False, default="")
    name_en: Mapped[str] = mapped_column(String(100), nullable=False, default="")
    slug: Mapped[str] = mapped_column(String(120), nullable=False, index=True, default="")
    multiplier: Mapped[float] = mapped_column(Numeric(10, 4), nullable=False, default=1.0)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    country: Mapped[Country] = relationship(back_populates="zones")
    localities: Mapped[list["Locality"]] = relationship(back_populates="zone")


class Locality(Base):
    __tablename__ = "localities"
    __table_args__ = (
        UniqueConstraint("country_id", "zone_id", "slug", name="uq_localities_geo_slug"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    country_id: Mapped[int] = mapped_column(ForeignKey("countries.id"), nullable=False, index=True)
    zone_id: Mapped[int] = mapped_column(ForeignKey("zones.id"), nullable=False, index=True)
    name_ro: Mapped[str] = mapped_column(String(120), nullable=False)
    name_en: Mapped[str] = mapped_column(String(120), nullable=False)
    slug: Mapped[str] = mapped_column(String(150), nullable=False, index=True)
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    country: Mapped[Country] = relationship(back_populates="localities")
    zone: Mapped[Zone] = relationship(back_populates="localities")
