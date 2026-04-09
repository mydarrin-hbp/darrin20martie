from __future__ import annotations

import csv
import io
from collections.abc import Iterable
from pathlib import Path

from sqlalchemy import Select, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, selectinload

from app.models.category import Category
from app.models.domain import Domain
from app.models.service import Service
from app.models.subcategory import SubCategory
from app.schemas.backoffice_catalog import CatalogImportResponse, CatalogImportRow
from app.schemas.category import CategoryCreate, CategoryUpdate
from app.schemas.domain import DomainCreate, DomainUpdate
from app.schemas.service import ServiceCreate, ServiceUpdate
from app.schemas.subcategory import SubcategoryCreate, SubcategoryUpdate
from app.services.xlsx_reader import read_xlsx_rows
from app.services.cache_service import invalidate_prefix


def _normalize_codes(values: Iterable[str] | None) -> list[str]:
    if not values:
        return []
    result: list[str] = []
    seen: set[str] = set()
    for item in values:
        value = str(item).strip()
        if not value or value in seen:
            continue
        seen.add(value)
        result.append(value)
    return result


def _normalized_payload(data: dict) -> dict:
    payload = dict(data)
    for field in ("caen_codes", "uniclass_codes", "esco_codes"):
        if field in payload and payload[field] is not None:
            payload[field] = _normalize_codes(payload[field])
    return payload


def _slug_exists(
    db: Session,
    *,
    slug: str,
    exclude_domain_id: int | None = None,
    exclude_category_id: int | None = None,
    exclude_subcategory_id: int | None = None,
) -> bool:
    domain_query = select(Domain.id).where(Domain.slug == slug)
    if exclude_domain_id is not None:
        domain_query = domain_query.where(Domain.id != exclude_domain_id)
    if db.execute(domain_query).scalar_one_or_none() is not None:
        return True

    category_query = select(Category.id).where(Category.slug == slug)
    if exclude_category_id is not None:
        category_query = category_query.where(Category.id != exclude_category_id)
    if db.execute(category_query).scalar_one_or_none() is not None:
        return True

    subcategory_query = select(SubCategory.id).where(SubCategory.slug == slug)
    if exclude_subcategory_id is not None:
        subcategory_query = subcategory_query.where(SubCategory.id != exclude_subcategory_id)
    return db.execute(subcategory_query).scalar_one_or_none() is not None


def get_domains(db: Session):
    return db.execute(select(Domain).order_by(Domain.id)).scalars().all()


def get_domain(db: Session, domain_id: int):
    return db.get(Domain, domain_id)


def get_domain_by_slug(db: Session, slug: str):
    return db.execute(select(Domain).where(Domain.slug == slug)).scalar_one_or_none()


def create_domain(db: Session, domain: DomainCreate):
    if _slug_exists(db, slug=domain.slug):
        return "duplicate_slug"

    db_domain = Domain(**_normalized_payload(domain.model_dump()))
    db.add(db_domain)

    try:
        db.commit()
        db.refresh(db_domain)
        invalidate_prefix("public_catalog:")
        return db_domain
    except IntegrityError:
        db.rollback()
        return "duplicate_slug"


def update_domain(db: Session, domain_id: int, domain_update: DomainUpdate):
    db_domain = db.get(Domain, domain_id)
    if not db_domain:
        return None

    update_data = _normalized_payload(domain_update.model_dump(exclude_unset=True))
    if "slug" in update_data and _slug_exists(db, slug=update_data["slug"], exclude_domain_id=domain_id):
        return "duplicate_slug"

    for field, value in update_data.items():
        setattr(db_domain, field, value)

    try:
        db.commit()
        db.refresh(db_domain)
        invalidate_prefix("public_catalog:")
        return db_domain
    except IntegrityError:
        db.rollback()
        return "duplicate_slug"


def delete_domain(db: Session, domain_id: int):
    db_domain = db.get(Domain, domain_id)
    if not db_domain:
        return None
    db.delete(db_domain)
    db.commit()
    invalidate_prefix("public_catalog:")
    return True


def get_categories(db: Session, domain_id: int | None = None):
    query: Select[tuple[Category]] = select(Category)
    if domain_id is not None:
        query = query.where(Category.domain_id == domain_id)
    return db.execute(query.order_by(Category.id)).scalars().all()


