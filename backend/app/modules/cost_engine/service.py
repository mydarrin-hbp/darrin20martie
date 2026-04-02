from sqlalchemy import and_, or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, selectinload

from app.models.price_analysis import CatalogActivity, PriceAnalysisRecipe, TaxRule
from app.models.service import Service
from app.modules.cost_engine.models import AdminPriceConfig, CostCalculation, FinancialConfig, LaborRate, PriceAnalysis, Resource
from app.modules.cost_engine.schemas import (
    AdminPriceConfigCreate,
    AdminPriceConfigUpdate,
    CostCalculationResponse,
    CostDraftRequest,
    CostDraftResponse,
    FinancialConfigCreate,
    FinancialConfigResponse,
    FinancialConfigUpdate,
    LaborRateCreate,
    LaborRateUpdate,
    PartialAvailabilityResponse,
    PriceAnalysisResponse,
    ProformaLineItem,
    ProformaPayload,
    ResourceCreate,
    ResourceResponse,
    ServiceLevel,
)
from app.modules.geography.models import Country, Locality, Zone
from app.schemas.price_analysis import RecipeLevelName, ResourceType
from app.services.price_analysis_service import (
    evaluate_recipe_geo_availability,
    get_recipe_coefficient,
    get_recipe_rows_for_activities,
    get_service_recipe_activities,
    resolve_resource_unit_price,
)


def _round_amount(value: float) -> float:
    return round(value, 2)


def _get_service_level_coefficient(config: AdminPriceConfig, service_level: ServiceLevel) -> float:
    if service_level == ServiceLevel.BASIC:
        return config.basic_level_coefficient
    if service_level == ServiceLevel.PREMIUM:
        return config.premium_level_coefficient
    return config.standard_level_coefficient


def _infer_service_family(service: Service) -> str:
    slug = (service.slug or "").lower()
    if "beton" in slug:
        return "CONCRETE"
    if "naval" in slug or "ambarc" in slug:
        return "NAVAL"
    if "generator" in slug or "inchiriere" in slug:
        return "RENTAL"
    if "centrala" in slug or "hvac" in slug:
        return "HVAC"
    return "GENERAL"


def _resolve_financial_config(
    db: Session,
    *,
    country_id: int,
    zone_id: int,
    locality_id: int | None,
    service_family: str,
) -> FinancialConfig | None:
    query = (
        select(FinancialConfig)
        .where(FinancialConfig.is_active.is_(True))
        .where(
            or_(
                FinancialConfig.country_id.is_(None),
                FinancialConfig.country_id == country_id,
            )
        )
        .where(
            or_(
                FinancialConfig.service_family.is_(None),
                FinancialConfig.service_family == service_family,
            )
        )
        .order_by(
            (FinancialConfig.locality_id == locality_id).desc() if locality_id is not None else FinancialConfig.locality_id.is_not(None).desc(),
            (FinancialConfig.zone_id == zone_id).desc(),
            FinancialConfig.country_id.is_not(None).desc(),
            FinancialConfig.service_family.is_not(None).desc(),
            FinancialConfig.id.desc(),
        )
    )
    if locality_id is not None:
        query = query.where(or_(FinancialConfig.locality_id.is_(None), FinancialConfig.locality_id == locality_id))
    else:
        query = query.where(FinancialConfig.locality_id.is_(None))
    query = query.where(or_(FinancialConfig.zone_id.is_(None), FinancialConfig.zone_id == zone_id))
    return db.execute(query).scalars().first()


