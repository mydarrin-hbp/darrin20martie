import csv
import io
from typing import Any

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.modules.geography.models import Country, Locality, Zone
from app.services.xlsx_reader import read_xlsx_rows
from app.modules.geography.schemas import (
    CountryCreate,
    CountryResponse,
    CountryUpdate,
    LocalityCreate,
    LocalityResponse,
    LocalityUpdate,
    ZoneCreate,
    ZoneResponse,
    ZoneUpdate,
)


def get_countries(db: Session):
    return db.execute(select(Country).order_by(Country.id)).scalars().all()


def get_zones(db: Session):
    return db.execute(select(Zone).order_by(Zone.id)).scalars().all()


def create_country(db: Session, data: CountryCreate):
    country = Country(**data.model_dump())
    db.add(country)
    try:
        db.commit()
        db.refresh(country)
        return country
    except IntegrityError:
        db.rollback()
        return "duplicate_country"


def update_country(db: Session, country_id: int, data: CountryUpdate):
    country = db.get(Country, country_id)
    if not country:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(country, field, value)
    try:
        db.commit()
        db.refresh(country)
        return country
    except IntegrityError:
        db.rollback()
        return "duplicate_country"


def delete_country(db: Session, country_id: int):
    country = db.get(Country, country_id)
    if not country:
        return None
    db.delete(country)
    db.commit()
    return True


def create_zone(db: Session, data: ZoneCreate):
    country = db.get(Country, data.country_id)
    if not country:
        return "country_not_found"
    zone = Zone(**data.model_dump())
    db.add(zone)
    try:
        db.commit()
        db.refresh(zone)
        return zone
    except IntegrityError:
        db.rollback()
        return "duplicate_zone"


def update_zone(db: Session, zone_id: int, data: ZoneUpdate):
    zone = db.get(Zone, zone_id)
    if not zone:
        return None
    update_data = data.model_dump(exclude_unset=True)
    if "country_id" in update_data:
        country = db.get(Country, update_data["country_id"])
        if not country:
            return "country_not_found"
    for field, value in update_data.items():
        setattr(zone, field, value)
    try:
        db.commit()
        db.refresh(zone)
        return zone
    except IntegrityError:
        db.rollback()
        return "duplicate_zone"


def delete_zone(db: Session, zone_id: int):
    zone = db.get(Zone, zone_id)
    if not zone:
        return None
    db.delete(zone)
    db.commit()
    return True


def list_localities(db: Session, *, country_id: int | None = None, zone_id: int | None = None):
    query = select(Locality)
    if country_id is not None:
        query = query.where(Locality.country_id == country_id)
    if zone_id is not None:
        query = query.where(Locality.zone_id == zone_id)
    rows = db.execute(query.order_by(Locality.name_ro, Locality.id)).scalars().all()
    return [
        LocalityResponse(
            id=item.id,
            country_id=item.country_id,
            zone_id=item.zone_id,
            name_ro=item.name_ro,
            name_en=item.name_en,
            slug=item.slug,
            latitude=item.latitude,
            longitude=item.longitude,
            is_active=item.is_active,
            country_name_ro=item.country.name_ro or item.country.name,
            zone_name_ro=item.zone.name_ro or item.zone.name,
        )
        for item in rows
    ]


def get_locality(db: Session, locality_id: int):
    locality = db.execute(
        select(Locality).where(Locality.id == locality_id)
    ).scalar_one_or_none()
    if not locality:
        return None
    return LocalityResponse(
        id=locality.id,
        country_id=locality.country_id,
        zone_id=locality.zone_id,
        name_ro=locality.name_ro,
        name_en=locality.name_en,
        slug=locality.slug,
        latitude=locality.latitude,
        longitude=locality.longitude,
        is_active=locality.is_active,
        country_name_ro=locality.country.name_ro or locality.country.name,
        zone_name_ro=locality.zone.name_ro or locality.zone.name,
    )


