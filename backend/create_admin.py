"""
Admin user creation helper script.

Usage:
    python create_admin.py
    python create_admin.py --email admin@mydarrin.com --password your_secure_password
"""

import argparse
import sys
from getpass import getpass
from pathlib import Path

backend_path = Path(__file__).parent
sys.path.insert(0, str(backend_path))

from app.core.auth import hash_password
from app.db.base import Base
from app.db.session import SessionLocal, engine
from app.models.user import User, UserRole
from app.schemas.user import VerificationStatus


def create_admin_user(email: str | None = None, password: str | None = None) -> bool:
    """Create an admin user in the active backend database."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        if not email:
            email = input("Enter admin email: ").strip()
            if not email:
                print("Email cannot be empty")
                return False

        existing_user = db.query(User).filter(User.email == email).first()
        if existing_user:
            print(f"User with email '{email}' already exists")
            return False

        if not password:
            while True:
                password = getpass("Enter admin password (min 8 characters): ")
                if len(password) < 8:
                    print("Password must be at least 8 characters")
                    continue

                password_confirm = getpass("Confirm password: ")
                if password != password_confirm:
                    print("Passwords do not match")
                    continue
                break
        elif len(password) < 8:
            print("Password must be at least 8 characters")
            return False

        admin_user = User(
            email=email,
            hashed_password=hash_password(password),
            role=UserRole.ADMIN.value,
            verification_status=VerificationStatus.APPROVED.value,
        )

        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)

        print("\nAdmin user created successfully")
        print(f"Email: {admin_user.email}")
        print(f"ID: {admin_user.id}")
        print(f"Role: {admin_user.role}")
        print(f"Verification: {admin_user.verification_status}")
        return True
    except Exception as exc:
        db.rollback()
        print(f"Error creating admin user: {exc}")
        return False
    finally:
        db.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Create admin user for My Darrin API")
    parser.add_argument("--email", help="Admin email address")
    parser.add_argument("--password", help="Admin password")
    args = parser.parse_args()
    raise SystemExit(0 if create_admin_user(email=args.email, password=args.password) else 1)
