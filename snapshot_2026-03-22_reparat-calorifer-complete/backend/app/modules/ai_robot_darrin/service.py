from __future__ import annotations

import json
import os
import re
from decimal import Decimal
from pathlib import Path

import yaml
from sqlalchemy import select, text
from sqlalchemy.orm import Session, selectinload

from app.core.config import settings
from app.models.category import Category
from app.models.domain import Domain
from app.models.service import Service
from app.models.subcategory import SubCategory
from app.modules.ai_robot_darrin.learning_loop import get_learning_examples, get_learning_snapshot
from app.modules.ai_robot_darrin.models import AIRobotDarrinDocument
from app.modules.cost_engine.models import AdminPriceConfig
from app.modules.cost_engine.schemas import ResourceCreate, ResourceType, ServiceLevel
from app.modules.deviz_engine.models import AdminDevizRule
from app.modules.deviz_engine.schemas import DevizRequest
from app.modules.deviz_engine.service import generate_deviz
from app.modules.geography.models import Country, Locality, Zone
from app.schemas.price_analysis import RecipeLevelName
from app.services.reparat_calorifer_service import match_reparat_calorifer_variant
from app.services.price_analysis_service import calculate_indicators_for_activity, get_service_recipe_activities

PROMPTS_DIR = Path(__file__).resolve().parent / "prompts"
GEMINI_MODEL = "gemini-2.5-flash"
EMBEDDING_MODEL = "gemini-embedding-001"


def _load_prompt(name: str) -> dict:
    with (PROMPTS_DIR / f"{name}.yaml").open("r", encoding="utf-8") as handle:
        return yaml.safe_load(handle)


def _normalize_text(value: str) -> str:
    return re.sub(r"\s+", " ", value).strip()


def _infer_urgency(message: str, override: bool | None) -> bool:
    if override is not None:
        return override
    normalized = message.lower()
    return any(keyword in normalized for keyword in ["urgent", "rapid", "asap", "imediat", "azi", "maine", "maine dimineata"])


def _infer_service_level(message: str, override: ServiceLevel | None) -> ServiceLevel:
    if override is not None:
        return override
    normalized = message.lower()
    if any(keyword in normalized for keyword in ["premium", "lux", "executiv", "platinum", "top", "gold"]):
        return ServiceLevel.PREMIUM
    if any(keyword in normalized for keyword in ["standard", "echilibrat", "normal", "bun", "argint"]):
        return ServiceLevel.STANDARD
    return ServiceLevel.BASIC


def _extract_json_blob(raw_text: str) -> dict | None:
    candidate = raw_text.strip()
    if candidate.startswith("```"):
        candidate = re.sub(r"^```(?:json)?", "", candidate).strip()
        candidate = re.sub(r"```$", "", candidate).strip()
    try:
        parsed = json.loads(candidate)
        return parsed if isinstance(parsed, dict) else None
    except json.JSONDecodeError:
        pass

    match = re.search(r"\{.*\}", candidate, re.DOTALL)
    if not match:
        return None
    try:
        parsed = json.loads(match.group(0))
        return parsed if isinstance(parsed, dict) else None
    except json.JSONDecodeError:
        return None


def _parse_service_level(value: str | None, fallback: ServiceLevel) -> ServiceLevel:
    if not value:
        return fallback
    normalized = value.upper().strip()
    for level in ServiceLevel:
        if level.value == normalized:
            return level
    return fallback


def _parse_resource_suggestions(payload: list[dict] | None, fallback_level: ServiceLevel) -> list[ResourceCreate]:
    resources: list[ResourceCreate] = []
    for item in payload or []:
        try:
            resource_type = ResourceType(str(item.get("resource_type", "OTHER")).upper())
        except ValueError:
            resource_type = ResourceType.OTHER

        try:
            resources.append(
                ResourceCreate(
                    resource_type=resource_type,
                    name=str(item.get("name") or "Resursa recomandata"),
                    unit=str(item.get("unit") or "buc"),
                    quantity=float(item.get("quantity") or 1),
                    unit_cost=float(item.get("unit_cost") or 0),
                )
            )
        except (TypeError, ValueError):
            continue

    return resources or suggest_resources("", fallback_level)


def _safe_json(value: object) -> str:
    def _default_serializer(item: object):
        if isinstance(item, Decimal):
            return float(item)
        raise TypeError(f"Object of type {item.__class__.__name__} is not JSON serializable")

    return json.dumps(value, ensure_ascii=True, sort_keys=True, default=_default_serializer)


