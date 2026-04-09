from __future__ import annotations

import secrets

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.service import Service
from app.models.user import User
from app.modules.cost_engine.schemas import ServiceLevel
from app.modules.deviz_engine.schemas import DevizRequest
from app.modules.deviz_engine.service import generate_deviz
from app.modules.geography.models import Country, Locality, Zone
from app.modules.orders.document_service import ensure_document_file, ensure_final_invoice, generate_proforma_document
from app.modules.orders.asset_dispatch_registry import resolve_dispatch_skill_packet
from app.modules.orders.models import Order, OrderBroadcast, OrderDocument, OrderReview
from app.modules.orders.schemas import (
    AdminOrderDetail,
    AdminOrderSummary,
    AdminOrderReviewResponse,
    ClientOrderDetail,
    ClientOrderSummary,
    ExpiredJobSummary,
    OrderReviewCreateRequest,
    OrderReviewResponse,
    ProjectedRevenueMetricResponse,
    PublicOrderCreateRequest,
    PublicOrderResponse,
    OrderStatusUpdateRequest,
)
from app.modules.orders.notification_service import (
    notify_order_completed,
    notify_order_confirmation,
    notify_provider_assignment,
)
from app.modules.sync.service import update_order_status as publish_order_status_update
from app.modules.sync.service import syncPublicPrices
from app.schemas.price_analysis import RecipeLevelName


def _round_amount(value: float) -> float:
    return round(value, 2)


PROJECTED_REVENUE_STATUSES = [
    "PENDING_PROVIDER_SELECTION",
    "SEARCHING_PROVIDER",
    "PROVIDER_ALLOCATED",
    "ASSIGNED",
    "IN_PROGRESS",
    "PAID",
]

LIVE_ACTIVITY_STATUSES = [
    "PAID",
    "IN_PROGRESS",
    "ASSIGNED",
]


def _resolve_service(db: Session, slug: str) -> Service | None:
    return db.execute(select(Service).where(Service.slug == slug)).scalar_one_or_none()


def _resolve_geo_ids(
    db: Session,
    *,
    country_code: str,
    zone_slug: str,
    locality_slug: str | None,
) -> tuple[Country, Zone, Locality | None] | None:
    country = db.execute(select(Country).where(Country.code == country_code)).scalar_one_or_none()
    if country is None:
        return None

    zone = db.execute(
        select(Zone).where(
            Zone.country_id == country.id,
            Zone.slug == zone_slug,
            Zone.is_active.is_(True),
        )
    ).scalar_one_or_none()
    if zone is None:
        return None

    locality = None
    if locality_slug:
        locality = db.execute(
            select(Locality).where(
                Locality.country_id == country.id,
                Locality.zone_id == zone.id,
                Locality.slug == locality_slug,
                Locality.is_active.is_(True),
            )
        ).scalar_one_or_none()
    return country, zone, locality


