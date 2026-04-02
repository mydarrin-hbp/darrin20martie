from __future__ import annotations

from datetime import UTC, datetime, timedelta
import json

from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.models.assets import ProviderAvailabilitySlot, ProviderCapability
from app.models.price_analysis import Supplier
from app.models.service import Service
from app.models.user import User
from app.modules.orders.asset_dispatch_registry import resolve_dispatch_skill_packet
from app.modules.orders.models import Order, OrderBroadcast, WorkPackage
from app.modules.orders.schemas import PartnerLiveJobResponse

FULL_PACKAGE_PRIORITY_SECONDS = 60


def _utcnow() -> datetime:
    return datetime.now(UTC)


def _normalize_location_geo(value: object) -> dict:
    if isinstance(value, dict):
        return value
    if isinstance(value, str) and value.strip():
        try:
            parsed = json.loads(value)
        except json.JSONDecodeError:
            return {}
        return parsed if isinstance(parsed, dict) else {}
    return {}


def _supports_locality(supplier: Supplier, locality_slug: str | None, zone_slug: str | None, country_code: str | None) -> bool:
    geo = _normalize_location_geo(supplier.location_geo)
    locality_slugs = {str(item).strip().lower() for item in geo.get("locality_slugs", []) if str(item).strip()}
    zone_slugs = {str(item).strip().lower() for item in geo.get("zone_slugs", []) if str(item).strip()}
    country_codes = {str(item).strip().upper() for item in geo.get("country_codes", []) if str(item).strip()}

    if locality_slug and locality_slugs and locality_slug.lower() not in locality_slugs:
        return False
    if zone_slug and zone_slugs and zone_slug.lower() not in zone_slugs:
        return False
    if country_code and country_codes and country_code.upper() not in country_codes:
        return False
    return True


def _service_task_scope(service: Service) -> str:
    slug = (service.slug or "").lower()
    if "beton" in slug:
        return "CONCRETE"
    if "centrala" in slug:
        return "HVAC"
    if "gazon" in slug:
        return "LANDSCAPING"
    return "GENERAL"


def _tokenize(value: str | None) -> set[str]:
    if not value:
        return set()
    cleaned = (
        value.lower()
        .replace("-", " ")
        .replace("_", " ")
        .replace("/", " ")
        .replace("+", " ")
    )
    return {chunk for chunk in cleaned.split() if chunk}


def _supplier_matches_order_requirements(supplier: Supplier, order: Order) -> bool:
    active_capabilities = [capability for capability in supplier.capabilities if capability.is_active]
    if not active_capabilities:
        return False

    required_caen = {str(item).strip() for item in (order.nace_codes or []) if str(item).strip()}
    required_certs = {
        str(item).strip().upper()
        for item in (order.required_certification_codes or [])
        if str(item).strip()
    }
    skill_tokens = _tokenize(order.skill_label) | _tokenize(order.task_label) | _tokenize(order.intervention_label)
    specialization_tokens = {
        token
        for item in _normalize_location_geo(supplier.location_geo).get("specializations", [])
        for token in _tokenize(str(item))
    }

    for capability in active_capabilities:
        if required_caen and capability.caen_code not in required_caen:
            continue

        capability_certs = {
            str(item).strip().upper()
            for item in (capability.certification_codes or [])
            if str(item).strip()
        }
        if required_certs and not required_certs.issubset(capability_certs):
            continue

        if not skill_tokens:
            return True

        capability_tokens = (
            _tokenize(getattr(capability.task_type, "slug", None))
            | _tokenize(getattr(capability.task_type, "name_ro", None))
            | _tokenize(getattr(capability.task_type, "name_en", None))
            | _tokenize(getattr(capability.asset_type, "slug", None))
            | specialization_tokens
        )
        if skill_tokens & capability_tokens:
            return True
    return False


def _supplier_can_cover_full_package(
    db: Session,
    *,
    supplier: Supplier,
    task_scope: str,
    locality_slug: str | None,
) -> bool:
    if task_scope == "CONCRETE":
        capability_count = db.execute(
            select(ProviderCapability)
            .where(ProviderCapability.supplier_id == supplier.id, ProviderCapability.is_active.is_(True))
        ).scalars().all()
        slots = db.execute(
            select(ProviderAvailabilitySlot).where(
                ProviderAvailabilitySlot.supplier_id == supplier.id,
                ProviderAvailabilitySlot.is_available.is_(True),
                or_(ProviderAvailabilitySlot.locality_slug.is_(None), ProviderAvailabilitySlot.locality_slug == locality_slug),
            )
        ).scalars().all()
        roles = {slot.slot_role.upper() for slot in slots}
        return bool(capability_count) and {"MATERIAL", "EQUIPMENT"}.issubset(roles)

    return any(capability.can_lead_package for capability in supplier.capabilities if capability.is_active)


def _normalize_datetime(value: datetime | None) -> datetime | None:
    if value is None:
        return None
    if value.tzinfo is None:
        return value.replace(tzinfo=UTC)
    return value.astimezone(UTC)


