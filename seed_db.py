import sys
import os

# Adăugăm calea către backend pentru importuri corecte
sys.path.append(os.path.join(os.getcwd(), "backend"))

from app.db.session import SessionLocal
from app.models.user import User, UserRole, VerificationStatus
from app.models.service import Service
from app.models.domain import Domain
from app.models.category import Category
from app.models.subcategory import Subcategory

def seed_data():
    db = SessionLocal()
    try:
        # Creăm structura necesară pentru a putea adăuga un serviciu
        domain = Domain(name_ro="Construcții")
        db.add(domain)
        db.flush()

        cat = Category(name_ro="Instalații", domain_id=domain.id)
        db.add(cat)
        db.flush()

        sub = Subcategory(name_ro="Termice", category_id=cat.id)
        db.add(sub)
        db.flush()

        # Adăugăm serviciul pentru testarea Task-ului 3
        svc = Service(name_ro="Montaj Centrală", subcategory_id=sub.id, is_active=False)
        db.add(svc)
        db.commit()
        print("Seed finalizat cu succes!")
    except Exception as e:
        print(f"Eroare: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()