def _ensure_sqlite_fts_objects(db: Session) -> None:
    statements = [
        """
        CREATE VIRTUAL TABLE IF NOT EXISTS ai_robot_darrin_documents_fts
        USING fts5(title, content, source_type, source_key, content='ai_robot_darrin_documents', content_rowid='id')
        """,
        """
        CREATE TRIGGER IF NOT EXISTS ai_robot_darrin_documents_ai
        AFTER INSERT ON ai_robot_darrin_documents
        BEGIN
            INSERT INTO ai_robot_darrin_documents_fts(rowid, title, content, source_type, source_key)
            VALUES (new.id, new.title, new.content, new.source_type, new.source_key);
        END
        """,
        """
        CREATE TRIGGER IF NOT EXISTS ai_robot_darrin_documents_ad
        AFTER DELETE ON ai_robot_darrin_documents
        BEGIN
            INSERT INTO ai_robot_darrin_documents_fts(ai_robot_darrin_documents_fts, rowid, title, content, source_type, source_key)
            VALUES('delete', old.id, old.title, old.content, old.source_type, old.source_key);
        END
        """,
        """
        CREATE TRIGGER IF NOT EXISTS ai_robot_darrin_documents_au
        AFTER UPDATE ON ai_robot_darrin_documents
        BEGIN
            INSERT INTO ai_robot_darrin_documents_fts(ai_robot_darrin_documents_fts, rowid, title, content, source_type, source_key)
            VALUES('delete', old.id, old.title, old.content, old.source_type, old.source_key);
            INSERT INTO ai_robot_darrin_documents_fts(rowid, title, content, source_type, source_key)
            VALUES (new.id, new.title, new.content, new.source_type, new.source_key);
        END
        """,
    ]
    for statement in statements:
        db.execute(text(statement))
    db.commit()


def _upsert_document(
    db: Session,
    *,
    source_type: str,
    source_key: str,
    title: str,
    content: str,
    metadata: dict,
) -> None:
    document = db.execute(
        select(AIRobotDarrinDocument).where(
            AIRobotDarrinDocument.source_type == source_type,
            AIRobotDarrinDocument.source_key == source_key,
        )
    ).scalar_one_or_none()

    if document is None:
        document = AIRobotDarrinDocument(
            source_type=source_type,
            source_key=source_key,
            title=title,
            content=content,
            metadata_json=_safe_json(metadata),
            is_active=True,
        )
        db.add(document)
        return

    document.title = title
    document.content = content
    document.metadata_json = _safe_json(metadata)
    document.is_active = True


