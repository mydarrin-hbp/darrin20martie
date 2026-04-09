from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.activities.models import Activity, ServiceActivity, Unit


def get_units(db: Session):
    return db.execute(select(Unit).order_by(Unit.id)).scalars().all()


def get_activities(db: Session):
    return db.execute(select(Activity).order_by(Activity.id)).scalars().all()


def get_service_activities(db: Session):
    return db.execute(select(ServiceActivity).order_by(ServiceActivity.id)).scalars().all()
