from fastapi import APIRouter, Depends

from app.core.config import settings
from app.core.security import get_current_admin_user
from app.schemas.backoffice_contact import BackofficeContactResponse

router = APIRouter(dependencies=[Depends(get_current_admin_user)])


@router.get("/contact", response_model=BackofficeContactResponse)
def get_backoffice_contact():
    return BackofficeContactResponse(
        name=settings.BACKOFFICE_CONTACT_NAME,
        email=settings.BACKOFFICE_CONTACT_EMAIL,
        phone=settings.BACKOFFICE_CONTACT_PHONE,
        whatsapp=settings.BACKOFFICE_CONTACT_WHATSAPP,
        note=settings.BACKOFFICE_CONTACT_NOTE,
    )
