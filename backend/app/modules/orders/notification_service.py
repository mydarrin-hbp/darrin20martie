from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.price_analysis import Supplier
from app.models.service import Service
from app.models.user import User
from app.modules.orders.models import Order
from app.services.email_service import send_email
import logging

LOGGER = logging.getLogger("mydarrin.notifications")


def _resolve_client_email(db: Session, order: Order) -> str | None:
    if not order.client_user_id:
        return None
    user = db.execute(select(User).where(User.id == order.client_user_id)).scalar_one_or_none()
    return user.email if user else None


def _resolve_provider_email(db: Session, order: Order) -> str | None:
    if not order.provider_ref and not order.provider_name:
        return None
    supplier = None
    if order.provider_ref:
        try:
            supplier_id = int(order.provider_ref)
        except (TypeError, ValueError):
            supplier_id = None
        if supplier_id:
            supplier = db.execute(select(Supplier).where(Supplier.id == supplier_id)).scalar_one_or_none()
    if supplier is None and order.provider_name:
        supplier = db.execute(
            select(Supplier).where(Supplier.name == order.provider_name)
        ).scalar_one_or_none()
    if supplier is None and order.provider_ref:
        supplier = db.execute(
            select(Supplier).where(Supplier.name == order.provider_ref)
        ).scalar_one_or_none()
    return supplier.contact_email if supplier else None


def _service_name(db: Session, order: Order) -> str:
    service = db.get(Service, order.service_id)
    return service.name if service else (order.asset_label or "Serviciu My Darrin")


def notify_order_confirmation(db: Session, order: Order) -> None:
    client_email = _resolve_client_email(db, order)
    if not client_email:
        return
    service_name = _service_name(db, order)
    body = (
        f"Comanda {order.order_ref} a fost inregistrata.\n"
        f"Serviciu: {service_name}\n"
        f"Adresa: {order.target_address}\n"
        f"Total: {order.total_facturabil:.2f} {order.currency}\n"
    )
    if not send_email(to_email=client_email, subject="Confirmare comanda My Darrin", body=body):
        LOGGER.warning("Email confirmation not sent for %s", order.order_ref)


def notify_provider_assignment(db: Session, order: Order) -> None:
    client_email = _resolve_client_email(db, order)
    provider_email = _resolve_provider_email(db, order)
    service_name = _service_name(db, order)
    body_client = (
        f"Comanda {order.order_ref} a fost alocata unui furnizor.\n"
        f"Serviciu: {service_name}\n"
        f"Furnizor: {order.provider_name or order.provider_ref or 'My Darrin'}\n"
    )
    if client_email and not send_email(to_email=client_email, subject="Furnizor alocat comenzii", body=body_client):
        LOGGER.warning("Email assignment to client not sent for %s", order.order_ref)
    if provider_email:
        body_provider = (
            f"Ati fost alocat pentru comanda {order.order_ref}.\n"
            f"Serviciu: {service_name}\n"
            f"Adresa: {order.target_address}\n"
        )
        if not send_email(to_email=provider_email, subject="Comanda noua alocata", body=body_provider):
            LOGGER.warning("Email assignment to provider not sent for %s", order.order_ref)


def notify_order_completed(db: Session, order: Order) -> None:
    client_email = _resolve_client_email(db, order)
    if not client_email:
        return
    service_name = _service_name(db, order)
    body = (
        f"Comanda {order.order_ref} a fost finalizata.\n"
        f"Serviciu: {service_name}\n"
        "Iti multumim pentru incredere.\n"
    )
    if not send_email(to_email=client_email, subject="Comanda finalizata", body=body):
        LOGGER.warning("Email completion not sent for %s", order.order_ref)
