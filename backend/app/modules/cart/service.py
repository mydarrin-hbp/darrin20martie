from __future__ import annotations

from datetime import datetime, timedelta, timezone
import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.cart.models import CartItem, CartSession
from app.modules.cart.schemas import (
    CartDevizPreviewRequest,
    CartDevizPreviewResponse,
    CartItemUpsertRequest,
    CartItemUpdateRequest,
    CartResponse,
    CartSessionResponse,
)
from app.models.price_analysis import Supplier
from app.modules.cost_engine.service import calculate_draft
from app.modules.cost_engine.schemas import CostDraftRequest


SESSION_TTL_HOURS = 48


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _expiry() -> datetime:
    return _now() + timedelta(hours=SESSION_TTL_HOURS)


def _ensure_session(db: Session, session_token: str | None) -> CartSession:
    if session_token:
        session = db.execute(select(CartSession).where(CartSession.session_token == session_token)).scalar_one_or_none()
        if session:
            if session.expires_at < _now():
                session.expires_at = _expiry()
                session.items = []
                db.add(session)
                db.commit()
                db.refresh(session)
            else:
                session.expires_at = _expiry()
                db.add(session)
                db.commit()
                db.refresh(session)
            return session

    token = uuid.uuid4().hex
    session = CartSession(session_token=token, expires_at=_expiry())
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


def create_or_refresh_session(db: Session, session_token: str | None) -> CartSessionResponse:
    session = _ensure_session(db, session_token)
    return CartSessionResponse(session_token=session.session_token, expires_at=session.expires_at)


def _rideshare_stats(db: Session) -> tuple[bool, int]:
    rows = db.execute(
        select(Supplier).where(
            Supplier.is_active.is_(True),
            Supplier.insurance_status == "APPROVED",
            Supplier.criminal_record_status == "APPROVED",
            Supplier.integrity_declaration_status == "APPROVED",
        )
    ).scalars().all()
    count = len(rows)
    return (count > 0, count)


def get_cart(db: Session, session_token: str) -> CartResponse:
    session = _ensure_session(db, session_token)
    rideshare_ok, rideshare_count = _rideshare_stats(db)
    items = [
        CartItemUpsertRequest(
            session_token=session.session_token,
            item_type=item.item_type,
            slug=item.slug,
            title=item.title,
            category=item.category,
            quantity=item.quantity,
            wants_installation=item.wants_installation,
            wants_delivery=item.wants_delivery,
            metadata=item.metadata,
        )
        for item in session.items
    ]
    return CartResponse(
        session_token=session.session_token,
        expires_at=session.expires_at,
        rideshare_eligible=rideshare_ok,
        rideshare_providers=rideshare_count,
        items=[
            {
                "id": item.id,
                "item_type": item.item_type,
                "slug": item.slug,
                "title": item.title,
                "category": item.category,
                "quantity": item.quantity,
                "wants_installation": item.wants_installation,
                "wants_delivery": item.wants_delivery,
                "metadata": item.metadata,
            }
            for item in session.items
        ],
    )


def upsert_item(db: Session, payload: CartItemUpsertRequest) -> CartResponse:
    session = _ensure_session(db, payload.session_token)
    existing = next((item for item in session.items if item.slug == payload.slug and item.item_type == payload.item_type), None)
    if existing:
        existing.quantity = payload.quantity
        existing.wants_installation = payload.wants_installation
        existing.wants_delivery = payload.wants_delivery
        existing.metadata = payload.metadata
        existing.title = payload.title
        existing.category = payload.category
        db.add(existing)
    else:
        item = CartItem(
            session_id=session.id,
            item_type=payload.item_type,
            slug=payload.slug,
            title=payload.title,
            category=payload.category,
            quantity=payload.quantity,
            wants_installation=payload.wants_installation,
            wants_delivery=payload.wants_delivery,
            metadata=payload.metadata,
        )
        db.add(item)
    db.commit()
    return get_cart(db, session.session_token)


def update_item(db: Session, item_id: int, payload: CartItemUpdateRequest) -> CartResponse:
    item = db.get(CartItem, item_id)
    if not item:
        raise ValueError("item_not_found")
    if payload.quantity is not None:
        item.quantity = payload.quantity
    if payload.wants_installation is not None:
        item.wants_installation = payload.wants_installation
    if payload.wants_delivery is not None:
        item.wants_delivery = payload.wants_delivery
    if payload.metadata is not None:
        item.metadata = payload.metadata
    db.add(item)
    db.commit()
    session = db.get(CartSession, item.session_id)
    return get_cart(db, session.session_token if session else "")


def delete_item(db: Session, item_id: int) -> CartResponse:
    item = db.get(CartItem, item_id)
    if not item:
        raise ValueError("item_not_found")
    session = db.get(CartSession, item.session_id)
    db.delete(item)
    db.commit()
    return get_cart(db, session.session_token if session else "")


def build_deviz_preview(db: Session, payload: CartDevizPreviewRequest) -> CartDevizPreviewResponse | str:
    draft_request = CostDraftRequest(
        service_id=payload.service_id,
        country_id=payload.country_id,
        zone_id=payload.zone_id,
        locality_id=None,
        currency=payload.currency,
        legislation_code=payload.legislation_code,
        urgency=False,
        requested_quantity=payload.requested_quantity,
        target_address=payload.target_address,
        activity_ids=[],
        resources=[],
    )
    result = calculate_draft(db, draft_request)
    if isinstance(result, str):
        return result
    resources_by_type: dict[str, list] = {}
    for resource in result.calculation.resources:
        key = resource.resource_type
        resources_by_type.setdefault(key, []).append(
            {
                "resource_type": resource.resource_type,
                "name": resource.name,
                "unit": resource.unit,
                "quantity": resource.quantity,
                "unit_cost": resource.unit_cost,
                "total_cost": resource.total_cost,
                "esco_code": resource.esco_code,
            }
        )
    return CartDevizPreviewResponse(
        service_id=payload.service_id,
        currency=result.currency,
        cost_direct_total=result.calculation.cost_direct_total,
        indirect_costs=result.calculation.indirect_costs,
        platform_maintenance=result.calculation.platform_maintenance_costs,
        mydarrin_platform=result.calculation.mydarrin_platform_value,
        vat_value=result.calculation.vat_value,
        gross_total=result.calculation.gross_total,
        resources=resources_by_type,
    )
