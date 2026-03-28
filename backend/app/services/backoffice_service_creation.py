from __future__ import annotations

import json
import re

from fastapi import UploadFile
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.category import Category
from app.models.price_analysis import CatalogActivity, CatalogResource, PriceAnalysisRecipe
from app.models.service import Service
from app.modules.cost_engine.schemas import AdminPriceConfigCreate
from app.modules.cost_engine.service import create_admin_price_config
from app.modules.geography.models import Country
from app.schemas.backoffice_service_creation import (
    BackofficeServiceCreateRequest,
    BackofficeServiceCreateResponse,
    CreatedServiceAttachmentResponse,
    ServiceRecipeDraftItemResponse,
)
from app.schemas.price_analysis import PriceAnalysisRecipeCreate
from app.schemas.service import ServiceCreate, ServiceResponse
from app.services.attachment_service import create_entity_attachment
from app.services.catalog_service import create_service, delete_service, get_service, get_subcategory
from app.services.price_analysis_service import create_recipe


def _slugify(value: str) -> str:
    cleaned = re.sub(r"[^a-zA-Z0-9]+", "-", value.strip().lower()).strip("-")
    return cleaned or "serviciu-nou"


def _generate_service_code(db: Session, subcategory_id: int) -> str:
    existing_count = db.execute(select(func.count(Service.id))).scalar_one()
    return f"SRV{subcategory_id:03d}{int(existing_count) + 1:03d}"


def _resolve_service_slug(payload: BackofficeServiceCreateRequest) -> str:
    return payload.service_slug or _slugify(payload.service_name_ro)


def _resolve_primary_activity_id(payload: BackofficeServiceCreateRequest, index: int) -> int | None:
    if payload.recipe_items[index].activity_id is not None:
        return payload.recipe_items[index].activity_id
    if payload.uniclass_activity_ids:
        return payload.uniclass_activity_ids[0]
    return None


def _validate_recipe_items(
    db: Session,
    *,
    payload: BackofficeServiceCreateRequest,
):
    validated_rows: list[tuple] = []
    seen_pairs: set[tuple[int, int]] = set()

    for index, recipe_item in enumerate(payload.recipe_items):
        activity_id = _resolve_primary_activity_id(payload, index)
        if activity_id is None:
            return "activity_required_for_recipe"

        activity = db.get(CatalogActivity, activity_id)
        if not activity:
            return "activity_not_found"
        if activity.subcategory_id != payload.subcategory_id:
            return "activity_subcategory_mismatch"

        resource = db.get(CatalogResource, recipe_item.resource_id)
        if not resource:
            return "resource_not_found"

        pair = (activity_id, recipe_item.resource_id)
        if pair in seen_pairs:
            return "duplicate_recipe"
        seen_pairs.add(pair)

        existing_recipe = db.execute(
            select(PriceAnalysisRecipe).where(
                PriceAnalysisRecipe.activity_id == activity_id,
                PriceAnalysisRecipe.resource_id == recipe_item.resource_id,
            )
        ).scalar_one_or_none()
        if existing_recipe:
            return "duplicate_recipe"

        validated_rows.append((recipe_item, activity_id, activity, resource))

    return validated_rows


def _find_default_country(db: Session) -> Country | None:
    return db.execute(select(Country).where(func.upper(Country.code) == "RO").order_by(Country.id)).scalar_one_or_none()


def _serialize_attachment(result) -> CreatedServiceAttachmentResponse:
    return CreatedServiceAttachmentResponse(
        attachment_type=result.attachment_type,
        file_name=result.file_name,
        secure_url=result.secure_url,
    )


def build_service_creation_response(
    *,
    payload: BackofficeServiceCreateRequest,
    service,
    service_code: str,
    hierarchy: dict,
    classifications: dict,
    recipes: list[ServiceRecipeDraftItemResponse],
    attachments: list[CreatedServiceAttachmentResponse],
    price_config,
) -> BackofficeServiceCreateResponse:
    service_response = ServiceResponse.from_service(service).model_dump()
    default_costs = payload.default_costs.model_dump()
    default_costs["currency"] = "RON"
    default_costs["country_code"] = "RO"
    default_costs["admin_price_config_id"] = getattr(price_config, "id", None)

    return BackofficeServiceCreateResponse(
        service_id=service.id,
        service_code=service_code,
        service_name_ro=payload.service_name_ro,
        service_name_en=payload.service_name_en,
        service_slug=service.slug,
        hierarchy=hierarchy,
        classifications=classifications,
        service=service_response,
        default_costs=default_costs,
        price_analysis_recipes=recipes,
        attachments=attachments,
    )


def parse_service_create_payload(raw_payload: str) -> BackofficeServiceCreateRequest:
    return BackofficeServiceCreateRequest.model_validate(json.loads(raw_payload))


