from __future__ import annotations

from datetime import datetime
from pathlib import Path
from typing import Iterable

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.orders.allocation_service import broadcast_order_to_eligible_partners
from app.modules.orders.models import Order, OrderDocument
from app.modules.orders.document_storage import get_document_path, save_document_content


def _create_document_placeholder(
    db: Session,
    *,
    order: Order,
    document_type: str,
    file_name: str,
    body: str,
) -> OrderDocument:
    storage_key = f"orders/{order.order_ref}/{document_type.lower()}.pdf"
    existing = db.execute(
        select(OrderDocument).where(
            OrderDocument.order_id == order.id,
            OrderDocument.document_type == document_type,
        )
    ).scalar_one_or_none()
    if existing:
        existing.storage_key = storage_key
        existing.file_name = file_name
        existing.placeholder_content = body
        existing.status = "GENERATED"
        return existing

    document = OrderDocument(
        order_id=order.id,
        document_type=document_type,
        status="GENERATED",
        mime_type="application/pdf",
        storage_key=storage_key,
        file_name=file_name,
        placeholder_content=body,
    )
    db.add(document)
    return document


def _escape_pdf_text(value: str) -> str:
    return value.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")


def _build_pdf_bytes(lines: Iterable[str]) -> bytes:
    clean_lines = [_escape_pdf_text(line) for line in lines if line]
    content_lines = ["BT", "/F1 12 Tf", "14 TL", "50 780 Td"]
    for idx, line in enumerate(clean_lines):
        if idx > 0:
            content_lines.append("T*")
        content_lines.append(f"({line}) Tj")
    content_lines.append("ET")
    content = "\n".join(content_lines)

    objects = [
        "<< /Type /Catalog /Pages 2 0 R >>",
        "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
        "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
        "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
        f"<< /Length {len(content)} >>\nstream\n{content}\nendstream",
    ]

    parts: list[bytes] = [b"%PDF-1.4\n"]
    offsets: list[int] = []
    current = len(parts[0])
    for index, obj in enumerate(objects, start=1):
        offsets.append(current)
        obj_bytes = f"{index} 0 obj\n{obj}\nendobj\n".encode("utf-8")
        parts.append(obj_bytes)
        current += len(obj_bytes)

    xref_offset = current
    xref_lines = [
        f"xref\n0 {len(objects) + 1}\n",
        "0000000000 65535 f \n",
    ]
    for offset in offsets:
        xref_lines.append(f"{offset:010d} 00000 n \n")
    trailer = f"trailer << /Size {len(objects) + 1} /Root 1 0 R >>\nstartxref\n{xref_offset}\n%%EOF\n"
    parts.append("".join(xref_lines).encode("utf-8"))
    parts.append(trailer.encode("utf-8"))
    return b"".join(parts)


def _build_document_lines(order: Order, *, title: str, body: str) -> list[str]:
    return [
        "My Darrin",
        title,
        f"Comanda: {order.order_ref}",
        f"Data: {datetime.now().strftime('%Y-%m-%d %H:%M')}",
        f"Adresa: {order.target_address}",
        f"Total: {order.total_facturabil:.2f} {order.currency}",
        "",
        body,
    ]


def _persist_document_file(order: Order, document: OrderDocument) -> Path:
    lines = _build_document_lines(order, title=document.document_type, body=document.placeholder_content)
    content = _build_pdf_bytes(lines)
    return save_document_content(storage_key=document.storage_key, content=content, mime_type=document.mime_type)


def ensure_document_file(db: Session, order: Order, document: OrderDocument) -> Path | None:
    path = get_document_path(document.storage_key)
    if path is not None:
        return path
    return _persist_document_file(order, document)


def generate_proforma_document(db: Session, order: Order) -> OrderDocument:
    document = _create_document_placeholder(
        db,
        order=order,
        document_type="PROFORMA",
        file_name=f"{order.order_ref}-proforma.pdf",
        body=f"Proforma placeholder pentru comanda {order.order_ref}. Total: {order.total_facturabil:.2f} {order.currency}.",
    )
    db.commit()
    ensure_document_file(db, order, document)
    db.refresh(document)
    return document


def handle_proforma_paid(db: Session, order_id: int) -> list[OrderDocument] | None:
    order = db.get(Order, order_id)
    if order is None:
        return None

    order.status = "PAID"
    docs = [
        _create_document_placeholder(
            db,
            order=order,
            document_type="CONTRACT",
            file_name=f"{order.order_ref}-contract.pdf",
            body=f"Contract prestari servicii generat automat pentru {order.order_ref}.",
        ),
        _create_document_placeholder(
            db,
            order=order,
            document_type="FINAL_INVOICE",
            file_name=f"{order.order_ref}-factura-finala.pdf",
            body=f"Factura finala placeholder pentru {order.order_ref}.",
        ),
    ]
    order.escrow_status = "BLOCKED" if order.garantie_buna_executie > 0 else "NOT_REQUIRED"
    order.escrow_blocked_amount = order.garantie_buna_executie
    db.commit()
    broadcast_order_to_eligible_partners(db, order.id)
    for item in docs:
        ensure_document_file(db, order, item)
        db.refresh(item)
    return docs


def release_quality_escrow(db: Session, order_id: int, *, quality_document_note: str) -> OrderDocument | None:
    order = db.get(Order, order_id)
    if order is None:
        return None

    document = _create_document_placeholder(
        db,
        order=order,
        document_type="WARRANTY_CERTIFICATE",
        file_name=f"{order.order_ref}-certificat-garantie.pdf",
        body=(
            f"Certificat garantie placeholder pentru {order.order_ref}. "
            f"Documente calitate: {quality_document_note}."
        ),
    )
    order.escrow_status = "RELEASED"
    order.escrow_blocked_amount = 0.0
    db.commit()
    ensure_document_file(db, order, document)
    db.refresh(document)
    return document


def ensure_final_invoice(db: Session, order: Order) -> OrderDocument:
    document = _create_document_placeholder(
        db,
        order=order,
        document_type="FINAL_INVOICE",
        file_name=f"{order.order_ref}-factura-finala.pdf",
        body=f"Factura finala pentru {order.order_ref}. Total {order.total_facturabil:.2f} {order.currency}.",
    )
    db.commit()
    ensure_document_file(db, order, document)
    db.refresh(document)
    return document