def sync_backoffice_documents(db: Session) -> int:
    _ensure_sqlite_fts_objects(db)

    services = db.execute(
        select(Service).options(selectinload(Service.subcategories)).order_by(Service.id)
    ).scalars().all()
    categories = db.execute(select(Category).order_by(Category.id)).scalars().all()
    subcategories = db.execute(select(SubCategory).order_by(SubCategory.id)).scalars().all()
    domains = db.execute(select(Domain).order_by(Domain.id)).scalars().all()
    price_configs = db.execute(select(AdminPriceConfig).order_by(AdminPriceConfig.id)).scalars().all()
    deviz_rules = db.execute(select(AdminDevizRule).order_by(AdminDevizRule.id)).scalars().all()
    countries = db.execute(select(Country).order_by(Country.id)).scalars().all()
    zones = db.execute(select(Zone).order_by(Zone.id)).scalars().all()
    localities = db.execute(select(Locality).order_by(Locality.id)).scalars().all()

    for domain in domains:
        _upsert_document(
            db,
            source_type="domain",
            source_key=str(domain.id),
            title=f"Domain {domain.name_ro}",
            content=_normalize_text(f"Domain catalog {domain.name_ro}. English {domain.name_en}. Slug {domain.slug}. Activ {domain.is_active}."),
            metadata={"domain_id": domain.id, "slug": domain.slug},
        )

    for category in categories:
        _upsert_document(
            db,
            source_type="category",
            source_key=str(category.id),
            title=f"Category {category.name_ro}",
            content=_normalize_text(
                f"Category {category.name_ro}. English {category.name_en}. Slug {category.slug}. Domain {category.domain_id}. Activ {category.is_active}."
            ),
            metadata={"category_id": category.id, "domain_id": category.domain_id, "slug": category.slug},
        )

    for subcategory in subcategories:
        _upsert_document(
            db,
            source_type="subcategory",
            source_key=str(subcategory.id),
            title=f"SubCategory {subcategory.name_ro}",
            content=_normalize_text(
                f"SubCategory {subcategory.name_ro}. English {subcategory.name_en}. Slug {subcategory.slug}. Category {subcategory.category_id}. Activ {subcategory.is_active}."
            ),
            metadata={"subcategory_id": subcategory.id, "category_id": subcategory.category_id, "slug": subcategory.slug},
        )

    for service in services:
        subcategory_names = [subcategory.name_ro for subcategory in service.subcategories]
        _upsert_document(
            db,
            source_type="service",
            source_key=str(service.id),
            title=f"Service {service.name}",
            content=_normalize_text(
                " ".join(
                    [
                        f"Service {service.name}.",
                        f"Slug {service.slug}.",
                        f"Descriere {service.description or 'fara descriere'}.",
                        f"Descriere extinsa {service.description_extended or 'fara descriere extinsa'}.",
                        f"Subcategorii {'; '.join(subcategory_names) if subcategory_names else 'niciuna'}.",
                        f"Imagini {len(service.images or [])}. Documente {len(service.documents or [])}. Video {len(service.videos or [])}.",
                    ]
                )
            ),
            metadata={
                "service_id": service.id,
                "slug": service.slug,
                "subcategory_ids": service.subcategory_ids,
                "subcategory_names": subcategory_names,
                "images": service.images or [],
                "documents": service.documents or [],
                "videos": service.videos or [],
                "level_attachments": service.level_attachments or {},
            },
        )

    for country in countries:
        _upsert_document(
            db,
            source_type="country",
            source_key=str(country.id),
            title=f"Country {country.name}",
            content=_normalize_text(f"Tara {country.name}. Cod {country.code}. Moneda {country.currency}."),
            metadata={"country_id": country.id, "code": country.code, "currency": country.currency},
        )

    for zone in zones:
        _upsert_document(
            db,
            source_type="zone",
            source_key=str(zone.id),
            title=f"Zone {zone.name}",
            content=_normalize_text(
                f"Zona {zone.name}. Tara {zone.country_id}. Multiplicator {zone.multiplier}."
            ),
            metadata={"zone_id": zone.id, "country_id": zone.country_id, "multiplier": zone.multiplier},
        )

    for locality in localities:
        _upsert_document(
            db,
            source_type="locality",
            source_key=str(locality.id),
            title=f"Locality {locality.name_ro}",
            content=_normalize_text(
                f"Localitate {locality.name_ro}. English {locality.name_en}. Tara {locality.country_id}. Zona {locality.zone_id}. Coordonate {locality.latitude or 'n/a'}, {locality.longitude or 'n/a'}."
            ),
            metadata={"locality_id": locality.id, "country_id": locality.country_id, "zone_id": locality.zone_id},
        )

    for config in price_configs:
        _upsert_document(
            db,
            source_type="price_config",
            source_key=str(config.id),
            title=f"Cost config service {config.service_id}",
            content=_normalize_text(
                " ".join(
                    [
                        f"Config cost serviciu {config.service_id}.",
                        f"Tara {config.country_id}.",
                        f"Zona {config.zone_id or 'default'}.",
                        f"Moneda {config.currency}.",
                        f"Legislatie {config.legislation_code}.",
                        f"Pret baza {config.base_price}.",
                        f"Urgenta {config.urgency_coefficient}.",
                        f"Nivel basic {config.basic_level_coefficient}.",
                        f"Nivel standard {config.standard_level_coefficient}.",
                        f"Nivel premium {config.premium_level_coefficient}.",
                        f"Indirecte {config.indirect_cost_percentage}.",
                        f"Mentenanta platforma {config.platform_maintenance_percentage}.",
                        f"Cost platforma My Darrin {config.mydarrin_platform_percentage}.",
                        f"TVA {config.vat_percentage}.",
                    ]
                )
            ),
            metadata={
                "config_id": config.id,
                "service_id": config.service_id,
                "country_id": config.country_id,
                "zone_id": config.zone_id,
                "currency": config.currency,
                "legislation_code": config.legislation_code,
            },
        )

    for rule in deviz_rules:
        _upsert_document(
            db,
            source_type="deviz_rule",
            source_key=str(rule.id),
            title=f"Deviz rule {rule.level_name}",
            content=_normalize_text(
                " ".join(
                    [
                        f"Regula deviz {rule.level_name}.",
                        f"Eticheta {rule.label}.",
                        f"Multiplier {rule.multiplier}.",
                        f"Serviciu {rule.service_id or 'global'}.",
                        f"Tara {rule.country_id or 'global'}.",
                        f"Descriere {rule.description or 'fara descriere'}.",
                    ]
                )
            ),
            metadata={
                "rule_id": rule.id,
                "service_id": rule.service_id,
                "country_id": rule.country_id,
                "level_name": rule.level_name,
            },
        )

    db.commit()
    return db.execute(select(AIRobotDarrinDocument)).scalars().all().__len__()


