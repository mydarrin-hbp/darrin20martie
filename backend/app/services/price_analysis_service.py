from __future__ import annotations

import csv
import io
import json
from pathlib import Path

from sqlalchemy import Select, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, selectinload

from app.models.category import Category
from app.models.domain import Domain
from app.models.price_analysis import (
    AdminResourcePriceConfig,
    CatalogActivity,
    CatalogResource,
    EntityAttachment,
    PriceAnalysisRecipe,
)
from app.models.service import Service
from app.models.subcategory import SubCategory
from app.modules.geography.models import Country, Locality, Zone
from app.schemas.price_analysis import (
    ActivityImportResponse,
    AdminResourcePriceConfigCreate,
    AdminResourcePriceConfigResponse,
    AdminResourcePriceConfigUpdate,
    CatalogActivityCreate,
    CatalogActivityResponse,
    CatalogActivityUpdate,
    CatalogResourceCreate,
    CatalogResourceResponse,
    CatalogResourceUpdate,
    EntityAttachmentResponse,
    IndicatorCalculationResponse,
    IndicatorResourceRow,
    PriceAnalysisRecipeCreate,
    PriceAnalysisRecipeImportResponse,
    PriceAnalysisRecipeResponse,
    PriceAnalysisRecipeUpdate,
    RecipeLevelName,
    ResourceType,
)
from app.services.xlsx_reader import read_xlsx_rows


def _validate_taxonomy_context(
    db: Session,
    *,
    domain_id: int,
    category_id: int,
    subcategory_id: int,
) -> bool:
    category = db.get(Category, category_id)
    subcategory = db.get(SubCategory, subcategory_id)
    return bool(
        category
        and subcategory
        and category.domain_id == domain_id
        and subcategory.category_id == category_id
    )


def _serialize_activity(activity: CatalogActivity) -> CatalogActivityResponse:
    return CatalogActivityResponse.model_validate(activity)


def _serialize_resource(resource: CatalogResource) -> CatalogResourceResponse:
    return CatalogResourceResponse.model_validate(resource)


def _serialize_resource_price_config(config: AdminResourcePriceConfig) -> AdminResourcePriceConfigResponse:
    return AdminResourcePriceConfigResponse(
        id=config.id,
        resource_id=config.resource_id,
        country_id=config.country_id,
        zone_id=config.zone_id,
        locality_id=config.locality_id,
        currency=config.currency,
        base_price=config.base_price,
        zone_multiplier=config.zone_multiplier,
        legislation_code=config.legislation_code,
        is_active=config.is_active,
        resource_name_ro=config.resource.name_ro,
        resource_type=ResourceType(config.resource.resource_type),
    )


def _serialize_recipe(recipe: PriceAnalysisRecipe) -> PriceAnalysisRecipeResponse:
    return PriceAnalysisRecipeResponse(
        id=recipe.id,
        activity_id=recipe.activity_id,
        resource_id=recipe.resource_id,
        specific_consumption=recipe.specific_consumption,
        productivity_norm=recipe.productivity_norm,
        indicator_code=recipe.indicator_code,
        consumption_unit=recipe.consumption_unit,
        waste_percentage=recipe.waste_percentage,
        waste_formula=recipe.waste_formula,
        coefficient_bronz=recipe.coefficient_bronz,
        coefficient_argint=recipe.coefficient_argint,
        coefficient_aur=recipe.coefficient_aur,
        coefficient_platinum=recipe.coefficient_platinum,
        level_coefficients=recipe.level_coefficients,
        caen_nace_link=recipe.caen_nace_link,
        is_essential=recipe.is_essential,
        activity_name_ro=recipe.activity.name_ro,
        resource_name_ro=recipe.resource.name_ro,
        resource_type=ResourceType(recipe.resource.resource_type),
        resource_unit=recipe.resource.unit,
        resource_base_price=recipe.resource.base_price,
        esco_code=recipe.resource.esco_code,
    )


def _serialize_entity_attachment(attachment: EntityAttachment) -> EntityAttachmentResponse:
    return EntityAttachmentResponse(
        id=attachment.id,
        entity_type=attachment.entity_type,
        entity_id=attachment.entity_id,
        attachment_type=attachment.attachment_type,
        level_name=attachment.level_name,
        file_name=attachment.file_name,
        mime_type=attachment.mime_type,
        secure_url=attachment.secure_url,
        created_at=attachment.created_at,
    )


def _build_caen_nace_link(activity: CatalogActivity) -> dict:
    domain = activity.domain
    category = activity.category
    subcategory = activity.subcategory
    return {
        "domain_id": activity.domain_id,
        "category_id": activity.category_id,
        "subcategory_id": activity.subcategory_id,
        "caen_codes": list(dict.fromkeys((domain.caen_codes or []) + (category.caen_codes or []) + (subcategory.caen_codes or []))),
        "nace_codes": list(dict.fromkeys(domain.caen_codes or [])),
    }


def _build_level_coefficients(payload: dict) -> dict:
    return {
        "BRONZ": float(payload["coefficient_bronz"]),
        "ARGINT": float(payload["coefficient_argint"]),
        "AUR": float(payload["coefficient_aur"]),
        "PLATINUM": float(payload["coefficient_platinum"]),
    }