def create_public_order(db: Session, data: PublicOrderCreateRequest, *, current_user: User | None = None) -> PublicOrderResponse | str | None:
    service = _resolve_service(db, data.slug)
    if service is None:
        return None

    breakdown = syncPublicPrices(
        db,
        data.slug,
        target_address=data.target_address,
        place_id=data.place_id,
        requested_quantity=data.requested_quantity,
        urgency=data.urgency,
        service_level=ServiceLevel.STANDARD,
        recipe_level=RecipeLevelName.ARGINT,
    )
    if isinstance(breakdown, str):
        return breakdown
    if breakdown is None:
        return None
    if breakdown.availability_status != "available":
        return breakdown.availability_status

    geo_ids = _resolve_geo_ids(
        db,
        country_code=breakdown.country_code,
        zone_slug=breakdown.zone_slug,
        locality_slug=breakdown.locality_slug,
    )
    if geo_ids is None:
        return "geo_context_not_found"
    country, zone, locality = geo_ids

    deviz = generate_deviz(
        db,
        DevizRequest(
            service_id=service.id,
            country_id=country.id,
            zone_id=zone.id,
            locality_id=locality.id if locality else None,
            currency=breakdown.currency,
            legislation_code=breakdown.legislation_code,
            urgency=data.urgency,
            service_level=ServiceLevel.STANDARD,
            recipe_level=RecipeLevelName.ARGINT,
            requested_quantity=data.requested_quantity,
            target_address=data.target_address,
            source_message=f"Public order {data.slug}",
            activity_ids=[],
            resources=[],
        ),
    )
    if isinstance(deviz, str):
        return deviz

    skill_packet = resolve_dispatch_skill_packet(data.slug, data.intervention_label)
    asset_label = data.slug
    intervention_label = data.intervention_label
    task_label = data.task_label
    skill_label = data.skill_label
    required_people = data.required_people
    esco_codes = list(data.esco_codes)
    nace_codes = list(data.nace_codes)
    required_certification_codes = list(data.required_certification_codes)
    standard_consumables = list(data.standard_consumables)
    if skill_packet is not None:
        asset_label = skill_packet.asset_label
        intervention_label = intervention_label or skill_packet.intervention_label
        task_label = task_label or skill_packet.task_label
        skill_label = skill_label or skill_packet.skill_label
        required_people = required_people or skill_packet.required_people
        esco_codes = esco_codes or list(skill_packet.esco_codes)
        nace_codes = nace_codes or list(skill_packet.nace_codes)
        required_certification_codes = required_certification_codes or list(skill_packet.required_certification_codes)
        standard_consumables = standard_consumables or list(skill_packet.standard_consumables)

    insurance_premium = 0.0
    if getattr(breakdown, "taxe_si_garantii", None) is not None:
        insurance_premium = max(breakdown.taxe_si_garantii - breakdown.tva - breakdown.garantie_buna_executie, 0.0)

    order = Order(
        order_ref=f"ORD-{secrets.token_hex(5).upper()}",
        service_id=service.id,
        client_user_id=current_user.id if current_user else None,
        deviz_draft_id=deviz.id,
        status="PENDING_PROVIDER_SELECTION",
        target_address=data.target_address,
        country_code=breakdown.country_code,
        zone_slug=breakdown.zone_slug,
        locality_slug=breakdown.locality_slug,
        requested_quantity=data.requested_quantity,
        asset_label=asset_label,
        intervention_label=intervention_label,
        task_label=task_label,
        skill_label=skill_label,
        required_people=required_people,
        esco_codes=esco_codes,
        nace_codes=nace_codes,
        required_certification_codes=required_certification_codes,
        standard_consumables=standard_consumables,
        currency=breakdown.currency,
        currency_symbol=breakdown.currency_symbol,
        cost_direct=_round_amount(breakdown.cost_direct),
        cost_regie=_round_amount(breakdown.cost_regie),
        mentenanta_platforma=_round_amount(breakdown.mentenanta_platforma),
        venit_platforma=_round_amount(breakdown.venit_platforma),
        garantie_buna_executie=_round_amount(breakdown.garantie_buna_executie),
        insurance_premium=_round_amount(insurance_premium),
        darrin_management_fee=_round_amount(max(breakdown.venit_platforma - breakdown.mentenanta_platforma, 0.0)),
        tva=_round_amount(breakdown.tva),
        total_facturabil=_round_amount(breakdown.total_facturabil),
        escrow_status="BLOCKED" if breakdown.garantie_buna_executie > 0 else "NOT_REQUIRED",
        escrow_blocked_amount=_round_amount(breakdown.garantie_buna_executie),
    )
    db.add(order)
    db.commit()
    db.refresh(order)
    generate_proforma_document(db, order)
    db.commit()
    notify_order_confirmation(db, order)

    return PublicOrderResponse(
        order_ref=order.order_ref,
        slug=data.slug,
        status=order.status,
        target_address=order.target_address,
        country_code=order.country_code,
        zone_slug=order.zone_slug,
        locality_slug=order.locality_slug,
        requested_quantity=order.requested_quantity,
        asset_label=order.asset_label,
        intervention_label=order.intervention_label,
        task_label=order.task_label,
        skill_label=order.skill_label,
        required_people=order.required_people,
        esco_codes=order.esco_codes or [],
        nace_codes=order.nace_codes or [],
        required_certification_codes=order.required_certification_codes or [],
        standard_consumables=order.standard_consumables or [],
        currency=order.currency,
        currency_symbol=order.currency_symbol,
        minimum_order_applied=bool(breakdown.minimum_order_applied),
        cost_direct=order.cost_direct,
        cost_regie=order.cost_regie,
        mentenanta_platforma=order.mentenanta_platforma,
        venit_platforma=order.venit_platforma,
        garantie_buna_executie=order.garantie_buna_executie,
        insurance_premium=order.insurance_premium,
        darrin_management_fee=order.darrin_management_fee,
        tva=order.tva,
        total_facturabil=order.total_facturabil,
        deviz_draft_id=order.deviz_draft_id,
        created_at=order.created_at,
    )


