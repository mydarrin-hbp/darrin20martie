from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.core.dependencies import get_db
from app.core.security import get_current_admin_user
from app.modules.sync.schemas import (
    OrderStatusSnapshotResponse,
    OrderStatusUpdateRequest,
    PublicCatalogPriceResponse,
    PublicPriceBreakdownResponse,
    PublicSyncManifestResponse,
)
from app.modules.sync.service import (
    get_order_status_snapshot,
    get_public_catalog_price,
    get_public_sync_manifest,
    syncPublicPrices,
    stream_sync_events,
    update_order_status,
)
from app.modules.cost_engine.schemas import ServiceLevel
from app.schemas.price_analysis import RecipeLevelName

public_router = APIRouter(prefix="/public/sync", tags=["PublicSync"])
admin_router = APIRouter(prefix="/backoffice/sync", tags=["AdminSync"], dependencies=[Depends(get_current_admin_user)])


@public_router.get("/manifest", response_model=PublicSyncManifestResponse)
def get_sync_manifest_route(db: Session = Depends(get_db)):
    return get_public_sync_manifest(db)


@public_router.get("/catalog-price/{slug}", response_model=PublicCatalogPriceResponse)
def get_catalog_price_route(
    slug: str,
    country_code: str | None = Query(default=None),
    zone_slug: str | None = Query(default=None),
    locality_slug: str | None = Query(default=None),
    target_address: str | None = Query(default=None),
    place_id: str | None = Query(default=None),
    requested_quantity: float | None = Query(default=None, gt=0),
    urgency: bool = Query(default=False),
    db: Session = Depends(get_db),
):
    try:
        result = get_public_catalog_price(
            db,
            slug,
            country_code=country_code,
            zone_slug=zone_slug,
            locality_slug=locality_slug,
            target_address=target_address,
            place_id=place_id,
            requested_quantity=requested_quantity,
            urgency=urgency,
        )
    except LookupError as exc:
        detail = str(exc)
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=detail) from exc

    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="service_not_found")
    if isinstance(result, str):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=result)
    return result


@public_router.get("/price-breakdown/{slug}", response_model=PublicPriceBreakdownResponse)
def get_price_breakdown_route(
    slug: str,
    country_code: str | None = Query(default=None),
    zone_slug: str | None = Query(default=None),
    locality_slug: str | None = Query(default=None),
    target_address: str | None = Query(default=None),
    place_id: str | None = Query(default=None),
    requested_quantity: float | None = Query(default=None, gt=0),
    urgency: bool = Query(default=False),
    service_level: ServiceLevel = Query(default=ServiceLevel.STANDARD),
    recipe_level: RecipeLevelName = Query(default=RecipeLevelName.ARGINT),
    db: Session = Depends(get_db),
):
    try:
        result = syncPublicPrices(
            db,
            slug,
            country_code=country_code,
            zone_slug=zone_slug,
            locality_slug=locality_slug,
            target_address=target_address,
            place_id=place_id,
            requested_quantity=requested_quantity,
            urgency=urgency,
            service_level=service_level,
            recipe_level=recipe_level,
        )
    except LookupError as exc:
        detail = str(exc)
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=detail) from exc

    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="service_not_found")
    if isinstance(result, str):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=result)
    return result


@public_router.get("/site-content/stream")
async def stream_site_content_events():
    return StreamingResponse(stream_sync_events("site-content"), media_type="text/event-stream")


@public_router.get("/order-status/{order_ref}", response_model=OrderStatusSnapshotResponse)
def get_order_status_route(order_ref: str):
    return get_order_status_snapshot(order_ref)


@public_router.get("/order-status/stream/{order_ref}")
async def stream_order_status_route(order_ref: str):
    initial_snapshot = get_order_status_snapshot(order_ref).model_dump(mode="json")
    return StreamingResponse(
        stream_sync_events(f"order-status:{order_ref}", initial_payload=initial_snapshot),
        media_type="text/event-stream",
    )


@admin_router.post("/order-status/{order_ref}", response_model=OrderStatusSnapshotResponse)
def update_order_status_route(order_ref: str, payload: OrderStatusUpdateRequest):
    return update_order_status(order_ref, payload)