def list_activities(
    db: Session,
    *,
    domain_id: int | None = None,
    category_id: int | None = None,
    subcategory_id: int | None = None,
):
    query: Select[tuple[CatalogActivity]] = select(CatalogActivity)
    if domain_id is not None:
        query = query.where(CatalogActivity.domain_id == domain_id)
    if category_id is not None:
        query = query.where(CatalogActivity.category_id == category_id)
    if subcategory_id is not None:
        query = query.where(CatalogActivity.subcategory_id == subcategory_id)
    activities = db.execute(query.order_by(CatalogActivity.uniclass_code, CatalogActivity.id)).scalars().all()
    return [_serialize_activity(activity) for activity in activities]


def get_activity(db: Session, activity_id: int):
    activity = db.get(CatalogActivity, activity_id)
    return _serialize_activity(activity) if activity else None


def get_activity_by_uniclass_code(db: Session, uniclass_code: str):
    return db.execute(
        select(CatalogActivity).where(CatalogActivity.uniclass_code == uniclass_code.strip())
    ).scalar_one_or_none()


def create_activity(db: Session, data: CatalogActivityCreate):
    if not _validate_taxonomy_context(
        db,
        domain_id=data.domain_id,
        category_id=data.category_id,
        subcategory_id=data.subcategory_id,
    ):
        return "invalid_taxonomy_context"

    db_activity = CatalogActivity(**data.model_dump())
    db.add(db_activity)
    try:
        db.commit()
        db.refresh(db_activity)
        return _serialize_activity(db_activity)
    except IntegrityError:
        db.rollback()
        return "duplicate_uniclass_code"


def update_activity(db: Session, activity_id: int, data: CatalogActivityUpdate):
    activity = db.get(CatalogActivity, activity_id)
    if not activity:
        return None

    update_data = data.model_dump(exclude_unset=True)
    if {"domain_id", "category_id", "subcategory_id"} & update_data.keys():
        target_domain_id = update_data.get("domain_id", activity.domain_id)
        target_category_id = update_data.get("category_id", activity.category_id)
        target_subcategory_id = update_data.get("subcategory_id", activity.subcategory_id)
        if not _validate_taxonomy_context(
            db,
            domain_id=target_domain_id,
            category_id=target_category_id,
            subcategory_id=target_subcategory_id,
        ):
            return "invalid_taxonomy_context"

    for field, value in update_data.items():
        setattr(activity, field, value)

    try:
        db.commit()
        db.refresh(activity)
        return _serialize_activity(activity)
    except IntegrityError:
        db.rollback()
        return "duplicate_uniclass_code"


def delete_activity(db: Session, activity_id: int):
    activity = db.get(CatalogActivity, activity_id)
    if not activity:
        return None
    db.delete(activity)
    db.commit()
    return True


def list_resources(db: Session, *, resource_type: ResourceType | None = None):
    query: Select[tuple[CatalogResource]] = select(CatalogResource)
    if resource_type is not None:
        query = query.where(CatalogResource.resource_type == resource_type.value)
    resources = db.execute(query.order_by(CatalogResource.name_ro, CatalogResource.id)).scalars().all()
    return [_serialize_resource(resource) for resource in resources]


def get_resource(db: Session, resource_id: int):
    resource = db.get(CatalogResource, resource_id)
    return _serialize_resource(resource) if resource else None


def create_resource(db: Session, data: CatalogResourceCreate):
    payload = data.model_dump()
    payload["resource_type"] = data.resource_type.value
    db_resource = CatalogResource(**payload)
    db.add(db_resource)
    db.commit()
    db.refresh(db_resource)
    return _serialize_resource(db_resource)


def update_resource(db: Session, resource_id: int, data: CatalogResourceUpdate):
    resource = db.get(CatalogResource, resource_id)
    if not resource:
        return None

    for field, value in data.model_dump(exclude_unset=True).items():
        if field == "resource_type" and value is not None:
            value = value.value
        setattr(resource, field, value)

    db.commit()
    db.refresh(resource)
    return _serialize_resource(resource)


def delete_resource(db: Session, resource_id: int):
    resource = db.get(CatalogResource, resource_id)
    if not resource:
        return None
    db.delete(resource)
    db.commit()
    return True


def _find_existing_resource_price_config(
    db: Session,
    *,
    resource_id: int,
    country_id: int,
    zone_id: int | None,
    locality_id: int | None,
    currency: str,
    legislation_code: str,
    exclude_id: int | None = None,
):
    query = select(AdminResourcePriceConfig).where(
        AdminResourcePriceConfig.resource_id == resource_id,
        AdminResourcePriceConfig.country_id == country_id,
        AdminResourcePriceConfig.currency == currency.upper(),
        AdminResourcePriceConfig.legislation_code == legislation_code.upper(),
    )
    if zone_id is None:
        query = query.where(AdminResourcePriceConfig.zone_id.is_(None))
    else:
        query = query.where(AdminResourcePriceConfig.zone_id == zone_id)
    if locality_id is None:
        query = query.where(AdminResourcePriceConfig.locality_id.is_(None))
    else:
        query = query.where(AdminResourcePriceConfig.locality_id == locality_id)
    if exclude_id is not None:
        query = query.where(AdminResourcePriceConfig.id != exclude_id)
    return db.execute(query).scalar_one_or_none()