def _order_summary_payload(order: Order, service: Service | None, client: User | None) -> dict:
    return {
        "id": order.id,
        "order_ref": order.order_ref,
        "status": order.status,
        "service_name": service.name if service else (order.asset_label or "Serviciu"),
        "total_facturabil": order.total_facturabil,
        "currency": order.currency,
        "target_address": order.target_address,
        "locality_slug": order.locality_slug,
        "client_email": client.email if client else None,
        "client_name": client.full_name if client else None,
        "provider_ref": order.provider_ref,
        "provider_name": order.provider_name,
        "created_at": order.created_at,
        "updated_at": order.updated_at,
    }


def list_admin_orders(db: Session, *, limit: int = 50) -> list[AdminOrderSummary]:
    rows = db.execute(
        select(Order, Service, User)
        .join(Service, Service.id == Order.service_id)
        .outerjoin(User, User.id == Order.client_user_id)
        .order_by(Order.created_at.desc())
        .limit(limit)
    ).all()
    return [AdminOrderSummary(**_order_summary_payload(order, service, client)) for order, service, client in rows]


def get_admin_order_detail(db: Session, *, order_id: int) -> AdminOrderDetail | None:
    row = db.execute(
        select(Order, Service, User)
        .join(Service, Service.id == Order.service_id)
        .outerjoin(User, User.id == Order.client_user_id)
        .where(Order.id == order_id)
    ).first()
    if not row:
        return None
    order, service, client = row
    payload = _order_summary_payload(order, service, client)
    payload.update(
        {
            "cost_direct": order.cost_direct,
            "cost_regie": order.cost_regie,
            "mentenanta_platforma": order.mentenanta_platforma,
            "venit_platforma": order.venit_platforma,
            "garantie_buna_executie": order.garantie_buna_executie,
            "insurance_premium": order.insurance_premium,
            "darrin_management_fee": order.darrin_management_fee,
            "tva": order.tva,
            "escrow_status": order.escrow_status,
            "escrow_blocked_amount": order.escrow_blocked_amount,
            "asset_label": order.asset_label,
            "intervention_label": order.intervention_label,
            "task_label": order.task_label,
            "skill_label": order.skill_label,
            "required_people": order.required_people,
        }
    )
    return AdminOrderDetail(**payload)


def list_client_orders(db: Session, *, user_id: int) -> list[ClientOrderSummary]:
    rows = db.execute(
        select(Order, Service)
        .join(Service, Service.id == Order.service_id)
        .where(Order.client_user_id == user_id)
        .order_by(Order.created_at.desc())
    ).all()
    return [
        ClientOrderSummary(
            order_ref=order.order_ref,
            status=order.status,
            service_name=service.name if service else (order.asset_label or "Serviciu"),
            total_facturabil=order.total_facturabil,
            currency=order.currency,
            target_address=order.target_address,
            locality_slug=order.locality_slug,
            provider_ref=order.provider_ref,
            provider_name=order.provider_name,
            created_at=order.created_at,
            updated_at=order.updated_at,
        )
        for order, service in rows
    ]


