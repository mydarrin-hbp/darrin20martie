from __future__ import annotations

import hashlib
import mimetypes
import os
import re
import subprocess
import tempfile
from pathlib import Path
from uuid import uuid4
from io import BytesIO

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.price_analysis import CatalogActivity, CatalogResource, EntityAttachment
from app.models.service import Service
from app.schemas.price_analysis import EntityAttachmentResponse


ATTACHMENT_TYPES = {"IMAGE": "images", "DOCUMENT": "documents", "VIDEO": "videos"}
LEVEL_NAMES = {"BRONZ", "ARGINT", "AUR", "PLATINUM"}
ENTITY_TYPES = {"activity", "service", "resource"}
TEMP_GCS_FILES: dict[int, Path] = {}


def _slugify(value: str) -> str:
    normalized = re.sub(r"[^a-zA-Z0-9._-]+", "-", value).strip("-").lower()
    return normalized or "attachment"


def _should_process_image(mime_type: str | None) -> bool:
    if not mime_type:
        return False
    lowered = mime_type.lower()
    if lowered.startswith("image/svg"):
        return False
    return lowered.startswith("image/")


def _convert_image_to_webp(content: bytes) -> tuple[bytes, str] | None:
    try:
        from PIL import Image
    except Exception:
        return None

    try:
        image = Image.open(BytesIO(content))
        image.load()
    except Exception:
        return None

    max_size = (1600, 1600)
    image.thumbnail(max_size)
    output = BytesIO()
    save_kwargs = {"format": "WEBP", "quality": 80, "method": 6}
    if image.mode in ("RGBA", "LA"):
        image.save(output, **save_kwargs)
    else:
        image.convert("RGB").save(output, **save_kwargs)
    return output.getvalue(), "image/webp"


def _storage_root() -> Path:
    root = Path(settings.ATTACHMENTS_STORAGE_DIR)
    root.mkdir(parents=True, exist_ok=True)
    return root


def _use_gcs_backend() -> bool:
    return settings.ATTACHMENTS_STORAGE_BACKEND.lower() == "gcs" and bool(settings.GCS_ATTACHMENTS_BUCKET)


def _gcs_object_name(storage_key: str) -> str:
    prefix = settings.GCS_ATTACHMENTS_PREFIX.strip("/").strip()
    return f"{prefix}/{storage_key}" if prefix else storage_key


def build_gcs_uri(storage_key: str) -> str:
    bucket = settings.GCS_ATTACHMENTS_BUCKET or ""
    return f"gs://{bucket}/{_gcs_object_name(storage_key)}"


def _upload_to_gcs(*, storage_key: str, content: bytes, mime_type: str) -> None:
    if not _use_gcs_backend():
        return
    try:
        from google.cloud import storage

        client = storage.Client(project=os.getenv("GOOGLE_CLOUD_PROJECT") or None)
        bucket = client.bucket(settings.GCS_ATTACHMENTS_BUCKET)
        blob = bucket.blob(_gcs_object_name(storage_key))
        blob.upload_from_string(content, content_type=mime_type)
        return
    except Exception:
        temp_dir = Path(tempfile.gettempdir()) / "mydarrin-gcs-upload"
        temp_dir.mkdir(parents=True, exist_ok=True)
        temp_file = temp_dir / _slugify(storage_key.replace("/", "-"))
        temp_file.write_bytes(content)
        subprocess.run(
            [
                "C:\\Program Files (x86)\\Google\\Cloud SDK\\google-cloud-sdk\\bin\\gcloud.cmd",
                "storage",
                "cp",
                str(temp_file),
                build_gcs_uri(storage_key),
            ],
            check=True,
            capture_output=True,
            text=True,
        )