def _build_fts_query(message: str) -> str:
    tokens = re.findall(r"[A-Za-z0-9_-]+", message.lower())
    if not tokens:
        return "service OR cost OR deviz"
    return " OR ".join(dict.fromkeys(tokens[:8]))


def search_rag_documents(db: Session, *, message: str, limit: int = 6) -> list[dict]:
    _ensure_sqlite_fts_objects(db)
    query = _build_fts_query(message)
    try:
        rows = db.execute(
            text(
                """
                SELECT d.id, d.source_type, d.source_key, d.title, d.content,
                       snippet(ai_robot_darrin_documents_fts, 1, '[', ']', '...', 12) AS snippet,
                       bm25(ai_robot_darrin_documents_fts) AS score
                FROM ai_robot_darrin_documents_fts
                JOIN ai_robot_darrin_documents d ON d.id = ai_robot_darrin_documents_fts.rowid
                WHERE ai_robot_darrin_documents_fts MATCH :query
                  AND d.is_active = 1
                ORDER BY score
                LIMIT :limit
                """
            ),
            {"query": query, "limit": limit},
        ).mappings().all()
        return [dict(row) for row in rows]
    except Exception:
        like_term = f"%{message[:80]}%"
        rows = db.execute(
            select(AIRobotDarrinDocument)
            .where(AIRobotDarrinDocument.content.ilike(like_term))
            .limit(limit)
        ).scalars().all()
        return [
            {
                "id": row.id,
                "source_type": row.source_type,
                "source_key": row.source_key,
                "title": row.title,
                "content": row.content,
                "snippet": row.content[:240],
                "score": None,
            }
            for row in rows
        ]


def _serialize_matching_price_configs(db: Session, *, service_id: int, country_id: int, zone_id: int) -> list[dict]:
    configs = db.execute(
        select(AdminPriceConfig).where(
            AdminPriceConfig.service_id == service_id,
            AdminPriceConfig.country_id == country_id,
            AdminPriceConfig.is_active.is_(True),
        )
    ).scalars().all()
    results: list[dict] = []
    for config in configs:
        if config.zone_id not in (None, zone_id):
            continue
        results.append(
            {
                "id": config.id,
                "zone_id": config.zone_id,
                "currency": config.currency,
                "legislation_code": config.legislation_code,
                "base_price": config.base_price,
                "urgency_coefficient": config.urgency_coefficient,
                "basic_level_coefficient": config.basic_level_coefficient,
                "standard_level_coefficient": config.standard_level_coefficient,
                "premium_level_coefficient": config.premium_level_coefficient,
                "indirect_cost_percentage": config.indirect_cost_percentage,
                "platform_maintenance_percentage": config.platform_maintenance_percentage,
                "mydarrin_platform_percentage": config.mydarrin_platform_percentage,
                "vat_percentage": config.vat_percentage,
                "platform_margin_coefficient": config.platform_margin_coefficient,
                "vat_coefficient": config.vat_coefficient,
            }
        )
    return results


def _serialize_matching_deviz_rules(db: Session, *, service_id: int, country_id: int) -> list[dict]:
    rules = db.execute(
        select(AdminDevizRule).where(AdminDevizRule.is_active.is_(True)).order_by(AdminDevizRule.sort_order)
    ).scalars().all()
    results: list[dict] = []
    for rule in rules:
        if rule.service_id not in (None, service_id):
            continue
        if rule.country_id not in (None, country_id):
            continue
        results.append(
            {
                "id": rule.id,
                "service_id": rule.service_id,
                "country_id": rule.country_id,
                "level_name": rule.level_name,
                "label": rule.label,
                "multiplier": rule.multiplier,
                "description": rule.description,
                "sort_order": rule.sort_order,
            }
        )
    return results


