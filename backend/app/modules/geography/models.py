from sqlalchemy import ForeignKey, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Country(Base):
    __tablename__ = "countries"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    code: Mapped[str] = mapped_column(String(3), unique=True, index=True, nullable=False)
    currency: Mapped[str] = mapped_column(String(3), nullable=False)

    zones: Mapped[list["Zone"]] = relationship(back_populates="country")


class Zone(Base):
    __tablename__ = "zones"

    id: Mapped[int] = mapped_column(primary_key=True)
    country_id: Mapped[int] = mapped_column(ForeignKey("countries.id"), index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    multiplier: Mapped[float] = mapped_column(Numeric(10, 4), nullable=False, default=1.0)

    country: Mapped[Country] = relationship(back_populates="zones")