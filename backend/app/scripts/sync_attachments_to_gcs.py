from __future__ import annotations

import json

from app.db.session import SessionLocal
from app.services.attachment_service import sync_all_attachments_to_gcs


def main() -> None:
    db = SessionLocal()
    try:
        result = sync_all_attachments_to_gcs(db)
        print(json.dumps(result, ensure_ascii=True, indent=2))
    finally:
        db.close()


if __name__ == "__main__":
    main()
