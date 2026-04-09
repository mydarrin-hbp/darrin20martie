from __future__ import annotations

import enum
from datetime import datetime

from sqlalchemy import JSON, Boolean, DateTime, ForeignKey, String, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class AdminRoleKey(str, enum.Enum):
    SUPER_ADMIN = "SUPER_ADMIN"
    COUNTRY_MANAGER = "COUNTRY_MANAGER"
    PARTNER_MANAGER = "PARTNER_MANAGER"
    CONTENT_MANAGER = "CONTENT_MANAGER"
    FINANCIAL_ADMIN = "FINANCIAL_ADMIN"


ROLE_MODULE_TEMPLATES: dict[str, list[str]] = {
    AdminRoleKey.SUPER_ADMIN.value: [
        "visual_cms",
        "catalog",
        "operations",
        "partners",
        "investors",
        "team",
        "geo",
        "cms",
        "financial",
        "catalog_pricing",
        "site_content",
        "partner_flow",
    ],
    AdminRoleKey.COUNTRY_MANAGER.value: [
        "catalog",
        "geo",
        "catalog_pricing",
    ],
    AdminRoleKey.PARTNER_MANAGER.value: [
        "partners",
        "partner_flow",
    ],
    AdminRoleKey.CONTENT_MANAGER.value: [
        "visual_cms",
        "cms",
        "site_content",
    ],
    AdminRoleKey.FINANCIAL_ADMIN.value: [
        "financial",
        "catalog_pricing",
        "investors",
    ],
}


ROLE_PERMISSION_TEMPLATES: dict[str, list[str]] = {
    AdminRoleKey.SUPER_ADMIN.value: [
        "backoffice:access",
        "team:manage",
        "catalog:manage",
        "site_content:manage",
        "financial:manage",
        "geography:manage",
        "partners:manage",
        "platform:admin",
        "design_edit:use",
    ],
    AdminRoleKey.COUNTRY_MANAGER.value: [
        "backoffice:access",
        "catalog:manage",
        "geography:manage",
    ],
    AdminRoleKey.PARTNER_MANAGER.value: [
        "backoffice:access",
        "partners:manage",
    ],
    AdminRoleKey.CONTENT_MANAGER.value: [
        "backoffice:access",
        "site_content:manage",
        "design_edit:use",
    ],
    AdminRoleKey.FINANCIAL_ADMIN.value: [
        "backoffice:access",
        "financial:manage",
    ],
}


class Admin(Base):
    __tablename__ = "admins"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), unique=True, index=True, nullable=False)
    role_key: Mapped[str] = mapped_column(String(64), nullable=False, index=True, default=AdminRoleKey.COUNTRY_MANAGER.value)
    country_access: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    module_access: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    invitation_token: Mapped[str | None] = mapped_column(String(255), nullable=True, unique=True, index=True)
    invitation_status: Mapped[str] = mapped_column(String(32), nullable=False, default="PENDING", index=True)
    invited_by_user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )

    user = relationship("User", foreign_keys=[user_id], back_populates="admin_profile")
    permissions: Mapped[list["AdminPermission"]] = relationship(
        back_populates="admin",
        cascade="all, delete-orphan",
    )


class AdminPermission(Base):
    __tablename__ = "admin_permissions"
    __table_args__ = (
        UniqueConstraint("admin_id", "permission_code", "country_code", name="uq_admin_permission_scope"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    admin_id: Mapped[int] = mapped_column(ForeignKey("admins.id", ondelete="CASCADE"), nullable=False, index=True)
    permission_code: Mapped[str] = mapped_column(String(120), nullable=False, index=True)
    module_key: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    country_code: Mapped[str | None] = mapped_column(String(3), nullable=True, index=True)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())

    admin: Mapped[Admin] = relationship(back_populates="permissions")
