from fastapi import APIRouter, Depends, HTTPException, UploadFile, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import io

from app.core.dependencies import get_db
from app.core.security import ensure_country_access, ensure_module_access, get_current_admin_profile, get_current_admin_user
from app.modules.cost_engine.schemas import (
    AdminPriceConfigCreate,
    AdminPriceConfigResponse,
    AdminPriceConfigUpdate,
    FinancialConfigCreate,
    FinancialConfigResponse,
    FinancialConfigUpdate,
    LaborRateCreate,
    LaborRateResponse,
    LaborRateUpdate,
)
from app.modules.geography.models import Country
from app.modules.cost_engine.service import (
    create_admin_price_config,
    create_financial_config,
    create_labor_rate,
    delete_admin_price_config,
    delete_financial_config,
    delete_labor_rate,
    export_labor_rates_csv,
    get_admin_price_config,
    get_admin_price_configs,
    get_financial_config,
    get_financial_configs,
    get_labor_rate,
    get_labor_rates,
    import_labor_rates,
    update_admin_price_config,
    update_financial_config,
    update_labor_rate,
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
def create_price_config(
    data: AdminPriceConfigCreate,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin_user),
    admin_profile=Depends(get_current_admin_profile),
):
    country = db.get(Country, data.country_id)
    ensure_module_access(current_admin, admin_profile, "catalog_pricing")
    ensure_country_access(current_admin, admin_profile, country.code if country else None)
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
def update_price_config(
    config_id: int,
    data: AdminPriceConfigUpdate,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin_user),
    admin_profile=Depends(get_current_admin_profile),
):
    existing = get_admin_price_config(db, config_id)
    if existing:
        country = db.get(Country, existing.country_id)
        ensure_module_access(current_admin, admin_profile, "catalog_pricing")
        ensure_country_access(current_admin, admin_profile, country.code if country else None)
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
def remove_price_config(
    config_id: int,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin_user),
    admin_profile=Depends(get_current_admin_profile),
):
    existing = get_admin_price_config(db, config_id)
    if existing:
        country = db.get(Country, existing.country_id)
        ensure_module_access(current_admin, admin_profile, "catalog_pricing")
        ensure_country_access(current_admin, admin_profile, country.code if country else None)
    deleted = delete_admin_price_config(db, config_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Price config not found")
    return {"message": "Price config deleted"}


@router.get("/financial-configs", response_model=list[FinancialConfigResponse])
def list_financial_configs_route(
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin_user),
    admin_profile=Depends(get_current_admin_profile),
):
    ensure_module_access(current_admin, admin_profile, "financial")
    return get_financial_configs(db)


@router.get("/financial-configs/{config_id}", response_model=FinancialConfigResponse)
def read_financial_config_route(config_id: int, db: Session = Depends(get_db)):
    config = get_financial_config(db, config_id)
    if not config:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Financial config not found")
    return config


@router.post("/financial-configs", response_model=FinancialConfigResponse, status_code=status.HTTP_201_CREATED)
def create_financial_config_route(
    data: FinancialConfigCreate,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin_user),
    admin_profile=Depends(get_current_admin_profile),
):
    ensure_module_access(current_admin, admin_profile, "financial")
    result = create_financial_config(db, data)
    if result == "duplicate_context":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Financial config already exists for this scope")
    return result


@router.put("/financial-configs/{config_id}", response_model=FinancialConfigResponse)
def update_financial_config_route(
    config_id: int,
    data: FinancialConfigUpdate,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin_user),
    admin_profile=Depends(get_current_admin_profile),
):
    ensure_module_access(current_admin, admin_profile, "financial")
    result = update_financial_config(db, config_id, data)
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Financial config not found")
    if result == "duplicate_context":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Financial config already exists for this scope")
    return result


@router.delete("/financial-configs/{config_id}")
def remove_financial_config_route(
    config_id: int,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin_user),
    admin_profile=Depends(get_current_admin_profile),
):
    ensure_module_access(current_admin, admin_profile, "financial")
    deleted = delete_financial_config(db, config_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Financial config not found")
    return {"message": "Financial config deleted"}


@router.get("/labor-rates", response_model=list[LaborRateResponse])
def list_labor_rates_route(
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin_user),
    admin_profile=Depends(get_current_admin_profile),
):
    ensure_module_access(current_admin, admin_profile, "financial")
    return get_labor_rates(db)


@router.post("/labor-rates/import")
def import_labor_rates_route(
    file: UploadFile,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin_user),
    admin_profile=Depends(get_current_admin_profile),
):
    ensure_module_access(current_admin, admin_profile, "financial")
    content = file.file.read()
    result = import_labor_rates(db, file.filename or "", content)
    return result


@router.get("/labor-rates/export")
def export_labor_rates_route(
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin_user),
    admin_profile=Depends(get_current_admin_profile),
):
    ensure_module_access(current_admin, admin_profile, "financial")
    csv_payload = export_labor_rates_csv(db)
    return StreamingResponse(
        io.StringIO(csv_payload),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=labor-rates.csv"},
    )


@router.get("/labor-rates/{rate_id}", response_model=LaborRateResponse)
def read_labor_rate_route(rate_id: int, db: Session = Depends(get_db)):
    rate = get_labor_rate(db, rate_id)
    if not rate:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Labor rate not found")
    return rate


@router.post("/labor-rates", response_model=LaborRateResponse, status_code=status.HTTP_201_CREATED)
def create_labor_rate_route(
    data: LaborRateCreate,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin_user),
    admin_profile=Depends(get_current_admin_profile),
):
    ensure_module_access(current_admin, admin_profile, "financial")
    result = create_labor_rate(db, data)
    if result == "duplicate_context":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Labor rate already exists for this scope")
    return result


@router.put("/labor-rates/{rate_id}", response_model=LaborRateResponse)
def update_labor_rate_route(
    rate_id: int,
    data: LaborRateUpdate,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin_user),
    admin_profile=Depends(get_current_admin_profile),
):
    ensure_module_access(current_admin, admin_profile, "financial")
    result = update_labor_rate(db, rate_id, data)
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Labor rate not found")
    if result == "duplicate_context":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Labor rate already exists for this scope")
    return result


@router.delete("/labor-rates/{rate_id}")
def remove_labor_rate_route(
    rate_id: int,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin_user),
    admin_profile=Depends(get_current_admin_profile),
):
    ensure_module_access(current_admin, admin_profile, "financial")
    deleted = delete_labor_rate(db, rate_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Labor rate not found")
    return {"message": "Labor rate deleted"}
