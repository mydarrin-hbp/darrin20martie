from __future__ import annotations

from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.assets import ProviderCapability, TaskType
from app.models.price_analysis import Supplier


def _utcnow() -> datetime:
    return datetime.now(UTC)


def _normalize_datetime(value: datetime | None) -> datetime | None:
    if value is None:
        return None
    if value.tzinfo is None:
        return value.replace(tzinfo=UTC)
    return value.astimezone(UTC)


def is_provider_eligible(db: Session, provider_id: int, task_id: int) -> bool:
    provider = db.get(Supplier, provider_id)
    if provider is None or not provider.is_active:
        return False

    if (provider.insurance_status or "").upper() != "ACTIVE":
        return False
    insurance_valid_until = _normalize_datetime(provider.insurance_valid_until)
    if insurance_valid_until is not None and insurance_valid_until < _utcnow():
        return False

    task = db.get(TaskType, task_id)
    if task is None or not task.is_active:
        return False

    capabilities = db.execute(
        select(ProviderCapability).where(
            ProviderCapability.supplier_id == provider.id,
            ProviderCapability.task_type_id == task.id,
            ProviderCapability.is_active.is_(True),
        )
    ).scalars().all()
    if not capabilities:
        return False

    required_caen = (task.required_caen_code or "").strip()
    required_certifications = {
        str(item).strip().upper()
        for item in (task.required_certification_codes or [])
        if str(item).strip()
    }

    for capability in capabilities:
        if required_caen and capability.caen_code.strip() != required_caen:
            continue

        provider_certifications = {
            str(item).strip().upper()
            for item in (capability.certification_codes or [])
            if str(item).strip()
        }
        if required_certifications and not required_certifications.issubset(provider_certifications):
            continue
        return True

    return False