def list_resource_price_configs(
    db: Session,
    *,
    resource_id: int | None = None,
    country_id: int | None = None,
    locality_id: int | None = None,
):
    query: Select[tuple[AdminResourcePriceConfig]] = select(AdminResourcePriceConfig).options(
        selectinload(AdminResourcePriceConfig.resource)
    )
    if resource_id is not None:
        query = query.where(AdminResourcePriceConfig.resource_id == resource_id)
    if country_id is not None:
        query = query.where(AdminResourcePriceConfig.country_id == country_id)
    if locality_id is not None:
        query = query.where(AdminResourcePriceConfig.locality_id == locality_id)
    configs = db.execute(
        query.order_by(AdminResourcePriceConfig.resource_id, AdminResourcePriceConfig.country_id, AdminResourcePriceConfig.id)
    ).scalars().all()
    return [_serialize_resource_price_config(item) for item in configs]


def create_resource_price_config(db: Session, data: AdminResourcePriceConfigCreate):
    resource = db.get(CatalogResource, data.resource_id)
    if not resource:
        return "resource_not_found"
    country = db.get(Country, data.country_id)
    if not country:
        return "country_not_found"
    if data.zone_id is not None:
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
        if data.zone_id is not None and locality.zone_id != data.zone_id:
            return "locality_zone_mismatch"

    existing = _find_existing_resource_price_config(
        db,
        resource_id=data.resource_id,
        country_id=data.country_id,
        zone_id=data.zone_id,
        locality_id=data.locality_id,
        currency=data.currency,
        legislation_code=data.legislation_code,
    )
    if existing:
        return "duplicate_context"

    config = AdminResourcePriceConfig(**data.model_dump())
    config.currency = config.currency.upper()
    config.legislation_code = config.legislation_code.upper()
    db.add(config)
    try:
        db.commit()
        config = db.execute(
            select(AdminResourcePriceConfig)
            .options(selectinload(AdminResourcePriceConfig.resource))
            .where(AdminResourcePriceConfig.id == config.id)
        ).scalar_one()
        return _serialize_resource_price_config(config)
    except IntegrityError:
        db.rollback()
        return "duplicate_context"


def update_resource_price_config(db: Session, config_id: int, data: AdminResourcePriceConfigUpdate):
    config = db.get(AdminResourcePriceConfig, config_id)
    if not config:
        return None

    update_data = data.model_dump(exclude_unset=True)
    target_zone_id = update_data.get("zone_id", config.zone_id)
    target_locality_id = update_data.get("locality_id", config.locality_id)
    target_country_id = config.country_id
    if target_zone_id is not None:
        zone = db.get(Zone, target_zone_id)
        if not zone:
            return "zone_not_found"
        if zone.country_id != target_country_id:
            return "zone_country_mismatch"
    if target_locality_id is not None:
        locality = db.get(Locality, target_locality_id)
        if not locality:
            return "locality_not_found"
        if locality.country_id != target_country_id:
            return "locality_country_mismatch"
        if target_zone_id is not None and locality.zone_id != target_zone_id:
            return "locality_zone_mismatch"

    for field, value in update_data.items():
        if field == "currency" and value is not None:
            value = value.upper()
        if field == "legislation_code" and value is not None:
            value = value.upper()
        setattr(config, field, value)

    existing = _find_existing_resource_price_config(
        db,
        resource_id=config.resource_id,
        country_id=config.country_id,
        zone_id=config.zone_id,
        locality_id=config.locality_id,
        currency=config.currency,
        legislation_code=config.legislation_code,
        exclude_id=config.id,
    )
    if existing:
        db.rollback()
        return "duplicate_context"

    try:
        db.commit()
        config = db.execute(
            select(AdminResourcePriceConfig)
            .options(selectinload(AdminResourcePriceConfig.resource))
            .where(AdminResourcePriceConfig.id == config.id)
        ).scalar_one()
        return _serialize_resource_price_config(config)
    except IntegrityError:
        db.rollback()
        return "duplicate_context"


def delete_resource_price_config(db: Session, config_id: int):
    config = db.get(AdminResourcePriceConfig, config_id)
    if not config:
        return None
    db.delete(config)
    db.commit()
    return True


def resolve_resource_unit_price(
    db: Session,
    *,
    resource: CatalogResource,
    country_id: int | None = None,
    zone_id: int | None = None,
    locality_id: int | None = None,
    currency: str | None = None,
    legislation_code: str | None = None,
) -> tuple[float, dict]:
    if not all([country_id, currency, legislation_code]):
        return float(resource.base_price), {"source": "catalog_resource_base_price"}

    normalized_currency = currency.upper()
    normalized_legislation = legislation_code.upper()
    configs = db.execute(
        select(AdminResourcePriceConfig).where(
            AdminResourcePriceConfig.resource_id == resource.id,
            AdminResourcePriceConfig.country_id == country_id,
            AdminResourcePriceConfig.currency == normalized_currency,
            AdminResourcePriceConfig.legislation_code == normalized_legislation,
            AdminResourcePriceConfig.is_active.is_(True),
        )
    ).scalars().all()

    selected = None
    for candidate in configs:
        if locality_id is not None and candidate.locality_id == locality_id:
            selected = candidate
            break
    if selected is None:
        for candidate in configs:
            if candidate.locality_id is None and candidate.zone_id == zone_id:
                selected = candidate
                break
    if selected is None:
        for candidate in configs:
            if candidate.locality_id is None and candidate.zone_id is None:
                selected = candidate
                break
    if selected is None:
        for candidate in configs:
            if candidate.zone_id == zone_id:
                selected = candidate
                break

    if not selected:
        return float(resource.base_price), {"source": "catalog_resource_base_price"}

    return (
        float(selected.base_price) * float(selected.zone_multiplier),
        {
            "source": "admin_resource_price_config",
            "config_id": selected.id,
            "currency": selected.currency,
            "country_id": selected.country_id,
            "zone_id": selected.zone_id,
            "locality_id": selected.locality_id,
            "legislation_code": selected.legislation_code,
            "zone_multiplier": float(selected.zone_multiplier),
        },
    )