def retrieve_backoffice_context(db: Session, *, service_id: int, country_id: int, zone_id: int, locality_id: int | None, message: str) -> dict:
    service = db.execute(
        select(Service).options(selectinload(Service.subcategories)).where(Service.id == service_id)
    ).scalar_one_or_none()
    country = db.get(Country, country_id)
    zone = db.get(Zone, zone_id)
    locality = db.get(Locality, locality_id) if locality_id is not None else None

    rag_matches = search_rag_documents(db, message=message, limit=6)
    price_configs = _serialize_matching_price_configs(db, service_id=service_id, country_id=country_id, zone_id=zone_id)
    deviz_rules = _serialize_matching_deviz_rules(db, service_id=service_id, country_id=country_id)
    service_activities = get_service_recipe_activities(db, service_id)
    indicator_snapshots = []
    for activity in service_activities[:5]:
        calculated = calculate_indicators_for_activity(
            db,
            activity.id,
            RecipeLevelName.ARGINT,
            country_id=country_id,
            zone_id=zone_id,
            locality_id=locality_id,
            currency=country.currency if country else None,
            legislation_code=country.code if country else None,
        )
        if calculated:
            indicator_snapshots.append(
                {
                    "activity_id": calculated.activity_id,
                    "activity_name_ro": calculated.activity_name_ro,
                    "total_estimated_cost": calculated.total_estimated_cost,
                    "caen_nace_link": calculated.caen_nace_link,
                    "resource_count": len(calculated.rows),
                    "attachments": {
                        "images": activity.images or [],
                        "documents": activity.documents or [],
                        "videos": activity.videos or [],
                    },
                }
            )

    return {
        "service": {
            "id": service.id,
            "name": service.name,
            "slug": service.slug,
            "subcategory_ids": service.subcategory_ids,
            "subcategory_names": [subcategory.name_ro for subcategory in service.subcategories],
        }
        if service
        else None,
        "country": {
            "id": country.id,
            "name": country.name,
            "code": country.code,
            "currency": country.currency,
        }
        if country
        else None,
        "zone": {
            "id": zone.id,
            "name": zone.name,
            "multiplier": zone.multiplier,
        }
        if zone
        else None,
        "locality": {
            "id": locality.id,
            "name_ro": locality.name_ro,
            "name_en": locality.name_en,
            "latitude": locality.latitude,
            "longitude": locality.longitude,
        }
        if locality
        else None,
        "service_attachments": {
            "images": service.images if service else [],
            "documents": service.documents if service else [],
            "videos": service.videos if service else [],
            "level_attachments": service.level_attachments if service else {},
        },
        "matching_price_configs": price_configs,
        "matching_deviz_rules": deviz_rules,
        "indicator_snapshots": indicator_snapshots,
        "rag_matches": [
            {
                "source_type": item["source_type"],
                "source_key": item["source_key"],
                "title": item["title"],
                "snippet": item["snippet"],
                "score": item["score"],
            }
            for item in rag_matches
        ],
    }


def suggest_resources(message: str, service_level: ServiceLevel) -> list[ResourceCreate]:
    normalized = message.lower()
    suggestions: list[ResourceCreate] = []

    if "centrala" in normalized:
        suggestions.append(
            ResourceCreate(
                resource_type=ResourceType.EQUIPMENT,
                name="Kit montaj centrala",
                unit="set",
                quantity=1,
                unit_cost=650.0 if service_level == ServiceLevel.PREMIUM else 500.0,
            )
        )
        suggestions.append(
            ResourceCreate(
                resource_type=ResourceType.LABOR,
                name="Manopera instalare",
                unit="ora",
                quantity=8 if service_level == ServiceLevel.PREMIUM else 6,
                unit_cost=120.0,
            )
        )

    if "consultanta" in normalized or "evaluare" in normalized:
        suggestions.append(
            ResourceCreate(
                resource_type=ResourceType.LABOR,
                name="Consultanta tehnica",
                unit="ora",
                quantity=2,
                unit_cost=90.0,
            )
        )

    if not suggestions:
        suggestions.append(
            ResourceCreate(
                resource_type=ResourceType.LABOR,
                name="Manopera evaluare si executie",
                unit="ora",
                quantity=4 if service_level == ServiceLevel.BASIC else 6,
                unit_cost=100.0,
            )
        )

    return suggestions