def _build_cost_layers(
    direct_cost: float,
    config: AdminPriceConfig,
    *,
    financial_config: FinancialConfig | None = None,
    vat_percentage: float | None = None,
    concrete_extras: dict[str, float] | None = None,
    resource_mix: dict[str, float] | None = None,
) -> dict[str, float]:
    effective_indirect_pct = financial_config.indirect_cost_percentage if financial_config else config.indirect_cost_percentage
    effective_platform_fee_pct = financial_config.platform_fee_percentage if financial_config else config.platform_maintenance_percentage
    effective_management_pct = financial_config.mydarrin_commission_percentage if financial_config else config.darrin_management_fee_percentage
    effective_insurance_pct = financial_config.insurance_percentage if financial_config else config.insurance_premium_percentage
    effective_insurance_fixed = financial_config.insurance_fixed_amount if financial_config else config.insurance_premium_fixed
    effective_escrow_pct = financial_config.escrow_guarantee_percentage if financial_config else config.escrow_retention_percentage

    incomplete_load_fee = _round_amount((concrete_extras or {}).get("incomplete_load_fee", 0.0))
    pump_mobilization_fee = _round_amount((concrete_extras or {}).get("pump_mobilization_fee", 0.0))
    pump_service_fee = _round_amount((concrete_extras or {}).get("pump_service_fee", 0.0))
    concrete_adjustment_total = _round_amount(incomplete_load_fee + pump_mobilization_fee + pump_service_fee)

    direct_cost_with_concrete = _round_amount(direct_cost + concrete_adjustment_total)
    indirect_cost_value = _round_amount(direct_cost_with_concrete * effective_indirect_pct)
    if financial_config and resource_mix:
        labor_margin = _round_amount(resource_mix.get("LABOR", 0.0) * financial_config.labor_margin_percentage)
        material_margin = _round_amount(resource_mix.get("MATERIAL", 0.0) * financial_config.material_margin_percentage)
        rental_margin = _round_amount(
            (resource_mix.get("EQUIPMENT", 0.0) + resource_mix.get("TRANSPORT", 0.0)) * financial_config.rental_margin_percentage
        )
        darrin_management_fee_value = _round_amount(
            config.darrin_management_fee_fixed + labor_margin + material_margin + rental_margin
        )
    else:
        darrin_management_fee_value = _round_amount(
            config.darrin_management_fee_fixed + (direct_cost_with_concrete * effective_management_pct)
        )
    base_before_platform = _round_amount(direct_cost_with_concrete + indirect_cost_value + darrin_management_fee_value)
    platform_maintenance_value = _round_amount(base_before_platform * effective_platform_fee_pct)
    mydarrin_platform_value = _round_amount(direct_cost_with_concrete * config.mydarrin_platform_percentage) if financial_config is None else 0.0
    insurance_premium_value = _round_amount(effective_insurance_fixed + (direct_cost_with_concrete * effective_insurance_pct))
    escrow_retention_value = _round_amount(direct_cost_with_concrete * effective_escrow_pct)
    net_total = _round_amount(
        base_before_platform
        + platform_maintenance_value
        + insurance_premium_value
        + escrow_retention_value
        + mydarrin_platform_value
    )
    applied_vat_percentage = config.vat_percentage if vat_percentage is None else vat_percentage
    vat_value = _round_amount(net_total * applied_vat_percentage)
    gross_total = _round_amount(net_total + vat_value)
    return {
        "direct_cost_value": direct_cost_with_concrete,
        "indirect_cost_value": indirect_cost_value,
        "platform_maintenance_value": platform_maintenance_value,
        "mydarrin_platform_value": mydarrin_platform_value,
        "escrow_retention_value": escrow_retention_value,
        "insurance_premium_value": insurance_premium_value,
        "darrin_management_fee_value": darrin_management_fee_value,
        "incomplete_load_fee": incomplete_load_fee,
        "pump_mobilization_fee": pump_mobilization_fee,
        "pump_service_fee": pump_service_fee,
        "net_total": net_total,
        "vat_value": vat_value,
        "gross_total": gross_total,
    }


def get_tax_rule(
    db: Session,
    *,
    country_code: str,
    service_type: str,
    locality_slug: str | None = None,
) -> float:
    normalized_country_code = country_code.upper().strip()
    normalized_service_type = service_type.upper().strip()
    normalized_locality_slug = locality_slug.lower().strip() if locality_slug else None

    if normalized_locality_slug:
        local_rule = db.execute(
            select(TaxRule).where(
                TaxRule.country_code == normalized_country_code,
                TaxRule.locality_slug == normalized_locality_slug,
                TaxRule.service_type == normalized_service_type,
                TaxRule.is_active.is_(True),
            )
        ).scalar_one_or_none()
        if local_rule:
            return float(local_rule.vat_percentage)

    country_rule = db.execute(
        select(TaxRule).where(
            TaxRule.country_code == normalized_country_code,
            TaxRule.locality_slug.is_(None),
            TaxRule.service_type == normalized_service_type,
            TaxRule.is_active.is_(True),
        )
    ).scalar_one_or_none()
    if country_rule:
        return float(country_rule.vat_percentage)

    fallback_tax_rules = {
        "RO": {"SERVICE": 0.19, "LANDSCAPING": 0.19, "CONSTRUCTION_MATERIAL": 0.19},
        "GR": {"SERVICE": 0.24, "LANDSCAPING": 0.24, "CONSTRUCTION_MATERIAL": 0.24},
    }
    return float(fallback_tax_rules.get(normalized_country_code, {}).get(normalized_service_type, 0.19))


def _infer_service_tax_type(service: Service, recipe_rows: list[PriceAnalysisRecipe]) -> str:
    normalized_slug = (service.slug or "").lower()
    resource_types = {(recipe.resource.resource_type or "").upper() for recipe in recipe_rows}

    if "gazon" in normalized_slug or "grass" in normalized_slug or "landscape" in normalized_slug:
        return "LANDSCAPING"
    if "beton" in normalized_slug or ResourceType.MATERIAL.value in resource_types:
        return "CONSTRUCTION_MATERIAL"
    return "SERVICE"


