from __future__ import annotations

import argparse
import re
from pathlib import Path

from sqlalchemy import select

import app.models.assets  # noqa: F401
from app.db.session import SessionLocal
from app.models.price_analysis import CatalogResource, EntityAttachment
from app.schemas.price_analysis import CatalogResourceCreate, ResourceType
from app.services.attachment_service import create_entity_attachment
from app.services.price_analysis_service import create_resource


DEFAULT_SOURCE_DIR = Path(
    r"c:\Users\admin\Downloads\RESURSE My Darrin\6 martie materiale,utilaje, echipamente"
)

TRANSPORT_HINTS = (
    "autobetoniera",
    "fiat",
    "commercials",
    "doblo",
    "van",
    "transport",
)
EQUIPMENT_HINTS = (
    "robot",
    "taietor",
    "masina",
    "placa compactoare",
    "compactoare",
    "powerplus",
    "hyundai",
    "excavator",
    "buldoexcavator",
    "catalogue",
    "catalog",
    "gazonul",
    "gazon",
    "canelat",
)
MATERIAL_HINTS = (
    "rigips",
    "sika",
    "mortar",
    "materiale",
    "product_range",
    "product range",
)


def slug_to_title(stem: str) -> str:
    cleaned = re.sub(r"\s+", " ", re.sub(r"[_-]+", " ", stem)).strip()
    return cleaned or "Resursa fara nume"


def safe_console_text(value: str) -> str:
    try:
        value.encode("cp1252")
        return value
    except UnicodeEncodeError:
        return value.encode("ascii", errors="replace").decode("ascii")


def classify_resource_type(name: str) -> ResourceType:
    lower = name.casefold()
    if any(token in lower for token in TRANSPORT_HINTS):
        return ResourceType.TRANSPORT
    if any(token in lower for token in EQUIPMENT_HINTS):
        return ResourceType.EQUIPMENT
    if any(token in lower for token in MATERIAL_HINTS):
        return ResourceType.MATERIAL
    return ResourceType.MATERIAL


def default_unit(resource_type: ResourceType) -> str:
    if resource_type == ResourceType.EQUIPMENT:
        return "zi"
    if resource_type == ResourceType.TRANSPORT:
        return "cursa"
    return "buc"


def ensure_resource(db, file_path: Path) -> CatalogResource:
    resource_name = slug_to_title(file_path.stem)
    resource_type = classify_resource_type(file_path.name)
    existing = db.execute(
        select(CatalogResource).where(
            CatalogResource.name_ro == resource_name,
            CatalogResource.resource_type == resource_type.value,
        )
    ).scalar_one_or_none()
    if existing:
        return existing

    created = create_resource(
        db,
        CatalogResourceCreate(
            supplier_id=None,
            esco_code=None,
            name_ro=resource_name,
            name_en=resource_name,
            resource_type=resource_type,
            base_price=0,
            unit=default_unit(resource_type),
            lead_time_days=1,
            stock_qty=1,
            availability_status="IN_STOCK",
            technical_specs={
                "source_catalog": "bulk_pdf_import",
                "source_file_name": file_path.name,
                "source_directory": str(file_path.parent),
            },
            is_active=True,
        ),
    )
    resource = db.get(CatalogResource, created.id)
    assert resource is not None
    return resource


def import_directory(source_dir: Path, dry_run: bool = False) -> tuple[int, int, int]:
    db = SessionLocal()
    created_resources = 0
    created_attachments = 0
    skipped = 0
    try:
        files = sorted(path for path in source_dir.glob("*.pdf") if path.is_file())
        for file_path in files:
            resource_name = slug_to_title(file_path.stem)
            resource_type = classify_resource_type(file_path.name)
            existing_resource = db.execute(
                select(CatalogResource).where(
                    CatalogResource.name_ro == resource_name,
                    CatalogResource.resource_type == resource_type.value,
                )
            ).scalar_one_or_none()
            resource = existing_resource
            if resource is None:
                if dry_run:
                    created_resources += 1
                else:
                    resource = ensure_resource(db, file_path)
                    created_resources += 1

            if resource is not None:
                duplicate_attachment = db.execute(
                    select(EntityAttachment).where(
                        EntityAttachment.entity_type == "resource",
                        EntityAttachment.entity_id == resource.id,
                        EntityAttachment.file_name == file_path.name,
                    )
                ).scalar_one_or_none()
                if duplicate_attachment:
                    skipped += 1
                    continue

            if dry_run:
                created_attachments += 1
                continue

            assert resource is not None
            result = create_entity_attachment(
                db,
                entity_type="resource",
                entity_id=resource.id,
                attachment_type="DOCUMENT",
                level_name=None,
                file_name=file_path.name,
                content=file_path.read_bytes(),
                mime_type="application/pdf",
            )
            if isinstance(result, str):
                print(f"SKIP {file_path.name}: {result}")
                skipped += 1
                continue
            created_attachments += 1
            print(f"OK {safe_console_text(file_path.name)} -> [{resource_type.value}] {safe_console_text(resource.name_ro)}")
        return created_resources, created_attachments, skipped
    finally:
        db.close()


def main():
    parser = argparse.ArgumentParser(description="Importa PDF-uri de materiale/utilaje/echipamente in Backoffice Resources.")
    parser.add_argument("--source-dir", type=Path, default=DEFAULT_SOURCE_DIR)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    if not args.source_dir.exists():
        raise SystemExit(f"Directorul nu exista: {args.source_dir}")

    created_resources, created_attachments, skipped = import_directory(args.source_dir, dry_run=args.dry_run)
    print(
        {
            "source_dir": str(args.source_dir),
            "created_resources": created_resources,
            "created_attachments": created_attachments,
            "skipped": skipped,
            "dry_run": args.dry_run,
        }
    )


if __name__ == "__main__":
    main()
