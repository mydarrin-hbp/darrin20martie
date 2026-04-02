from __future__ import annotations

from fastapi import APIRouter

from app.modules.public_investors.schemas import PublicSeedRoundListResponse
from app.modules.public_investors.service import list_public_seed_rounds

public_router = APIRouter(prefix="/public/investors", tags=["PublicInvestors"])


@public_router.get("/seed-rounds", response_model=PublicSeedRoundListResponse)
def list_seed_rounds():
    return PublicSeedRoundListResponse(items=list_public_seed_rounds())