def _download_from_gcs(storage_key: str) -> Path | None:
    if not _use_gcs_backend():
        return None
    temp_dir = Path(tempfile.gettempdir()) / "mydarrin-gcs-attachments"
    temp_dir.mkdir(parents=True, exist_ok=True)
    local_path = temp_dir / _slugify(storage_key.replace("/", "-"))
    try:
        from google.cloud import storage

        client = storage.Client(project=os.getenv("GOOGLE_CLOUD_PROJECT") or None)
        bucket = client.bucket(settings.GCS_ATTACHMENTS_BUCKET)
        blob = bucket.blob(_gcs_object_name(storage_key))
        if not blob.exists(client):
            return None
        blob.download_to_filename(str(local_path))
        return local_path
    except Exception:
        result = subprocess.run(
            [
                "C:\\Program Files (x86)\\Google\\Cloud SDK\\google-cloud-sdk\\bin\\gcloud.cmd",
                "storage",
                "cp",
                build_gcs_uri(storage_key),
                str(local_path),
            ],
            capture_output=True,
            text=True,
        )
        if result.returncode != 0:
            return None
        return local_path


def _build_signature(attachment: EntityAttachment) -> str:
    payload = f"{attachment.id}:{attachment.entity_type}:{attachment.attachment_type}:{attachment.storage_key}:{settings.JWT_SECRET}"
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()


def build_secure_attachment_url(attachment: EntityAttachment) -> str:
    return f"/api/v1/backoffice/attachments/content/{attachment.id}?token={_build_signature(attachment)}"


def _get_entity(db: Session, entity_type: str, entity_id: int):
    if entity_type == "activity":
        return db.get(CatalogActivity, entity_id)
    if entity_type == "service":
        return db.get(Service, entity_id)
    if entity_type == "resource":
        return db.get(CatalogResource, entity_id)
    return None


def _serialize_attachment(attachment: EntityAttachment) -> EntityAttachmentResponse:
    return EntityAttachmentResponse(
        id=attachment.id,
        entity_type=attachment.entity_type,
        entity_id=attachment.entity_id,
        attachment_type=attachment.attachment_type,
        level_name=attachment.level_name,
        file_name=attachment.file_name,
        mime_type=attachment.mime_type,
        secure_url=attachment.secure_url,
        created_at=attachment.created_at,
    )


def sync_entity_attachment_fields(db: Session, *, entity_type: str, entity_id: int):
    entity = _get_entity(db, entity_type, entity_id)
    if not entity:
        return None

    attachments = db.execute(
        select(EntityAttachment)
        .where(EntityAttachment.entity_type == entity_type, EntityAttachment.entity_id == entity_id)
        .order_by(EntityAttachment.created_at, EntityAttachment.id)
    ).scalars().all()

    images = [item.secure_url for item in attachments if item.attachment_type == "IMAGE"]
    documents = [item.secure_url for item in attachments if item.attachment_type == "DOCUMENT"]
    videos = [item.secure_url for item in attachments if item.attachment_type == "VIDEO"]
    level_attachments: dict[str, list[str]] = {}
    for item in attachments:
        if not item.level_name:
            continue
        level_attachments.setdefault(item.level_name, []).append(item.secure_url)

    # Activities and services keep a denormalized projection of attachment URLs.
    # Resources currently use entity_attachments as source-of-truth and don't need
    # mirrored JSON columns on the model.
    if all(hasattr(entity, field) for field in ("images", "documents", "videos", "level_attachments")):
        entity.images = images
        entity.documents = documents
        entity.videos = videos
        entity.level_attachments = level_attachments
        db.commit()
        db.refresh(entity)
    return entity


def list_entity_attachments(db: Session, *, entity_type: str, entity_id: int) -> list[EntityAttachmentResponse]:
    attachments = db.execute(
        select(EntityAttachment)
        .where(EntityAttachment.entity_type == entity_type, EntityAttachment.entity_id == entity_id)
        .order_by(EntityAttachment.created_at.desc(), EntityAttachment.id.desc())
    ).scalars().all()
    return [_serialize_attachment(item) for item in attachments]