def _build_prompt_text(
    *,
    prompt_name: str,
    user_message: str,
    rag_context: dict,
    learning_context: dict,
    fallback_urgency: bool,
    fallback_level: ServiceLevel,
    seeded_resources: list[ResourceCreate],
) -> str:
    prompt = _load_prompt(prompt_name)
    lines = [
        f"Rol sistem: {prompt['system_role']}",
        f"Obiectiv: {prompt['goal']}",
        f"Model preferat: {prompt['model_hint']}",
        "Instructiuni:",
    ]
    for instruction in prompt.get("instructions", []):
        lines.append(f"- {instruction}")

    lines.extend(
        [
            "Contract raspuns JSON:",
        ]
    )
    for field in prompt.get("response_contract", []):
        lines.append(f"- {field}")

    lines.extend(
        [
            f"Mesaj client: {user_message}",
            f"Fallback urgenta: {fallback_urgency}",
            f"Fallback service level: {fallback_level.value}",
            f"Resurse seed: {_safe_json([item.model_dump() for item in seeded_resources])}",
            f"Context back-office: {_safe_json(rag_context)}",
            f"Context learning loop: {_safe_json(learning_context)}",
            "Raspunde strict JSON valid.",
        ]
    )
    return "\n".join(lines)


def _call_gemini(prompt_text: str) -> tuple[dict | None, dict]:
    api_key = (
        settings.GOOGLE_API_KEY
        or settings.GEMINI_API_KEY
        or os.getenv("GOOGLE_API_KEY")
        or os.getenv("GEMINI_API_KEY")
    )
    if not api_key:
        return None, {
            "provider": "local-fallback",
            "model": GEMINI_MODEL,
            "reason": "missing_api_key",
            "warning": "GOOGLE_API_KEY/GEMINI_API_KEY lipseste; se foloseste fallback local.",
        }

    try:
        from google import genai
    except ImportError:
        return None, {
            "provider": "local-fallback",
            "model": GEMINI_MODEL,
            "reason": "missing_google_genai",
            "warning": "Pachetul google-genai nu este disponibil; se foloseste fallback local.",
        }

    client = genai.Client(api_key=api_key)
    response = client.models.generate_content(
        model=GEMINI_MODEL,
        contents=prompt_text,
    )
    raw_text = getattr(response, "text", "") or ""
    parsed = _extract_json_blob(raw_text)
    if parsed is None:
        return None, {
            "provider": "local-fallback",
            "model": GEMINI_MODEL,
            "reason": "invalid_json_response",
            "warning": "Gemini a raspuns intr-un format nevalid JSON; se foloseste fallback local.",
            "raw_preview": raw_text[:300],
        }

    return parsed, {
        "provider": "google-genai",
        "model": GEMINI_MODEL,
        "embedding_model": EMBEDDING_MODEL,
        "reason": "live_gemini_call",
    }


def _build_local_fallback_response(
    *,
    message: str,
    fallback_urgency: bool,
    fallback_level: ServiceLevel,
    resources: list[ResourceCreate],
    rag_context: dict,
    learning_context: dict,
) -> dict:
    return {
        "summary": f"Cerere interpretata local pentru mesajul: {message[:120]}",
        "urgency": fallback_urgency,
        "service_level": fallback_level.value,
        "resource_suggestions": [item.model_dump() for item in resources],
        "risk_flags": [
            "Necesita validare umana finala"
            if learning_context["summary"]["total_feedback"] < 3
            else "Ruleaza pe fallback local din lipsa raspuns Gemini"
        ],
        "follow_up_questions": [
            "Confirmati accesul la locatie?",
            "Exista constrangeri de program sau materiale preferate?",
        ],
        "client_explanation": "Am folosit datele reale din back-office si regulile curente de cost/deviz.",
        "recommended_deviz_level": "ARGINT" if fallback_urgency else "BRONZ",
    }


def _calculate_confidence(*, rag_matches: int, feedback_total: int, used_fallback: bool) -> float:
    score = 0.55
    score += min(rag_matches, 6) * 0.04
    score += min(feedback_total, 10) * 0.015
    if not used_fallback:
        score += 0.08
    return round(min(score, 0.98), 2)


