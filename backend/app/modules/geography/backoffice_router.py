from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import io

from app.core.security import ensure_country_access, ensure_module_access, get_current_admin_profile, get_current_admin_user
from app.db.session import get_db
from app.modules.geography.schemas import (
    CountryCreate,
    CountryResponse,
    CountryUpdate,
    LocalityCreate,
    LocalityResponse,
    LocalityUpdate,
    ZoneCreate,
    ZoneResponse,
    ZoneUpdate,
)
from app.modules.geography.service import (
    create_country,
    create_locality,
    create_zone,
    delete_country,
    delete_locality,
    delete_zone,
    export_zones_csv,
    get_countries,
    get_locality,
    get_zones,
    import_zones,
    list_localities,
    update_country,
    update_locality,
    update_zone,
)


router = APIRouter(dependencies=[Depends(get_current_admin_user)])


@router.get("/countries", response_model=list[CountryResponse])
def list_backoffice_countries(db: Session = Depends(get_db)):
    return get_countries(db)


@router.post("/countries", response_model=CountryResponse, status_code=status.HTTP_201_CREATED)
def create_backoffice_country(
    data: CountryCreate,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin_user),
    admin_profile=Depends(get_current_admin_profile),
):
    ensure_module_access(current_admin, admin_profile, "geo")
    ensure_country_access(current_admin, admin_profile, data.code)
    result = create_country(db, data)
    if result == "duplicate_country":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Country already exists")
    return result


@router.put("/countries/{country_id}", response_model=CountryResponse)
def update_backoffice_country(
    country_id: int,
    data: CountryUpdate,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin_user),
    admin_profile=Depends(get_current_admin_profile),
):
    ensure_module_access(current_admin, admin_profile, "geo")
    result = update_country(db, country_id, data)
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Country not found")
    if result == "duplicate_country":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Country already exists")
    return result


@router.delete("/countries/{country_id}")
def delete_backoffice_country(
    country_id: int,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin_user),
    admin_profile=Depends(get_current_admin_profile),
):
    ensure_module_access(current_admin, admin_profile, "geo")
    result = delete_country(db, country_id)
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Country not found")
    return {"message": "Country deleted"}


@router.get("/zones", response_model=list[ZoneResponse])
def list_backoffice_zones(
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin_user),
    admin_profile=Depends(get_current_admin_profile),
):
    ensure_module_access(current_admin, admin_profile, "geo")
    return get_zones(db)


@router.post("/zones/import")
def import_backoffice_zones(
    file: UploadFile,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin_user),
    admin_profile=Depends(get_current_admin_profile),
):
    ensure_module_access(current_admin, admin_profile, "geo")
    content = file.file.read()
    return import_zones(db, file.filename or "", content)


@router.get("/zones/export")
def export_backoffice_zones(
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin_user),
    admin_profile=Depends(get_current_admin_profile),
):
    ensure_module_access(current_admin, admin_profile, "geo")
    csv_payload = export_zones_csv(db)
    return StreamingResponse(
        io.StringIO(csv_payload),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=zones.csv"},
    )


@router.post("/zones", response_model=ZoneResponse, status_code=status.HTTP_201_CREATED)
def create_backoffice_zone(
    data: ZoneCreate,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin_user),
    admin_profile=Depends(get_current_admin_profile),
):
    ensure_module_access(current_admin, admin_profile, "geo")
    result = create_zone(db, data)
    if result == "country_not_found":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Country not found")
    if result == "duplicate_zone":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Zone already exists")
    return result


@router.put("/zones/{zone_id}", response_model=ZoneResponse)
def update_backoffice_zone(
    zone_id: int,
    data: ZoneUpdate,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin_user),
    admin_profile=Depends(get_current_admin_profile),
):
    ensure_module_access(current_admin, admin_profile, "geo")
    result = update_zone(db, zone_id, data)
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Zone not found")
    if result == "country_not_found":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Country not found")
    if result == "duplicate_zone":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Zone already exists")
    return result


@router.delete("/zones/{zone_id}")
def delete_backoffice_zone(
    zone_id: int,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin_user),
    admin_profile=Depends(get_current_admin_profile),
):
    ensure_module_access(current_admin, admin_profile, "geo")
    result = delete_zone(db, zone_id)
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Zone not found")
    return {"message": "Zone deleted"}


@router.get("/localities", response_model=list[LocalityResponse])
def list_backoffice_localities(
    country_id: int | None = Query(default=None),
    zone_id: int | None = Query(default=None),
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin_user),
    admin_profile=Depends(get_current_admin_profile),
):
    ensure_module_access(current_admin, admin_profile, "geo")
    return list_localities(db, country_id=country_id, zone_id=zone_id)


@router.get("/localities/{locality_id}", response_model=LocalityResponse)
def read_backoffice_locality(locality_id: int, db: Session = Depends(get_db)):
    locality = get_locality(db, locality_id)
    if not locality:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Locality not found")
    return locality


@router.post("/localities", response_model=LocalityResponse, status_code=status.HTTP_201_CREATED)
def create_backoffice_locality(
    data: LocalityCreate,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin_user),
    admin_profile=Depends(get_current_admin_profile),
):
    ensure_module_access(current_admin, admin_profile, "geo")
    result = create_locality(db, data)
    if result == "country_not_found":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Country not found")
    if result == "zone_not_found":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Zone not found")
    if result == "zone_country_mismatch":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Zone does not belong to the selected country")
    if result == "duplicate_slug":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Locality slug already exists in this geography context")
    return result


@router.put("/localities/{locality_id}", response_model=LocalityResponse)
def update_backoffice_locality(
    locality_id: int,
    data: LocalityUpdate,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin_user),
    admin_profile=Depends(get_current_admin_profile),
):
    ensure_module_access(current_admin, admin_profile, "geo")
    result = update_locality(db, locality_id, data)
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Locality not found")
    if result == "zone_not_found":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Zone not found")
    if result == "zone_country_mismatch":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Zone does not belong to the selected country")
    if result == "duplicate_slug":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Locality slug already exists in this geography context")
    return result


@router.delete("/localities/{locality_id}")
def delete_backoffice_locality(
    locality_id: int,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin_user),
    admin_profile=Depends(get_current_admin_profile),
):
    ensure_module_access(current_admin, admin_profile, "geo")
    result = delete_locality(db, locality_id)
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Locality not found")
    return {"message": "Locality deleted"}