def get_category(db: Session, category_id: int):
    return db.get(Category, category_id)


def get_category_by_slug(db: Session, slug: str):
    return db.execute(select(Category).where(Category.slug == slug)).scalar_one_or_none()


def create_category(db: Session, category: CategoryCreate):
    db_domain = db.get(Domain, category.domain_id)
    if not db_domain:
        return "domain_not_found"

    if _slug_exists(db, slug=category.slug):
        return "duplicate_slug"

    db_category = Category(**_normalized_payload(category.model_dump()))
    db.add(db_category)

    try:
        db.commit()
        db.refresh(db_category)
        invalidate_prefix("public_catalog:")
        return db_category
    except IntegrityError:
        db.rollback()
        return "duplicate_slug"


def update_category(db: Session, category_id: int, category_update: CategoryUpdate):
    db_category = db.get(Category, category_id)
    if not db_category:
        return None

    update_data = _normalized_payload(category_update.model_dump(exclude_unset=True))
    if "domain_id" in update_data:
        db_domain = db.get(Domain, update_data["domain_id"])
        if not db_domain:
            return "domain_not_found"

    if "slug" in update_data and _slug_exists(db, slug=update_data["slug"], exclude_category_id=category_id):
        return "duplicate_slug"

    for field, value in update_data.items():
        setattr(db_category, field, value)

    try:
        db.commit()
        db.refresh(db_category)
        invalidate_prefix("public_catalog:")
        return db_category
    except IntegrityError:
        db.rollback()
        return "duplicate_slug"


def delete_category(db: Session, category_id: int):
    db_category = db.get(Category, category_id)
    if not db_category:
        return None
    db.delete(db_category)
    db.commit()
    invalidate_prefix("public_catalog:")
    return True


def get_subcategories(db: Session, category_id: int | None = None, domain_id: int | None = None):
    query: Select[tuple[SubCategory]] = select(SubCategory)
    if category_id is not None:
        query = query.where(SubCategory.category_id == category_id)
    if domain_id is not None:
        query = query.join(Category, SubCategory.category_id == Category.id).where(Category.domain_id == domain_id)
    return db.execute(query.order_by(SubCategory.id)).scalars().all()


def get_subcategory(db: Session, subcategory_id: int):
    return db.get(SubCategory, subcategory_id)


def get_subcategory_by_slug(db: Session, slug: str):
    return db.execute(select(SubCategory).where(SubCategory.slug == slug)).scalar_one_or_none()


def create_subcategory(db: Session, subcategory: SubcategoryCreate):
    db_category = db.get(Category, subcategory.category_id)
    if not db_category:
        return "category_not_found"

    if _slug_exists(db, slug=subcategory.slug):
        return "duplicate_slug"

    db_subcategory = SubCategory(**_normalized_payload(subcategory.model_dump()))
    db.add(db_subcategory)

    try:
        db.commit()
        db.refresh(db_subcategory)
        invalidate_prefix("public_catalog:")
        return db_subcategory
    except IntegrityError:
        db.rollback()
        return "duplicate_slug"


def update_subcategory(db: Session, subcategory_id: int, subcategory_update: SubcategoryUpdate):
    db_subcategory = db.get(SubCategory, subcategory_id)
    if not db_subcategory:
        return None

    update_data = _normalized_payload(subcategory_update.model_dump(exclude_unset=True))
    if "category_id" in update_data:
        db_category = db.get(Category, update_data["category_id"])
        if not db_category:
            return "category_not_found"

    if "slug" in update_data and _slug_exists(db, slug=update_data["slug"], exclude_subcategory_id=subcategory_id):
        return "duplicate_slug"

    for field, value in update_data.items():
        setattr(db_subcategory, field, value)

    try:
        db.commit()
        db.refresh(db_subcategory)
        invalidate_prefix("public_catalog:")
        return db_subcategory
    except IntegrityError:
        db.rollback()
        return "duplicate_slug"


def delete_subcategory(db: Session, subcategory_id: int):
    db_subcategory = db.get(SubCategory, subcategory_id)
    if not db_subcategory:
        return None
    db.delete(db_subcategory)
    db.commit()
    invalidate_prefix("public_catalog:")
    return True