def create_locality(db: Session, data: LocalityCreate):
    country = db.get(Country, data.country_id)
    if not country:
        return "country_not_found"
    zone = db.get(Zone, data.zone_id)
    if not zone:
        return "zone_not_found"
    if zone.country_id != country.id:
        return "zone_country_mismatch"
    locality = Locality(**data.model_dump())
    db.add(locality)
    try:
        db.commit()
        db.refresh(locality)
    except IntegrityError:
        db.rollback()
        return "duplicate_slug"
    return get_locality(db, locality.id)


def update_locality(db: Session, locality_id: int, data: LocalityUpdate):
    locality = db.get(Locality, locality_id)
    if not locality:
        return None
    update_data = data.model_dump(exclude_unset=True)
    target_zone_id = update_data.get("zone_id", locality.zone_id)
    zone = db.get(Zone, target_zone_id)
    if not zone:
        return "zone_not_found"
    if zone.country_id != locality.country_id:
        return "zone_country_mismatch"
    for field, value in update_data.items():
        setattr(locality, field, value)
    try:
        db.commit()
        db.refresh(locality)
    except IntegrityError:
        db.rollback()
        return "duplicate_slug"
    return get_locality(db, locality.id)


def delete_locality(db: Session, locality_id: int):
    locality = db.get(Locality, locality_id)
    if not locality:
        return None
    db.delete(locality)
    db.commit()
    return True


def _read_zone_rows(filename: str, content: bytes) -> list[dict[str, Any]]:
    suffix = (filename or "").lower().strip()
    if suffix.endswith(".csv"):
        decoded = content.decode("utf-8-sig", errors="ignore")
        reader = csv.DictReader(io.StringIO(decoded))
        return [row for row in reader if row]
    if suffix.endswith(".xlsx") or suffix.endswith(".xlsm"):
        return read_xlsx_rows(content, required_headers={"country_id", "name", "slug"})
    raise ValueError("Unsupported file format. Please upload CSV or XLSX.")


def import_zones(db: Session, filename: str, content: bytes) -> dict[str, Any]:
    rows = _read_zone_rows(filename, content)
    created = 0
    updated = 0
    errors: list[dict[str, Any]] = []
    for index, row in enumerate(rows, start=2):
        try:
            country_id = int(float(str(row.get("country_id") or row.get("Country ID") or "").strip()))
        except ValueError:
            errors.append({"row": index, "error": "country_id_missing"})
            continue
        country = db.get(Country, country_id)
        if not country:
            errors.append({"row": index, "error": "country_not_found"})
            continue
        name = str(row.get("name") or row.get("Name") or "").strip()
        slug = str(row.get("slug") or row.get("Slug") or "").strip()
        if not name or not slug:
            errors.append({"row": index, "error": "name_or_slug_missing"})
            continue
        multiplier_raw = str(row.get("multiplier") or row.get("Multiplier") or "1").strip()
        try:
            multiplier = float(multiplier_raw.replace(",", ".")) if multiplier_raw else 1.0
        except ValueError:
            multiplier = 1.0
        existing = db.execute(
            select(Zone).where(Zone.country_id == country_id, Zone.slug == slug)
        ).scalar_one_or_none()
        data = {
            "country_id": country_id,
            "name": name,
            "name_ro": str(row.get("name_ro") or row.get("Name RO") or "").strip(),
            "name_en": str(row.get("name_en") or row.get("Name EN") or "").strip(),
            "slug": slug,
            "multiplier": multiplier,
            "is_active": str(row.get("is_active") or "1").strip().lower() not in {"0", "false", "no"},
        }
        if existing:
            for field, value in data.items():
                setattr(existing, field, value)
            updated += 1
        else:
            db.add(Zone(**data))
            created += 1
    db.commit()
    return {"created": created, "updated": updated, "errors": errors}


def export_zones_csv(db: Session) -> str:
    rows = db.execute(select(Zone).order_by(Zone.country_id, Zone.id)).scalars().all()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["country_id", "name", "name_ro", "name_en", "slug", "multiplier", "is_active"])
    for row in rows:
        writer.writerow(
            [
                row.country_id,
                row.name,
                row.name_ro,
                row.name_en,
                row.slug,
                float(row.multiplier),
                row.is_active,
            ]
        )
    return output.getvalue()
