from __future__ import annotations

import smtplib
from email.message import EmailMessage

from app.core.config import settings
import logging

LOGGER = logging.getLogger("mydarrin.email")


def _email_configured() -> bool:
    return bool(settings.SMTP_HOST and settings.SMTP_SENDER)


def send_email(*, to_email: str, subject: str, body: str) -> bool:
    if not _email_configured():
        return False

    message = EmailMessage()
    message["From"] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_SENDER}>"
    message["To"] = to_email
    message["Subject"] = subject
    message.set_content(body)

    try:
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10) as server:
            if settings.SMTP_USE_TLS:
                server.starttls()
            if settings.SMTP_USERNAME and settings.SMTP_PASSWORD:
                server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
            server.send_message(message)
        return True
    except Exception:
        LOGGER.exception("Email send failed to %s", to_email)
        return False