def normalize_supplier_location_geo(value) -> dict:
    if isinstance(value, dict):
        return value
    if isinstance(value, str):
        try:
            parsed = json.loads(value)
            if isinstance(parsed, dict):
                return parsed
        except json.JSONDecodeError:
            return {}
    return {}


def supplier_matches_geo(
    supplier,
    *,
    country: Country,
    zone: Zone,
    locality: Locality | None,
) -> bool:
    if supplier is None:
        return True
    if not supplier.is_active:
        return False

    location_geo = normalize_supplier_location_geo(getattr(supplier, "location_geo", None))
    if not location_geo:
        return True

    country_codes = {str(item).upper() for item in location_geo.get("country_codes", []) if str(item).strip()}
    zone_slugs = {str(item).lower() for item in location_geo.get("zone_slugs", []) if str(item).strip()}
    locality_slugs = {str(item).lower() for item in location_geo.get("locality_slugs", []) if str(item).strip()}

    if country_codes and country.code.upper() not in country_codes:
        return False
    if zone_slugs and zone.slug.lower() not in zone_slugs:
        return False
    if locality and locality_slugs and locality.slug.lower() not in locality_slugs:
        return False
    return True


def evaluate_recipe_geo_availability(
    recipe_rows: list[PriceAnalysisRecipe],
    *,
    country: Country,
    zone: Zone,
    locality: Locality | None,
) -> dict | None:
    critical_types = {ResourceType.LABOR.value, ResourceType.MATERIAL.value, ResourceType.TRANSPORT.value}
    required_types: set[str] = set()
    available_types: set[str] = set()

    for recipe in recipe_rows:
        resource = recipe.resource
        resource_type = (resource.resource_type or "").upper()
        if resource_type not in critical_types:
            continue
        if not recipe.is_essential and resource_type not in {ResourceType.LABOR.value, ResourceType.MATERIAL.value, ResourceType.TRANSPORT.value}:
            continue
        required_types.add(resource_type)

        if not resource.is_active:
            continue
        if resource.stock_qty is not None and resource.stock_qty <= 0:
            continue
        if str(resource.availability_status or "IN_STOCK").upper() in {"OUT_OF_STOCK", "UNAVAILABLE", "BLOCKED"}:
            continue
        if not supplier_matches_geo(getattr(resource, "supplier", None), country=country, zone=zone, locality=locality):
            continue
        available_types.add(resource_type)

    if not required_types:
        return None

    missing_types = sorted(required_types - available_types)
    if not missing_types:
        return None

    available_sorted = sorted(available_types)
    if available_sorted == [ResourceType.LABOR.value]:
        message = "Doar manopera disponibila pentru adresa de executie selectata."
    elif available_sorted == [ResourceType.MATERIAL.value]:
        message = "Doar materialele sunt disponibile pentru adresa de executie selectata."
    elif available_sorted == [ResourceType.TRANSPORT.value]:
        message = "Doar transportul este disponibil pentru adresa de executie selectata."
    elif available_sorted:
        message = f"Disponibilitate partiala pentru adresa de executie: lipsesc {', '.join(missing_types)}."
    else:
        message = "Serviciul este indisponibil la adresa de executie selectata."

    return {
        "status": "partial_available" if available_sorted else "resource_unavailable",
        "message": message,
        "available_resource_types": available_sorted,
        "missing_resource_types": missing_types,
    }


def list_recipes(db: Session, *, activity_id: int | None = None):
    query: Select[tuple[PriceAnalysisRecipe]] = select(PriceAnalysisRecipe).options(
        selectinload(PriceAnalysisRecipe.activity),
        selectinload(PriceAnalysisRecipe.resource),
    )
    if activity_id is not None:
        query = query.where(PriceAnalysisRecipe.activity_id == activity_id)
    recipes = db.execute(query.order_by(PriceAnalysisRecipe.id)).scalars().all()
    return [_serialize_recipe(recipe) for recipe in recipes]


def create_recipe(db: Session, data: PriceAnalysisRecipeCreate):
    activity = db.execute(
        select(CatalogActivity)
        .options(
            selectinload(CatalogActivity.domain),
            selectinload(CatalogActivity.category),
            selectinload(CatalogActivity.subcategory),
        )
        .where(CatalogActivity.id == data.activity_id)
    ).scalar_one_or_none()
    if not activity:
        return "activity_not_found"
    if not db.get(CatalogResource, data.resource_id):
        return "resource_not_found"

    payload = data.model_dump()
    payload["consumption_unit"] = payload.get("consumption_unit") or activity.uom
    payload["level_coefficients"] = payload.get("level_coefficients") or _build_level_coefficients(payload)
    payload["caen_nace_link"] = payload.get("caen_nace_link") or _build_caen_nace_link(activity)
    recipe = PriceAnalysisRecipe(**payload)
    db.add(recipe)
    try:
        db.commit()
        recipe = db.execute(
            select(PriceAnalysisRecipe)
            .options(selectinload(PriceAnalysisRecipe.activity), selectinload(PriceAnalysisRecipe.resource))
            .where(PriceAnalysisRecipe.id == recipe.id)
        ).scalar_one()
        return _serialize_recipe(recipe)
    except IntegrityError:
        db.rollback()
        return "duplicate_recipe"


