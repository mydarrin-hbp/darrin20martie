from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_db
from app.core.security import get_current_admin_user
from app.modules.providers.schemas import ProviderCreate, ProviderResponse, ProviderUpdate
from app.modules.providers.service import create_provider, delete_provider, list_providers, update_provider

router = APIRouter(prefix="/backoffice/providers", tags=["Providers"], dependencies=[Depends(get_current_admin_user)])


@router.get("", response_model=list[ProviderResponse])
def list_providers_route(db: Session = Depends(get_db)):
    return list_providers(db)


@router.post("", response_model=ProviderResponse, status_code=status.HTTP_201_CREATED)
def create_provider_route(payload: ProviderCreate, db: Session = Depends(get_db)):
    return create_provider(db, payload)


@router.put("/{provider_id}", response_model=ProviderResponse)
def update_provider_route(provider_id: int, payload: ProviderUpdate, db: Session = Depends(get_db)):
    provider = update_provider(db, provider_id, payload)
    if provider is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="provider_not_found")
    return provider


@router.delete("/{provider_id}")
def delete_provider_route(provider_id: int, db: Session = Depends(get_db)):
    deleted = delete_provider(db, provider_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="provider_not_found")
    return {"message": "Provider deleted"}
