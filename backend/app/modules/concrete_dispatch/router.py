from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_db
from app.core.security import get_current_admin_user
from app.modules.concrete_dispatch.schemas import ConcreteDispatchRequest, ConcreteDispatchResponse
from app.modules.concrete_dispatch.service import ConcreteDispatchService


router = APIRouter(
    prefix="/backoffice/concrete-dispatch",
    tags=["ConcreteDispatch"],
    dependencies=[Depends(get_current_admin_user)],
)


@router.post("/work-packages", response_model=ConcreteDispatchResponse, status_code=status.HTTP_201_CREATED)
async def create_concrete_work_package_route(
    payload: ConcreteDispatchRequest,
    db: Session = Depends(get_db),
):
    result = await ConcreteDispatchService.create_work_package(db, payload)
    if result == "material_supplier_unavailable":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="No concrete plant available for the selected slot")
    if result == "equipment_supplier_unavailable":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="No pump operator available for the selected slot")
    return result
