from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import FileResponse, Response
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.dependencies import get_db
from app.core.limiter import limiter
from app.core.security import get_current_admin_user, get_current_partner_user, get_current_user
from app.models.user import User
from app.modules.orders.document_service import handle_proforma_paid, release_quality_escrow
from app.modules.orders.allocation_service import claim_order_broadcast, get_partner_live_jobs, list_order_broadcasts
from app.modules.orders.schemas import (
    AdminOrderDetail,
    AdminOrderSummary,
    AdminOrderReviewResponse,
    ClientOrderDetail,
    ClientOrderSummary,
    OrderBroadcastClaimRequest,
    OrderBroadcastResponse,
    OrderDocumentResponse,
    OrderAssignRequest,
    OrderReviewCreateRequest,
    OrderReviewResponse,
    OrderReviewAdminUpdateRequest,
    OrderStatusUpdateRequest,
    PartnerLiveJobResponse,
    ProjectedRevenueMetricResponse,
    PublicLiveActivityResponse,
    PublicOrderCreateRequest,
    PublicOrderResponse,
    QualityDocumentsReleaseRequest,
)
from app.modules.orders.service import (
    assign_order_provider,
    create_order_review,
    create_public_order,
    ensure_client_order_document_file,
    ensure_order_document_file_for_order,
    get_admin_order_detail,
    get_client_order_detail,
    get_client_order_review,
    get_projected_revenue_metric,
    list_admin_orders,
    list_admin_reviews,
    list_client_order_documents,
    list_client_orders,
    list_order_documents,
    list_public_live_activity,
    update_admin_review,
    update_admin_order_status,
)
from app.modules.orders.document_storage import get_document_path
from app.modules.orders.models import OrderDocument, Order
from app.models.service import Service
from app.models.user import User
import csv
import io


public_router = APIRouter(prefix="/public/orders", tags=["PublicOrders"])
admin_router = APIRouter(prefix="/backoffice/orders", tags=["AdminOrders"], dependencies=[Depends(get_current_admin_user)])
partner_router = APIRouter(prefix="/partner/orders", tags=["PartnerOrders"], dependencies=[Depends(get_current_partner_user)])
client_router = APIRouter(prefix="/orders", tags=["ClientOrders"], dependencies=[Depends(get_current_user)])


@public_router.post("", response_model=PublicOrderResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("12 per 10 minutes")
def create_public_order_route(
    request: Request,
    payload: PublicOrderCreateRequest,
    db: Session = Depends(get_db),
):
    result = create_public_order(db, payload)
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="service_not_found")
    if isinstance(result, str):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=result)
    return result


@client_router.post("", response_model=PublicOrderResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("12 per 10 minutes")
def create_client_order_route(
    request: Request,
    payload: PublicOrderCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != "CLIENT":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Client access required")
    result = create_public_order(db, payload, current_user=current_user)
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="service_not_found")
    if isinstance(result, str):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=result)
    return result


@public_router.get("/live-feed", response_model=PublicLiveActivityResponse)
def list_public_live_feed(
    db: Session = Depends(get_db),
    limit: int = 8,
):
    return PublicLiveActivityResponse(items=list_public_live_activity(db, limit=limit))


@admin_router.get("/projected-revenue", response_model=ProjectedRevenueMetricResponse)
def get_projected_revenue_route(
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user),
):
    return get_projected_revenue_metric(db, current_admin=current_admin)


@admin_router.get("", response_model=list[AdminOrderSummary])
def list_admin_orders_route(
    db: Session = Depends(get_db),
    limit: int = 50,
):
    return list_admin_orders(db, limit=limit)


