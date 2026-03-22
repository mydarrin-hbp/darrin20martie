from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, selectinload

from app.models.price_analysis import CatalogActivity, PriceAnalysisRecipe
from app.models.service import Service
from app.modules.cost_engine.models import AdminPriceConfig, CostCalculation, PriceAnalysis, Resource
from app.modules.cost_engine.schemas import (
    AdminPriceConfigCreate,
    AdminPriceConfigUpdate,
    CostCalculationResponse,
    CostDraftRequest,
    CostDraftResponse,
    PriceAnalysisResponse,
    ResourceCreate,
    ResourceResponse,
    ServiceLevel,
)
from app.modules.geography.models import Country, Locality, Zone
from app.schemas.price_analysis import RecipeLevelName
from app.services.price_analysis_service import (
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


def _build_cost_layers(direct_cost: float, config: AdminPriceConfig) -> dict[str, float]:
    indirect_cost_value = _round_amount(direct_cost * config.indirect_cost_percentage)
    platform_maintenance_value = _round_amount(direct_cost * config.platform_maintenance_percentage)
    mydarrin_platform_value = _round_amount(direct_cost * config.mydarrin_platform_percentage)
    net_total = _round_amount(direct_cost + indirect_cost_value + platform_maintenance_value + mydarrin_platform_value)
    vat_value = _round_amount(net_total * config.vat_percentage)
    gross_total = _round_amount(net_total + vat_value)
    return {
        "indirect_cost_value": indirect_cost_value,
        "platform_maintenance_value": platform_maintenance_value,
        "mydarrin_platform_value": mydarrin_platform_value,
        "net_total": net_total,
        "vat_value": vat_value,
        "gross_total": gross_total,
    }


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


def calculate_draft(db: Session, data: CostDraftRequest) -> CostDraftResponse | str:
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

    base_price = _round_amount(config.base_price)
    zone_coefficient = config.zone_coefficient_override or float(zone.multiplier)
    urgency_coefficient = config.urgency_coefficient if data.urgency else 1.0
    service_level_coefficient = _get_service_level_coefficient(config, data.service_level)
    legislation_coefficient = config.legislation_coefficient

    adjusted_subtotal = _round_amount(
        (base_price + resource_subtotal)
        * zone_coefficient
        * urgency_coefficient
        * service_level_coefficient
        * legislation_coefficient
    )
    cost_layers = _build_cost_layers(adjusted_subtotal, config)

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
        indirect_cost_percentage=config.indirect_cost_percentage,
        platform_maintenance_percentage=config.platform_maintenance_percentage,
        mydarrin_platform_percentage=config.mydarrin_platform_percentage,
        vat_percentage=config.vat_percentage,
        platform_margin_coefficient=config.platform_margin_coefficient,
        vat_coefficient=config.vat_coefficient,
        cost_direct_total=adjusted_subtotal,
        indirect_cost_value=cost_layers["indirect_cost_value"],
        platform_maintenance_value=cost_layers["platform_maintenance_value"],
        mydarrin_platform_value=cost_layers["mydarrin_platform_value"],
        adjusted_subtotal=adjusted_subtotal,
    )
    db.add(analysis)
    db.flush()

    calculation = CostCalculation(
        price_analysis_id=analysis.id,
        service_id=service.id,
        cost_direct_total=adjusted_subtotal,
        indirect_cost_value=cost_layers["indirect_cost_value"],
        platform_maintenance_value=cost_layers["platform_maintenance_value"],
        mydarrin_platform_value=cost_layers["mydarrin_platform_value"],
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
            platform_costs=analysis.platform_maintenance_value + analysis.mydarrin_platform_value,
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
            platform_costs=calculation.platform_maintenance_value + calculation.mydarrin_platform_value,
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
    )