def _resolve_partner_supplier(db: Session, user: User) -> Supplier | None:
    supplier = db.execute(select(Supplier).where(Supplier.user_id == user.id, Supplier.is_active.is_(True))).scalar_one_or_none()
    if supplier:
        return supplier
    return db.execute(
        select(Supplier).where(Supplier.contact_email == user.email, Supplier.is_active.is_(True))
    ).scalar_one_or_none()


def _partner_document_blockers(supplier: Supplier) -> list[str]:
    blockers: list[str] = []
    if (supplier.insurance_status or "").upper() != "ACTIVE":
        blockers.append("Asigurarea de raspundere civila nu este activa.")
    insurance_valid_until = _normalize_datetime(supplier.insurance_valid_until)
    if insurance_valid_until is not None and insurance_valid_until < _utcnow():
        blockers.append("Asigurarea de raspundere civila este expirata.")
    if (supplier.criminal_record_status or "").upper() != "VALID":
        blockers.append("Cazierul judiciar nu este valid.")
    criminal_record_valid_until = _normalize_datetime(supplier.criminal_record_valid_until)
    if criminal_record_valid_until is not None and criminal_record_valid_until < _utcnow():
        blockers.append("Cazierul judiciar este expirat.")
    if (supplier.integrity_declaration_status or "").upper() != "VALID":
        blockers.append("Declaratia de integritate lipseste sau este invalida.")
    return blockers


def broadcast_order_to_eligible_partners(db: Session, order_id: int) -> list[OrderBroadcast]:
    order = db.get(Order, order_id)
    if order is None:
        return []

    service = db.get(Service, order.service_id)
    if service is None:
        return []

    task_scope = _service_task_scope(service)
    if not order.intervention_label or not order.task_label or not (order.nace_codes or []):
        packet = resolve_dispatch_skill_packet(service.slug, order.intervention_label)
        if packet is not None:
            order.asset_label = order.asset_label or packet.asset_label
            order.intervention_label = order.intervention_label or packet.intervention_label
            order.task_label = order.task_label or packet.task_label
            order.skill_label = order.skill_label or packet.skill_label
            order.required_people = order.required_people or packet.required_people
            order.esco_codes = order.esco_codes or list(packet.esco_codes)
            order.nace_codes = order.nace_codes or list(packet.nace_codes)
            order.required_certification_codes = order.required_certification_codes or list(packet.required_certification_codes)
            order.standard_consumables = order.standard_consumables or list(packet.standard_consumables)
    suppliers = db.execute(select(Supplier).where(Supplier.is_active.is_(True))).scalars().all()
    eligible_suppliers = [
        supplier
        for supplier in suppliers
        if _supports_locality(supplier, order.locality_slug, order.zone_slug, order.country_code)
        and _supplier_matches_order_requirements(supplier, order)
    ]
    if not eligible_suppliers:
        order.status = "SEARCHING_PROVIDER"
        db.commit()
        return []

    now = _utcnow()
    full_package_suppliers = {
        supplier.id
        for supplier in eligible_suppliers
        if _supplier_can_cover_full_package(
            db,
            supplier=supplier,
            task_scope=task_scope,
            locality_slug=order.locality_slug,
        )
    }

    existing = db.execute(select(OrderBroadcast).where(OrderBroadcast.order_id == order.id)).scalars().all()
    existing_by_supplier = {item.supplier_id: item for item in existing}
    created: list[OrderBroadcast] = []

    for supplier in eligible_suppliers:
        hold_for_priority = bool(full_package_suppliers) and supplier.id not in full_package_suppliers
        broadcast = existing_by_supplier.get(supplier.id)
        if broadcast is None:
            broadcast = OrderBroadcast(
                order_id=order.id,
                supplier_id=supplier.id,
                task_scope=task_scope,
                claim_status="PRIORITY_HOLD" if hold_for_priority else "PENDING",
                can_cover_full_package=supplier.id in full_package_suppliers,
                locality_slug=order.locality_slug,
                priority_expires_at=now + timedelta(seconds=FULL_PACKAGE_PRIORITY_SECONDS) if hold_for_priority else None,
            )
            db.add(broadcast)
            created.append(broadcast)
        else:
            broadcast.claim_status = "PRIORITY_HOLD" if hold_for_priority else "PENDING"
            broadcast.can_cover_full_package = supplier.id in full_package_suppliers
            broadcast.priority_expires_at = now + timedelta(seconds=FULL_PACKAGE_PRIORITY_SECONDS) if hold_for_priority else None

    order.status = "SEARCHING_PROVIDER"
    db.commit()
    for item in created:
        db.refresh(item)
    return created or existing


def list_order_broadcasts(db: Session, order_id: int) -> list[OrderBroadcast]:
    return db.execute(
        select(OrderBroadcast)
        .where(OrderBroadcast.order_id == order_id)
        .order_by(OrderBroadcast.can_cover_full_package.desc(), OrderBroadcast.id.asc())
    ).scalars().all()


