from __future__ import annotations

import json
from urllib.request import urlopen

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.core.security import get_current_admin_user
from app.db.session import get_db
from app.modules.esco.models import EscoIscoGroup, EscoOccupation, EscoSkill
from app.schemas.esco_browse import (
    EscoBrowseResponse,
    EscoIscoGroupRecord,
    EscoOccupationRecord,
    EscoSkillRecord,
)
from app.schemas.esco_import import EscoResourceImportResponse
from app.scripts.import_esco_api_resource import import_esco_resource

router = APIRouter(dependencies=[Depends(get_current_admin_user)])


def _load_payload_from_bytes(content: bytes) -> dict:
    try:
        payload = json.loads(content.decode("utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError) as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid ESCO JSON file",
        ) from exc
    if not isinstance(payload, dict):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="ESCO JSON payload must be an object",
        )
    return payload


def _load_payload_from_url(source_url: str) -> dict:
    try:
        with urlopen(source_url) as response:
            payload = json.loads(response.read().decode("utf-8"))
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unable to download or parse ESCO JSON from URL",
        ) from exc
    if not isinstance(payload, dict):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="ESCO JSON payload must be an object",
        )
    return payload


def _apply_text_filter(statement, model, query: str | None):
    if not query:
        return statement

    like_value = f"%{query.strip()}%"
    conditions = [
        model.preferred_label.ilike(like_value),
        model.concept_uri.ilike(like_value),
    ]
    if hasattr(model, "code"):
        conditions.append(model.code.ilike(like_value))
    return statement.where(or_(*conditions))


@router.get("/esco/isco-groups", response_model=EscoBrowseResponse)
def list_esco_isco_groups(
    q: str | None = None,
    limit: int = 40,
    db: Session = Depends(get_db),
):
    limit = max(1, min(limit, 200))
    statement = select(EscoIscoGroup).order_by(EscoIscoGroup.code.asc(), EscoIscoGroup.preferred_label.asc())
    statement = _apply_text_filter(statement, EscoIscoGroup, q).limit(limit)
    rows = db.execute(statement).scalars().all()

    return EscoBrowseResponse(
        query=q,
        count=len(rows),
        items=[
            EscoIscoGroupRecord(
                concept_uri=row.concept_uri,
                concept_type=row.concept_type,
                code=row.code,
                preferred_label=row.preferred_label,
                alt_labels=row.alt_labels,
                status=row.status,
                in_scheme=row.in_scheme,
                description=row.description,
            )
            for row in rows
        ],
    )


@router.get("/esco/skills", response_model=EscoBrowseResponse)
def list_esco_skills(
    q: str | None = None,
    limit: int = 40,
    db: Session = Depends(get_db),
):
    limit = max(1, min(limit, 200))
    statement = select(EscoSkill).order_by(EscoSkill.preferred_label.asc(), EscoSkill.concept_uri.asc())
    statement = _apply_text_filter(statement, EscoSkill, q).limit(limit)
    rows = db.execute(statement).scalars().all()

    return EscoBrowseResponse(
        query=q,
        count=len(rows),
        items=[
            EscoSkillRecord(
                concept_uri=row.concept_uri,
                concept_type=row.concept_type,
                preferred_label=row.preferred_label,
                alt_labels=row.alt_labels,
                status=row.status,
                reuse_level=row.reuse_level,
                skill_types=row.skill_types,
                in_scheme=row.in_scheme,
                description=row.description,
            )
            for row in rows
        ],
    )


@router.get("/esco/occupations", response_model=EscoBrowseResponse)
def list_esco_occupations(
    q: str | None = None,
    limit: int = 40,
    db: Session = Depends(get_db),
):
    limit = max(1, min(limit, 200))
    statement = select(EscoOccupation).order_by(EscoOccupation.preferred_label.asc(), EscoOccupation.code.asc())
    statement = _apply_text_filter(statement, EscoOccupation, q).limit(limit)
    rows = db.execute(statement).scalars().all()

    return EscoBrowseResponse(
        query=q,
        count=len(rows),
        items=[
            EscoOccupationRecord(
                concept_uri=row.concept_uri,
                concept_type=row.concept_type,
                isco_group=row.isco_group,
                code=row.code,
                preferred_label=row.preferred_label,
                alt_labels=row.alt_labels,
                status=row.status,
                in_scheme=row.in_scheme,
                nace_code=row.nace_code,
                research_occupation=row.research_occupation,
                green_share=row.green_share,
                description=row.description,
            )
            for row in rows
        ],
    )


@router.post("/esco/import-resource", response_model=EscoResourceImportResponse)
async def import_backoffice_esco_resource(
    source_url: str | None = Form(default=None),
    file: UploadFile | None = File(default=None),
    db: Session = Depends(get_db),
):
    if not source_url and file is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Provide either a source URL or a JSON file",
        )

    if file is not None:
        payload = _load_payload_from_bytes(await file.read())
        source_file_name = file.filename
        source_url_value = None
    else:
        payload = _load_payload_from_url(source_url or "")
        source_file_name = None
        source_url_value = source_url

    try:
        summary = import_esco_resource(db, payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    return EscoResourceImportResponse(
        **summary,
        source_url=source_url_value,
        source_file_name=source_file_name,
    )