def create_entity_attachment(
    db: Session,
    *,
    entity_type: str,
    entity_id: int,
    attachment_type: str,
    file_name: str,
    content: bytes,
    mime_type: str | None,
    level_name: str | None = None,
):
    if entity_type not in ENTITY_TYPES:
        return "invalid_entity_type"
    if attachment_type not in ATTACHMENT_TYPES:
        return "invalid_attachment_type"
    if level_name is not None and level_name.upper() not in LEVEL_NAMES:
        return "invalid_level_name"

    entity = _get_entity(db, entity_type, entity_id)
    if not entity:
        return "entity_not_found"

    suffix = Path(file_name or "").suffix or mimetypes.guess_extension(mime_type or "") or ""
    processed_content = content
    processed_mime = mime_type or mimetypes.guess_type(file_name or "")[0] or "application/octet-stream"
    if attachment_type == "IMAGE" and _should_process_image(processed_mime):
        converted = _convert_image_to_webp(content)
        if converted:
            processed_content, processed_mime = converted
            suffix = ".webp"
            file_name = f"{Path(file_name or 'image').stem}.webp"
    storage_file_name = f"{uuid4().hex}-{_slugify(Path(file_name or 'attachment').stem)}{suffix}"
    storage_key = str(Path(entity_type) / str(entity_id) / storage_file_name).replace("\\", "/")
    file_path = _storage_root() / storage_key
    file_path.parent.mkdir(parents=True, exist_ok=True)
    file_path.write_bytes(processed_content)

    attachment = EntityAttachment(
        entity_type=entity_type,
        entity_id=entity_id,
        attachment_type=attachment_type,
        level_name=level_name.upper() if level_name else None,
        file_name=file_name or storage_file_name,
        mime_type=processed_mime,
        storage_key=storage_key,
        secure_url="",
    )
    db.add(attachment)
    db.commit()
    db.refresh(attachment)

    attachment.secure_url = build_secure_attachment_url(attachment)
    db.commit()
    db.refresh(attachment)
    _upload_to_gcs(storage_key=storage_key, content=processed_content, mime_type=attachment.mime_type)
    sync_entity_attachment_fields(db, entity_type=entity_type, entity_id=entity_id)
    return _serialize_attachment(attachment)


def get_attachment_file(db: Session, attachment_id: int, token: str):
    attachment = db.get(EntityAttachment, attachment_id)
    if not attachment:
        return None
    if token != _build_signature(attachment):
        return "invalid_token"

    path = _storage_root() / attachment.storage_key
    if path.exists():
        return attachment, path
    gcs_path = _download_from_gcs(attachment.storage_key)
    if gcs_path is not None:
        TEMP_GCS_FILES[attachment.id] = gcs_path
        return attachment, gcs_path
    return "file_not_found"


def sync_attachment_to_gcs(db: Session, attachment: EntityAttachment) -> EntityAttachmentResponse | str:
    local_path = _storage_root() / attachment.storage_key
    if not local_path.exists():
        return "file_not_found"
    _upload_to_gcs(storage_key=attachment.storage_key, content=local_path.read_bytes(), mime_type=attachment.mime_type)
    attachment.secure_url = build_secure_attachment_url(attachment)
    db.commit()
    db.refresh(attachment)
    sync_entity_attachment_fields(db, entity_type=attachment.entity_type, entity_id=attachment.entity_id)
    return _serialize_attachment(attachment)


def sync_all_attachments_to_gcs(db: Session) -> dict:
    attachments = db.execute(select(EntityAttachment).order_by(EntityAttachment.id)).scalars().all()
    synced = 0
    missing = 0
    for attachment in attachments:
        result = sync_attachment_to_gcs(db, attachment)
        if result == "file_not_found":
            missing += 1
        else:
            synced += 1
    return {"synced": synced, "missing": missing, "bucket": settings.GCS_ATTACHMENTS_BUCKET, "backend": settings.ATTACHMENTS_STORAGE_BACKEND}


def seed_attachment_file(
    db: Session,
    *,
    entity_type: str,
    entity_id: int,
    attachment_type: str,
    file_name: str,
    content: bytes,
    mime_type: str,
    level_name: str | None = None,
):
    result = create_entity_attachment(
        db,
        entity_type=entity_type,
        entity_id=entity_id,
        attachment_type=attachment_type,
        file_name=file_name,
        content=content,
        mime_type=mime_type,
        level_name=level_name,
    )
    if isinstance(result, str):
        raise RuntimeError(f"Unable to seed attachment: {result}")
    return result
