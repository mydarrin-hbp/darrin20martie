from typing import List

from sqlalchemy import Boolean, ForeignKey, JSON, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Category(Base):
    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    domain_id: Mapped[int] = mapped_column(
        ForeignKey("domains.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name_ro: Mapped[str] = mapped_column(String(150), nullable=False, index=True)
    name_en: Mapped[str] = mapped_column(String(150), nullable=False, index=True)
    slug: Mapped[str] = mapped_column(String(180), nullable=False, unique=True, index=True)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    caen_codes: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    uniclass_codes: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    esco_codes: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)

    domain: Mapped["Domain"] = relationship(
        "Domain",
        back_populates="categories",
    )
    subcategories: Mapped[List["SubCategory"]] = relationship(
        "SubCategory",
        back_populates="category",
        cascade="all, delete-orphan",
    )