def get_services(db: Session):
    return db.execute(
        select(Service).options(selectinload(Service.subcategories)).order_by(Service.id)
    ).scalars().all()


def get_service(db: Session, service_id: int):
    return db.execute(
        select(Service)
        .options(
            selectinload(Service.subcategories)
            .selectinload(SubCategory.category)
            .selectinload(Category.domain)
        )
        .where(Service.id == service_id)
    ).scalar_one_or_none()


def get_service_by_slug(db: Session, slug: str):
    return db.execute(
        select(Service)
        .options(
            selectinload(Service.subcategories)
            .selectinload(SubCategory.category)
            .selectinload(Category.domain)
        )
        .where(Service.slug == slug)
    ).scalar_one_or_none()


def get_subcategories_by_ids(db: Session, subcategory_ids: list[int]) -> list[SubCategory]:
    unique_ids = list(dict.fromkeys(subcategory_ids))
    subcategories = db.execute(
        select(SubCategory).where(SubCategory.id.in_(unique_ids)).order_by(SubCategory.id)
    ).scalars().all()
    subcategory_map = {subcategory.id: subcategory for subcategory in subcategories}
    return [subcategory_map[subcategory_id] for subcategory_id in unique_ids if subcategory_id in subcategory_map]


def create_service(db: Session, service: ServiceCreate):
    db_subcategories = get_subcategories_by_ids(db, service.subcategory_ids)
    if len(db_subcategories) != len(set(service.subcategory_ids)):
        return "subcategory_not_found"

    existing_service = get_service_by_slug(db, service.slug)
    if existing_service:
        return "duplicate_slug"

    service_data = service.model_dump(exclude={"subcategory_ids"})
    db_service = Service(**service_data)
    db_service.subcategories = db_subcategories
    db.add(db_service)

    try:
        db.commit()
        db.refresh(db_service)
        invalidate_prefix("public_catalog:")
        invalidate_prefix("service_taxonomy:")
        return db_service
    except IntegrityError:
        db.rollback()
        return "duplicate_slug"


def update_service(db: Session, service_id: int, service_update: ServiceUpdate):
    db_service = get_service(db, service_id)
    if not db_service:
        return None

    update_data = service_update.model_dump(exclude_unset=True)
    if "subcategory_ids" in update_data:
        db_subcategories = get_subcategories_by_ids(db, update_data["subcategory_ids"])
        if len(db_subcategories) != len(set(update_data["subcategory_ids"])):
            return "subcategory_not_found"
        db_service.subcategories = db_subcategories
        update_data.pop("subcategory_ids")

    if "slug" in update_data:
        existing_service = get_service_by_slug(db, update_data["slug"])
        if existing_service and existing_service.id != service_id:
            return "duplicate_slug"

    for field, value in update_data.items():
        setattr(db_service, field, value)

    try:
        db.commit()
        db.refresh(db_service)
        invalidate_prefix("public_catalog:")
        invalidate_prefix("service_taxonomy:")
        return db_service
    except IntegrityError:
        db.rollback()
        return "duplicate_slug"


def delete_service(db: Session, service_id: int):
    db_service = db.get(Service, service_id)
    if not db_service:
        return None
    db.delete(db_service)
    db.commit()
    invalidate_prefix("public_catalog:")
    invalidate_prefix("service_taxonomy:")
    return True


def _parse_codes_cell(value: object) -> list[str]:
    if value is None:
        return []
    if isinstance(value, str):
        separator_normalized = value.replace("|", ",").replace(";", ",")
        return _normalize_codes(separator_normalized.split(","))
    if isinstance(value, Iterable):
        return _normalize_codes(value)
    return _normalize_codes([str(value)])


def _normalize_row(row: dict[str, object]) -> CatalogImportRow:
    lowered = {(key or "").strip().lower(): value for key, value in row.items()}
    return CatalogImportRow(
        level=str(lowered.get("level", "")).strip().lower(),
        slug=str(lowered.get("slug", "")).strip(),
        name_ro=str(lowered.get("name_ro", "")).strip(),
        name_en=str(lowered.get("name_en", "")).strip(),
        caen_codes=_parse_codes_cell(lowered.get("caen_codes")),
        uniclass_codes=_parse_codes_cell(lowered.get("uniclass_codes")),
        esco_codes=_parse_codes_cell(lowered.get("esco_codes")),
        domain_slug=(str(lowered.get("domain_slug", "")).strip() or None),
        category_slug=(str(lowered.get("category_slug", "")).strip() or None),
    )


