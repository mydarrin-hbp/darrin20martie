import sys
import os

sys.path.append(os.getcwd())

from app.db.session import SessionLocal
from app.models.user import User, UserRole, VerificationStatus
from app.models.service import Service
from app.crud.service_manager import check_and_activate_service

def run_validation():
    db = SessionLocal()
    print("\n--- START VALIDARE INTEGRALĂ MY DARRIN ---")
    
    try:
        test_svc = Service(
            name_ro="Serviciu Test", 
            name_en="Test Service", 
            is_active=False
        )
        db.add(test_svc)
        db.commit()
        db.refresh(test_svc)
        
        for i in range(1, 4):
            u = User(
                email=f"p_{i}_{os.urandom(2).hex()}@test.ro",
                hashed_password="hash",
                role=UserRole.PARTNER,
                verification_status=VerificationStatus.VALIDATED
            )
            u.services.append(test_svc)
            db.add(u)
        
        db.commit()

        status_final = check_and_activate_service(db, test_svc.id)
        
        print(f"Status Final is_active: {status_final}")

        if status_final is True:
            print("✅ SUCCES: Task 1, 2 și 3 sunt confirmate.")
        else:
            print("❌ EROARE: Activarea nu a avut loc.")

    except Exception as e:
        print(f"❌ EROARE: {str(e)}")
    finally:
        db.close()

if __name__ == "__main__":
    run_validation()