def claim_order_broadcast(db: Session, *, broadcast_id: int, supplier_id: int) -> OrderBroadcast | str | None:
    broadcast = db.get(OrderBroadcast, broadcast_id)
    if broadcast is None:
        return None
    if broadcast.supplier_id != supplier_id:
        return "broadcast_supplier_mismatch"

    now = _utcnow()
    if broadcast.claim_status == "PRIORITY_HOLD" and broadcast.priority_expires_at and broadcast.priority_expires_at > now:
        return "priority_window_active"
    if broadcast.claim_status in {"CLAIMED", "EXPIRED"}:
        return "broadcast_unavailable"
    supplier = db.get(Supplier, supplier_id)
    if supplier is None:
        return "supplier_not_found"
    if _partner_document_blockers(supplier):
        return "supplier_documents_invalid"

    competing_priority = db.execute(
        select(OrderBroadcast).where(
            OrderBroadcast.order_id == broadcast.order_id,
            OrderBroadcast.can_cover_full_package.is_(True),
            OrderBroadcast.claim_status.in_(["PENDING", "PRIORITY_HOLD"]),
            OrderBroadcast.priority_expires_at.is_not(None),
            OrderBroadcast.priority_expires_at > now,
        )
    ).scalars().all()
    if competing_priority and not broadcast.can_cover_full_package:
        return "priority_window_active"

    order = db.get(Order, broadcast.order_id)
    if order is None:
        return "order_not_found"

    broadcast.claim_status = "CLAIMED"
    broadcast.claimed_at = now
    order.status = "ASSIGNED"

    if order.work_package_id:
        work_package = db.get(WorkPackage, order.work_package_id)
        if work_package is not None:
            work_package.status = "SUPPLIER_CLAIMED"

    competing_broadcasts = db.execute(
        select(OrderBroadcast).where(
            OrderBroadcast.order_id == order.id,
            OrderBroadcast.id != broadcast.id,
            OrderBroadcast.claim_status.in_(["PENDING", "PRIORITY_HOLD"]),
        )
    ).scalars().all()
    for item in competing_broadcasts:
        item.claim_status = "EXPIRED"
        item.priority_expires_at = None

    db.commit()
    db.refresh(broadcast)
    return broadcast


def get_partner_live_jobs(db: Session, *, current_user: User) -> list[PartnerLiveJobResponse]:
    supplier = _resolve_partner_supplier(db, current_user)
    if supplier is None:
        return []

    broadcasts = db.execute(
        select(OrderBroadcast)
        .where(OrderBroadcast.supplier_id == supplier.id)
        .where(OrderBroadcast.claim_status.in_(["PENDING", "PRIORITY_HOLD"]))
        .order_by(OrderBroadcast.created_at.desc())
    ).scalars().all()
    blockers = _partner_document_blockers(supplier)
    now = _utcnow()
    results: list[PartnerLiveJobResponse] = []
    for broadcast in broadcasts:
        order = db.get(Order, broadcast.order_id)
        if order is None:
            continue
        service = db.get(Service, order.service_id)
        full_package_seconds = 0
        if broadcast.priority_expires_at:
            full_package_seconds = max(0, int((broadcast.priority_expires_at - now).total_seconds()))
        mydarrin_retention = round(order.darrin_management_fee + order.mentenanta_platforma, 2)
        escrow_retention = round(order.garantie_buna_executie, 2)
        insurance_fee = round(order.insurance_premium, 2)
        partner_net_receivable = round(max(order.cost_direct - escrow_retention, 0.0), 2)
        results.append(
            PartnerLiveJobResponse(
                broadcast_id=broadcast.id,
                supplier_id=supplier.id,
                order_id=order.id,
                order_ref=order.order_ref,
                service_slug=service.slug if service else "unknown-service",
                service_name=service.name if service else "Serviciu necunoscut",
                asset_label=order.asset_label,
                intervention_label=order.intervention_label,
                task_label=order.task_label,
                skill_label=order.skill_label,
                required_people=order.required_people,
                esco_codes=order.esco_codes or [],
                nace_codes=order.nace_codes or [],
                required_certification_codes=order.required_certification_codes or [],
                standard_consumables=order.standard_consumables or [],
                target_address=order.target_address,
                locality_slug=order.locality_slug,
                claim_status=broadcast.claim_status,
                full_package_priority_seconds=full_package_seconds,
                can_cover_full_package=broadcast.can_cover_full_package,
                client_gross_total=round(order.total_facturabil, 2),
                mydarrin_retention=mydarrin_retention,
                escrow_retention=escrow_retention,
                insurance_fee=insurance_fee,
                partner_net_receivable=partner_net_receivable,
                can_claim=not blockers and (broadcast.claim_status != "PRIORITY_HOLD" or full_package_seconds == 0 or broadcast.can_cover_full_package),
                blocking_reasons=blockers,
            )
        )
    return results
