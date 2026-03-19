import sys
import os
from sqlalchemy.orm import Session

# Adăugăm calea către backend pentru a putea importa modulele
sys.path.append(os.path.join(os.getcwd(), "backend"))

from app.db.session import SessionLocal
from app.models.user import User, UserRole, VerificationStatus, partner_services
from app.models.service import Service
from app.services.catalog_service import update_all_user_services_status

def test_quorum_logic():
    db = SessionLocal()
    try:
        print("--- START TEST CVORUM MY DARRIN ---")

        # 1. Creăm un Serviciu de test (dacă nu există)
        test_service = db.query(Service).filter(Service.name_ro == "Serviciu Test Cvorum").first()
        if not test_service:
            test_service = Service(
                name_ro="Serviciu Test Cvorum",
                service_level="Gold",
                is_active=False
            )
            db.add(test_service)
            db.commit()
            db.refresh(test_service)
        
        service_id = test_service.id
        print(f"[*] Serviciu creat: {test_service.name_ro} | Status inițial: {test_service.is_active}")

        # 2. Creăm și validăm 3 parteneri
        for i in range(1, 4):
            email = f"partener{i}@test.com"
            user = db.query(User).filter(User.email == email).first()
            
            if not user:
                user = User(
                    email=email,
                    hashed_password="fake_password",
                    role=UserRole.PARTNER,
                    verification_status=VerificationStatus.PENDING
                )
                db.add(user)
                db.commit()
                db.refresh(user)
            
            # Asociem partenerul cu serviciul (dacă nu e deja asociat)
            if test_service not in user.services:
                user.services.append(test_service)
                db.commit()

            print(f"[>] Partener {i} creat și asociat. Validăm...")

            # SIMULĂM VALIDAREA ADMIN (Trigger-ul de Cvorum)
            user.verification_status = VerificationStatus.VALIDATED
            db.commit()
            
            # Apelează funcția de cvorum
            update_all_user_services_status(db, user.id)
            
            # Verificăm statusul serviciului după fiecare validare
            db.refresh(test_service)
            print(f"    Status Serviciu: {'ACTIV' if test_service.is_active else 'INACTIV'} (Count: {i})")

        print("--- TEST FINALIZAT CU SUCCES ---")

    except Exception as e:
        print(f"[!] EROARE: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    test_quorum_logic()