def _apply_minimum_order_to_layers(
    cost_layers: dict[str, float],
    config: AdminPriceConfig,
    minimum_order_value: float,
    *,
    financial_config: FinancialConfig | None = None,
    vat_percentage: float | None = None,
    resource_mix: dict[str, float] | None = None,
) -> dict[str, float]:
    current_net_total = _round_amount(cost_layers["net_total"])
    target_net_total = _round_amount(minimum_order_value)
    if current_net_total <= 0 or target_net_total <= current_net_total:
        return cost_layers

    effective_indirect_pct = financial_config.indirect_cost_percentage if financial_config else config.indirect_cost_percentage
    effective_platform_fee_pct = financial_config.platform_fee_percentage if financial_config else config.platform_maintenance_percentage
    effective_management_pct = financial_config.mydarrin_commission_percentage if financial_config else config.darrin_management_fee_percentage
    effective_insurance_pct = financial_config.insurance_percentage if financial_config else config.insurance_premium_percentage
    effective_insurance_fixed = financial_config.insurance_fixed_amount if financial_config else config.insurance_premium_fixed
    effective_escrow_pct = financial_config.escrow_guarantee_percentage if financial_config else config.escrow_retention_percentage
    concrete_extras = {
        "incomplete_load_fee": cost_layers.get("incomplete_load_fee", 0.0),
        "pump_mobilization_fee": cost_layers.get("pump_mobilization_fee", 0.0),
        "pump_service_fee": cost_layers.get("pump_service_fee", 0.0),
    }
    fixed_component = _round_amount(effective_insurance_fixed)
    fixed_direct_addon = _round_amount(sum(concrete_extras.values()))
    required_direct_cost = target_net_total - fixed_component
    probe_direct_cost = max(required_direct_cost, 0)
    for _ in range(12):
        rebuilt = _build_cost_layers(
            probe_direct_cost,
            config,
            financial_config=financial_config,
            vat_percentage=vat_percentage,
            concrete_extras=concrete_extras,
            resource_mix=resource_mix,
        )
        gap = target_net_total - rebuilt["net_total"]
        if gap <= 0.01:
            return rebuilt
        multiplier = 1 + effective_indirect_pct + effective_management_pct + effective_platform_fee_pct + effective_insurance_pct + effective_escrow_pct
        probe_direct_cost += max(gap / max(multiplier, 1), 0.01)
    required_direct_cost = _round_amount(max(probe_direct_cost, cost_layers["direct_cost_value"] - fixed_direct_addon))
    return _build_cost_layers(
        required_direct_cost,
        config,
        financial_config=financial_config,
        vat_percentage=vat_percentage,
        concrete_extras=concrete_extras,
        resource_mix=resource_mix,
    )


def _serialize_resources(resources: list[Resource]) -> list[ResourceResponse]:
    return [
        ResourceResponse(
            id=resource.id,
            catalog_resource_id=resource.catalog_resource_id,
            activity_id=resource.activity_id,
            activity_name=resource.activity_name,
            esco_code=resource.esco_code,
            is_essential=resource.is_essential,
            resource_type=resource.resource_type,
            name=resource.name,
            unit=resource.unit,
            quantity=resource.quantity,
            unit_cost=resource.unit_cost,
            total_cost=resource.total_cost,
        )
        for resource in resources
    ]


def get_admin_price_configs(db: Session):
    return db.execute(select(AdminPriceConfig).order_by(AdminPriceConfig.id)).scalars().all()


def get_admin_price_config(db: Session, config_id: int):
    return db.get(AdminPriceConfig, config_id)


def get_financial_configs(db: Session):
    return db.execute(select(FinancialConfig).order_by(FinancialConfig.id)).scalars().all()


def get_financial_config(db: Session, config_id: int):
    return db.get(FinancialConfig, config_id)


def create_financial_config(db: Session, data: FinancialConfigCreate):
    config = FinancialConfig(**data.model_dump())
    db.add(config)
    try:
        db.commit()
        db.refresh(config)
        return config
    except IntegrityError:
        db.rollback()
        return "duplicate_context"


def update_financial_config(db: Session, config_id: int, data: FinancialConfigUpdate):
    config = db.get(FinancialConfig, config_id)
    if not config:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(config, field, value)
    try:
        db.commit()
        db.refresh(config)
        return config
    except IntegrityError:
        db.rollback()
        return "duplicate_context"


def delete_financial_config(db: Session, config_id: int):
    config = db.get(FinancialConfig, config_id)
    if not config:
        return None
    db.delete(config)
    db.commit()
    return True


def get_labor_rates(db: Session):
    return db.execute(select(LaborRate).order_by(LaborRate.skill_label, LaborRate.id)).scalars().all()


def get_labor_rate(db: Session, rate_id: int):
    return db.get(LaborRate, rate_id)


def create_labor_rate(db: Session, data: LaborRateCreate):
    rate = LaborRate(**data.model_dump())
    db.add(rate)
    try:
        db.commit()
        db.refresh(rate)
        return rate
    except IntegrityError:
        db.rollback()
        return "duplicate_context"


