from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.modules.cart.schemas import (
    CartItemUpsertRequest,
    CartItemUpdateRequest,
    CartDevizPreviewRequest,
    CartDevizPreviewResponse,
    CartResponse,
    CartSessionResponse,
)
from app.modules.cart.service import (
    build_deviz_preview,
    create_or_refresh_session,
    delete_item,
    get_cart,
    upsert_item,
    update_item,
)

router = APIRouter(prefix="/public/cart", tags=["PublicCart"])


@router.post("/session", response_model=CartSessionResponse)
def create_session(payload: dict | None = None, db: Session = Depends(get_db)):
    token = None
    if payload and isinstance(payload, dict):
        token = payload.get("session_token")
    return create_or_refresh_session(db, token)


@router.get("", response_model=CartResponse)
def get_cart_route(session_token: str, db: Session = Depends(get_db)):
    return get_cart(db, session_token)


@router.post("/items", response_model=CartResponse)
def upsert_item_route(payload: CartItemUpsertRequest, db: Session = Depends(get_db)):
    return upsert_item(db, payload)


@router.patch("/items/{item_id}", response_model=CartResponse)
def update_item_route(item_id: int, payload: CartItemUpdateRequest, db: Session = Depends(get_db)):
    try:
        return update_item(db, item_id, payload)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="item_not_found") from None


@router.delete("/items/{item_id}", response_model=CartResponse)
def delete_item_route(item_id: int, db: Session = Depends(get_db)):
    try:
        return delete_item(db, item_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="item_not_found") from None


@router.post("/deviz-preview", response_model=CartDevizPreviewResponse)
def deviz_preview_route(payload: CartDevizPreviewRequest, db: Session = Depends(get_db)):
    result = build_deviz_preview(db, payload)
    if isinstance(result, str):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=result)
    return result
