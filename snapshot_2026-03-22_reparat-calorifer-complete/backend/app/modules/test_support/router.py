from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.dependencies import get_db
from app.core.security import get_current_admin_user
from app.services.reparat_calorifer_service import (
    calculate_all_reparat_calorifer_variant_final_prices,
    calculate_reparat_calorifer_levels,
    calculate_reparat_calorifer_variant_levels,
    ensure_reparat_calorifer_variants,
    ensure_reparat_calorifer_setup,
    summarize_reparat_calorifer_final_price,
    summarize_reparat_calorifer_output,
)


router = APIRouter(
    prefix="/test",
    tags=["test-support"],
    dependencies=[Depends(get_current_admin_user)],
)


@router.get("/reparat-calorifer")
def test_reparat_calorifer(db: Session = Depends(get_db)):
    try:
        ensure_reparat_calorifer_setup(db)
        ensure_reparat_calorifer_variants(db)
        payload = calculate_reparat_calorifer_levels(db)
        return summarize_reparat_calorifer_output(payload)
    except Exception as exc:  # pragma: no cover - defensive endpoint
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.get("/reparat-calorifer-final-price")
def test_reparat_calorifer_final_price(
    service_slug: str | None = None,
    db: Session = Depends(get_db),
):
    try:
        ensure_reparat_calorifer_setup(db)
        ensure_reparat_calorifer_variants(db)
        if service_slug:
            payload = calculate_reparat_calorifer_variant_levels(db, service_slug=service_slug)
            return summarize_reparat_calorifer_final_price(payload)
        return {"items": calculate_all_reparat_calorifer_variant_final_prices(db)}
    except Exception as exc:  # pragma: no cover - defensive endpoint
        raise HTTPException(status_code=500, detail=str(exc)) from exc
