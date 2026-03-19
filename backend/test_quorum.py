import sys
import os

# Forțăm Python să vadă folderul curent ca rădăcină pentru 'app'
sys.path.append(os.getcwd())

from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.user import User, UserRole, VerificationStatus
from app.models.service import Service
from app.models.catalog import Subcategory, Category, Domain
from app.services.catalog_service import update_all_user_services_status

def test_quorum_logic():
    db = SessionLocal()
    try:
        print("\n--- [MY DARRIN] PORNIRE TEST ACTIVARE AUTOMATĂ ---")

        # 1. Setup structură catalog
        domain = db.query(Domain).first() or Domain(name_ro="Construcții")
        if not domain.id: db.add(domain); db.flush()

        cat = db.query(Category).first() or Category(domain_id=domain.id, name_ro="Instalații")
        if not cat.id: db.add(cat); db.flush()

        sub = db.query(Subcategory).first() or Subcategory(category_id=cat.id, name_ro="Sanitare")
        if not sub.id: db.add(sub); db.flush()

        # 2. Setup Serviciu (Status inițial: Inactiv)
        svc_name = "Montaj Centrală Termică"
        service = db.query(Service).filter(Service.name_ro == svc_name).first()
        if not service:
            service = Service(
                subcategory_id=sub.id,
                name_ro=svc_name,
                service_level="Platinum",
                is_active=False
            )
            db.add(service)
            db.commit()
            db.refresh(service)
        
        print(f"[*] Serviciu țintă: {service.name_ro}")
        print(f"[*] Status actual: {'ACTIV' if service.is_active else 'INACTIV'}")

        # 3. Validăm 3 Parteneri (Pragul de cvorum)
        for i in range(1, 4):
            email = f"partener_{i}@test.com"
            user = db.query(User).filter(User.email == email).first()
            if not user:
                user = User(email=email, hashed_password="pwd", role=UserRole.PARTNER)
                db.add(user)
                db.commit()
                db.refresh(user)
            
            if service not in user.services:
                user.services.append(service)
                db.commit()

            print(f"\n[PAS {i}] Validare KYC pentru: {email}")
            user.verification_status = VerificationStatus.VALIDATED
            db.commit()
            
            # Declanșăm calculul cvorumului
            update_all_user_services_status(db, user.id)
            
            db.refresh(service)
            print(f"    >>> Cvorum check: Serviciul este {'✅ ACTIV' if service.is_active else '❌ ÎNCĂ INACTIV'}")

        print("\n--- TEST FINALIZAT ---")

    except Exception as e:
        print(f"\n[!] EROARE: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    test_quorum_logic()