def update_recipe(db: Session, recipe_id: int, data: PriceAnalysisRecipeUpdate):
    recipe = db.get(PriceAnalysisRecipe, recipe_id)
    if not recipe:
        return None

    update_data = data.model_dump(exclude_unset=True)
    activity = None
    if "activity_id" in update_data:
        activity = db.execute(
            select(CatalogActivity)
            .options(
                selectinload(CatalogActivity.domain),
                selectinload(CatalogActivity.category),
                selectinload(CatalogActivity.subcategory),
            )
            .where(CatalogActivity.id == update_data["activity_id"])
        ).scalar_one_or_none()
        if not activity:
            return "activity_not_found"
    if "resource_id" in update_data and not db.get(CatalogResource, update_data["resource_id"]):
        return "resource_not_found"

    if any(field in update_data for field in ("coefficient_bronz", "coefficient_argint", "coefficient_aur", "coefficient_platinum")):
        merged = {
            "coefficient_bronz": update_data.get("coefficient_bronz", recipe.coefficient_bronz),
            "coefficient_argint": update_data.get("coefficient_argint", recipe.coefficient_argint),
            "coefficient_aur": update_data.get("coefficient_aur", recipe.coefficient_aur),
            "coefficient_platinum": update_data.get("coefficient_platinum", recipe.coefficient_platinum),
        }
        update_data["level_coefficients"] = update_data.get("level_coefficients") or _build_level_coefficients(merged)

    if "consumption_unit" not in update_data:
        activity_for_unit = activity or recipe.activity
        update_data["consumption_unit"] = recipe.consumption_unit or activity_for_unit.uom

    if "caen_nace_link" not in update_data:
        activity_for_link = activity or db.execute(
            select(CatalogActivity)
            .options(
                selectinload(CatalogActivity.domain),
                selectinload(CatalogActivity.category),
                selectinload(CatalogActivity.subcategory),
            )
            .where(CatalogActivity.id == recipe.activity_id)
        ).scalar_one()
        update_data["caen_nace_link"] = _build_caen_nace_link(activity_for_link)

    for field, value in update_data.items():
        setattr(recipe, field, value)

    try:
        db.commit()
        recipe = db.execute(
            select(PriceAnalysisRecipe)
            .options(selectinload(PriceAnalysisRecipe.activity), selectinload(PriceAnalysisRecipe.resource))
            .where(PriceAnalysisRecipe.id == recipe.id)
        ).scalar_one()
        return _serialize_recipe(recipe)
    except IntegrityError:
        db.rollback()
        return "duplicate_recipe"


def delete_recipe(db: Session, recipe_id: int):
    recipe = db.get(PriceAnalysisRecipe, recipe_id)
    if not recipe:
        return None
    db.delete(recipe)
    db.commit()
    return True


def _normalize_name(value: str) -> str:
    return " ".join((value or "").strip().split())


def _infer_taxonomy_for_activity(db: Session, title: str) -> tuple[int, int, int] | None:
    normalized = title.lower()
    keyword_map = [
        ("smart", "sisteme-smart-home"),
        ("automation", "sisteme-smart-home"),
        ("solar", "montaj-panouri-invertoare"),
        ("photovolta", "montaj-panouri-invertoare"),
        ("transport", "logistica-last-mile"),
        ("logistic", "logistica-last-mile"),
        ("repair", "diagnoza-mentenanta-utilaje"),
        ("maintenance", "diagnoza-mentenanta-utilaje"),
        ("finish", "finisaje-interioare-exterioare"),
        ("structure", "executie-structuri-fundatii"),
        ("foundation", "executie-structuri-fundatii"),
    ]
    for keyword, slug in keyword_map:
        if keyword in normalized:
            subcategory = db.execute(select(SubCategory).where(SubCategory.slug == slug)).scalar_one_or_none()
            if subcategory:
                category = db.get(Category, subcategory.category_id)
                return category.domain_id, category.id, subcategory.id

    first_subcategory = db.execute(select(SubCategory).order_by(SubCategory.id)).scalar_one_or_none()
    if not first_subcategory:
        return None
    category = db.get(Category, first_subcategory.category_id)
    return category.domain_id, category.id, first_subcategory.id


def _read_uniclass_csv(content: bytes) -> list[dict[str, str]]:
    return list(csv.DictReader(io.StringIO(content.decode("utf-8-sig"))))


def _read_uniclass_xlsx(content: bytes) -> list[dict[str, str]]:
    return read_xlsx_rows(content, required_headers={"Code", "Title"})


def parse_uniclass_import_file(filename: str, content: bytes) -> list[dict[str, str]]:
    suffix = Path(filename).suffix.lower()
    if suffix == ".csv":
        return _read_uniclass_csv(content)
    if suffix in {".xlsx", ".xlsm"}:
        return _read_uniclass_xlsx(content)
    raise ValueError("Unsupported file format. Please upload CSV or XLSX.")


