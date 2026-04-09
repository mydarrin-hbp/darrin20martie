from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel


class PublicSeedRoundItem(BaseModel):
    id: str
    title: str
    target_amount: float
    committed_amount: float
    quorum_percent: float
    currency: str = "EUR"
    status: str = "ACTIVE"
    updated_at: datetime


class PublicSeedRoundListResponse(BaseModel):
    items: list[PublicSeedRoundItem]
