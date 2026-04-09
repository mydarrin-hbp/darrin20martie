from __future__ import annotations

import argparse
import csv
import re
from pathlib import Path

from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.modules.esco.models import (
    EscoDictionaryEntry,
    EscoIscoGroup,
    EscoOccupation,
    EscoOccupationBroaderRelation,
    EscoOccupationSkillRelation,
    EscoSkill,
    EscoSkillBroaderRelation,
    EscoSkillGroup,
    EscoSkillHierarchy,
    EscoSkillRelation,
)


DEFAULT_BASE_DIR = Path(r"C:\Users\admin\Downloads\RESURSE My Darrin")


def read_csv(base_dir: Path, name: str) -> list[dict[str, str]]:
    with (base_dir / name).open("r", encoding="utf-8-sig", newline="") as handle:
        return list(csv.DictReader(handle))


def clean(value: object) -> str | None:
    if value is None:
        return None
    text = str(value).strip()
    return text or None


def clean_limited(value: object, max_length: int) -> str | None:
    text = clean(value)
    if text is None:
        return None
    return text[:max_length]


def split_labels(value: object) -> list[str]:
    text = clean(value)
    if not text:
        return []
    return [item.strip() for item in re.split(r"[\n;|]+", text) if item.strip()]


def normalize_skill_types(value: object) -> list[str]:
    text = clean(value)
    if not text:
        return []
    text = text.lower().replace("skill/competence", "skill,competence")
    result: list[str] = []
    for item in re.split(r"[,/]+", text):
        normalized = item.strip()
        if normalized in {"knowledge", "skill", "competence"} and normalized not in result:
            result.append(normalized)
    return result


def normalize_reuse_level(value: object) -> str | None:
    text = clean(value)
    if not text:
        return None
    text = text.lower().replace("_", "-").replace(" ", "-")
    mapping = {
        "cross-sector": "cross-sector",
        "cross-sectoral": "cross-sector",
        "occupation-specific": "occupation-specific",
        "transversal": "transversal",
        "sector-specific": "sector-specific",
    }
    return mapping.get(text, text)


def dedupe(rows: list[dict], keys: tuple[str, ...]) -> list[dict]:
    seen: set[tuple[object, ...]] = set()
    result: list[dict] = []
    for row in rows:
        marker = tuple(row.get(key) for key in keys)
        if marker in seen:
            continue
        seen.add(marker)
        result.append(row)
    return result


def replace_table(db: Session, model, rows: list[dict]) -> int:
    db.query(model).delete()
    if rows:
        db.bulk_insert_mappings(model, rows)
    return len(rows)


