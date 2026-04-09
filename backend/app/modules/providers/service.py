from __future__ import annotations

from sqlalchemy.orm import Session

from app.models.price_analysis import Supplier
from app.modules.providers.schemas import ProviderCreate, ProviderUpdate


def list_providers(db: Session):
    return db.query(Supplier).order_by(Supplier.name).all()


def create_provider(db: Session, data: ProviderCreate):
    provider = Supplier(
        name=data.name,
        contact_email=data.contact_email,
        provider_type=data.provider_type,
        is_active=data.is_active,
    )
    db.add(provider)
    db.commit()
    db.refresh(provider)
    return provider


def update_provider(db: Session, provider_id: int, data: ProviderUpdate):
    provider = db.get(Supplier, provider_id)
    if not provider:
        return None
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(provider, field, value)
    db.commit()
    db.refresh(provider)
    return provider


def delete_provider(db: Session, provider_id: int):
    provider = db.get(Supplier, provider_id)
    if not provider:
        return None
    db.delete(provider)
    db.commit()
    return True