def parse_indicator_import_file(filename: str, content: bytes) -> list[dict[str, str]]:
    suffix = Path(filename).suffix.lower()
    if suffix == ".csv":
        return _read_uniclass_csv(content)
    if suffix in {".xlsx", ".xlsm"}:
        return read_xlsx_rows(content, sheet_name="Sheet1")
    raise ValueError("Unsupported file format. Please upload CSV or XLSX.")


def import_uniclass_activities(
    db: Session,
    rows: list[dict[str, str]],
    *,
    domain_id: int | None = None,
    category_id: int | None = None,
    subcategory_id: int | None = None,
    default_uom: str = "unit",
):
    result = ActivityImportResponse()
    explicit_context = None
    if domain_id and category_id and subcategory_id:
        explicit_context = (domain_id, category_id, subcategory_id)
        if not _validate_taxonomy_context(
            db,
            domain_id=domain_id,
            category_id=category_id,
            subcategory_id=subcategory_id,
        ):
            return "invalid_taxonomy_context"

    for row in rows:
        uniclass_code = (row.get("Code") or row.get("code") or "").strip()
        title = _normalize_name(row.get("Title") or row.get("title") or "")
        if not uniclass_code or not title:
            result.skipped += 1
            continue

        context = explicit_context or _infer_taxonomy_for_activity(db, title)
        if not context:
            result.skipped += 1
            continue
        activity_domain_id, activity_category_id, activity_subcategory_id = context

        payload = {
            "uniclass_code": uniclass_code,
            "name_ro": title,
            "name_en": title,
            "uom": default_uom,
            "domain_id": activity_domain_id,
            "category_id": activity_category_id,
            "subcategory_id": activity_subcategory_id,
            "description": _normalize_name(row.get("Group") or row.get("Section") or ""),
            "is_active": True,
        }
        existing = get_activity_by_uniclass_code(db, uniclass_code)
        if existing:
            updated = update_activity(db, existing.id, CatalogActivityUpdate(**payload))
            if isinstance(updated, str):
                result.skipped += 1
            else:
                result.updated += 1
        else:
            created = create_activity(db, CatalogActivityCreate(**payload))
            if isinstance(created, str):
                result.skipped += 1
            else:
                result.created += 1

    return result


def get_service_recipe_activities(db: Session, service_id: int) -> list[CatalogActivity]:
    service = db.execute(
        select(Service).options(selectinload(Service.subcategories)).where(Service.id == service_id)
    ).scalar_one_or_none()
    if not service:
        return []

    subcategory_ids = [subcategory.id for subcategory in service.subcategories]
    if not subcategory_ids:
        return []

    return db.execute(
        select(CatalogActivity)
        .where(
            CatalogActivity.subcategory_id.in_(subcategory_ids),
            CatalogActivity.is_active.is_(True),
        )
        .order_by(CatalogActivity.uniclass_code, CatalogActivity.id)
    ).scalars().all()


def get_recipe_rows_for_activities(db: Session, activity_ids: list[int]) -> list[PriceAnalysisRecipe]:
    if not activity_ids:
        return []
    unique_ids = list(dict.fromkeys(activity_ids))
    return db.execute(
        select(PriceAnalysisRecipe)
        .options(
            selectinload(PriceAnalysisRecipe.activity),
            selectinload(PriceAnalysisRecipe.resource),
        )
        .where(PriceAnalysisRecipe.activity_id.in_(unique_ids))
        .order_by(PriceAnalysisRecipe.activity_id, PriceAnalysisRecipe.id)
    ).scalars().all()


def get_recipe_coefficient(recipe: PriceAnalysisRecipe, level: RecipeLevelName) -> float:
    normalized_level = level.value if isinstance(level, RecipeLevelName) else str(level).upper()
    if recipe.level_coefficients and normalized_level in recipe.level_coefficients:
        return float(recipe.level_coefficients[normalized_level])
    if level == RecipeLevelName.BRONZ:
        return recipe.coefficient_bronz
    if level == RecipeLevelName.ARGINT:
        return recipe.coefficient_argint
    if level == RecipeLevelName.AUR:
        return recipe.coefficient_aur
    return recipe.coefficient_platinum


