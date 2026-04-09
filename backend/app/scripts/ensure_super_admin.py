import os

os.environ.setdefault("DATABASE_URL", "sqlite:///backend/mydarrin.db")
os.environ.setdefault("JWT_SECRET", "local-dev-super-admin-secret-2026")
os.environ.setdefault("PYTHONPATH", "backend")

from sqlalchemy import select

from app.db.session import SessionLocal
from app.models.assets import ProviderCapability  # noqa: F401
from app.models.admin_rbac import Admin, AdminPermission, AdminRoleKey, ROLE_MODULE_TEMPLATES, ROLE_PERMISSION_TEMPLATES
from app.models.user import User, UserRole


TARGET_EMAIL = "mydarrin.hbp@gmail.com"
COUNTRY_ACCESS = ["GLOBAL"]


def ensure_super_admin() -> None:
    db = SessionLocal()
    try:
        user = db.execute(select(User).where(User.email == TARGET_EMAIL)).scalar_one_or_none()
        if user is None:
            raise RuntimeError(f"User not found: {TARGET_EMAIL}")

        user.role = UserRole.SUPER_ADMIN.value
        user.verification_status = "APPROVED"

        admin = db.execute(select(Admin).where(Admin.user_id == user.id)).scalar_one_or_none()
        if admin is None:
            admin = Admin(
                user_id=user.id,
                role_key=AdminRoleKey.SUPER_ADMIN.value,
                country_access=COUNTRY_ACCESS,
                module_access=ROLE_MODULE_TEMPLATES[AdminRoleKey.SUPER_ADMIN.value],
                invitation_token=None,
                invitation_status="ACCEPTED",
                invited_by_user_id=user.id,
                is_active=True,
            )
            db.add(admin)
            db.flush()
        else:
            admin.role_key = AdminRoleKey.SUPER_ADMIN.value
            admin.country_access = COUNTRY_ACCESS
            admin.module_access = ROLE_MODULE_TEMPLATES[AdminRoleKey.SUPER_ADMIN.value]
            admin.invitation_token = None
            admin.invitation_status = "ACCEPTED"
            admin.invited_by_user_id = user.id
            admin.is_active = True
            db.query(AdminPermission).filter(AdminPermission.admin_id == admin.id).delete()
            db.flush()

        for permission_code in ROLE_PERMISSION_TEMPLATES[AdminRoleKey.SUPER_ADMIN.value]:
            module_key = permission_code.split(":", 1)[0]
            db.add(
                AdminPermission(
                    admin_id=admin.id,
                    permission_code=permission_code,
                    module_key=module_key,
                    country_code="GLOBAL",
                    is_active=True,
                )
            )

        db.commit()
        print(
            {
                "email": user.email,
                "role": user.role,
                "verification_status": user.verification_status,
                "admin_role_key": admin.role_key,
                "country_access": admin.country_access,
                "module_access": admin.module_access,
                "permissions": ROLE_PERMISSION_TEMPLATES[AdminRoleKey.SUPER_ADMIN.value],
            }
        )
    finally:
        db.close()


if __name__ == "__main__":
    ensure_super_admin()
