from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, selectinload

from app.modules.cost_engine.schemas import CostDraftRequest
from app.modules.cost_engine.service import calculate_draft
from app.modules.deviz_engine.models import AdminDevizRule, DevizCalculation, DevizDraft, DevizLevel
from app.modules.deviz_engine.schemas import (
    DevizCalculationResponse,
    DevizLevelName,
    DevizLevelResponse,
    DevizLevelRuleCreate,
    DevizLevelRuleUpdate,
    DevizLevelRuleResponse,
    DevizRequest,
    DevizResponse,
)
from app.schemas.price_analysis import RecipeLevelName


DEFAULT_LEVEL_RULES = {
    DevizLevelName.BRONZ: ("Bronz", 1.0, "Pachet esential La Cheie", 1),
    DevizLevelName.ARGINT: ("Argint", 1.12, "Pachet echilibrat cu finisaje si coordonare extinsa", 2),
    DevizLevelName.AUR: ("Aur", 1.25, "Pachet premium cu control operational superior", 3),
    DevizLevelName.PLATINUM: ("Platinum", 1.45, "Pachet executiv complet, prioritar si personalizat", 4),
}


def _round_amount(value: float) -> float:
    return round(value, 2)


def _serialize_rule(rule: AdminDevizRule) -> DevizLevelRuleResponse:
    return DevizLevelRuleResponse(
        id=rule.id,
        service_id=rule.service_id,
        country_id=rule.country_id,
        level_name=DevizLevelName(rule.level_name),
        label=rule.label,
        multiplier=rule.multiplier,
        description=rule.description,
        sort_order=rule.sort_order,
        is_active=rule.is_active,
        created_at=rule.created_at,
        updated_at=rule.updated_at,
    )


def _get_matching_rule(
    db: Session,
    *,
    service_id: int,
    country_id: int,
    level_name: DevizLevelName,
):
    candidates = db.execute(
        select(AdminDevizRule)
        .where(
            AdminDevizRule.level_name == level_name.value,
            AdminDevizRule.is_active.is_(True),
        )
        .order_by(AdminDevizRule.service_id.desc(), AdminDevizRule.country_id.desc())
    ).scalars().all()

    for candidate in candidates:
        if candidate.service_id == service_id and candidate.country_id == country_id:
            return candidate
    for candidate in candidates:
        if candidate.service_id == service_id and candidate.country_id is None:
            return candidate
    for candidate in candidates:
        if candidate.service_id is None and candidate.country_id == country_id:
            return candidate
    for candidate in candidates:
        if candidate.service_id is None and candidate.country_id is None:
            return candidate
    return None


def _resolve_level_rules(db: Session, *, service_id: int, country_id: int):
    resolved = []
    for level_name, (label, multiplier, description, sort_order) in DEFAULT_LEVEL_RULES.items():
        override = _get_matching_rule(
            db,
            service_id=service_id,
            country_id=country_id,
            level_name=level_name,
        )
        resolved.append(
            {
                "level_name": level_name,
                "label": override.label if override else label,
                "multiplier": override.multiplier if override else multiplier,
                "description": override.description if override else description,
                "sort_order": override.sort_order if override else sort_order,
            }
        )
    return sorted(resolved, key=lambda item: item["sort_order"])


def _select_recommended_level(urgency: bool, base_gross_total: float) -> DevizLevelName:
    if urgency or base_gross_total >= 15000:
        return DevizLevelName.AUR
    if base_gross_total >= 8000:
        return DevizLevelName.ARGINT
    return DevizLevelName.BRONZ


def list_admin_deviz_rules(db: Session):
    rules = db.execute(select(AdminDevizRule).order_by(AdminDevizRule.sort_order, AdminDevizRule.id)).scalars().all()
    return [_serialize_rule(rule) for rule in rules]


def get_admin_deviz_rule(db: Session, rule_id: int):
    rule = db.get(AdminDevizRule, rule_id)
    return _serialize_rule(rule) if rule else None


def create_admin_deviz_rule(db: Session, data: DevizLevelRuleCreate):
    query = select(AdminDevizRule).where(AdminDevizRule.level_name == data.level_name.value)
    if data.service_id is None:
        query = query.where(AdminDevizRule.service_id.is_(None))
    else:
        query = query.where(AdminDevizRule.service_id == data.service_id)
    if data.country_id is None:
        query = query.where(AdminDevizRule.country_id.is_(None))
    else:
        query = query.where(AdminDevizRule.country_id == data.country_id)
    existing = db.execute(query).scalar_one_or_none()
    if existing:
        return "duplicate_context"

    rule = AdminDevizRule(
        service_id=data.service_id,
        country_id=data.country_id,
        level_name=data.level_name.value,
        label=data.label,
        multiplier=data.multiplier,
        description=data.description,
        sort_order=data.sort_order,
        is_active=data.is_active,
    )
    db.add(rule)
    try:
        db.commit()
        db.refresh(rule)
        return _serialize_rule(rule)
    except IntegrityError:
        db.rollback()
        return "duplicate_context"


def update_admin_deviz_rule(db: Session, rule_id: int, data: DevizLevelRuleUpdate):
    rule = db.get(AdminDevizRule, rule_id)
    if not rule:
        return None

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(rule, field, value)

    db.commit()
    db.refresh(rule)
    return _serialize_rule(rule)


def delete_admin_deviz_rule(db: Session, rule_id: int):
    rule = db.get(AdminDevizRule, rule_id)
    if not rule:
        return None
    db.delete(rule)
    db.commit()
    return True


