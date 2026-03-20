from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Table, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


if TYPE_CHECKING:
    from app.models.subcategory import SubCategory


service_subcategories = Table(
    "service_subcategories",
    Base.metadata,
    Column("service_id", Integer, ForeignKey("services.id", ondelete="CASCADE"), primary_key=True),
    Column(
        "subcategory_id",
        Integer,
        ForeignKey("subcategories.id", ondelete="CASCADE"),
        primary_key=True,
    ),
)


class Service(Base):
    __tablename__ = "services"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    # Legacy compatibility column kept during the transition from 1:N to N:M.
    legacy_subcategory_id: Mapped[int | None] = mapped_column(
        "subcategory_id",
        ForeignKey("subcategories.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    slug: Mapped[str] = mapped_column(String(255), nullable=False, unique=True, index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    legacy_subcategory: Mapped["SubCategory | None"] = relationship(
        "SubCategory",
        foreign_keys=[legacy_subcategory_id],
        viewonly=True,
    )
    subcategories: Mapped[list["SubCategory"]] = relationship(
        "SubCategory",
        secondary=service_subcategories,
        back_populates="services",
    )

    @property
    def subcategory_ids(self) -> list[int]:
        ids = [subcategory.id for subcategory in self.subcategories]
        if ids:
            return ids
        if self.legacy_subcategory_id is not None:
            return [self.legacy_subcategory_id]
        return []
