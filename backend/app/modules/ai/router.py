from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import get_db
from app.core.security import get_current_admin_user
from app.modules.cost_engine.schemas import ResourceCreate, ServiceLevel
from app.modules.deviz_engine.schemas import DevizRequest, DevizResponse
from app.modules.deviz_engine.service import generate_deviz


class AIInterpretRequest(BaseModel):
    service_id: int
    country_id: int
    zone_id: int
    currency: str = Field(min_length=3, max_length=3)
    legislation_code: str = Field(min_length=2, max_length=32)
    message: str = Field(min_length=3, max_length=1000)
    urgency: bool | None = None
    service_level: ServiceLevel | None = None
    resources: list[ResourceCreate] = Field(default_factory=list)


class AIInterpretResponse(BaseModel):
    interpreted_urgency: bool
    interpreted_service_level: ServiceLevel
    reasoning: str
    deviz: DevizResponse | None
    error: str | None = None


router = APIRouter(
    prefix="/ai",
    tags=["ai"],
    dependencies=[Depends(get_current_admin_user)],
)


def _infer_urgency(message: str, override: bool | None) -> bool:
    if override is not None:
        return override
    normalized = message.lower()
    return any(keyword in normalized for keyword in ["urgent", "rapid", "asap", "imediat", "azi"])


def _infer_service_level(message: str, override: ServiceLevel | None) -> ServiceLevel:
    if override is not None:
        return override
    normalized = message.lower()
    if any(keyword in normalized for keyword in ["premium", "lux", "executiv", "platinum"]):
        return ServiceLevel.PREMIUM
    if any(keyword in normalized for keyword in ["standard", "echilibrat", "normal"]):
        return ServiceLevel.STANDARD
    return ServiceLevel.BASIC


@router.post("/interpret", response_model=AIInterpretResponse)
def interpret_request(data: AIInterpretRequest, db: Session = Depends(get_db)):
    urgency = _infer_urgency(data.message, data.urgency)
    service_level = _infer_service_level(data.message, data.service_level)
    deviz = generate_deviz(
        db,
        DevizRequest(
            service_id=data.service_id,
            country_id=data.country_id,
            zone_id=data.zone_id,
            currency=data.currency,
            legislation_code=data.legislation_code,
            urgency=urgency,
            service_level=service_level,
            resources=data.resources,
            source_message=data.message,
        ),
    )

    reasoning = (
        f"Urgenta a fost interpretata ca {urgency} iar nivelul de serviciu ca "
        f"{service_level.value}, pe baza mesajului transmis."
    )

    return AIInterpretResponse(
        interpreted_urgency=urgency,
        interpreted_service_level=service_level,
        reasoning=reasoning,
        deviz=deviz if isinstance(deviz, DevizResponse) else None,
        error=deviz if isinstance(deviz, str) else None,
    )
