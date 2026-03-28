from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any
from urllib.parse import urlencode
from urllib.request import urlopen

from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.modules.esco.models import (
    EscoIscoGroup,
    EscoOccupation,
    EscoOccupationBroaderRelation,
    EscoOccupationSkillRelation,
    EscoSkill,
    EscoSkillBroaderRelation,
)


ESCO_API_BASE = "https://ec.europa.eu/esco/api"


def _clean(value: Any) -> str | None:
    if value is None:
        return None
    text = str(value).strip()
    return text or None


def _clean_limited(value: Any, max_length: int) -> str | None:
    text = _clean(value)
    if text is None:
        return None
    return text[:max_length]


def _as_list(value: Any) -> list[Any]:
    if value is None:
        return []
    if isinstance(value, list):
        return value
    return [value]


def _extract_literal(node: Any) -> str | None:
    if isinstance(node, dict):
        for value in node.values():
            if isinstance(value, dict) and value.get("literal"):
                return _clean(value.get("literal"))
        if node.get("literal"):
            return _clean(node.get("literal"))
    return _clean(node)


def _extract_alt_labels(payload: dict[str, Any]) -> list[str]:
    values: list[str] = []
    for item in _as_list(payload.get("alternativeLabel")):
        text = _clean(item)
        if text and text not in values:
            values.append(text)
    for item in _as_list(payload.get("alternativeTerms")):
        if isinstance(item, dict):
            text = _clean(item.get("label"))
            if text and text not in values:
                values.append(text)
    return values


def _join_scheme_uris(payload: dict[str, Any]) -> str | None:
    uris = []
    for item in _as_list(payload.get("links", {}).get("isInScheme")):
        if isinstance(item, dict):
            uri = _clean(item.get("uri"))
            if uri:
                uris.append(uri)
    if not uris:
        return None
    return _clean_limited(",\n".join(dict.fromkeys(uris)), 255)


def _fetch_api_payload(resource_type: str, uri: str, language: str, selected_version: str | None) -> dict[str, Any]:
    query = {
        "uri": uri,
        "language": language,
    }
    if selected_version:
        query["selectedVersion"] = selected_version
    url = f"{ESCO_API_BASE}/resource/{resource_type}?{urlencode(query)}"
    with urlopen(url) as response:
        return json.loads(response.read().decode("utf-8"))


def _upsert_isco_group(db: Session, payload: dict[str, Any]) -> EscoIscoGroup:
    uri = _clean_limited(payload.get("uri"), 255)
    if not uri:
        raise ValueError("Payload does not contain a valid uri")

    row = db.get(EscoIscoGroup, uri)
    if row is None:
        row = EscoIscoGroup(concept_uri=uri)
        db.add(row)

    row.concept_type = _clean_limited(payload.get("className"), 80)
    row.code = _clean_limited(payload.get("code"), 80)
    row.preferred_label = _clean_limited(payload.get("preferredLabel") or payload.get("title"), 500)
    row.status = _clean_limited(payload.get("status"), 80)
    row.alt_labels = _extract_alt_labels(payload)
    row.in_scheme = _join_scheme_uris(payload)
    row.description = _extract_literal(payload.get("description"))
    db.flush()
    return row


def _upsert_occupation(db: Session, payload: dict[str, Any]) -> EscoOccupation:
    uri = _clean_limited(payload.get("uri"), 255)
    if not uri:
        raise ValueError("Payload does not contain a valid uri")

    row = db.get(EscoOccupation, uri)
    if row is None:
        row = EscoOccupation(concept_uri=uri)
        db.add(row)

    broader = _as_list(payload.get("links", {}).get("broaderConcept"))
    broader_uri = _clean_limited(broader[0].get("uri"), 255) if broader and isinstance(broader[0], dict) else None

    nace_codes = []
    for item in _as_list(payload.get("links", {}).get("hasNACECode")):
        if isinstance(item, dict):
            uri_value = _clean(item.get("uri"))
            if uri_value:
                nace_codes.append(uri_value)

    row.concept_type = _clean_limited(payload.get("className"), 80)
    row.isco_group = broader_uri
    row.preferred_label = _clean_limited(payload.get("preferredLabel") or payload.get("title"), 500)
    row.alt_labels = _extract_alt_labels(payload)
    row.hidden_labels = []
    row.status = _clean_limited(payload.get("status"), 80)
    row.modified_date = None
    row.regulated_profession_note = None
    row.scope_note = _extract_literal(payload.get("scopeNote"))
    row.definition = _extract_literal(payload.get("definition"))
    row.in_scheme = _join_scheme_uris(payload)
    row.description = _extract_literal(payload.get("description"))
    row.code = _clean_limited(payload.get("code"), 80)
    row.nace_code = _clean_limited(", ".join(nace_codes), 80) if nace_codes else None
    row.research_occupation = False
    row.green_share = None
    db.flush()
    return row