def create_backoffice_service_flow(
    db: Session,
    *,
    payload: BackofficeServiceCreateRequest,
    main_image: UploadFile | None = None,
    demo_video: UploadFile | None = None,
    instructions_pdf: UploadFile | None = None,
):
    subcategory = get_subcategory(db, payload.subcategory_id)
    if not subcategory:
        return "subcategory_not_found"

    category = db.get(Category, payload.category_id)
    if not category:
        return "category_not_found"
    if subcategory.category_id != category.id:
        return "subcategory_category_mismatch"
    if category.domain_id != payload.domain_id:
        return "category_domain_mismatch"

    validated_rows = _validate_recipe_items(db, payload=payload)
    if isinstance(validated_rows, str):
        return validated_rows

    hierarchy = {
        "domain_id": payload.domain_id,
        "category_id": payload.category_id,
        "subcategory_id": payload.subcategory_id,
        "category_name_ro": category.name_ro,
        "subcategory_name_ro": subcategory.name_ro,
    }

    service_code = payload.service_code or _generate_service_code(db, payload.subcategory_id)
    created_service = create_service(
        db,
        ServiceCreate(
            name=payload.service_name_ro,
            slug=_resolve_service_slug(payload),
            description=payload.short_description_ro,
            description_extended=payload.short_description_en,
            is_active=payload.is_active,
            subcategory_ids=[payload.subcategory_id],
            images=[],
            documents=[],
            videos=[],
            level_attachments={},
        ),
    )
    if isinstance(created_service, str):
        return created_service

    recipe_responses: list[ServiceRecipeDraftItemResponse] = []
    try:
        for recipe_item, activity_id, activity, resource in validated_rows:
            created_recipe = create_recipe(
                db,
                PriceAnalysisRecipeCreate(
                    activity_id=activity_id,
                    resource_id=recipe_item.resource_id,
                    specific_consumption=recipe_item.specific_consumption,
                    consumption_unit=recipe_item.consumption_unit,
                    waste_percentage=recipe_item.waste_percentage,
                    coefficient_bronz=recipe_item.level_coefficients["BRONZ"],
                    coefficient_argint=recipe_item.level_coefficients["ARGINT"],
                    coefficient_aur=recipe_item.level_coefficients["AUR"],
                    coefficient_platinum=recipe_item.level_coefficients["PLATINUM"],
                    level_coefficients=recipe_item.level_coefficients,
                    caen_nace_link={"codes": payload.caen_codes},
                    is_essential=True,
                ),
            )
            if isinstance(created_recipe, str):
                delete_service(db, created_service.id)
                return created_recipe

            recipe_responses.append(
                ServiceRecipeDraftItemResponse(
                    recipe_id=created_recipe.id,
                    activity_id=created_recipe.activity_id,
                    activity_name_ro=created_recipe.activity_name_ro,
                    resource_id=created_recipe.resource_id,
                    resource_name_ro=created_recipe.resource_name_ro,
                    resource_type=created_recipe.resource_type.value if hasattr(created_recipe.resource_type, "value") else str(created_recipe.resource_type),
                    requested_resource_type=recipe_item.resource_type,
                    specific_consumption=created_recipe.specific_consumption,
                    consumption_unit=created_recipe.consumption_unit or recipe_item.consumption_unit,
                    waste_percentage=created_recipe.waste_percentage,
                    level_coefficients=recipe_item.level_coefficients,
                )
            )

        attachments: list[CreatedServiceAttachmentResponse] = []
        for file_obj, attachment_type in (
            (main_image, "IMAGE"),
            (demo_video, "VIDEO"),
            (instructions_pdf, "DOCUMENT"),
        ):
            if file_obj is None:
                continue
            content = file_obj.file.read()
            result = create_entity_attachment(
                db,
                entity_type="service",
                entity_id=created_service.id,
                attachment_type=attachment_type,
                file_name=file_obj.filename or f"{attachment_type.lower()}.bin",
                content=content,
                mime_type=file_obj.content_type,
            )
            if isinstance(result, str):
                delete_service(db, created_service.id)
                return result
            attachments.append(_serialize_attachment(result))

        price_config = None
        default_country = _find_default_country(db)
        if default_country:
            first_recipe = payload.recipe_items[0].level_coefficients if payload.recipe_items else None
            price_config = create_admin_price_config(
                db,
                AdminPriceConfigCreate(
                    service_id=created_service.id,
                    country_id=default_country.id,
                    zone_id=None,
                    currency="RON",
                    legislation_code="RO_STANDARD",
                    base_price=payload.default_costs.labor_hourly_rate,
                    legislation_coefficient=1.0,
                    zone_coefficient_override=None,
                    urgency_coefficient=1.0,
                    basic_level_coefficient=first_recipe["BRONZ"] if first_recipe else 1.0,
                    standard_level_coefficient=first_recipe["ARGINT"] if first_recipe else 1.0,
                    premium_level_coefficient=first_recipe["AUR"] if first_recipe else 1.0,
                    indirect_cost_percentage=payload.default_costs.indirect_cost_percentage,
                    platform_maintenance_percentage=payload.default_costs.platform_maintenance_percentage,
                    mydarrin_platform_percentage=payload.default_costs.mydarrin_platform_percentage,
                    vat_percentage=payload.default_costs.vat_percentage,
                    platform_margin_coefficient=payload.default_costs.mydarrin_platform_percentage,
                    vat_coefficient=payload.default_costs.vat_percentage,
                    is_active=True,
                ),
            )
            if isinstance(price_config, str):
                price_config = None
    except Exception:
        delete_service(db, created_service.id)
        raise

    persisted_service = get_service(db, created_service.id)
    classifications = {
        "caen_codes": payload.caen_codes,
        "uniclass_activity_ids": payload.uniclass_activity_ids,
        "esco_occupations": payload.esco_occupations,
    }

    return build_service_creation_response(
        payload=payload,
        service=persisted_service,
        service_code=service_code,
        hierarchy=hierarchy,
        classifications=classifications,
        recipes=recipe_responses,
        attachments=attachments,
        price_config=price_config,
    )