@admin_router.get("/export")
def export_orders_csv_route(
    db: Session = Depends(get_db),
):
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "order_ref",
        "status",
        "service_name",
        "total_facturabil",
        "currency",
        "target_address",
        "locality_slug",
        "client_email",
        "client_name",
        "created_at",
    ])
    rows = db.execute(
        select(Order, Service, User)
        .join(Service, Service.id == Order.service_id)
        .outerjoin(User, User.id == Order.client_user_id)
        .order_by(Order.created_at.desc())
    ).all()
    for order, service, client in rows:
        writer.writerow([
            order.order_ref,
            order.status,
            service.name if service else order.asset_label,
            f"{order.total_facturabil:.2f}",
            order.currency,
            order.target_address,
            order.locality_slug or "",
            client.email if client else "",
            client.full_name if client else "",
            order.created_at.isoformat() if order.created_at else "",
        ])
    payload = output.getvalue()
    return Response(
        content=payload,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=orders-export.csv"},
    )


@admin_router.get("/documents/export")
def export_documents_csv_route(
    db: Session = Depends(get_db),
):
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "order_ref",
        "document_type",
        "status",
        "file_name",
        "generated_at",
    ])
    rows = db.execute(
        select(OrderDocument, Order)
        .join(Order, Order.id == OrderDocument.order_id)
        .where(OrderDocument.document_type == "FINAL_INVOICE")
        .order_by(OrderDocument.generated_at.desc())
    ).all()
    for document, order in rows:
        writer.writerow([
            order.order_ref,
            document.document_type,
            document.status,
            document.file_name,
            document.generated_at.isoformat() if document.generated_at else "",
        ])
    payload = output.getvalue()
    return Response(
        content=payload,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=order-documents-export.csv"},
    )


@admin_router.get("/{order_id}", response_model=AdminOrderDetail)
def get_admin_order_detail_route(
    order_id: int,
    db: Session = Depends(get_db),
):
    detail = get_admin_order_detail(db, order_id=order_id)
    if detail is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="order_not_found")
    return detail


@admin_router.get("/{order_id}/documents", response_model=list[OrderDocumentResponse])
def list_admin_order_documents_route(
    order_id: int,
    db: Session = Depends(get_db),
):
    return list_order_documents(db, order_id=order_id)


@admin_router.get("/{order_id}/documents/{document_id}/download")
def download_admin_order_document(
    order_id: int,
    document_id: int,
    db: Session = Depends(get_db),
):
    result = ensure_order_document_file_for_order(db, order_id=order_id, document_id=document_id)
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="document_not_found")
    order, document = result
    path = get_document_path(document.storage_key)
    if path is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="file_not_found")
    return FileResponse(
        path,
        media_type=document.mime_type,
        filename=document.file_name,
    )


@admin_router.patch("/{order_id}/status", response_model=AdminOrderDetail)
def update_admin_order_status_route(
    order_id: int,
    payload: OrderStatusUpdateRequest,
    db: Session = Depends(get_db),
):
    detail = update_admin_order_status(
        db,
        order_id=order_id,
        status=payload.status,
        provider_ref=payload.provider_ref,
        provider_name=payload.provider_name,
        message=payload.message,
    )
    if detail is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="order_not_found")
    return detail


@admin_router.patch("/{order_id}/assign", response_model=AdminOrderDetail)
def assign_order_provider_route(
    order_id: int,
    payload: OrderAssignRequest,
    db: Session = Depends(get_db),
):
    detail = assign_order_provider(
        db,
        order_id=order_id,
        provider_ref=payload.provider_ref,
        provider_name=payload.provider_name,
    )
    if detail is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="order_not_found")
    return detail


@client_router.get("/my", response_model=list[ClientOrderSummary])
def list_client_orders_route(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != "CLIENT":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Client access required")
    return list_client_orders(db, user_id=current_user.id)


@client_router.get("/{order_ref}", response_model=ClientOrderDetail)
def get_client_order_detail_route(
    order_ref: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != "CLIENT":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Client access required")
    detail = get_client_order_detail(db, user_id=current_user.id, order_ref=order_ref)
    if detail is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="order_not_found")
    return detail


@client_router.get("/{order_ref}/documents", response_model=list[OrderDocumentResponse])
def list_client_order_documents_route(
    order_ref: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != "CLIENT":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Client access required")
    docs = list_client_order_documents(db, user_id=current_user.id, order_ref=order_ref)
    if docs is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="order_not_found")
    return docs


@client_router.get("/{order_ref}/documents/{document_id}/download")
def download_client_order_document(
    order_ref: str,
    document_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != "CLIENT":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Client access required")
    result = ensure_client_order_document_file(db, user_id=current_user.id, order_ref=order_ref, document_id=document_id)
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="document_not_found")
    order, document = result
    path = get_document_path(document.storage_key)
    if path is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="file_not_found")
    return FileResponse(
        path,
        media_type=document.mime_type,
        filename=document.file_name,
    )