def _upsert_skill(db: Session, payload: dict[str, Any]) -> EscoSkill:
    uri = _clean_limited(payload.get("uri"), 255)
    if not uri:
        raise ValueError("Payload does not contain a valid uri")

    row = db.get(EscoSkill, uri)
    if row is None:
        row = EscoSkill(concept_uri=uri)
        db.add(row)

    broader_uris = []
    for item in _as_list(payload.get("links", {}).get("broaderConcept")):
        if isinstance(item, dict):
            value = _clean(item.get("uri"))
            if value:
                broader_uris.append(value)

    skill_types = []
    for item in _as_list(payload.get("links", {}).get("hasSkillType")):
        if isinstance(item, dict):
            label = _clean(item.get("title")) or _clean(item.get("uri"))
            if label and label not in skill_types:
                skill_types.append(label)

    reuse_level = None
    reuse_links = _as_list(payload.get("links", {}).get("hasReuseLevel"))
    if reuse_links and isinstance(reuse_links[0], dict):
        reuse_level = _clean_limited(reuse_links[0].get("title") or reuse_links[0].get("uri"), 80)

    row.concept_type = _clean_limited(payload.get("className"), 80)
    row.preferred_label = _clean_limited(payload.get("preferredLabel") or payload.get("title"), 500)
    row.status = _clean_limited(payload.get("status"), 80)
    row.skill_types = skill_types
    row.reuse_level = reuse_level
    row.alt_labels = _extract_alt_labels(payload)
    row.hidden_labels = []
    row.definition = _extract_literal(payload.get("definition"))
    row.scope_note = _extract_literal(payload.get("scopeNote"))
    row.description = _extract_literal(payload.get("description"))
    row.in_scheme = _join_scheme_uris(payload)
    row.broader_concept_uris = broader_uris
    row.thematic_tags = []
    row.source_collections = ["esco_api_resource"]
    db.flush()
    return row


def _sync_occupation_relations(db: Session, payload: dict[str, Any]) -> tuple[int, int]:
    concept_uri = _clean_limited(payload.get("uri"), 255)
    if not concept_uri:
        return (0, 0)

    broader_count = 0
    for item in _as_list(payload.get("links", {}).get("broaderConcept")):
        if not isinstance(item, dict):
            continue
        broader_uri = _clean_limited(item.get("uri"), 255)
        if not broader_uri:
            continue
        existing = (
            db.query(EscoOccupationBroaderRelation)
            .filter(
                EscoOccupationBroaderRelation.concept_uri == concept_uri,
                EscoOccupationBroaderRelation.broader_uri == broader_uri,
            )
            .first()
        )
        if existing is None:
            db.add(
                EscoOccupationBroaderRelation(
                    concept_type=_clean_limited(payload.get("className"), 80),
                    concept_uri=concept_uri,
                    concept_label=_clean_limited(payload.get("preferredLabel") or payload.get("title"), 500),
                    broader_type="broaderConcept",
                    broader_uri=broader_uri,
                    broader_label=_clean_limited(item.get("title"), 500),
                )
            )
            broader_count += 1

    narrower_count = 0
    for item in _as_list(payload.get("links", {}).get("narrowerConcept")):
        if not isinstance(item, dict):
            continue
        narrower_uri = _clean_limited(item.get("uri"), 255)
        if not narrower_uri:
            continue
        if db.get(EscoIscoGroup, narrower_uri) is None:
            db.add(
                EscoIscoGroup(
                    concept_uri=narrower_uri,
                    concept_type="Occupation",
                    code=_clean_limited(item.get("code"), 80),
                    preferred_label=_clean_limited(item.get("title"), 500),
                    alt_labels=[],
                )
            )
        existing = (
            db.query(EscoOccupationBroaderRelation)
            .filter(
                EscoOccupationBroaderRelation.concept_uri == narrower_uri,
                EscoOccupationBroaderRelation.broader_uri == concept_uri,
            )
            .first()
        )
        if existing is None:
            db.add(
                EscoOccupationBroaderRelation(
                    concept_type="Occupation",
                    concept_uri=narrower_uri,
                    concept_label=_clean_limited(item.get("title"), 500),
                    broader_type="broaderConcept",
                    broader_uri=concept_uri,
                    broader_label=_clean_limited(payload.get("preferredLabel") or payload.get("title"), 500),
                )
            )
            narrower_count += 1

    skill_relation_count = 0
    for relation_type, section_name in (
        ("essential", "essentialSkills"),
        ("optional", "optionalSkills"),
    ):
        section = payload.get(section_name) or {}
        for skill_kind in ("skill", "knowledge"):
            for item in _as_list(section.get(skill_kind)):
                if not isinstance(item, dict):
                    continue
                skill_uri = _clean_limited(item.get("uri"), 255)
                if not skill_uri:
                    continue
                existing = (
                    db.query(EscoOccupationSkillRelation)
                    .filter(
                        EscoOccupationSkillRelation.occupation_uri == concept_uri,
                        EscoOccupationSkillRelation.relation_type == relation_type,
                        EscoOccupationSkillRelation.skill_uri == skill_uri,
                    )
                    .first()
                )
                if existing is None:
                    db.add(
                        EscoOccupationSkillRelation(
                            occupation_uri=concept_uri,
                            occupation_label=_clean_limited(payload.get("preferredLabel") or payload.get("title"), 500),
                            relation_type=relation_type,
                            skill_type=_clean_limited(skill_kind, 80),
                            skill_uri=skill_uri,
                            skill_label=_clean_limited(item.get("title"), 500),
                        )
                    )
                    skill_relation_count += 1

    return broader_count + narrower_count, skill_relation_count


