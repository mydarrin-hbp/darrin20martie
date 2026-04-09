from __future__ import annotations

from datetime import datetime, timezone

from app.modules.public_investors.schemas import PublicSeedRoundItem

DEFAULT_SEED_ROUNDS = [
    {
        "id": "seed-2026-q2",
        "title": "Runda SEED Q2 2026",
        "target_amount": 850000.0,
        "committed_amount": 420000.0,
        "currency": "EUR",
    },
    {
        "id": "seed-robotics",
        "title": "SEED Robotics & Fleet AI",
        "target_amount": 400000.0,
        "committed_amount": 180000.0,
        "currency": "EUR",
    },
]


def list_public_seed_rounds() -> list[PublicSeedRoundItem]:
    now = datetime.now(timezone.utc)
    items: list[PublicSeedRoundItem] = []
    for row in DEFAULT_SEED_ROUNDS:
        target = float(row["target_amount"])
        committed = float(row["committed_amount"])
        quorum = round((committed / target) * 100, 2) if target else 0.0
        items.append(
            PublicSeedRoundItem(
                id=row["id"],
                title=row["title"],
                target_amount=target,
                committed_amount=committed,
                quorum_percent=quorum,
                currency=row.get("currency", "EUR"),
                updated_at=now,
            )
        )
    return items