def get_client_order_detail(db: Session, *, user_id: int, order_ref: str) -> ClientOrderDetail | None:
    row = db.execute(
        select(Order, Service)
        .join(Service, Service.id == Order.service_id)
        .where(Order.client_user_id == user_id, Order.order_ref == order_ref)
    ).first()
    if not row:
        return None
    order, service = row
    return ClientOrderDetail(
        order_ref=order.order_ref,
        status=order.status,
        service_name=service.name if service else (order.asset_label or "Serviciu"),
        total_facturabil=order.total_facturabil,
        currency=order.currency,
        target_address=order.target_address,
        locality_slug=order.locality_slug,
        provider_ref=order.provider_ref,
        provider_name=order.provider_name,
        created_at=order.created_at,
        updated_at=order.updated_at,
        cost_direct=order.cost_direct,
        cost_regie=order.cost_regie,
        mentenanta_platforma=order.mentenanta_platforma,
        venit_platforma=order.venit_platforma,
        garantie_buna_executie=order.garantie_buna_executie,
        insurance_premium=order.insurance_premium,
        darrin_management_fee=order.darrin_management_fee,
        tva=order.tva,
        escrow_status=order.escrow_status,
        escrow_blocked_amount=order.escrow_blocked_amount,
        asset_label=order.asset_label,
        intervention_label=order.intervention_label,
        task_label=order.task_label,
        skill_label=order.skill_label,
        required_people=order.required_people,
    )


def update_admin_order_status(
    db: Session,
    *,
    order_id: int,
    status: str,
    provider_ref: str | None = None,
    provider_name: str | None = None,
    message: str | None = None,
) -> AdminOrderDetail | None:
    order = db.get(Order, order_id)
    if order is None:
        return None
    order.status = status
    if provider_ref is not None:
        order.provider_ref = provider_ref
    if provider_name is not None:
        order.provider_name = provider_name
    db.commit()
    db.refresh(order)

    if order.status in {"PAID", "COMPLETED"}:
        ensure_final_invoice(db, order)
    if order.status == "COMPLETED":
        notify_order_completed(db, order)

    publish_order_status_update(
        order.order_ref,
        OrderStatusUpdateRequest(
            status=order.status,
            provider_ref=order.provider_ref,
            provider_name=order.provider_name,
            message=message,
        ),
    )

    return get_admin_order_detail(db, order_id=order.id)


def assign_order_provider(
    db: Session,
    *,
    order_id: int,
    provider_ref: str | None,
    provider_name: str | None,
) -> AdminOrderDetail | None:
    order = db.get(Order, order_id)
    if order is None:
        return None
    order.provider_ref = provider_ref
    order.provider_name = provider_name
    if order.status == "PENDING_PROVIDER_SELECTION":
        order.status = "ASSIGNED"
    db.commit()
    db.refresh(order)
    notify_provider_assignment(db, order)
    publish_order_status_update(
        order.order_ref,
        OrderStatusUpdateRequest(
            status=order.status,
            provider_ref=order.provider_ref,
            provider_name=order.provider_name,
            message="Comanda a fost alocata unui furnizor.",
        ),
    )
    return get_admin_order_detail(db, order_id=order.id)


def list_order_documents(db: Session, *, order_id: int) -> list[OrderDocument]:
    return db.execute(
        select(OrderDocument)
        .where(OrderDocument.order_id == order_id)
        .order_by(OrderDocument.generated_at.desc(), OrderDocument.id.desc())
    ).scalars().all()


def list_client_order_documents(db: Session, *, user_id: int, order_ref: str) -> list[OrderDocument] | None:
    order = db.execute(
        select(Order).where(Order.order_ref == order_ref, Order.client_user_id == user_id)
    ).scalar_one_or_none()
    if order is None:
        return None
    return list_order_documents(db, order_id=order.id)


def ensure_order_document_file(db: Session, *, document_id: int) -> tuple[Order, OrderDocument] | None:
    row = db.execute(
        select(Order, OrderDocument)
        .join(OrderDocument, OrderDocument.order_id == Order.id)
        .where(OrderDocument.id == document_id)
    ).first()
    if not row:
        return None
    order, document = row
    ensure_document_file(db, order, document)
    return order, document