def update_labor_rate(db: Session, rate_id: int, data: LaborRateUpdate):
    rate = db.get(LaborRate, rate_id)
    if not rate:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(rate, field, value)
    try:
        db.commit()
        db.refresh(rate)
        return rate
    except IntegrityError:
        db.rollback()
        return "duplicate_context"


def delete_labor_rate(db: Session, rate_id: int):
    rate = db.get(LaborRate, rate_id)
    if not rate:
        return None
    db.delete(rate)
    db.commit()
    return True


def _build_concrete_extras(
    resource_rows: list[dict],
    *,
    requested_quantity: float | None,
    financial_config: FinancialConfig | None,
    service_family: str,
) -> dict[str, float]:
    if service_family != "CONCRETE":
        return {
            "incomplete_load_fee": 0.0,
            "pump_mobilization_fee": 0.0,
            "pump_service_fee": 0.0,
        }

    qty = requested_quantity or 0.0
    incomplete_load_fee = 0.0
    if financial_config and qty > 0 and qty < 7:
        incomplete_load_fee = financial_config.incomplete_load_fee

    has_pump = any("pompa" in str(row.get("name", "")).lower() or row.get("resource_type") == ResourceType.EQUIPMENT.value for row in resource_rows)
    pump_mobilization_fee = financial_config.pump_mobilization_fee if financial_config and has_pump else 0.0
    pump_service_fee = (financial_config.pump_price_per_m3 * qty) if financial_config and has_pump and qty > 0 else 0.0
    return {
        "incomplete_load_fee": _round_amount(incomplete_load_fee),
        "pump_mobilization_fee": _round_amount(pump_mobilization_fee),
        "pump_service_fee": _round_amount(pump_service_fee),
    }


def _build_proforma_payload(
    *,
    service: Service,
    currency: str,
    cost_layers: dict[str, float],
    resources: list[Resource],
) -> ProformaPayload:
    line_items: list[ProformaLineItem] = [
        ProformaLineItem(code="DIRECT_COSTS", label="Costuri directe", amount=cost_layers["direct_cost_value"]),
        ProformaLineItem(code="INDIRECT", label="Costuri indirecte", amount=cost_layers["indirect_cost_value"]),
        ProformaLineItem(code="MGMT", label="Comision Antreprenor General", amount=cost_layers["darrin_management_fee_value"]),
        ProformaLineItem(code="PLATFORM", label="Taxa platforma", amount=cost_layers["platform_maintenance_value"]),
        ProformaLineItem(code="INSURANCE", label="Prima asigurare", amount=cost_layers["insurance_premium_value"]),
        ProformaLineItem(code="ESCROW", label="Garantie buna executie", amount=cost_layers["escrow_retention_value"]),
    ]
    if cost_layers.get("incomplete_load_fee", 0) > 0:
        line_items.append(ProformaLineItem(code="INCOMPLETE_LOAD", label="Taxa cifra incompleta", amount=cost_layers["incomplete_load_fee"]))
    if cost_layers.get("pump_mobilization_fee", 0) > 0:
        line_items.append(ProformaLineItem(code="PUMP_MOB", label="Mobilizare pompa", amount=cost_layers["pump_mobilization_fee"]))
    if cost_layers.get("pump_service_fee", 0) > 0:
        line_items.append(ProformaLineItem(code="PUMP_M3", label="Serviciu pompare per m3", amount=cost_layers["pump_service_fee"]))
    line_items.append(ProformaLineItem(code="VAT", label="TVA", amount=cost_layers["vat_value"]))

    return ProformaPayload(
        service_slug=service.slug,
        service_name=service.name,
        currency=currency,
        net_total=cost_layers["net_total"],
        vat_value=cost_layers["vat_value"],
        gross_total=cost_layers["gross_total"],
        line_items=line_items,
        financial_flow={
            "resource_count": len(resources),
            "has_concrete_dispatch_components": any("pompa" in resource.name.lower() or "beton" in resource.name.lower() for resource in resources),
        },
    )


def _find_existing_admin_price_config(
    db: Session,
    *,
    service_id: int,
    country_id: int,
    zone_id: int | None,
    currency: str,
    legislation_code: str,
    exclude_id: int | None = None,
):
    query = select(AdminPriceConfig).where(
        AdminPriceConfig.service_id == service_id,
        AdminPriceConfig.country_id == country_id,
        AdminPriceConfig.currency == currency.upper(),
        AdminPriceConfig.legislation_code == legislation_code.upper(),
    )
    if zone_id is None:
        query = query.where(AdminPriceConfig.zone_id.is_(None))
    else:
        query = query.where(AdminPriceConfig.zone_id == zone_id)
    if exclude_id is not None:
        query = query.where(AdminPriceConfig.id != exclude_id)
    return db.execute(query).scalar_one_or_none()