def interpret_request(
    db: Session,
    *,
    service_id: int,
    country_id: int,
    zone_id: int,
    locality_id: int | None,
    currency: str,
    legislation_code: str,
    message: str,
    urgency: bool | None,
    service_level: ServiceLevel | None,
    resources: list[ResourceCreate],
):
    selected_service_id = service_id
    matched_variant = match_reparat_calorifer_variant(
        db,
        message=message,
        preferred_service_id=service_id,
    )
    if matched_variant is not None:
        selected_service_id = matched_variant.selected_service_id

    indexed_documents = sync_backoffice_documents(db)
    fallback_urgency = _infer_urgency(message, urgency)
    fallback_level = _infer_service_level(message, service_level)
    seeded_resources = resources or suggest_resources(message, fallback_level)
    rag_context = retrieve_backoffice_context(
        db,
        service_id=selected_service_id,
        country_id=country_id,
        zone_id=zone_id,
        locality_id=locality_id,
        message=message,
    )
    learning_context = get_learning_examples(db)

    prompt_text = _build_prompt_text(
        prompt_name="interpret",
        user_message=message,
        rag_context={
            **rag_context,
            "indexed_documents": indexed_documents,
        },
        learning_context=learning_context,
        fallback_urgency=fallback_urgency,
        fallback_level=fallback_level,
        seeded_resources=seeded_resources,
    )

    llm_payload, llm_meta = _call_gemini(prompt_text)
    if llm_payload is None:
        llm_payload = _build_local_fallback_response(
            message=message,
            fallback_urgency=fallback_urgency,
            fallback_level=fallback_level,
            resources=seeded_resources,
            rag_context=rag_context,
            learning_context=learning_context,
        )

    interpreted_urgency = bool(llm_payload.get("urgency", fallback_urgency))
    interpreted_service_level = _parse_service_level(llm_payload.get("service_level"), fallback_level)
    suggested_resources = _parse_resource_suggestions(
        llm_payload.get("resource_suggestions"),
        interpreted_service_level,
    )
    if resources:
        suggested_resources = resources

    deviz = generate_deviz(
        db,
        DevizRequest(
            service_id=selected_service_id,
            country_id=country_id,
            zone_id=zone_id,
            locality_id=locality_id,
            currency=currency,
            legislation_code=legislation_code,
            urgency=interpreted_urgency,
            service_level=interpreted_service_level,
            resources=suggested_resources,
            source_message=message,
        ),
    )

    learning_snapshot = get_learning_snapshot(db)
    rag_sources = [f"{item['source_type']}:{item['source_key']}" for item in rag_context["rag_matches"]]
    used_fallback = llm_meta["provider"] != "google-genai"
    confidence = _calculate_confidence(
        rag_matches=len(rag_context["rag_matches"]),
        feedback_total=learning_snapshot["total_feedback"],
        used_fallback=used_fallback,
    )
    reasoning = (
        f"provider={llm_meta['provider']} model={llm_meta['model']} "
        f"reason={llm_meta.get('reason')} rag={len(rag_context['rag_matches'])} "
        f"feedback={learning_snapshot['total_feedback']}"
    )

    return {
        "provider": llm_meta["provider"],
        "model": llm_meta["model"],
        "embedding_model": llm_meta.get("embedding_model"),
        "used_fallback": used_fallback,
        "provider_reason": llm_meta.get("reason"),
        "warnings": [llm_meta["warning"]] if llm_meta.get("warning") else [],
        "confidence": confidence,
        "interpreted_summary": llm_payload.get("summary") or llm_payload.get("client_explanation") or reasoning,
        "interpreted_urgency": interpreted_urgency,
        "interpreted_service_level": interpreted_service_level,
        "reasoning": reasoning,
        "rag_context": rag_context,
        "matched_service_variant": {
            "service_id": matched_variant.selected_service_id,
            "service_slug": matched_variant.selected_service_slug,
            "service_name": matched_variant.selected_service_name,
            "confidence": matched_variant.confidence,
            "matched_keywords": matched_variant.matched_keywords,
        }
        if matched_variant
        else None,
        "rag_sources": rag_sources,
        "learning_snapshot": learning_snapshot,
        "suggested_resources": suggested_resources,
        "risk_flags": llm_payload.get("risk_flags") or [],
        "follow_up_questions": llm_payload.get("follow_up_questions") or [],
        "client_explanation": llm_payload.get("client_explanation"),
        "recommended_deviz_level": llm_payload.get("recommended_deviz_level"),
        "prompt_snapshot": prompt_text,
        "deviz": deviz,
    }
