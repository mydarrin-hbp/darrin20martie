from typing import List

from sqlalchemy import Boolean, JSON, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Domain(Base):
    __tablename__ = "domains"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name_ro: Mapped[str] = mapped_column(String(150), nullable=False, index=True)
    name_en: Mapped[str] = mapped_column(String(150), nullable=False, index=True)
    slug: Mapped[str] = mapped_column(String(180), nullable=False, unique=True, index=True)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    caen_codes: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    uniclass_codes: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    esco_codes: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)

    categories: Mapped[List["Category"]] = relationship(
        "Category",
        back_populates="domain",
        cascade="all, delete-orphan",
    )
