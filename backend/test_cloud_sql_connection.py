import traceback

from sqlalchemy import create_engine, text
from sqlalchemy.engine import make_url
from sqlalchemy.exc import InterfaceError, OperationalError, TimeoutError as SQLAlchemyTimeoutError

from app.core.config import settings


def main() -> int:
    database_url = settings.DATABASE_URL

    if "YOUR_CLOUD_SQL_PASSWORD" in database_url:
        print("Eroare conexiune: DATABASE_URL contine placeholder-ul YOUR_CLOUD_SQL_PASSWORD.")
        return 1

    try:
        masked_url = make_url(database_url).render_as_string(hide_password=True)
    except Exception:
        masked_url = "<DATABASE_URL invalid>"

    print("[1/4] Pregatesc conexiunea SQLAlchemy...")
    print(f"DATABASE_URL: {masked_url}")

    try:
        engine = create_engine(
            database_url,
            pool_pre_ping=True,
            pool_timeout=30,
            connect_args={"connect_timeout": 30},
        )
        print("[2/4] Deschid conexiunea catre Cloud SQL...")
        with engine.connect() as connection:
            print("[3/4] Rulez SELECT 1...")
            result = connection.execute(text("SELECT 1"))
            value = result.scalar_one()
            print(f"SELECT 1 => {value}")
        print("[4/4] Inchid conexiunea...")
        engine.dispose()
        print("✅ Conexiune reusita")
        return 0
    except OperationalError as exc:
        print(f"Eroare OperationalError: {exc}")
        print(traceback.format_exc(limit=3))
        return 1
    except InterfaceError as exc:
        print(f"Eroare InterfaceError: {exc}")
        print(traceback.format_exc(limit=3))
        return 1
    except SQLAlchemyTimeoutError as exc:
        print(f"Eroare SQLAlchemy TimeoutError: {exc}")
        print(traceback.format_exc(limit=3))
        return 1
    except TimeoutError as exc:
        print(f"Eroare TimeoutError: {exc}")
        print(traceback.format_exc(limit=3))
        return 1
    except Exception as exc:
        print(f"Eroare conexiune: {exc}")
        print(traceback.format_exc(limit=3))
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