def ensure_order_document_file_for_order(db: Session, *, order_id: int, document_id: int) -> tuple[Order, OrderDocument] | None:
    row = db.execute(
        select(Order, OrderDocument)
        .join(OrderDocument, OrderDocument.order_id == Order.id)
        .where(Order.id == order_id, OrderDocument.id == document_id)
    ).first()
    if not row:
        return None
    order, document = row
    ensure_document_file(db, order, document)
    return order, document


def ensure_client_order_document_file(db: Session, *, user_id: int, order_ref: str, document_id: int) -> tuple[Order, OrderDocument] | None:
    row = db.execute(
        select(Order, OrderDocument)
        .join(OrderDocument, OrderDocument.order_id == Order.id)
        .where(Order.order_ref == order_ref, Order.client_user_id == user_id, OrderDocument.id == document_id)
    ).first()
    if not row:
        return None
    order, document = row
    ensure_document_file(db, order, document)
    return order, document


def create_order_review(
    db: Session,
    *,
    user_id: int,
    order_ref: str,
    payload: OrderReviewCreateRequest,
) -> OrderReviewResponse | str | None:
    order = db.execute(
        select(Order).where(Order.order_ref == order_ref, Order.client_user_id == user_id)
    ).scalar_one_or_none()
    if order is None:
        return None
    if order.status not in {"PAID", "COMPLETED"}:
        return "order_not_completed"
    existing = db.execute(
        select(OrderReview).where(OrderReview.order_id == order.id)
    ).scalar_one_or_none()
    if existing:
        return "review_exists"

    review = OrderReview(
        order_id=order.id,
        user_id=user_id,
        rating=payload.rating,
        feedback=payload.feedback,
        is_visible=True,
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    return OrderReviewResponse(
        id=review.id,
        order_ref=order.order_ref,
        rating=review.rating,
        feedback=review.feedback,
        is_visible=review.is_visible,
        admin_note=review.admin_note,
        created_at=review.created_at,
    )


def get_client_order_review(db: Session, *, user_id: int, order_ref: str) -> OrderReviewResponse | None:
    row = db.execute(
        select(Order, OrderReview)
        .join(OrderReview, OrderReview.order_id == Order.id)
        .where(Order.order_ref == order_ref, Order.client_user_id == user_id)
    ).first()
    if not row:
        return None
    order, review = row
    return OrderReviewResponse(
        id=review.id,
        order_ref=order.order_ref,
        rating=review.rating,
        feedback=review.feedback,
        is_visible=review.is_visible,
        admin_note=review.admin_note,
        created_at=review.created_at,
    )


def list_admin_reviews(db: Session, *, limit: int = 50) -> list[AdminOrderReviewResponse]:
    rows = db.execute(
        select(OrderReview, Order, User)
        .join(Order, Order.id == OrderReview.order_id)
        .outerjoin(User, User.id == Order.client_user_id)
        .order_by(OrderReview.created_at.desc())
        .limit(limit)
    ).all()
    result: list[AdminOrderReviewResponse] = []
    for review, order, client in rows:
        result.append(
            AdminOrderReviewResponse(
                id=review.id,
                order_ref=order.order_ref,
                rating=review.rating,
                feedback=review.feedback,
                is_visible=review.is_visible,
                admin_note=review.admin_note,
                client_name=client.full_name if client else None,
                client_email=client.email if client else None,
                created_at=review.created_at,
            )
        )
    return result


def update_admin_review(
    db: Session,
    *,
    review_id: int,
    is_visible: bool | None,
    admin_note: str | None,
) -> AdminOrderReviewResponse | None:
    review = db.get(OrderReview, review_id)
    if review is None:
        return None
    if is_visible is not None:
        review.is_visible = is_visible
    if admin_note is not None:
        review.admin_note = admin_note
    db.commit()
    order = db.get(Order, review.order_id)
    client = db.get(User, order.client_user_id) if order and order.client_user_id else None
    return AdminOrderReviewResponse(
        id=review.id,
        order_ref=order.order_ref if order else "UNKNOWN",
        rating=review.rating,
        feedback=review.feedback,
        is_visible=review.is_visible,
        admin_note=review.admin_note,
        client_name=client.full_name if client else None,
        client_email=client.email if client else None,
        created_at=review.created_at,
    )


def get_projected_revenue_metric(db: Session, *, current_admin: User | None = None) -> ProjectedRevenueMetricResponse:
    totals = db.execute(
        select(
            func.coalesce(func.sum(Order.total_facturabil), 0.0),
            func.count(Order.id),
        ).where(Order.status.in_(PROJECTED_REVENUE_STATUSES))
    ).one()

    projected_total = _round_amount(float(totals[0] or 0.0))
    projected_count = int(totals[1] or 0)
    currency = db.execute(select(Order.currency).where(Order.status.in_(PROJECTED_REVENUE_STATUSES)).limit(1)).scalar_one_or_none() or "RON"
    full_package_rows = db.execute(
        select(OrderBroadcast).where(OrderBroadcast.can_cover_full_package.is_(True))
    ).scalars().all()
    full_package_claimed_60s = 0
    for row in full_package_rows:
        if row.claim_status == "CLAIMED" and row.claimed_at and row.created_at:
            if (row.claimed_at - row.created_at).total_seconds() <= 60:
                full_package_claimed_60s += 1
    expired_job_count = int(
        db.execute(select(func.count(OrderBroadcast.id)).where(OrderBroadcast.claim_status == "EXPIRED")).scalar_one() or 0
    )
    expired_rows = db.execute(
        select(OrderBroadcast).where(OrderBroadcast.claim_status == "EXPIRED").order_by(OrderBroadcast.created_at.desc()).limit(5)
    ).scalars().all()
    expired_jobs: list[ExpiredJobSummary] = []
    for row in expired_rows:
        order = db.get(Order, row.order_id)
        if order is None:
            continue
        service = db.get(Service, order.service_id)
        if any(code.upper() == "ISCIR_AUTH" for code in (order.required_certification_codes or [])):
            missing_skill_label = "Lipseste instalator autorizat ISCIR"
        elif order.skill_label:
            missing_skill_label = f"Lipseste {order.skill_label.lower()}"
        else:
            missing_skill_label = "Lipseste partener eligibil"
        expired_jobs.append(
            ExpiredJobSummary(
                order_ref=order.order_ref,
                service_name=service.name if service else order.asset_label or "Serviciu necunoscut",
                locality_slug=order.locality_slug,
                missing_skill_label=missing_skill_label,
                expired_at=row.created_at,
            )
        )

    return ProjectedRevenueMetricResponse(
        projected_revenue_total=projected_total,
        projected_order_count=projected_count,
        currency=currency,
        statuses=PROJECTED_REVENUE_STATUSES,
        full_package_claim_rate_60s=_round_amount(
            (full_package_claimed_60s / len(full_package_rows) * 100.0) if full_package_rows else 0.0
        ),
        expired_job_count=expired_job_count,
        expired_jobs=expired_jobs,
    )


def list_public_live_activity(db: Session, *, limit: int = 8):
    rows = db.execute(
        select(Order)
        .where(Order.status.in_(LIVE_ACTIVITY_STATUSES))
        .order_by(Order.created_at.desc())
        .limit(limit)
    ).scalars().all()
    items = []
    for order in rows:
        service = db.get(Service, order.service_id)
        service_name = service.name if service else order.asset_label or "Serviciu"
        locality = order.locality_slug or order.zone_slug
        if order.status == "PAID":
            message = f"{service_name} finalizat in {locality}"
        elif order.status == "IN_PROGRESS":
            message = f"{service_name} in executie in {locality}"
        else:
            message = f"{service_name} in asignare in {locality}"
        items.append(
            {
                "order_ref": order.order_ref,
                "service_name": service_name,
                "locality_slug": order.locality_slug,
                "status": order.status,
                "finished_at": order.created_at,
                "message": message,
            }
        )
    return items
