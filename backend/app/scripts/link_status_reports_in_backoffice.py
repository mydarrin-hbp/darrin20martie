from __future__ import annotations

from pathlib import Path

from sqlalchemy import select

import app.models.assets  # noqa: F401
from app.db.session import SessionLocal
from app.models.price_analysis import CatalogResource, EntityAttachment
from app.schemas.price_analysis import CatalogResourceCreate, ResourceType
from app.services.attachment_service import create_entity_attachment
from app.services.price_analysis_service import create_resource


ROOT = Path(__file__).resolve().parents[3]
STATUS_DIR = ROOT / "docs" / "status"
RESOURCE_NAME = "My Darrin - Status Reports Martie 2026"


def ensure_status_resource(db) -> CatalogResource:
    existing = db.execute(
        select(CatalogResource).where(
            CatalogResource.name_ro == RESOURCE_NAME,
            CatalogResource.resource_type == ResourceType.MATERIAL.value,
        )
    ).scalar_one_or_none()
    if existing:
        return existing

    created = create_resource(
        db,
        CatalogResourceCreate(
            supplier_id=None,
            esco_code=None,
            name_ro=RESOURCE_NAME,
            name_en=RESOURCE_NAME,
            resource_type=ResourceType.MATERIAL,
            base_price=0,
            unit="pachet",
            lead_time_days=0,
            stock_qty=1,
            availability_status="IN_STOCK",
            technical_specs={
                "resource_family": "STATUS_REPORT",
                "document_scope": "executive report, rag board, investor status",
                "reporting_period": "Martie 2026",
                "owner": "My Darrin PMO",
            },
            is_active=True,
        ),
    )
    resource = db.get(CatalogResource, created.id)
    assert resource is not None
    return resource


def attach_document(db, resource: CatalogResource, file_path: Path) -> bool:
    duplicate = db.execute(
        select(EntityAttachment).where(
            EntityAttachment.entity_type == "resource",
            EntityAttachment.entity_id == resource.id,
            EntityAttachment.file_name == file_path.name,
        )
    ).scalar_one_or_none()
    if duplicate:
        return False

    suffix = file_path.suffix.lower()
    mime_type = (
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        if suffix == ".docx"
        else "text/markdown"
    )
    result = create_entity_attachment(
        db,
        entity_type="resource",
        entity_id=resource.id,
        attachment_type="DOCUMENT",
        level_name=None,
        file_name=file_path.name,
        content=file_path.read_bytes(),
        mime_type=mime_type,
    )
    if isinstance(result, str):
        raise RuntimeError(f"Nu s-a putut atasa {file_path.name}: {result}")
    return True


def main() -> None:
    source_files = sorted(
        [
            *STATUS_DIR.glob("mydarrin-*.md"),
            *STATUS_DIR.glob("mydarrin-*.docx"),
        ]
    )
    if not source_files:
        raise SystemExit("Nu exista rapoarte My Darrin in docs/status.")

    db = SessionLocal()
    try:
        resource = ensure_status_resource(db)
        created = 0
        skipped = 0
        for file_path in source_files:
            if attach_document(db, resource, file_path):
                created += 1
                print(f"OK {file_path.name}")
            else:
                skipped += 1
                print(f"SKIP {file_path.name}")
        print(
            {
                "resource_id": resource.id,
                "resource_name": resource.name_ro,
                "created_attachments": created,
                "skipped": skipped,
            }
        )
    finally:
        db.close()


if __name__ == "__main__":
    main()
