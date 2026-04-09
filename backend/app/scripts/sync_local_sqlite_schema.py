from __future__ import annotations

import os

os.environ.setdefault("JWT_SECRET", "verify-local-secret-2026")

from app.db.session import engine
from app.db.sqlite_compat import ensure_sqlite_runtime_schema


def main() -> None:
    ensure_sqlite_runtime_schema(engine)
    print("SQLite runtime schema synchronized.")


if __name__ == "__main__":
    main()