@client_router.post("/{order_ref}/review", response_model=OrderReviewResponse)
@limiter.limit("5 per hour")
def create_order_review_route(
    order_ref: str,
    request: Request,
    payload: OrderReviewCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != "CLIENT":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Client access required")
    result = create_order_review(db, user_id=current_user.id, order_ref=order_ref, payload=payload)
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="order_not_found")
    if isinstance(result, str):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=result)
    return result


@client_router.get("/{order_ref}/review", response_model=OrderReviewResponse)
def get_order_review_route(
    order_ref: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != "CLIENT":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Client access required")
    result = get_client_order_review(db, user_id=current_user.id, order_ref=order_ref)
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="review_not_found")
    return result


@admin_router.get("/reviews", response_model=list[AdminOrderReviewResponse])
def list_admin_reviews_route(
    db: Session = Depends(get_db),
    limit: int = 50,
):
    return list_admin_reviews(db, limit=limit)


@admin_router.patch("/reviews/{review_id}", response_model=AdminOrderReviewResponse)
def update_admin_review_route(
    review_id: int,
    payload: OrderReviewAdminUpdateRequest,
    db: Session = Depends(get_db),
):
    result = update_admin_review(db, review_id=review_id, is_visible=payload.is_visible, admin_note=payload.admin_note)
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="review_not_found")
    return result


@admin_router.post("/{order_id}/documents/proforma-paid", response_model=list[OrderDocumentResponse])
def mark_proforma_paid_route(
    order_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user),
):
    documents = handle_proforma_paid(db, order_id)
    if documents is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="order_not_found")
    return documents


@admin_router.post("/{order_id}/documents/release-escrow", response_model=OrderDocumentResponse)
def release_escrow_route(
    order_id: int,
    payload: QualityDocumentsReleaseRequest,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user),
):
    document = release_quality_escrow(db, order_id, quality_document_note=payload.quality_document_note)
    if document is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="order_not_found")
    return document


@admin_router.get("/{order_id}/broadcasts", response_model=list[OrderBroadcastResponse])
def list_order_broadcasts_route(
    order_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user),
):
    return list_order_broadcasts(db, order_id)


@admin_router.post("/broadcasts/{broadcast_id}/claim", response_model=OrderBroadcastResponse)
def claim_order_broadcast_route(
    broadcast_id: int,
    payload: OrderBroadcastClaimRequest,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user),
):
    result = claim_order_broadcast(db, broadcast_id=broadcast_id, supplier_id=payload.supplier_id)
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="broadcast_not_found")
    if isinstance(result, str):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=result)
    return result


@partner_router.get("/live-jobs", response_model=list[PartnerLiveJobResponse])
def get_partner_live_jobs_route(
    db: Session = Depends(get_db),
    current_partner: User = Depends(get_current_partner_user),
):
    return get_partner_live_jobs(db, current_user=current_partner)


@partner_router.post("/broadcasts/{broadcast_id}/claim", response_model=OrderBroadcastResponse)
def claim_partner_live_job_route(
    broadcast_id: int,
    db: Session = Depends(get_db),
    current_partner: User = Depends(get_current_partner_user),
):
    jobs = get_partner_live_jobs(db, current_user=current_partner)
    target = next((item for item in jobs if item.broadcast_id == broadcast_id), None)
    if target is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="broadcast_not_found")
    result = claim_order_broadcast(db, broadcast_id=broadcast_id, supplier_id=target.supplier_id)
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="broadcast_not_found")
    if isinstance(result, str):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=result)
    return result
