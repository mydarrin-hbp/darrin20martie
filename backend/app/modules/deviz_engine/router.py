from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_db
from app.core.security import get_current_admin_user
from app.modules.deviz_engine.schemas import DevizRequest, DevizResponse
from app.modules.deviz_engine.service import generate_deviz, get_deviz

router = APIRouter(
    prefix="/deviz",
    tags=["deviz-engine"],
    dependencies=[Depends(get_current_admin_user)],
)


@router.post("/generate", response_model=DevizResponse)
def generate_deviz_route(data: DevizRequest, db: Session = Depends(get_db)):
    result = generate_deviz(db, data)
    if result == "service_not_found":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not found")
    if result == "country_not_found":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Country not found")
    if result == "zone_not_found":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Zone not found")
    if result == "zone_country_mismatch":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Zone does not belong to the selected country",
        )
    if result == "price_config_not_found":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Manual price configuration not found for the selected context",
        )
    return result


@router.get("/{deviz_id}", response_model=DevizResponse)
def get_deviz_route(deviz_id: int, db: Session = Depends(get_db)):
    result = get_deviz(db, deviz_id)
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Deviz not found")
    return result