def calculate_indicators_for_activity(
    db: Session,
    activity_id: int,
    level: RecipeLevelName,
    *,
    country_id: int | None = None,
    zone_id: int | None = None,
    locality_id: int | None = None,
    currency: str | None = None,
    legislation_code: str | None = None,
):
    activity = db.execute(
        select(CatalogActivity)
        .options(
            selectinload(CatalogActivity.domain),
            selectinload(CatalogActivity.category),
            selectinload(CatalogActivity.subcategory),
        )
        .where(CatalogActivity.id == activity_id)
    ).scalar_one_or_none()
    if not activity:
        return None

    recipes = db.execute(
        select(PriceAnalysisRecipe)
        .options(selectinload(PriceAnalysisRecipe.resource))
        .where(PriceAnalysisRecipe.activity_id == activity_id)
        .order_by(PriceAnalysisRecipe.id)
    ).scalars().all()

    rows: list[IndicatorResourceRow] = []
    total_estimated_cost = 0.0
    caen_nace_link = _build_caen_nace_link(activity)

    for recipe in recipes:
        if level == RecipeLevelName.BRONZ and not recipe.is_essential:
            continue
        applied_coefficient = get_recipe_coefficient(recipe, level)
        calculated_consumption = recipe.specific_consumption * applied_coefficient * (1 + (recipe.waste_percentage / 100))
        unit_price, _pricing_context = resolve_resource_unit_price(
            db,
            resource=recipe.resource,
            country_id=country_id,
            zone_id=zone_id,
            locality_id=locality_id,
            currency=currency,
            legislation_code=legislation_code,
        )
        estimated_cost = calculated_consumption * unit_price
        total_estimated_cost += estimated_cost
        rows.append(
            IndicatorResourceRow(
                recipe_id=recipe.id,
                resource_id=recipe.resource_id,
                resource_name_ro=recipe.resource.name_ro,
                resource_type=ResourceType(recipe.resource.resource_type),
                esco_code=recipe.resource.esco_code,
                specific_consumption=recipe.specific_consumption,
                calculated_consumption=round(calculated_consumption, 4),
                consumption_unit=recipe.consumption_unit or recipe.resource.unit or activity.uom,
                waste_percentage=recipe.waste_percentage,
                waste_formula=recipe.waste_formula,
                applied_coefficient=round(applied_coefficient, 4),
                level=level,
                base_price=round(unit_price, 2),
                estimated_cost=round(estimated_cost, 2),
                is_essential=recipe.is_essential,
            )
        )

    return IndicatorCalculationResponse(
        activity_id=activity.id,
        activity_name_ro=activity.name_ro,
        level=level,
        domain_id=activity.domain_id,
        category_id=activity.category_id,
        subcategory_id=activity.subcategory_id,
        caen_nace_link=caen_nace_link,
        pricing_context={
            "country_id": country_id,
            "zone_id": zone_id,
            "locality_id": locality_id,
            "currency": currency,
            "legislation_code": legislation_code,
        },
        total_estimated_cost=round(total_estimated_cost, 2),
        rows=rows,
    )


def import_historical_indicators(
    db: Session,
    rows: list[dict[str, str]],
    *,
    source_name: str,
    default_category_slug: str = "service-auto-flote",
) -> PriceAnalysisRecipeImportResponse:
    result = PriceAnalysisRecipeImportResponse()
    category = db.execute(select(Category).where(Category.slug == default_category_slug)).scalar_one_or_none()
    if not category:
        category = db.execute(select(Category).order_by(Category.id)).scalar_one_or_none()
    if not category:
        return result
    subcategory = db.execute(
        select(SubCategory).where(SubCategory.category_id == category.id).order_by(SubCategory.id)
    ).scalar_one_or_none()
    if not subcategory:
        return result
    domain = db.get(Domain, category.domain_id)

    current_activity = None
    historical_prefix = Path(source_name).stem.split(" ")[0].strip().upper()

    for row in rows:
        symbol = (row.get("Simbol") or row.get("simbol") or "").strip()
        denumire = _normalize_name(row.get("Denumire") or row.get("denumire") or "")
        um = (row.get("UM") or row.get("um") or "").strip() or "unit"
        quantity_raw = (row.get("Cantitatea") or row.get("cantitatea") or "").strip()
        price_raw = (row.get("Pretul unitar") or row.get("pretul unitar") or "").strip()
        if not symbol or not denumire:
            result.skipped += 1
            continue

        if historical_prefix and symbol.upper().startswith(historical_prefix):
            existing_activity = get_activity_by_uniclass_code(db, symbol)
            activity_payload = {
                "uniclass_code": symbol,
                "name_ro": denumire,
                "name_en": denumire,
                "uom": um,
                "domain_id": domain.id,
                "category_id": category.id,
                "subcategory_id": subcategory.id,
                "description": f"Indicator istoric importat din {source_name}",
                "is_active": True,
            }
            if existing_activity:
                current_activity = db.get(CatalogActivity, existing_activity.id)
                result.updated += 1
            else:
                created_activity = create_activity(db, CatalogActivityCreate(**activity_payload))
                if isinstance(created_activity, str):
                    result.skipped += 1
                    current_activity = None
                else:
                    current_activity = db.get(CatalogActivity, created_activity.id)
                    result.created += 1
            continue

        if current_activity is None:
            result.skipped += 1
            continue

        try:
            specific_consumption = float(quantity_raw.replace(",", ".")) if quantity_raw else 1.0
        except ValueError:
            specific_consumption = 1.0
        try:
            base_price = float(price_raw.replace(",", ".")) if price_raw else 0.0
        except ValueError:
            base_price = 0.0

        resource_type = ResourceType.MATERIAL
        normalized_name = denumire.lower()
        if any(keyword in normalized_name for keyword in ["transport", "camion", "autocamion"]):
            resource_type = ResourceType.TRANSPORT
        elif any(keyword in normalized_name for keyword in ["utilaj", "compresor", "generator", "pompa"]):
            resource_type = ResourceType.EQUIPMENT

        resource = db.execute(
            select(CatalogResource).where(
                CatalogResource.name_ro == denumire,
                CatalogResource.unit == um,
            )
        ).scalars().first()
        if not resource:
            created_resource = create_resource(
                db,
                CatalogResourceCreate(
                    esco_code=None,
                    name_ro=denumire,
                    name_en=denumire,
                    resource_type=resource_type,
                    base_price=base_price,
                    unit=um,
                    technical_specs={"source": "historical_indicator", "symbol": symbol, "file": source_name},
                    is_active=True,
                ),
            )
            resource = db.get(CatalogResource, created_resource.id)

        existing_recipe = db.execute(
            select(PriceAnalysisRecipe).where(
                PriceAnalysisRecipe.activity_id == current_activity.id,
                PriceAnalysisRecipe.resource_id == resource.id,
            )
        ).scalar_one_or_none()
        if existing_recipe:
            result.updated += 1
            continue

        created_recipe = create_recipe(
            db,
            PriceAnalysisRecipeCreate(
                activity_id=current_activity.id,
                resource_id=resource.id,
                specific_consumption=specific_consumption,
                consumption_unit=um,
                waste_percentage=0,
                waste_formula="historical_default",
                coefficient_bronz=0.9,
                coefficient_argint=1.0,
                coefficient_aur=1.12,
                coefficient_platinum=1.25,
                level_coefficients={"BRONZ": 0.9, "ARGINT": 1.0, "AUR": 1.12, "PLATINUM": 1.25},
                caen_nace_link={
                    "domain_id": domain.id,
                    "category_id": category.id,
                    "subcategory_id": subcategory.id,
                    "caen_codes": domain.caen_codes,
                    "nace_codes": domain.caen_codes,
                    "source_file": source_name,
                },
                is_essential=resource_type != ResourceType.EQUIPMENT,
            ),
        )
        if isinstance(created_recipe, str):
            result.skipped += 1
        else:
            result.created += 1

    return result


