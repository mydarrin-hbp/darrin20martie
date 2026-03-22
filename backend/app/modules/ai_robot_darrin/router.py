from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.dependencies import get_db
from app.core.security import get_current_admin_user
from app.modules.ai_robot_darrin.learning_loop import get_learning_snapshot, save_feedback
from app.modules.ai_robot_darrin.service import interpret_request
from app.modules.cost_engine.schemas import ResourceCreate, ServiceLevel
from app.modules.deviz_engine.schemas import DevizResponse


class AIRobotDarrinInterpretRequest(BaseModel):
    service_id: int
    country_id: int
    zone_id: int
    locality_id: int | None = None
    currency: str = Field(min_length=3, max_length=3)
    legislation_code: str = Field(min_length=2, max_length=32)
    message: str = Field(min_length=3, max_length=1000)
    urgency: bool | None = None
    service_level: ServiceLevel | None = None
    resources: list[ResourceCreate] = Field(default_factory=list)


class AIRobotDarrinFeedbackRequest(BaseModel):
    service_id: int | None = None
    deviz_id: int | None = None
    rating: int = Field(ge=1, le=5)
    accepted: bool
    user_message: str | None = None
    ai_summary: str | None = None
    suggested_level: str | None = None
    resolution_notes: str | None = None
    prompt_snapshot: str | None = None
    rag_sources: list[str] = Field(default_factory=list)


class AIRobotDarrinInterpretResponse(BaseModel):
    provider: str
    model: str
    embedding_model: str | None = None
    used_fallback: bool
    provider_reason: str | None = None
    warnings: list[str] = Field(default_factory=list)
    confidence: float
    interpreted_summary: str
    interpreted_urgency: bool
    interpreted_service_level: ServiceLevel
    reasoning: str
    rag_context: dict
    rag_sources: list[str]
    learning_snapshot: dict
    suggested_resources: list[ResourceCreate]
    risk_flags: list[str] = Field(default_factory=list)
    follow_up_questions: list[str] = Field(default_factory=list)
    client_explanation: str | None = None
    recommended_deviz_level: str | None = None
    prompt_snapshot: str | None = None
    deviz: DevizResponse | None
    error: str | None = None


router = APIRouter(
    prefix="/ai",
    tags=["ai-robot-darrin"],
    dependencies=[Depends(get_current_admin_user)],
)


@router.post("/interpret", response_model=AIRobotDarrinInterpretResponse)
def interpret(data: AIRobotDarrinInterpretRequest, db: Session = Depends(get_db)):
    result = interpret_request(
        db,
        service_id=data.service_id,
        country_id=data.country_id,
        zone_id=data.zone_id,
        locality_id=data.locality_id,
        currency=data.currency,
        legislation_code=data.legislation_code,
        message=data.message,
        urgency=data.urgency,
        service_level=data.service_level,
        resources=data.resources,
    )
    deviz = result["deviz"]
    return AIRobotDarrinInterpretResponse(
        provider=result["provider"],
        model=result["model"],
        embedding_model=result["embedding_model"],
        used_fallback=result["used_fallback"],
        provider_reason=result["provider_reason"],
        warnings=result["warnings"],
        confidence=result["confidence"],
        interpreted_summary=result["interpreted_summary"],
        interpreted_urgency=result["interpreted_urgency"],
        interpreted_service_level=result["interpreted_service_level"],
        reasoning=result["reasoning"],
        rag_context=result["rag_context"],
        rag_sources=result["rag_sources"],
        learning_snapshot=result["learning_snapshot"],
        suggested_resources=result["suggested_resources"],
        risk_flags=result["risk_flags"],
        follow_up_questions=result["follow_up_questions"],
        client_explanation=result["client_explanation"],
        recommended_deviz_level=result["recommended_deviz_level"],
        prompt_snapshot=result["prompt_snapshot"],
        deviz=deviz if isinstance(deviz, DevizResponse) else None,
        error=deviz if isinstance(deviz, str) else None,
    )


@router.post("/feedback")
def feedback(data: AIRobotDarrinFeedbackRequest, db: Session = Depends(get_db)):
    feedback_row = save_feedback(
        db,
        service_id=data.service_id,
        deviz_id=data.deviz_id,
        rating=data.rating,
        accepted=data.accepted,
        user_message=data.user_message,
        ai_summary=data.ai_summary,
        suggested_level=data.suggested_level,
        resolution_notes=data.resolution_notes,
        prompt_snapshot=data.prompt_snapshot,
        rag_sources=data.rag_sources,
    )
    return {
        "id": feedback_row.id,
        "learning_snapshot": get_learning_snapshot(db),
    }
