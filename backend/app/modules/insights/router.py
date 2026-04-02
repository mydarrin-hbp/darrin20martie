from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_db
from app.core.security import get_current_admin_user
from app.modules.insights.schemas import InsightsResponse
from app.modules.insights.service import get_insights


router = APIRouter(prefix="/backoffice/insights", tags=["BackofficeInsights"], dependencies=[Depends(get_current_admin_user)])


@router.get("", response_model=InsightsResponse)
def get_insights_route(db: Session = Depends(get_db)):
    return get_insights(db)