def _serialize_deviz(draft: DevizDraft) -> DevizResponse:
    calculation = draft.calculations[0]
    return DevizResponse(
        id=draft.id,
        service_id=draft.service_id,
        country_id=draft.country_id,
        zone_id=draft.zone_id,
        locality_id=draft.locality_id,
        currency=draft.currency,
        legislation_code=draft.legislation_code,
        urgency=draft.urgency,
        source_message=draft.source_message,
        created_at=draft.created_at,
        levels=[
            DevizLevelResponse(
                id=level.id,
                level_name=DevizLevelName(level.level_name),
                label=level.label,
                description=level.description,
                multiplier=level.multiplier,
                cost_direct_per_nivel=level.cost_direct_total,
                indirecte=level.indirect_cost_value,
                platform_maintenance=level.platform_maintenance_value,
                mydarrin_platform=level.mydarrin_platform_value,
                net_total=level.net_total,
                vat_value=level.vat_value,
                gross_total=level.gross_total,
                pret_final_net=level.net_total,
                pret_final_gross=level.gross_total,
                recommended=level.recommended,
                sort_order=level.sort_order,
            )
            for level in draft.levels
        ],
        calculation=DevizCalculationResponse(
            id=calculation.id,
            cost_calculation_id=calculation.cost_calculation_id,
            recommended_level_name=DevizLevelName(calculation.recommended_level_name),
            cost_direct_total=calculation.cost_direct_total,
            indirect_costs=calculation.indirect_cost_value,
            platform_maintenance=calculation.platform_maintenance_value,
            mydarrin_platform=calculation.mydarrin_platform_value,
            base_net_total=calculation.base_net_total,
            base_vat_value=calculation.base_vat_value,
            base_gross_total=calculation.base_gross_total,
            created_at=calculation.created_at,
        ),
    )


def get_deviz(db: Session, deviz_id: int):
    draft = db.execute(
        select(DevizDraft)
        .options(selectinload(DevizDraft.levels), selectinload(DevizDraft.calculations))
        .where(DevizDraft.id == deviz_id)
    ).scalar_one_or_none()
    if not draft:
        return None
    return _serialize_deviz(draft)


def generate_deviz(db: Session, data: DevizRequest):
    draft = DevizDraft(
        service_id=data.service_id,
        country_id=data.country_id,
        zone_id=data.zone_id,
        locality_id=data.locality_id,
        currency=data.currency.upper(),
        legislation_code=data.legislation_code.upper(),
        urgency=data.urgency,
        source_message=data.source_message,
    )
    db.add(draft)
    db.flush()
    level_rules = _resolve_level_rules(
        db,
        service_id=data.service_id,
        country_id=data.country_id,
    )

    raw_cost_results: dict[DevizLevelName, object] = {}
    for level_name in (
        DevizLevelName.BRONZ,
        DevizLevelName.ARGINT,
        DevizLevelName.AUR,
        DevizLevelName.PLATINUM,
    ):
        cost_result = calculate_draft(
            db,
            CostDraftRequest(
                service_id=data.service_id,
                country_id=data.country_id,
                zone_id=data.zone_id,
                locality_id=data.locality_id,
                currency=data.currency,
                legislation_code=data.legislation_code,
                urgency=data.urgency,
                service_level=data.service_level,
                recipe_level=RecipeLevelName(level_name.value),
                activity_ids=data.activity_ids,
                resources=data.resources,
            ),
        )
        if isinstance(cost_result, str):
            return cost_result
        raw_cost_results[level_name] = cost_result

    recommended_level = _select_recommended_level(
        data.urgency,
        raw_cost_results[DevizLevelName.ARGINT].calculation.gross_total,
    )

    for rule in level_rules:
        base_cost = raw_cost_results[rule["level_name"]]
        level = DevizLevel(
            draft_id=draft.id,
            level_name=rule["level_name"].value,
            label=rule["label"],
            description=rule["description"],
            multiplier=rule["multiplier"],
            cost_direct_total=_round_amount(base_cost.calculation.cost_direct_total * rule["multiplier"]),
            indirect_cost_value=_round_amount(base_cost.calculation.indirect_cost_value * rule["multiplier"]),
            platform_maintenance_value=_round_amount(base_cost.calculation.platform_maintenance_value * rule["multiplier"]),
            mydarrin_platform_value=_round_amount(base_cost.calculation.mydarrin_platform_value * rule["multiplier"]),
            net_total=_round_amount(base_cost.calculation.net_total * rule["multiplier"]),
            vat_value=_round_amount(base_cost.calculation.vat_value * rule["multiplier"]),
            gross_total=_round_amount(base_cost.calculation.gross_total * rule["multiplier"]),
            recommended=rule["level_name"] == recommended_level,
            sort_order=rule["sort_order"],
        )
        db.add(level)

    recommended_cost = raw_cost_results[recommended_level]
    calculation = DevizCalculation(
        draft_id=draft.id,
        cost_calculation_id=recommended_cost.calculation.id,
        recommended_level_name=recommended_level.value,
        cost_direct_total=recommended_cost.calculation.cost_direct_total,
        indirect_cost_value=recommended_cost.calculation.indirect_cost_value,
        platform_maintenance_value=recommended_cost.calculation.platform_maintenance_value,
        mydarrin_platform_value=recommended_cost.calculation.mydarrin_platform_value,
        base_net_total=recommended_cost.calculation.net_total,
        base_vat_value=recommended_cost.calculation.vat_value,
        base_gross_total=recommended_cost.calculation.gross_total,
    )
    db.add(calculation)
    db.commit()

    return get_deviz(db, draft.id)
