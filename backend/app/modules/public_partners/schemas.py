from __future__ import annotations

from pydantic import BaseModel


class PublicPartnerDocumentUploadResponse(BaseModel):
    attachment_id: int
    status: str
    attachment_type: str
    file_name: str
    mime_type: str
