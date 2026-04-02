from __future__ import annotations

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_db
from app.modules.public_partners.schemas import PublicPartnerDocumentUploadResponse
from app.services.attachment_service import create_entity_attachment

public_router = APIRouter(prefix="/public/partners", tags=["PublicPartners"])

ALLOWED_PDF_TYPES = {"application/pdf"}
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}


@public_router.post("/documents", response_model=PublicPartnerDocumentUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_partner_document(
    user_id: int = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    content_type = (file.content_type or "").lower()
    if content_type not in ALLOWED_PDF_TYPES | ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="unsupported_document_type")

    attachment_type = "DOCUMENT" if content_type in ALLOWED_PDF_TYPES else "IMAGE"
    payload = await file.read()
    result = create_entity_attachment(
        db,
        entity_type="partner",
        entity_id=user_id,
        attachment_type=attachment_type,
        file_name=file.filename or f"partner-document.{ 'pdf' if attachment_type == 'DOCUMENT' else 'png'}",
        content=payload,
        mime_type=content_type or "application/octet-stream",
    )
    if result == "invalid_attachment_type":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="invalid_attachment_type")

    return PublicPartnerDocumentUploadResponse(
        attachment_id=result.id,
        status="PENDING",
        attachment_type=result.attachment_type,
        file_name=result.file_name,
        mime_type=result.mime_type,
    )