def create_admin_price_config(db: Session, data: AdminPriceConfigCreate):
    country = db.get(Country, data.country_id)
    if not country:
        return "country_not_found"

    service = db.get(Service, data.service_id)
    if not service:
        return "service_not_found"

    if data.zone_id is not None:
        zone = db.get(Zone, data.zone_id)
        if not zone:
            return "zone_not_found"
        if zone.country_id != country.id:
            return "zone_country_mismatch"

    existing = _find_existing_admin_price_config(
        db,
        service_id=data.service_id,
        country_id=data.country_id,
        zone_id=data.zone_id,
        currency=data.currency,
        legislation_code=data.legislation_code,
    )
    if existing:
        return "duplicate_context"

    config = AdminPriceConfig(**data.model_dump())
    config.currency = config.currency.upper()
    config.legislation_code = config.legislation_code.upper()
    config.platform_margin_coefficient = config.mydarrin_platform_percentage
    config.vat_coefficient = config.vat_percentage
    db.add(config)
    try:
        db.commit()
        db.refresh(config)
        return config
    except IntegrityError:
        db.rollback()
        return "duplicate_context"


def update_admin_price_config(db: Session, config_id: int, data: AdminPriceConfigUpdate):
    config = db.get(AdminPriceConfig, config_id)
    if not config:
        return None

    update_data = data.model_dump(exclude_unset=True)
    if "zone_id" in update_data and update_data["zone_id"] is not None:
        zone = db.get(Zone, update_data["zone_id"])
        if not zone:
            return "zone_not_found"
        if zone.country_id != config.country_id:
            return "zone_country_mismatch"

    for field, value in update_data.items():
        if field == "currency" and value is not None:
            value = value.upper()
        if field == "legislation_code" and value is not None:
            value = value.upper()
        setattr(config, field, value)
    config.platform_margin_coefficient = config.mydarrin_platform_percentage
    config.vat_coefficient = config.vat_percentage

    existing = _find_existing_admin_price_config(
        db,
        service_id=config.service_id,
        country_id=config.country_id,
        zone_id=config.zone_id,
        currency=config.currency,
        legislation_code=config.legislation_code,
        exclude_id=config.id,
    )
    if existing:
        db.rollback()
        return "duplicate_context"

    try:
        db.commit()
        db.refresh(config)
        return config
    except IntegrityError:
        db.rollback()
        return "duplicate_context"


def delete_admin_price_config(db: Session, config_id: int):
    config = db.get(AdminPriceConfig, config_id)
    if not config:
        return None

    db.delete(config)
    db.commit()
    return True


def _get_matching_price_config(
    db: Session,
    *,
    service_id: int,
    country_id: int,
    zone_id: int,
    currency: str,
    legislation_code: str,
):
    normalized_currency = currency.upper()
    normalized_legislation = legislation_code.upper()
    exact = db.execute(
        select(AdminPriceConfig).where(
            AdminPriceConfig.service_id == service_id,
            AdminPriceConfig.country_id == country_id,
            AdminPriceConfig.zone_id == zone_id,
            AdminPriceConfig.currency == normalized_currency,
            AdminPriceConfig.legislation_code == normalized_legislation,
            AdminPriceConfig.is_active.is_(True),
        )
    ).scalar_one_or_none()
    if exact:
        return exact

    return db.execute(
        select(AdminPriceConfig).where(
            AdminPriceConfig.service_id == service_id,
            AdminPriceConfig.country_id == country_id,
            AdminPriceConfig.zone_id.is_(None),
            AdminPriceConfig.currency == normalized_currency,
            AdminPriceConfig.legislation_code == normalized_legislation,
            AdminPriceConfig.is_active.is_(True),
        )
    ).scalar_one_or_none()


def _build_manual_resource_rows(resources: list[ResourceCreate]) -> tuple[list[dict], float]:
    rows: list[dict] = []
    subtotal = 0.0
    for resource in resources:
        total_cost = _round_amount(resource.quantity * resource.unit_cost)
        subtotal += total_cost
        rows.append(
            {
                "catalog_resource_id": resource.catalog_resource_id,
                "activity_id": resource.activity_id,
                "activity_name": resource.activity_name,
                "esco_code": resource.esco_code,
                "is_essential": resource.is_essential,
                "resource_type": resource.resource_type.value,
                "name": resource.name,
                "unit": resource.unit,
                "quantity": resource.quantity,
                "unit_cost": resource.unit_cost,
                "total_cost": total_cost,
            }
        )
    return rows, _round_amount(subtotal)


def _resolve_activities_for_cost(db: Session, service: Service, requested_activity_ids: list[int]) -> list[CatalogActivity]:
    available_activities = get_service_recipe_activities(db, service.id)
    if not requested_activity_ids:
        return available_activities

    available_by_id = {activity.id: activity for activity in available_activities}
    return [available_by_id[activity_id] for activity_id in requested_activity_ids if activity_id in available_by_id]


