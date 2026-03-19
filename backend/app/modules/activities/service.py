from sqlalchemy import Boolean, ForeignKey, String, Text, Float
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Service(Base):
    __tablename__ = "services"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    subcategory_id: Mapped[int] = mapped_column(
        ForeignKey("subcategories.id", ondelete="CASCADE"),
        nullable=False
    )

    code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(180), nullable=False, index=True)
    slug: Mapped[str] = mapped_column(String(200), unique=True, nullable=False, index=True)

    short_description: Mapped[str | None] = mapped_column(String(255), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    unit: Mapped[str] = mapped_column(String(20), nullable=False)
    base_duration: Mapped[float] = mapped_column(Float, default=1.0, nullable=False)

    ai_enabled: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    requires_site_visit: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    add_to_cart_enabled: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    subcategory = relationship("Subcategory", back_populates="services")