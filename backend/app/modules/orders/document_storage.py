from __future__ import annotations

import os
import subprocess
import tempfile
from pathlib import Path

from app.core.config import settings


TEMP_ORDER_DOCS: dict[str, Path] = {}


def _storage_root() -> Path:
    root = Path(settings.ATTACHMENTS_STORAGE_DIR)
    root.mkdir(parents=True, exist_ok=True)
    return root


def _use_gcs_backend() -> bool:
    return settings.ATTACHMENTS_STORAGE_BACKEND.lower() == "gcs" and bool(settings.GCS_ATTACHMENTS_BUCKET)


def _gcs_object_name(storage_key: str) -> str:
    prefix = settings.GCS_ATTACHMENTS_PREFIX.strip("/").strip()
    return f"{prefix}/{storage_key}" if prefix else storage_key


def _build_gcs_uri(storage_key: str) -> str:
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
    except Exception:
        temp_dir = Path(tempfile.gettempdir()) / "mydarrin-gcs-upload"
        temp_dir.mkdir(parents=True, exist_ok=True)
        temp_file = temp_dir / storage_key.replace("/", "-")
        temp_file.write_bytes(content)
        subprocess.run(
            [
                "C:\\Program Files (x86)\\Google\\Cloud SDK\\google-cloud-sdk\\bin\\gcloud.cmd",
                "storage",
                "cp",
                str(temp_file),
                _build_gcs_uri(storage_key),
            ],
            check=True,
            capture_output=True,
            text=True,
        )


def _download_from_gcs(storage_key: str) -> Path | None:
    if not _use_gcs_backend():
        return None
    temp_dir = Path(tempfile.gettempdir()) / "mydarrin-gcs-order-docs"
    temp_dir.mkdir(parents=True, exist_ok=True)
    local_path = temp_dir / storage_key.replace("/", "-")
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
                _build_gcs_uri(storage_key),
                str(local_path),
            ],
            capture_output=True,
            text=True,
        )
        if result.returncode != 0:
            return None
        return local_path


def save_document_content(*, storage_key: str, content: bytes, mime_type: str) -> Path:
    path = _storage_root() / storage_key
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(content)
    _upload_to_gcs(storage_key=storage_key, content=content, mime_type=mime_type)
    return path


def get_document_path(storage_key: str) -> Path | None:
    path = _storage_root() / storage_key
    if path.exists():
        return path
    gcs_path = _download_from_gcs(storage_key)
    if gcs_path is not None:
        TEMP_ORDER_DOCS[storage_key] = gcs_path
        return gcs_path
    return None
