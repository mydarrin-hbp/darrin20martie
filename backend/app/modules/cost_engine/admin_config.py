from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_db
from app.core.security import get_current_admin_user
from app.modules.cost_engine.schemas import (
    AdminPriceConfigCreate,
    AdminPriceConfigResponse,
    AdminPriceConfigUpdate,
)
from app.modules.cost_engine.service import (
    create_admin_price_config,
    delete_admin_price_config,
    get_admin_price_config,
    get_admin_price_configs,
    update_admin_price_config,
)

router = APIRouter(
    prefix="/cost/admin-configs",
    tags=["cost-engine-admin"],
    dependencies=[Depends(get_current_admin_user)],
)


@router.get("", response_model=list[AdminPriceConfigResponse])
def list_price_configs(db: Session = Depends(get_db)):
    return get_admin_price_configs(db)


@router.get("/{config_id}", response_model=AdminPriceConfigResponse)
def read_price_config(config_id: int, db: Session = Depends(get_db)):
    config = get_admin_price_config(db, config_id)
    if not config:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Price config not found")
    return config


@router.post("", response_model=AdminPriceConfigResponse, status_code=status.HTTP_201_CREATED)
def create_price_config(data: AdminPriceConfigCreate, db: Session = Depends(get_db)):
    result = create_admin_price_config(db, data)
    if result == "country_not_found":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Country not found")
    if result == "service_not_found":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not found")
    if result == "zone_not_found":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Zone not found")
    if result == "zone_country_mismatch":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Zone does not belong to the selected country",
        )
    if result == "duplicate_context":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A manual price configuration already exists for this context",
        )
    return result


@router.put("/{config_id}", response_model=AdminPriceConfigResponse)
def update_price_config(config_id: int, data: AdminPriceConfigUpdate, db: Session = Depends(get_db)):
    result = update_admin_price_config(db, config_id, data)
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Price config not found")
    if result == "zone_not_found":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Zone not found")
    if result == "zone_country_mismatch":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Zone does not belong to the selected country",
        )
    if result == "duplicate_context":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A manual price configuration already exists for this context",
        )
    return result


@router.delete("/{config_id}")
def remove_price_config(config_id: int, db: Session = Depends(get_db)):
    deleted = delete_admin_price_config(db, config_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Price config not found")
    return {"message": "Price config deleted"}
