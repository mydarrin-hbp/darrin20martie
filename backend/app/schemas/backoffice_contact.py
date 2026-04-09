from pydantic import BaseModel, EmailStr


class BackofficeContactResponse(BaseModel):
    name: str | None
    email: EmailStr | None
    phone: str | None
    whatsapp: str | None
    note: str | None