def _sync_skill_relations(db: Session, payload: dict[str, Any]) -> int:
    concept_uri = _clean_limited(payload.get("uri"), 255)
    if not concept_uri:
        return 0

    created = 0
    for item in _as_list(payload.get("links", {}).get("broaderConcept")):
        if not isinstance(item, dict):
            continue
        broader_uri = _clean_limited(item.get("uri"), 255)
        if not broader_uri:
            continue
        existing = (
            db.query(EscoSkillBroaderRelation)
            .filter(
                EscoSkillBroaderRelation.concept_uri == concept_uri,
                EscoSkillBroaderRelation.broader_uri == broader_uri,
            )
            .first()
        )
        if existing is None:
            db.add(
                EscoSkillBroaderRelation(
                    concept_type=_clean_limited(payload.get("className"), 80),
                    concept_uri=concept_uri,
                    concept_label=_clean_limited(payload.get("preferredLabel") or payload.get("title"), 500),
                    broader_type="broaderConcept",
                    broader_uri=broader_uri,
                    broader_label=_clean_limited(item.get("title"), 500),
                )
            )
            created += 1
    return created


def import_esco_resource(db: Session, payload: dict[str, Any]) -> dict[str, Any]:
    class_name = (_clean(payload.get("className")) or "").lower()
    uri = _clean(payload.get("uri"))
    if not uri:
        raise ValueError("ESCO resource is missing the 'uri' field")

    summary = {
        "uri": uri,
        "class_name": class_name,
        "resource_table": None,
        "relations_created": 0,
        "skill_relations_created": 0,
    }

    if class_name == "skill":
        _upsert_skill(db, payload)
        summary["resource_table"] = "esco_skills"
        summary["relations_created"] = _sync_skill_relations(db, payload)
    elif class_name == "occupation":
        if "/esco/isco/" in uri:
            _upsert_isco_group(db, payload)
            summary["resource_table"] = "esco_isco_groups"
        else:
            _upsert_occupation(db, payload)
            summary["resource_table"] = "esco_occupations"
        relation_count, skill_relation_count = _sync_occupation_relations(db, payload)
        summary["relations_created"] = relation_count
        summary["skill_relations_created"] = skill_relation_count
    else:
        raise ValueError(f"Unsupported ESCO className: {payload.get('className')}")

    db.commit()
    return summary


def main() -> None:
    parser = argparse.ArgumentParser(description="Importa o resursa ESCO individuala din JSON sau direct din API.")
    parser.add_argument("--json-file", help="Calea catre fisierul JSON ESCO.")
    parser.add_argument("--resource-type", choices=["occupation", "skill", "concept"], help="Tipul resursei pentru apel API.")
    parser.add_argument("--uri", help="URI-ul resursei ESCO pentru apel API.")
    parser.add_argument("--language", default="en")
    parser.add_argument("--selected-version", default=None)
    args = parser.parse_args()

    if not args.json_file and not (args.resource_type and args.uri):
        raise SystemExit("Provide either --json-file or both --resource-type and --uri.")

    if args.json_file:
        payload = json.loads(Path(args.json_file).read_text(encoding="utf-8"))
    else:
        payload = _fetch_api_payload(
            resource_type=args.resource_type,
            uri=args.uri,
            language=args.language,
            selected_version=args.selected_version,
        )

    db = SessionLocal()
    try:
        summary = import_esco_resource(db, payload)
    finally:
        db.close()

    print("ESCO resource import complete:")
    for key, value in summary.items():
        print(f"- {key}: {value}")


if __name__ == "__main__":
    main()
