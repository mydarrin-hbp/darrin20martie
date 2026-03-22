import json

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.modules.ai_robot_darrin.models import AIRobotDarrinFeedback


def save_feedback(
    db: Session,
    *,
    service_id: int | None,
    deviz_id: int | None,
    rating: int,
    accepted: bool,
    user_message: str | None,
    ai_summary: str | None,
    suggested_level: str | None,
    resolution_notes: str | None = None,
    prompt_snapshot: str | None = None,
    rag_sources: list[str] | None = None,
):
    feedback = AIRobotDarrinFeedback(
        service_id=service_id,
        deviz_id=deviz_id,
        rating=rating,
        accepted=accepted,
        user_message=user_message,
        ai_summary=ai_summary,
        suggested_level=suggested_level,
        resolution_notes=resolution_notes,
        prompt_snapshot=prompt_snapshot,
        rag_sources=json.dumps(rag_sources or [], ensure_ascii=True),
    )
    db.add(feedback)
    db.commit()
    db.refresh(feedback)
    return feedback


def get_learning_snapshot(db: Session):
    total_feedback = db.execute(
        select(func.count(AIRobotDarrinFeedback.id))
    ).scalar_one()
    accepted_feedback = db.execute(
        select(func.count(AIRobotDarrinFeedback.id)).where(AIRobotDarrinFeedback.accepted.is_(True))
    ).scalar_one()
    average_rating = db.execute(
        select(func.avg(AIRobotDarrinFeedback.rating))
    ).scalar_one()

    acceptance_rate = 0.0
    if total_feedback:
        acceptance_rate = round((accepted_feedback / total_feedback) * 100, 2)

    return {
        "total_feedback": total_feedback,
        "accepted_feedback": accepted_feedback,
        "average_rating": round(float(average_rating or 0), 2),
        "acceptance_rate": acceptance_rate,
    }


def get_learning_examples(db: Session, *, limit: int = 6) -> dict:
    rows = db.execute(
        select(AIRobotDarrinFeedback)
        .order_by(AIRobotDarrinFeedback.created_at.desc(), AIRobotDarrinFeedback.id.desc())
        .limit(limit * 2)
    ).scalars().all()

    positives: list[dict] = []
    negatives: list[dict] = []
    used_ids: list[int] = []

    for row in rows:
        example = {
            "id": row.id,
            "rating": row.rating,
            "accepted": row.accepted,
            "user_message": row.user_message,
            "ai_summary": row.ai_summary,
            "suggested_level": row.suggested_level,
            "resolution_notes": row.resolution_notes,
            "rag_sources": json.loads(row.rag_sources or "[]"),
        }
        if row.accepted and row.rating >= 4 and len(positives) < limit:
            positives.append(example)
            used_ids.append(row.id)
        elif (not row.accepted or row.rating <= 2) and len(negatives) < limit:
            negatives.append(example)
            used_ids.append(row.id)

    if used_ids:
        db.query(AIRobotDarrinFeedback).filter(AIRobotDarrinFeedback.id.in_(used_ids)).update(
            {AIRobotDarrinFeedback.used_in_learning: True},
            synchronize_session=False,
        )
        db.commit()

    return {
        "summary": get_learning_snapshot(db),
        "positive_examples": positives,
        "negative_examples": negatives,
    }
