from __future__ import annotations

import json

from app.db.session import SessionLocal
from app.services.reparat_calorifer_service import (
    calculate_reparat_calorifer_levels,
    ensure_reparat_calorifer_variants,
    ensure_reparat_calorifer_setup,
    summarize_reparat_calorifer_output,
)


def main() -> None:
    db = SessionLocal()
    try:
        ensure_reparat_calorifer_setup(db)
        ensure_reparat_calorifer_variants(db)
        payload = calculate_reparat_calorifer_levels(db)
        print(json.dumps(summarize_reparat_calorifer_output(payload), ensure_ascii=True, indent=2))
    finally:
        db.close()


if __name__ == "__main__":
    main()