def _build_recipe_resource_rows(
    db: Session,
    recipe_rows: list[PriceAnalysisRecipe],
    recipe_level: RecipeLevelName,
    *,
    country_id: int,
    zone_id: int,
    locality_id: int | None,
    currency: str,
    legislation_code: str,
) -> tuple[list[dict], float]:
    rows: list[dict] = []
    subtotal = 0.0

    for recipe in recipe_rows:
        if recipe_level == RecipeLevelName.BRONZ and not recipe.is_essential:
            continue

        coefficient = get_recipe_coefficient(recipe, recipe_level)
        quantity = recipe.specific_consumption * coefficient * (1 + (recipe.waste_percentage / 100))
        quantity = _round_amount(quantity)
        unit_cost, _pricing_context = resolve_resource_unit_price(
            db,
            resource=recipe.resource,
            country_id=country_id,
            zone_id=zone_id,
            locality_id=locality_id,
            currency=currency,
            legislation_code=legislation_code,
        )
        unit_cost = _round_amount(unit_cost)
        total_cost = _round_amount(quantity * unit_cost)
        subtotal += total_cost
        rows.append(
            {
                "catalog_resource_id": recipe.resource_id,
                "activity_id": recipe.activity_id,
                "activity_name": recipe.activity.name_ro,
                "esco_code": recipe.resource.esco_code,
                "is_essential": recipe.is_essential,
                "resource_type": recipe.resource.resource_type,
                "name": recipe.resource.name_ro,
                "unit": recipe.resource.unit,
                "quantity": quantity,
                "unit_cost": unit_cost,
                "total_cost": total_cost,
            }
        )

    return rows, _round_amount(subtotal)


