from __future__ import annotations

from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.modules.geo_fiscal_engine.vatsense_sync import sync_vat_rates
from app.modules.geography.models import Country


def sync_all_active_markets() -> None:
    db: Session = SessionLocal()
    synced_count = 0

    try:
        countries = (
            db.query(Country)
            .filter(Country.is_active.is_(True))
            .order_by(Country.name.asc())
            .all()
        )

        if not countries:
            print("Nu exista tari active in tabela countries.")
            return

        for country in countries:
            print(f"--- Sincronizare fiscala: {country.name} ({country.code}) ---")
            vat_rates = sync_vat_rates(db, country_code=country.code)
            synced_count += 1

            service_vat = vat_rates.get("SERVICE")
            landscaping_vat = vat_rates.get("LANDSCAPING")
            material_vat = vat_rates.get("CONSTRUCTION_MATERIAL")

            print(
                "TVA sincronizat -> "
                f"SERVICE={service_vat:.2%}, "
                f"LANDSCAPING={landscaping_vat:.2%}, "
                f"CONSTRUCTION_MATERIAL={material_vat:.2%}"
            )

        print(
            f"Sincronizare terminata cu succes. Piete active procesate: {synced_count}."
        )
    except Exception as exc:
        db.rollback()
        print(f"Eroare la sincronizare geo-fiscala: {exc}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    sync_all_active_markets()