def import_esco(base_dir: Path, db: Session) -> dict[str, int]:
    dictionary_rows = read_csv(base_dir, "dictionary_ro.csv")
    skill_groups_rows = read_csv(base_dir, "skillGroups_ro.csv")
    isco_group_rows = read_csv(base_dir, "ISCOGroups_ro.csv")
    skills_rows = read_csv(base_dir, "skills_ro.csv")
    hierarchy_rows = read_csv(base_dir, "skillsHierarchy_ro.csv")
    broader_skill_rows = read_csv(base_dir, "broaderRelationsSkillPillar_ro.csv")
    skill_skill_rows = read_csv(base_dir, "skillSkillRelations_ro.csv")
    occupations_rows = read_csv(base_dir, "occupations_ro.csv")
    broader_occ_rows = read_csv(base_dir, "broaderRelationsOccPillar_ro.csv")
    occupation_skill_rows = read_csv(base_dir, "occupationSkillRelations_ro.csv")
    green_share_rows = read_csv(base_dir, "greenShareOcc_ro.csv")
    research_occ_rows = read_csv(base_dir, "researchOccupationsCollection_ro.csv")
    thematic_sources = {
        "digitalSkillsCollection_ro": ("digital", read_csv(base_dir, "digitalSkillsCollection_ro.csv")),
        "digCompSkillsCollection_ro": ("digital", read_csv(base_dir, "digCompSkillsCollection_ro.csv")),
        "greenSkillsCollection_ro": ("green", read_csv(base_dir, "greenSkillsCollection_ro.csv")),
        "researchSkillsCollection_ro": ("research", read_csv(base_dir, "researchSkillsCollection_ro.csv")),
        "transversalSkillsCollection_ro": ("transversal", read_csv(base_dir, "transversalSkillsCollection_ro.csv")),
        "languageSkillsCollection_ro": ("language", read_csv(base_dir, "languageSkillsCollection_ro.csv")),
    }

    skills: dict[str, dict] = {}

    def ensure_skill(uri: str, label: str | None = None) -> dict:
        if uri not in skills:
            skills[uri] = {
                "concept_uri": uri,
                "concept_type": None,
                "preferred_label": label,
                "status": None,
                "skill_types": [],
                "reuse_level": None,
                "alt_labels": [],
                "hidden_labels": [],
                "definition": None,
                "scope_note": None,
                "description": None,
                "in_scheme": None,
                "broader_concept_uris": [],
                "thematic_tags": [],
                "source_collections": [],
            }
        elif label and not skills[uri]["preferred_label"]:
            skills[uri]["preferred_label"] = label
        return skills[uri]

    def merge_skill_row(row: dict[str, str], source: str, thematic_tag: str | None = None) -> None:
        uri = clean(row.get("conceptUri"))
        if not uri:
            return
        skill = ensure_skill(uri, clean(row.get("preferredLabel")))
        if clean(row.get("conceptType")) and not skill["concept_type"]:
            skill["concept_type"] = clean(row.get("conceptType"))
        if clean(row.get("status")) and not skill["status"]:
            skill["status"] = clean(row.get("status"))
        if clean(row.get("definition")) and not skill["definition"]:
            skill["definition"] = clean(row.get("definition"))
        if clean(row.get("scopeNote")) and not skill["scope_note"]:
            skill["scope_note"] = clean(row.get("scopeNote"))
        if clean(row.get("description")) and not skill["description"]:
            skill["description"] = clean(row.get("description"))
        if clean(row.get("inScheme")) and not skill["in_scheme"]:
            skill["in_scheme"] = clean(row.get("inScheme"))
        reuse_level = normalize_reuse_level(row.get("reuseLevel"))
        if reuse_level and not skill["reuse_level"]:
            skill["reuse_level"] = reuse_level
        for item in normalize_skill_types(row.get("skillType")):
            if item not in skill["skill_types"]:
                skill["skill_types"].append(item)
        for item in split_labels(row.get("altLabels")):
            if item not in skill["alt_labels"]:
                skill["alt_labels"].append(item)
        for item in split_labels(row.get("hiddenLabels")):
            if item not in skill["hidden_labels"]:
                skill["hidden_labels"].append(item)
        broader_uri = clean(row.get("broaderConceptUri"))
        if broader_uri and broader_uri not in skill["broader_concept_uris"]:
            skill["broader_concept_uris"].append(broader_uri)
        if thematic_tag and thematic_tag not in skill["thematic_tags"]:
            skill["thematic_tags"].append(thematic_tag)
        if source not in skill["source_collections"]:
            skill["source_collections"].append(source)

    for row in skills_rows:
        merge_skill_row(row, "skills_ro")
    for source_name, (tag, rows) in thematic_sources.items():
        for row in rows:
            merge_skill_row(row, source_name, tag)

    green_share = {
        clean(row.get("conceptUri")): float(row["greenShare"])
        for row in green_share_rows
        if clean(row.get("conceptUri")) and clean(row.get("greenShare"))
    }
    research_occ_uris = {clean(row.get("conceptUri")) for row in research_occ_rows if clean(row.get("conceptUri"))}

    counts: dict[str, int] = {}
    counts["dictionary"] = replace_table(
        db,
        EscoDictionaryEntry,
        [
            {
                "filename": clean(row.get("filename")) or "",
                "data_header": clean_limited(row.get("data header"), 255) or "",
                "property_name": clean_limited(row.get("property"), 255) or "",
                "description": clean(row.get("description")),
            }
            for row in dictionary_rows
        ],
    )
    counts["skill_groups"] = replace_table(
        db,
        EscoSkillGroup,
        [
            {
                "concept_uri": clean_limited(row.get("conceptUri"), 255) or "",
                "concept_type": clean_limited(row.get("conceptType"), 80),
                "preferred_label": clean_limited(row.get("preferredLabel"), 500),
                "alt_labels": split_labels(row.get("altLabels")),
                "hidden_labels": split_labels(row.get("hiddenLabels")),
                "status": clean_limited(row.get("status"), 80),
                "modified_date": clean_limited(row.get("modifiedDate"), 80),
                "scope_note": clean(row.get("scopeNote")),
                "in_scheme": clean_limited(row.get("inScheme"), 255),
                "description": clean(row.get("description")),
                "code": clean_limited(row.get("code"), 80),
            }
            for row in skill_groups_rows
            if clean(row.get("conceptUri"))
        ],
    )
    counts["isco_groups"] = replace_table(
        db,
        EscoIscoGroup,
        [
            {
                "concept_uri": clean_limited(row.get("conceptUri"), 255) or "",
                "concept_type": clean_limited(row.get("conceptType"), 80),
                "code": clean_limited(row.get("code"), 80),
                "preferred_label": clean_limited(row.get("preferredLabel"), 500),
                "status": clean_limited(row.get("status"), 80),
                "alt_labels": split_labels(row.get("altLabels")),
                "in_scheme": clean_limited(row.get("inScheme"), 255),
                "description": clean(row.get("description")),
            }
            for row in isco_group_rows
            if clean(row.get("conceptUri"))
        ],
    )
    counts["skills"] = replace_table(
        db,
        EscoSkill,
        [
                {
                    **row,
                    "concept_uri": clean_limited(row["concept_uri"], 255) or "",
                    "concept_type": clean_limited(row["concept_type"], 80),
                    "preferred_label": clean_limited(row["preferred_label"], 500),
                    "status": clean_limited(row["status"], 80),
                    "reuse_level": clean_limited(row["reuse_level"], 80),
                    "in_scheme": clean_limited(row["in_scheme"], 255),
                    "skill_types": sorted(row["skill_types"]),
                    "alt_labels": sorted(dict.fromkeys(row["alt_labels"])),
                    "hidden_labels": sorted(dict.fromkeys(row["hidden_labels"])),
                "broader_concept_uris": sorted(dict.fromkeys(row["broader_concept_uris"])),
                "thematic_tags": sorted(dict.fromkeys(row["thematic_tags"])),
                "source_collections": sorted(dict.fromkeys(row["source_collections"])),
            }
            for row in skills.values()
        ],
    )
    counts["skill_hierarchy"] = replace_table(
        db,
        EscoSkillHierarchy,
        [
            {
                "level_0_uri": clean_limited(row.get("Level 0 URI"), 255),
                "level_0_preferred_term": clean_limited(row.get("Level 0 preferred term"), 500),
                "level_1_uri": clean_limited(row.get("Level 1 URI"), 255),
                "level_1_preferred_term": clean_limited(row.get("Level 1 preferred term"), 500),
                "level_2_uri": clean_limited(row.get("Level 2 URI"), 255),
                "level_2_preferred_term": clean_limited(row.get("Level 2 preferred term"), 500),
                "level_3_uri": clean_limited(row.get("Level 3 URI"), 255),
                "level_3_preferred_term": clean_limited(row.get("Level 3 preferred term"), 500),
                "description": clean(row.get("Description")),
                "scope_note": clean(row.get("Scope note")),
                "level_0_code": clean_limited(row.get("Level 0 code"), 80),
                "level_1_code": clean_limited(row.get("Level 1 code"), 80),
                "level_2_code": clean_limited(row.get("Level 2 code"), 80),
                "level_3_code": clean_limited(row.get("Level 3 code"), 80),
            }
            for row in hierarchy_rows
        ],
    )
    counts["skill_broader_relations"] = replace_table(
        db,
        EscoSkillBroaderRelation,
        dedupe(
            [
                {
                    "concept_type": clean_limited(row.get("conceptType"), 80),
                    "concept_uri": clean_limited(row.get("conceptUri"), 255),
                    "concept_label": clean_limited(row.get("conceptLabel"), 500),
                    "broader_type": clean_limited(row.get("broaderType"), 80),
                    "broader_uri": clean_limited(row.get("broaderUri"), 255),
                    "broader_label": clean_limited(row.get("broaderLabel"), 500),
                }
                for row in broader_skill_rows
                if clean(row.get("conceptUri")) and clean(row.get("broaderUri"))
            ],
            ("concept_uri", "broader_uri"),
        ),
    )
    counts["skill_relations"] = replace_table(
        db,
        EscoSkillRelation,
        dedupe(
            [
                {
                    "original_skill_uri": clean_limited(row.get("originalSkillUri"), 255),
                    "original_skill_type": clean_limited(row.get("originalSkillType"), 80),
                    "relation_type": clean_limited(row.get("relationType"), 80) or "",
                    "related_skill_type": clean_limited(row.get("relatedSkillType"), 80),
                    "related_skill_uri": clean_limited(row.get("relatedSkillUri"), 255),
                }
                for row in skill_skill_rows
                if clean(row.get("originalSkillUri")) and clean(row.get("relatedSkillUri")) and clean(row.get("relationType"))
            ],
            ("original_skill_uri", "relation_type", "related_skill_uri"),
        ),
    )
    counts["occupations"] = replace_table(
        db,
        EscoOccupation,
        dedupe(
            [
                {
                    "concept_uri": clean_limited(uri, 255) or "",
                    "concept_type": clean_limited(row.get("conceptType"), 80),
                    "isco_group": clean_limited(row.get("iscoGroup"), 255),
                    "preferred_label": clean_limited(row.get("preferredLabel"), 500),
                    "alt_labels": split_labels(row.get("altLabels")),
                    "hidden_labels": split_labels(row.get("hiddenLabels")),
                    "status": clean_limited(row.get("status"), 80),
                    "modified_date": clean_limited(row.get("modifiedDate"), 80),
                    "regulated_profession_note": clean(row.get("regulatedProfessionNote")),
                    "scope_note": clean(row.get("scopeNote")),
                    "definition": clean(row.get("definition")),
                    "in_scheme": clean_limited(row.get("inScheme"), 255),
                    "description": clean(row.get("description")),
                    "code": clean_limited(row.get("code"), 80),
                    "nace_code": clean_limited(row.get("naceCode"), 80),
                    "research_occupation": uri in research_occ_uris,
                    "green_share": green_share.get(uri),
                }
                for row in occupations_rows
                if (uri := clean(row.get("conceptUri")))
            ],
            ("concept_uri",),
        ),
    )
    counts["occupation_broader_relations"] = replace_table(
        db,
        EscoOccupationBroaderRelation,
        dedupe(
            [
                {
                    "concept_type": clean_limited(row.get("conceptType"), 80),
                    "concept_uri": clean_limited(row.get("conceptUri"), 255),
                    "concept_label": clean_limited(row.get("conceptLabel"), 500),
                    "broader_type": clean_limited(row.get("broaderType"), 80),
                    "broader_uri": clean_limited(row.get("broaderUri"), 255),
                    "broader_label": clean_limited(row.get("broaderLabel"), 500),
                }
                for row in broader_occ_rows
                if clean(row.get("conceptUri")) and clean(row.get("broaderUri"))
            ],
            ("concept_uri", "broader_uri"),
        ),
    )
    counts["occupation_skill_relations"] = replace_table(
        db,
        EscoOccupationSkillRelation,
        dedupe(
            [
                {
                    "occupation_uri": clean_limited(row.get("occupationUri"), 255),
                    "occupation_label": clean_limited(row.get("occupationLabel"), 500),
                    "relation_type": clean_limited(row.get("relationType"), 80) or "",
                    "skill_type": clean_limited(row.get("skillType"), 80),
                    "skill_uri": clean_limited(row.get("skillUri"), 255),
                    "skill_label": clean_limited(row.get("skillLabel"), 500),
                }
                for row in occupation_skill_rows
                if clean(row.get("occupationUri")) and clean(row.get("skillUri")) and clean(row.get("relationType"))
            ],
            ("occupation_uri", "relation_type", "skill_uri"),
        ),
    )
    db.commit()
    return counts


def main() -> None:
    parser = argparse.ArgumentParser(description="Importa datele ESCO RO in baza de date.")
    parser.add_argument("--base-dir", default=str(DEFAULT_BASE_DIR), help="Folderul cu CSV-urile ESCO.")
    args = parser.parse_args()

    base_dir = Path(args.base_dir)
    if not base_dir.exists():
        raise SystemExit(f"Folderul nu exista: {base_dir}")

    db = SessionLocal()
    try:
        counts = import_esco(base_dir, db)
    finally:
        db.close()

    print("ESCO import finalizat:")
    for key, value in counts.items():
        print(f"- {key}: {value}")


if __name__ == "__main__":
    main()