def import_resource_prices(
    db: Session,
    rows: list[dict[str, str]],
    *,
    source_name: str,
    country_id: int,
    currency: str,
    legislation_code: str,
    zone_id: int | None = None,
    locality_id: int | None = None,
) -> PriceAnalysisRecipeImportResponse | str:
    country = db.get(Country, country_id)
    if not country:
        return "country_not_found"
    if zone_id is not None:
        zone = db.get(Zone, zone_id)
        if not zone:
            return "zone_not_found"
        if zone.country_id != country.id:
            return "zone_country_mismatch"
    if locality_id is not None:
        locality = db.get(Locality, locality_id)
        if not locality:
            return "locality_not_found"
        if locality.country_id != country.id:
            return "locality_country_mismatch"
        if zone_id is not None and locality.zone_id != zone_id:
            return "locality_zone_mismatch"

    result = PriceAnalysisRecipeImportResponse()
    current_activity_code = None

    for row in rows:
        symbol = (row.get("Simbol") or row.get("simbol") or "").strip()
        denumire = _normalize_name(row.get("Denumire") or row.get("denumire") or "")
        um = (row.get("UM") or row.get("um") or "").strip() or "unit"
        price_raw = (row.get("Pretul unitar") or row.get("pretul unitar") or "").strip()
        if not symbol or not denumire:
            result.skipped += 1
            continue

        try:
            base_price = float(price_raw.replace(",", ".")) if price_raw else 0.0
        except ValueError:
            base_price = 0.0

        if any(char.isalpha() for char in symbol[:4]) and not price_raw:
            current_activity_code = symbol
            result.skipped += 1
            continue

        resource = db.execute(
            select(CatalogResource).where(
                CatalogResource.name_ro == denumire,
                CatalogResource.unit == um,
            )
        ).scalars().first()
        if not resource:
            resource_type = ResourceType.MATERIAL
            lowered = denumire.lower()
            if any(keyword in lowered for keyword in ["utilaj", "excavator", "compactor", "robot", "betoniera", "buldoexcavator"]):
                resource_type = ResourceType.EQUIPMENT
            elif any(keyword in lowered for keyword in ["transport", "fiat", "doblo", "commercial"]):
                resource_type = ResourceType.TRANSPORT
            created = create_resource(
                db,
                CatalogResourceCreate(
                    esco_code=None,
                    name_ro=denumire,
                    name_en=denumire,
                    resource_type=resource_type,
                    base_price=base_price,
                    unit=um,
                    technical_specs={"source": "resource_price_import", "symbol": symbol, "file": source_name, "activity_code": current_activity_code},
                    is_active=True,
                ),
            )
            resource = db.get(CatalogResource, created.id)
            result.created += 1
        else:
            if base_price > 0:
                resource.base_price = base_price
                db.commit()
            result.updated += 1

        if resource.resource_type == ResourceType.LABOR.value:
            continue

        config_payload = AdminResourcePriceConfigCreate(
            resource_id=resource.id,
            country_id=country_id,
            zone_id=zone_id,
            locality_id=locality_id,
            currency=currency.upper(),
            base_price=base_price or float(resource.base_price),
            zone_multiplier=1.0,
            legislation_code=legislation_code.upper(),
            is_active=True,
        )
        existing = _find_existing_resource_price_config(
            db,
            resource_id=resource.id,
            country_id=country_id,
            zone_id=zone_id,
            locality_id=locality_id,
            currency=currency,
            legislation_code=legislation_code,
        )
        if existing:
            update_resource_price_config(
                db,
                existing.id,
                AdminResourcePriceConfigUpdate(
                    base_price=config_payload.base_price,
                    zone_multiplier=config_payload.zone_multiplier,
                    legislation_code=config_payload.legislation_code,
                    is_active=True,
                ),
            )
        else:
            create_resource_price_config(db, config_payload)

    return result