def calculate_draft(db: Session, data: CostDraftRequest) -> CostDraftResponse | PartialAvailabilityResponse | str:
    service = db.execute(
        select(Service).options(selectinload(Service.subcategories)).where(Service.id == data.service_id)
    ).scalar_one_or_none()
    if not service:
        return "service_not_found"

    country = db.get(Country, data.country_id)
    if not country:
        return "country_not_found"

    zone = db.get(Zone, data.zone_id)
    if not zone:
        return "zone_not_found"
    if zone.country_id != country.id:
        return "zone_country_mismatch"
    locality = None
    if data.locality_id is not None:
        locality = db.get(Locality, data.locality_id)
        if not locality:
            return "locality_not_found"
        if locality.country_id != country.id:
            return "locality_country_mismatch"
        if locality.zone_id != zone.id:
            return "locality_zone_mismatch"

    config = _get_matching_price_config(
        db,
        service_id=service.id,
        country_id=country.id,
        zone_id=zone.id,
        currency=data.currency,
        legislation_code=data.legislation_code,
    )
    if not config:
        return "price_config_not_found"

    selected_activities = _resolve_activities_for_cost(db, service, data.activity_ids)
    recipe_rows = get_recipe_rows_for_activities(db, [activity.id for activity in selected_activities])
    availability_error = evaluate_recipe_geo_availability(
        recipe_rows,
        country=country,
        zone=zone,
        locality=locality,
    )
    if availability_error:
        return PartialAvailabilityResponse(
            status=availability_error["status"],
            service_id=service.id,
            service_name=service.name,
            service_slug=service.slug,
            country_id=country.id,
            zone_id=zone.id,
            locality_id=data.locality_id,
            currency=config.currency,
            legislation_code=config.legislation_code,
            message=availability_error["message"],
            available_resource_types=availability_error["available_resource_types"],
            missing_resource_types=availability_error["missing_resource_types"],
            target_address=data.target_address,
        )
    recipe_resource_rows, recipe_subtotal = _build_recipe_resource_rows(
        db,
        recipe_rows,
        data.recipe_level,
        country_id=country.id,
        zone_id=zone.id,
        locality_id=data.locality_id,
        currency=data.currency,
        legislation_code=data.legislation_code,
    )
    manual_resource_rows, manual_subtotal = _build_manual_resource_rows(data.resources)
    resource_rows = recipe_resource_rows + manual_resource_rows
    resource_subtotal = _round_amount(recipe_subtotal + manual_subtotal)
    resource_mix: dict[str, float] = {}
    for row in resource_rows:
        resource_key = str(row.get("resource_type") or "OTHER").upper()
        resource_mix[resource_key] = _round_amount(resource_mix.get(resource_key, 0.0) + float(row.get("total_cost") or 0.0))

    base_price = _round_amount(config.base_price)
    zone_coefficient = config.zone_coefficient_override or float(zone.multiplier)
    urgency_coefficient = config.urgency_coefficient if data.urgency else 1.0
    service_level_coefficient = _get_service_level_coefficient(config, data.service_level)
    legislation_coefficient = config.legislation_coefficient
    service_tax_type = _infer_service_tax_type(service, recipe_rows)
    service_family = _infer_service_family(service)
    financial_config = _resolve_financial_config(
        db,
        country_id=country.id,
        zone_id=zone.id,
        locality_id=data.locality_id,
        service_family=service_family,
    )
    applied_vat_percentage = get_tax_rule(
        db,
        country_code=country.code,
        service_type=service_tax_type,
        locality_slug=locality.slug if locality else None,
    )

    adjusted_subtotal = _round_amount(
        (base_price + resource_subtotal)
        * zone_coefficient
        * urgency_coefficient
        * service_level_coefficient
        * legislation_coefficient
    )
    minimum_order_applied = False
    if data.requested_quantity is not None:
        if config.minimum_quantity_threshold <= 0 or data.requested_quantity >= config.minimum_quantity_threshold:
            adjusted_subtotal = _round_amount(adjusted_subtotal * data.requested_quantity)
    concrete_extras = _build_concrete_extras(
        resource_rows,
        requested_quantity=data.requested_quantity,
        financial_config=financial_config,
        service_family=service_family,
    )
    cost_layers = _build_cost_layers(
        adjusted_subtotal,
        config,
        financial_config=financial_config,
        vat_percentage=applied_vat_percentage,
        concrete_extras=concrete_extras,
        resource_mix=resource_mix,
    )
    if (
        data.requested_quantity is not None
        and config.minimum_quantity_threshold > 0
        and data.requested_quantity < config.minimum_quantity_threshold
    ):
        current_gross_total = cost_layers["gross_total"]
        updated_layers = _apply_minimum_order_to_layers(
            cost_layers,
            config,
            config.minimum_order_value,
            financial_config=financial_config,
            vat_percentage=applied_vat_percentage,
            resource_mix=resource_mix,
        )
        minimum_order_applied = updated_layers["gross_total"] != current_gross_total
        cost_layers = updated_layers

    analysis = PriceAnalysis(
        service_id=service.id,
        admin_price_config_id=config.id,
        country_id=country.id,
        zone_id=zone.id,
        locality_id=data.locality_id,
        currency=config.currency,
        legislation_code=config.legislation_code,
        service_level=data.service_level.value,
        recipe_level=data.recipe_level.value,
        urgency=data.urgency,
        activity_count=len(selected_activities),
        subcategory_count=len(service.subcategory_ids),
        uses_recipe_engine=bool(recipe_resource_rows),
        resource_subtotal=resource_subtotal,
        base_price=base_price,
        zone_coefficient=zone_coefficient,
        urgency_coefficient=urgency_coefficient,
        service_level_coefficient=service_level_coefficient,
        legislation_coefficient=legislation_coefficient,
        indirect_cost_percentage=financial_config.indirect_cost_percentage if financial_config else config.indirect_cost_percentage,
        platform_maintenance_percentage=financial_config.platform_fee_percentage if financial_config else config.platform_maintenance_percentage,
        mydarrin_platform_percentage=config.mydarrin_platform_percentage,
        escrow_retention_percentage=financial_config.escrow_guarantee_percentage if financial_config else config.escrow_retention_percentage,
        insurance_premium_fixed=financial_config.insurance_fixed_amount if financial_config else config.insurance_premium_fixed,
        insurance_premium_percentage=financial_config.insurance_percentage if financial_config else config.insurance_premium_percentage,
        darrin_management_fee_fixed=config.darrin_management_fee_fixed,
        darrin_management_fee_percentage=financial_config.mydarrin_commission_percentage if financial_config else config.darrin_management_fee_percentage,
        vat_percentage=applied_vat_percentage,
        platform_margin_coefficient=config.platform_margin_coefficient,
        vat_coefficient=applied_vat_percentage,
        cost_direct_total=cost_layers["direct_cost_value"],
        indirect_cost_value=cost_layers["indirect_cost_value"],
        platform_maintenance_value=cost_layers["platform_maintenance_value"],
        mydarrin_platform_value=cost_layers["mydarrin_platform_value"],
        escrow_retention_value=cost_layers["escrow_retention_value"],
        insurance_premium_value=cost_layers["insurance_premium_value"],
        darrin_management_fee_value=cost_layers["darrin_management_fee_value"],
        adjusted_subtotal=cost_layers["direct_cost_value"],
    )
    db.add(analysis)
    db.flush()

    calculation = CostCalculation(
        price_analysis_id=analysis.id,
        service_id=service.id,
        cost_direct_total=cost_layers["direct_cost_value"],
        indirect_cost_value=cost_layers["indirect_cost_value"],
        platform_maintenance_value=cost_layers["platform_maintenance_value"],
        mydarrin_platform_value=cost_layers["mydarrin_platform_value"],
        escrow_retention_value=cost_layers["escrow_retention_value"],
        insurance_premium_value=cost_layers["insurance_premium_value"],
        darrin_management_fee_value=cost_layers["darrin_management_fee_value"],
        net_total=cost_layers["net_total"],
        platform_margin_value=cost_layers["mydarrin_platform_value"],
        vat_value=cost_layers["vat_value"],
        gross_total=cost_layers["gross_total"],
        currency=config.currency,
    )
    db.add(calculation)
    db.flush()

    resources: list[Resource] = []
    for row in resource_rows:
        resource = Resource(cost_calculation_id=calculation.id, **row)
        db.add(resource)
        resources.append(resource)

    db.commit()
    db.refresh(analysis)
    db.refresh(calculation)
    for resource in resources:
        db.refresh(resource)

    return CostDraftResponse(
        service_id=service.id,
        service_name=service.name,
        service_slug=service.slug,
        subcategory_ids=service.subcategory_ids,
        activity_ids=[activity.id for activity in selected_activities],
        country_id=country.id,
        zone_id=zone.id,
        locality_id=data.locality_id,
        currency=config.currency,
        legislation_code=config.legislation_code,
        service_level=data.service_level,
        urgency=data.urgency,
        requested_quantity=data.requested_quantity,
        target_address=data.target_address,
        minimum_order_applied=minimum_order_applied,
        availability_status="available",
        price_analysis=PriceAnalysisResponse(
            id=analysis.id,
            admin_price_config_id=analysis.admin_price_config_id,
            service_id=analysis.service_id,
            country_id=analysis.country_id,
            zone_id=analysis.zone_id,
            locality_id=analysis.locality_id,
            currency=analysis.currency,
            legislation_code=analysis.legislation_code,
            service_level=ServiceLevel(analysis.service_level),
            recipe_level=RecipeLevelName(analysis.recipe_level),
            urgency=analysis.urgency,
            activity_count=analysis.activity_count,
            subcategory_count=analysis.subcategory_count,
            uses_recipe_engine=analysis.uses_recipe_engine,
            resource_subtotal=analysis.resource_subtotal,
            base_price=analysis.base_price,
            zone_coefficient=analysis.zone_coefficient,
            urgency_coefficient=analysis.urgency_coefficient,
            service_level_coefficient=analysis.service_level_coefficient,
            legislation_coefficient=analysis.legislation_coefficient,
            indirect_cost_percentage=analysis.indirect_cost_percentage,
            platform_maintenance_percentage=analysis.platform_maintenance_percentage,
            mydarrin_platform_percentage=analysis.mydarrin_platform_percentage,
            escrow_retention_percentage=analysis.escrow_retention_percentage,
            insurance_premium_fixed=analysis.insurance_premium_fixed,
            insurance_premium_percentage=analysis.insurance_premium_percentage,
            darrin_management_fee_fixed=analysis.darrin_management_fee_fixed,
            darrin_management_fee_percentage=analysis.darrin_management_fee_percentage,
            vat_percentage=analysis.vat_percentage,
            platform_margin_coefficient=analysis.platform_margin_coefficient,
            vat_coefficient=analysis.vat_coefficient,
            cost_direct_total=analysis.cost_direct_total,
            cost_direct=analysis.cost_direct_total,
            indirect_cost_value=analysis.indirect_cost_value,
            indirect_costs=analysis.indirect_cost_value,
            platform_maintenance_value=analysis.platform_maintenance_value,
            platform_maintenance_costs=analysis.platform_maintenance_value,
            mydarrin_platform_value=analysis.mydarrin_platform_value,
            escrow_retention_value=analysis.escrow_retention_value,
            insurance_premium_value=analysis.insurance_premium_value,
            darrin_management_fee_value=analysis.darrin_management_fee_value,
            platform_costs=(
                analysis.platform_maintenance_value
                + analysis.mydarrin_platform_value
                + analysis.darrin_management_fee_value
            ),
            adjusted_subtotal=analysis.adjusted_subtotal,
            final_price=calculation.gross_total,
            created_at=analysis.created_at,
        ),
        calculation=CostCalculationResponse(
            id=calculation.id,
            price_analysis_id=calculation.price_analysis_id,
            service_id=calculation.service_id,
            cost_direct_total=calculation.cost_direct_total,
            cost_direct=calculation.cost_direct_total,
            indirect_cost_value=calculation.indirect_cost_value,
            indirect_costs=calculation.indirect_cost_value,
            platform_maintenance_value=calculation.platform_maintenance_value,
            platform_maintenance_costs=calculation.platform_maintenance_value,
            mydarrin_platform_value=calculation.mydarrin_platform_value,
            escrow_retention_value=calculation.escrow_retention_value,
            insurance_premium_value=calculation.insurance_premium_value,
            darrin_management_fee_value=calculation.darrin_management_fee_value,
            platform_costs=(
                calculation.platform_maintenance_value
                + calculation.mydarrin_platform_value
                + calculation.darrin_management_fee_value
            ),
            net_total=calculation.net_total,
            platform_margin_value=calculation.platform_margin_value,
            vat_value=calculation.vat_value,
            gross_total=calculation.gross_total,
            final_price_net=calculation.net_total,
            final_price_gross=calculation.gross_total,
            final_price=calculation.gross_total,
            currency=calculation.currency,
            created_at=calculation.created_at,
            resources=_serialize_resources(resources),
        ),
        proforma_payload=_build_proforma_payload(
            service=service,
            currency=config.currency,
            cost_layers=cost_layers,
            resources=resources,
        ),
    )
