"""
Admin User Creation Helper Script

Usage:
    python create_admin.py
    
    Or with custom credentials:
    python create_admin.py --email admin@mydarrin.com --password your_secure_password
"""

import sys
import argparse
from pathlib import Path
from getpass import getpass

# Add backend to path
backend_path = Path(__file__).parent
sys.path.insert(0, str(backend_path))

from app.core.database import SessionLocal
from app.core.auth import hash_password
from app.models.user import User, UserRole, VerificationStatus
from app.db.base import Base
from app.core.database import engine


def create_admin_user(email: str = None, password: str = None):
    """
    Create an admin user in the database.
    
    Args:
        email: Admin email (prompted if not provided)
        password: Admin password (prompted if not provided)
    """
    # Create tables if they don't exist
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # Get email if not provided
        if not email:
            email = input("Enter admin email: ").strip()
            if not email:
                print("❌ Email cannot be empty")
                return False
        
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == email).first()
        if existing_user:
            print(f"❌ User with email '{email}' already exists")
            return False
        
        # Get password if not provided
        if not password:
            while True:
                password = getpass("Enter admin password (min 8 characters): ")
                if len(password) < 8:
                    print("❌ Password must be at least 8 characters")
                    continue
                
                password_confirm = getpass("Confirm password: ")
                if password != password_confirm:
                    print("❌ Passwords do not match")
                    continue
                break
        else:
            if len(password) < 8:
                print("❌ Password must be at least 8 characters")
                return False
        
        # Create admin user
        admin_user = User(
            email=email,
            hashed_password=hash_password(password),
            role=UserRole.ADMIN,
            verification_status=VerificationStatus.VALIDATED,
            is_active=True,
        )
        
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        
        print(f"\n✅ Admin user created successfully!")
        print(f"   Email: {admin_user.email}")
        print(f"   ID: {admin_user.id}")
        print(f"   Role: {admin_user.role.value}")
        print(f"   Active: {admin_user.is_active}")
        
        return True
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error creating admin user: {e}")
        return False
    finally:
        db.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Create admin user for My Darrin API")
    parser.add_argument("--email", help="Admin email address")
    parser.add_argument("--password", help="Admin password")
    
    args = parser.parse_args()
    
    success = create_admin_user(email=args.email, password=args.password)
    sys.exit(0 if success else 1)
