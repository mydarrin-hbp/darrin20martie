from fastapi import APIRouter
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.modules.catalog.models import Domain

router = APIRouter(prefix="/catalog", tags=["catalog"])


def get_db_session() -> Session:
    engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)
    return Session(engine)


@router.get("/domains")
def list_domains():
    db = get_db_session()
    try:
        rows = db.execute(select(Domain).order_by(Domain.id)).scalars().all()
        return [
            {
                "id": d.id,
                "name": d.name,
                "slug": getattr(d, "slug", None),
                "description": d.description,
            }
            for d in rows
        ]
    finally:
        db.close()