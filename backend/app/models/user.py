import enum

from sqlalchemy import Enum, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class UserRole(str, enum.Enum):
    CLIENT = "CLIENT"
    PARTNER = "PARTNER"
    ADMIN = "ADMIN"
    INVESTOR = "INVESTOR"
    SUPER_ADMIN = "SUPER_ADMIN"


ROLE_PERMISSIONS: dict[str, list[str]] = {
    UserRole.CLIENT.value: [
        "orders:create",
        "orders:view_own",
        "account:update_own",
        "media:upload_own",
    ],
    UserRole.PARTNER.value: [
        "partner:dashboard",
        "partner:orders:view",
        "partner:profile:update",
        "partner:documents:upload",
    ],
    UserRole.INVESTOR.value: [
        "investor:dashboard",
        "investor:profile:update",
        "investor:documents:upload",
    ],
    UserRole.ADMIN.value: [
        "backoffice:access",
        "catalog:manage",
        "site_content:manage",
        "users:review",
    ],
    UserRole.SUPER_ADMIN.value: [
        "backoffice:access",
        "catalog:manage",
        "site_content:manage",
        "users:review",
        "users:roles:manage",
        "platform:admin",
    ],
}


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(50), nullable=True)
    city: Mapped[str | None] = mapped_column(String(120), nullable=True)
    role: Mapped[str | None] = mapped_column(String(50), nullable=True, default=UserRole.CLIENT.value)
    verification_status: Mapped[str | None] = mapped_column(String(50), nullable=True, default="PENDING")
