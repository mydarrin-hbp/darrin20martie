from __future__ import annotations

from pathlib import Path
import shutil

from sqlalchemy import func, select

from app.db.session import SessionLocal
from app.models.price_analysis import AdminResourcePriceConfig, EntityAttachment
from app.models.service import Service
from app.modules.geography.models import Country, Locality, Zone


SNAPSHOT_NAME = "snapshot_2026-03-22_reparat-calorifer-complete"
FILES_TO_COPY = [
    "backend/app/core/config.py",
    "backend/requirements.txt",
    "backend/app/api/router.py",
    "backend/app/models/price_analysis.py",
    "backend/app/models/service.py",
    "backend/app/modules/geography/models.py",
    "backend/app/modules/geography/schemas.py",
    "backend/app/modules/geography/service.py",
    "backend/app/modules/geography/router.py",
    "backend/app/modules/geography/backoffice_router.py",
    "backend/app/schemas/service.py",
    "backend/app/schemas/price_analysis.py",
    "backend/app/services/attachment_service.py",
    "backend/app/services/price_analysis_service.py",
    "backend/app/services/reparat_calorifer_service.py",
    "backend/app/services/catalog_service.py",
    "backend/app/modules/price_analysis/router.py",
    "backend/app/modules/cost_engine/models.py",
    "backend/app/modules/cost_engine/schemas.py",
    "backend/app/modules/cost_engine/service.py",
    "backend/app/modules/cost_engine/admin_config.py",
    "backend/app/modules/deviz_engine/models.py",
    "backend/app/modules/deviz_engine/schemas.py",
    "backend/app/modules/deviz_engine/service.py",
    "backend/app/modules/ai_robot_darrin/service.py",
    "backend/app/modules/test_support/router.py",
    "backend/app/scripts/configure_reparat_calorifer.py",
    "backend/app/scripts/seed_price_analysis_engine.py",
    "backend/app/scripts/seed_cost_engine_minimal.py",
    "backend/app/scripts/seed_demo_full.py",
    "backend/app/scripts/sync_attachments_to_gcs.py",
    "backend/alembic/versions/j4e5f6g7h8i9_geography_locality_attachments.py",
    "backend/alembic/versions/k5f6g7h8i9j0_indirect_cost_layers.py",
    "backoffice/lib/api.ts",
    "backoffice/app/(protected)/backoffice/services/page.tsx",
    "backoffice/app/(protected)/deviz-configs/page.tsx",
]


def _repo_root() -> Path:
    return Path(__file__).resolve().parents[3]


def _db_status() -> dict[str, int]:
    db = SessionLocal()
    try:
        return {
            "countries": db.scalar(select(func.count()).select_from(Country)) or 0,
            "zones": db.scalar(select(func.count()).select_from(Zone)) or 0,
            "localities": db.scalar(select(func.count()).select_from(Locality)) or 0,
            "services": db.scalar(select(func.count()).select_from(Service)) or 0,
            "attachments": db.scalar(select(func.count()).select_from(EntityAttachment)) or 0,
            "resource_price_configs": db.scalar(select(func.count()).select_from(AdminResourcePriceConfig)) or 0,
        }
    finally:
        db.close()


def main() -> None:
    repo_root = _repo_root()
    snapshot_root = repo_root / SNAPSHOT_NAME
    if snapshot_root.exists():
        shutil.rmtree(snapshot_root)
    snapshot_root.mkdir(parents=True, exist_ok=True)

    copied: list[str] = []
    for relative_path in FILES_TO_COPY:
        source = repo_root / relative_path
        if not source.exists():
            continue
        target = snapshot_root / relative_path
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, target)
        copied.append(relative_path)

    status = _db_status()
    summary = [
        "# Snapshot Summary",
        "",
        f"Snapshot folder: `{SNAPSHOT_NAME}`",
        "",
        f"Files copied: {len(copied)}",
        "",
        "## Files",
        *[f"- `{path}`" for path in copied],
        "",
        "## DB Status",
        *[f"- `{key}` = {value}" for key, value in status.items()],
    ]
    (snapshot_root / "SUMMARY.md").write_text("\n".join(summary), encoding="utf-8")
    print(f"Snapshot created: {snapshot_root}")
    print(f"Files copied: {len(copied)}")


if __name__ == "__main__":
    main()