def _read_csv_rows(content: bytes) -> list[CatalogImportRow]:
    decoded = content.decode("utf-8-sig")
    reader = csv.DictReader(io.StringIO(decoded))
    return [_normalize_row(row) for row in reader]


def _read_xlsx_rows(content: bytes) -> list[CatalogImportRow]:
    rows: list[CatalogImportRow] = []
    preferred_sheets = {
        "domains": "domain",
        "categories": "category",
        "subcategories": "subcategory",
    }
    matched = False

    for sheet_name, level in preferred_sheets.items():
        try:
            sheet_rows = read_xlsx_rows(content, sheet_name=sheet_name)
        except ValueError:
            continue
        if not sheet_rows:
            continue
        matched = True
        for row in sheet_rows:
            normalized_row = {key.strip().lower(): value for key, value in row.items()}
            normalized_row["level"] = level
            rows.append(_normalize_row(normalized_row))

    if matched:
        return rows

    for row in read_xlsx_rows(content):
        rows.append(_normalize_row({key.strip().lower(): value for key, value in row.items()}))
    return rows


def parse_catalog_import_file(filename: str, content: bytes) -> list[CatalogImportRow]:
    suffix = Path(filename).suffix.lower()
    if suffix == ".csv":
        return _read_csv_rows(content)
    if suffix in {".xlsx", ".xlsm"}:
        return _read_xlsx_rows(content)
    raise ValueError("Unsupported file format. Please upload CSV or XLSX.")


def import_catalog_taxonomy(db: Session, rows: list[CatalogImportRow]) -> CatalogImportResponse:
    result = CatalogImportResponse()

    for row in rows:
        if not row.slug or not row.name_ro or not row.name_en or row.level not in {"domain", "category", "subcategory"}:
            continue

        if row.level == "domain":
            existing_domain = get_domain_by_slug(db, row.slug)
            payload = {
                "name_ro": row.name_ro,
                "name_en": row.name_en,
                "slug": row.slug,
                "is_active": True,
                "caen_codes": row.caen_codes,
                "uniclass_codes": row.uniclass_codes,
                "esco_codes": row.esco_codes,
            }
            if existing_domain:
                update_domain(db, existing_domain.id, DomainUpdate(**payload))
                result.domains_updated += 1
            else:
                create_domain(db, DomainCreate(**payload))
                result.domains_created += 1
            continue

        if row.level == "category":
            if not row.domain_slug:
                continue
            domain = get_domain_by_slug(db, row.domain_slug)
            if not domain:
                continue
            existing_category = get_category_by_slug(db, row.slug)
            payload = {
                "domain_id": domain.id,
                "name_ro": row.name_ro,
                "name_en": row.name_en,
                "slug": row.slug,
                "is_active": True,
                "caen_codes": row.caen_codes,
                "uniclass_codes": row.uniclass_codes,
                "esco_codes": row.esco_codes,
            }
            if existing_category:
                update_category(db, existing_category.id, CategoryUpdate(**payload))
                result.categories_updated += 1
            else:
                create_category(db, CategoryCreate(**payload))
                result.categories_created += 1
            continue

        if not row.category_slug:
            continue
        category = get_category_by_slug(db, row.category_slug)
        if not category:
            continue
        existing_subcategory = get_subcategory_by_slug(db, row.slug)
        payload = {
            "category_id": category.id,
            "name_ro": row.name_ro,
            "name_en": row.name_en,
            "slug": row.slug,
            "is_active": True,
            "caen_codes": row.caen_codes,
            "uniclass_codes": row.uniclass_codes,
            "esco_codes": row.esco_codes,
        }
        if existing_subcategory:
            update_subcategory(db, existing_subcategory.id, SubcategoryUpdate(**payload))
            result.subcategories_updated += 1
        else:
            create_subcategory(db, SubcategoryCreate(**payload))
            result.subcategories_created += 1

    return result
