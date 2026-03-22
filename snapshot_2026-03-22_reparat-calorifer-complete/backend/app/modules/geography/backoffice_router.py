from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.security import get_current_admin_user
from app.db.session import get_db
from app.modules.geography.schemas import LocalityCreate, LocalityResponse, LocalityUpdate
from app.modules.geography.service import create_locality, delete_locality, get_locality, list_localities, update_locality


router = APIRouter(dependencies=[Depends(get_current_admin_user)])


@router.get("/localities", response_model=list[LocalityResponse])
def list_backoffice_localities(
    country_id: int | None = Query(default=None),
    zone_id: int | None = Query(default=None),
    db: Session = Depends(get_db),
):
    return list_localities(db, country_id=country_id, zone_id=zone_id)


@router.get("/localities/{locality_id}", response_model=LocalityResponse)
def read_backoffice_locality(locality_id: int, db: Session = Depends(get_db)):
    locality = get_locality(db, locality_id)
    if not locality:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Locality not found")
    return locality


@router.post("/localities", response_model=LocalityResponse, status_code=status.HTTP_201_CREATED)
def create_backoffice_locality(data: LocalityCreate, db: Session = Depends(get_db)):
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
def update_backoffice_locality(locality_id: int, data: LocalityUpdate, db: Session = Depends(get_db)):
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
def delete_backoffice_locality(locality_id: int, db: Session = Depends(get_db)):
    result = delete_locality(db, locality_id)
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Locality not found")
    return {"message": "Locality deleted"}
