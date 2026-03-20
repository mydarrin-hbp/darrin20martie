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


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str | None] = mapped_column(String(50), nullable=True, default=UserRole.CLIENT.value)
    verification_status: Mapped[str | None] = mapped_column(String(50), nullable=True, default="PENDING")