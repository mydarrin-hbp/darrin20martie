from __future__ import annotations

from dataclasses import asdict, dataclass
from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.category import Category
from app.models.price_analysis import AdminResourcePriceConfig, CatalogActivity, CatalogResource, EntityAttachment, PriceAnalysisRecipe
from app.models.service import Service
from app.models.subcategory import SubCategory
from app.modules.cost_engine.models import AdminPriceConfig
from app.modules.cost_engine.schemas import CostDraftRequest, ServiceLevel
from app.modules.cost_engine.service import calculate_draft
from app.modules.deviz_engine.models import AdminDevizRule
from app.modules.deviz_engine.schemas import DevizLevelName, DevizRequest
from app.modules.deviz_engine.service import generate_deviz
from app.modules.geography.models import Country, Locality, Zone
from app.schemas.price_analysis import AdminResourcePriceConfigCreate, CatalogActivityCreate, CatalogResourceCreate, PriceAnalysisRecipeCreate, RecipeLevelName, ResourceType
from app.schemas.service import ServiceCreate, ServiceUpdate
from app.services.attachment_service import seed_attachment_file
from app.services.catalog_service import create_service, update_service
from app.services.price_analysis_service import create_activity, create_recipe, create_resource, create_resource_price_config, get_activity_by_uniclass_code

THERMAL_LABOR_ESCO = "http://data.europa.eu/esco/skill/592525ab-b517-4c55-8c65-17e0f5d99205"
SERVICE_SLUG = "reparat-calorifer"
ACTIVITY_CODE = "Pr_65_52_63"
SUBCATEGORY_SLUG = "instalatii-termice"

REPARAT_CALORIFER_VARIANTS: list[dict[str, Any]] = [
    {"service_slug": "reparat-calorifer-aerisire", "service_name": "Aerisit calorifer", "subcategory_slug": "aerisire-calorifer", "subcategory_name_ro": "Aerisire calorifer", "activity_code": "Pr_65_52_63_RC01", "activity_name_ro": "Aerisire calorifer si echilibrare", "description": "Eliminare aer din instalatie si verificare functionare.", "symptom_keywords": ["nu se incalzeste complet", "aer", "bolboros", "rece sus", "cald jos"], "base_price": 35.0, "recipes": {"labor_hours": 0.6, "material_units": 0.0, "equipment_hours": 0.2, "transport_km": 6.0}},
    {"service_slug": "reparat-calorifer-etansare", "service_name": "Etansare calorifer / remediere scurgere", "subcategory_slug": "etansare-calorifer", "subcategory_name_ro": "Etansare calorifer", "activity_code": "Pr_65_52_63_RC02", "activity_name_ro": "Etansare si remediere scurgere calorifer", "description": "Remediere scurgeri la imbinari, nipluri sau racorduri.", "symptom_keywords": ["curge", "pierde apa", "scurgere", "picura", "etansare"], "base_price": 55.0, "recipes": {"labor_hours": 1.1, "material_units": 0.15, "equipment_hours": 0.5, "transport_km": 7.0}},
    {"service_slug": "reparat-calorifer-robinet", "service_name": "Inlocuire robinet / ventil calorifer", "subcategory_slug": "robineti-ventile-calorifer", "subcategory_name_ro": "Robineti si ventile calorifer", "activity_code": "Pr_65_52_63_RC03", "activity_name_ro": "Inlocuire robinet sau ventil calorifer", "description": "Demontare piesa defecta si montaj robinet sau ventil nou.", "symptom_keywords": ["robinet", "ventil", "nu se inchide", "nu se deschide", "termostat"], "base_price": 70.0, "recipes": {"labor_hours": 1.3, "material_units": 0.18, "equipment_hours": 0.5, "transport_km": 8.0}},
    {"service_slug": "reparat-calorifer-otel", "service_name": "Reparatie calorifer otel", "subcategory_slug": "reparatie-calorifer-otel", "subcategory_name_ro": "Reparatie calorifer otel", "activity_code": "Pr_65_52_63_RC04", "activity_name_ro": "Reparatie calorifer otel", "description": "Interventii pe calorifere din otel, inclusiv remedieri locale.", "symptom_keywords": ["otel", "panou", "fisura", "lovit", "rugina"], "base_price": 60.0, "recipes": {"labor_hours": 1.2, "material_units": 1.0, "equipment_hours": 0.7, "transport_km": 8.0}},
    {"service_slug": "reparat-calorifer-fonta", "service_name": "Reparatie calorifer fonta", "subcategory_slug": "reparatie-calorifer-fonta", "subcategory_name_ro": "Reparatie calorifer fonta", "activity_code": "Pr_65_52_63_RC05", "activity_name_ro": "Reparatie calorifer fonta", "description": "Interventii pe calorifere de fonta cu masa mare si elemente segmentate.", "symptom_keywords": ["fonta", "greu", "vechi", "element", "segment"], "base_price": 85.0, "recipes": {"labor_hours": 1.7, "material_units": 0.35, "equipment_hours": 1.0, "transport_km": 10.0}},
    {"service_slug": "reparat-calorifer-aluminiu", "service_name": "Reparatie calorifer aluminiu", "subcategory_slug": "reparatie-calorifer-aluminiu", "subcategory_name_ro": "Reparatie calorifer aluminiu", "activity_code": "Pr_65_52_63_RC06", "activity_name_ro": "Reparatie calorifer aluminiu", "description": "Interventii pe radiatoare modulare din aluminiu.", "symptom_keywords": ["aluminiu", "modular", "usor", "elemente aluminiu"], "base_price": 72.0, "recipes": {"labor_hours": 1.35, "material_units": 0.4, "equipment_hours": 0.7, "transport_km": 8.0}},
    {"service_slug": "reparat-calorifer-inlocuire", "service_name": "Demontare + montaj calorifer nou", "subcategory_slug": "inlocuire-calorifer", "subcategory_name_ro": "Inlocuire calorifer", "activity_code": "Pr_65_52_63_RC07", "activity_name_ro": "Demontare calorifer vechi si montaj calorifer nou", "description": "Inlocuire completa a caloriferului cu varianta noua selectata de client.", "symptom_keywords": ["inlocuire", "schimbat", "nou", "demontare", "montaj nou"], "base_price": 95.0, "recipes": {"labor_hours": 2.1, "material_units": 1.0, "equipment_hours": 1.0, "transport_km": 10.0}},
]


@dataclass
class ReparatCaloriferContext:
    service_id: int
    activity_id: int
    country_id: int
    zone_id: int
    locality_id: int
    currency: str


@dataclass
class ReparatCaloriferVariantContext:
    service_id: int
    service_slug: str
    service_name: str
    activity_id: int
    activity_code: str
    country_id: int
    zone_id: int
    locality_id: int
    currency: str


@dataclass
class ReparatCaloriferVariantMatch:
    selected_service_id: int
    selected_service_slug: str
    selected_service_name: str
    confidence: float
    matched_keywords: list[str]


def _get_ro_context(db: Session) -> tuple[Country, Zone, Locality]:
    country = db.execute(select(Country).where(Country.code == "RO")).scalar_one()
    zone = db.execute(select(Zone).where(Zone.country_id == country.id, Zone.slug == "bucuresti-ilfov")).scalar_one()
    locality = db.execute(select(Locality).where(Locality.country_id == country.id, Locality.slug == "bucuresti")).scalar_one()
    return country, zone, locality


def _ensure_thermal_subcategory(db: Session) -> SubCategory:
    existing = db.execute(select(SubCategory).where(SubCategory.slug == SUBCATEGORY_SLUG)).scalar_one_or_none()
    if existing:
        return existing
    category = db.execute(select(Category).where(Category.slug == "constructii-civile-industriale")).scalar_one_or_none()
    if category is None:
        category = db.execute(select(Category).order_by(Category.id)).scalar_one()
    subcategory = SubCategory(category_id=category.id, name_ro="Instalatii termice", name_en="Thermal installations", slug=SUBCATEGORY_SLUG, is_active=True, caen_codes=["4322"], uniclass_codes=[ACTIVITY_CODE], esco_codes=[THERMAL_LABOR_ESCO])
    db.add(subcategory)
    db.commit()
    db.refresh(subcategory)
    return subcategory


def _upsert_service(db: Session, *, service_slug: str, payload: ServiceCreate) -> Service:
    service = db.execute(select(Service).where(Service.slug == service_slug)).scalar_one_or_none()
    if service is None:
        created = create_service(db, payload)
        if isinstance(created, str):
            raise RuntimeError(created)
        return created
    updated = update_service(db, service.id, ServiceUpdate(name=payload.name, slug=payload.slug, description=payload.description, description_extended=payload.description_extended, is_active=payload.is_active, esco_concept_uri=payload.esco_concept_uri, images=payload.images, documents=payload.documents, videos=payload.videos, level_attachments=payload.level_attachments, subcategory_ids=payload.subcategory_ids))
    if isinstance(updated, str) or updated is None:
        raise RuntimeError(str(updated))
    return updated


def _ensure_service(db: Session, subcategory: SubCategory) -> Service:
    return _upsert_service(db, service_slug=SERVICE_SLUG, payload=ServiceCreate(name="Reparat calorifer", slug=SERVICE_SLUG, description="Interventie umbrella pentru reparatie, reetansare sau inlocuire punctuala calorifer.", description_extended="Serviciu umbrella pentru diagnostic, reparatie si repunere in functiune a caloriferelor. Varianta tehnica potrivita se alege dupa simptome, material, dimensiuni si greutate.", is_active=True, esco_concept_uri=None, images=[], documents=[], videos=[], level_attachments={}, subcategory_ids=[subcategory.id]))


def _ensure_activity(db: Session, subcategory: SubCategory) -> CatalogActivity:
    activity = get_activity_by_uniclass_code(db, ACTIVITY_CODE)
    category = db.get(Category, subcategory.category_id)
    payload = CatalogActivityCreate(uniclass_code=ACTIVITY_CODE, name_ro="Montaj / reparatii instalatii termice", name_en="Thermal installation repair / fitting", uom="interventie", domain_id=category.domain_id, category_id=category.id, subcategory_id=subcategory.id, description="Activitate umbrella pentru interventii de reparatie calorifere.", description_extended="Activitate umbrella folosita pentru screening si mapping initial. Retetele specifice stau pe variantele tehnice.", is_active=True, images=[], documents=[], videos=[], level_attachments={})
    if activity is None:
        created = create_activity(db, payload)
        if isinstance(created, str):
            raise RuntimeError(created)
        return db.get(CatalogActivity, created.id)
    activity.uniclass_code = payload.uniclass_code
    activity.name_ro = payload.name_ro
    activity.name_en = payload.name_en
    activity.uom = payload.uom
    activity.domain_id = payload.domain_id
    activity.category_id = payload.category_id
    activity.subcategory_id = payload.subcategory_id
    activity.description = payload.description
    activity.description_extended = payload.description_extended
    activity.is_active = True
    db.commit()
    db.refresh(activity)
    return activity


def _ensure_subcategory_for_variant(db: Session, *, category: Category, variant: dict[str, Any]) -> SubCategory:
    existing = db.execute(select(SubCategory).where(SubCategory.slug == variant["subcategory_slug"])).scalar_one_or_none()
    if existing:
        existing.category_id = category.id
        existing.name_ro = variant["subcategory_name_ro"]
        existing.name_en = variant["subcategory_name_ro"]
        existing.is_active = True
        existing.caen_codes = ["4322"]
        existing.uniclass_codes = [variant["activity_code"]]
        existing.esco_codes = [THERMAL_LABOR_ESCO]
        db.commit()
        db.refresh(existing)
        return existing
    subcategory = SubCategory(category_id=category.id, name_ro=variant["subcategory_name_ro"], name_en=variant["subcategory_name_ro"], slug=variant["subcategory_slug"], is_active=True, caen_codes=["4322"], uniclass_codes=[variant["activity_code"]], esco_codes=[THERMAL_LABOR_ESCO])
    db.add(subcategory)
    db.commit()
    db.refresh(subcategory)
    return subcategory


def _ensure_variant_service(db: Session, *, subcategory: SubCategory, variant: dict[str, Any]) -> Service:
    return _upsert_service(db, service_slug=variant["service_slug"], payload=ServiceCreate(name=variant["service_name"], slug=variant["service_slug"], description=variant["description"], description_extended=f"{variant['description']} Varianta este aleasa dupa simptome, materialul caloriferului, dimensiuni si greutate.", is_active=True, esco_concept_uri=None, images=[], documents=[], videos=[], level_attachments={}, subcategory_ids=[subcategory.id]))


def _ensure_variant_activity(db: Session, *, subcategory: SubCategory, variant: dict[str, Any]) -> CatalogActivity:
    activity = get_activity_by_uniclass_code(db, variant["activity_code"])
    category = db.get(Category, subcategory.category_id)
    payload = CatalogActivityCreate(uniclass_code=variant["activity_code"], name_ro=variant["activity_name_ro"], name_en=variant["activity_name_ro"], uom="interventie", domain_id=category.domain_id, category_id=category.id, subcategory_id=subcategory.id, description=variant["description"], description_extended=f"{variant['description']} Consumul si coeficientii sunt calibrati pentru aceasta varianta.", is_active=True, images=[], documents=[], videos=[], level_attachments={})
    if activity is None:
        created = create_activity(db, payload)
        if isinstance(created, str):
            raise RuntimeError(created)
        return db.get(CatalogActivity, created.id)
    activity.uniclass_code = payload.uniclass_code
    activity.name_ro = payload.name_ro
    activity.name_en = payload.name_en
    activity.uom = payload.uom
    activity.domain_id = payload.domain_id
    activity.category_id = payload.category_id
    activity.subcategory_id = payload.subcategory_id
    activity.description = payload.description
    activity.description_extended = payload.description_extended
    activity.is_active = True
    db.commit()
    db.refresh(activity)
    return activity


def _ensure_resource(db: Session, *, name_ro: str, name_en: str, resource_type: ResourceType, unit: str, base_price: float, esco_code: str | None = None, technical_specs: dict | None = None) -> CatalogResource:
    resource = db.execute(select(CatalogResource).where(CatalogResource.name_ro == name_ro)).scalar_one_or_none()
    if resource is None:
        created = create_resource(db, CatalogResourceCreate(esco_code=esco_code, name_ro=name_ro, name_en=name_en, resource_type=resource_type, base_price=base_price, unit=unit, technical_specs=technical_specs or {}, is_active=True))
        return db.get(CatalogResource, created.id)
    resource.esco_code = esco_code
    resource.name_ro = name_ro
    resource.name_en = name_en
    resource.resource_type = resource_type.value
    resource.base_price = base_price
    resource.unit = unit
    resource.technical_specs = technical_specs or {}
    resource.is_active = True
    db.commit()
    db.refresh(resource)
    return resource


def _upsert_resource_price(db: Session, *, resource: CatalogResource, country_id: int, zone_id: int | None, locality_id: int | None, currency: str, base_price: float):
    existing = db.execute(select(AdminResourcePriceConfig).where(AdminResourcePriceConfig.resource_id == resource.id, AdminResourcePriceConfig.country_id == country_id, AdminResourcePriceConfig.zone_id == zone_id, AdminResourcePriceConfig.locality_id == locality_id, AdminResourcePriceConfig.currency == currency, AdminResourcePriceConfig.legislation_code == "RO")).scalar_one_or_none()
    if existing:
        existing.base_price = base_price
        existing.zone_multiplier = 1.0
        existing.is_active = True
        db.commit()
        return existing
    result = create_resource_price_config(db, AdminResourcePriceConfigCreate(resource_id=resource.id, country_id=country_id, zone_id=zone_id, locality_id=locality_id, currency=currency, base_price=base_price, zone_multiplier=1.0, legislation_code="RO", is_active=True))
    if isinstance(result, str):
        raise RuntimeError(result)
    return db.get(AdminResourcePriceConfig, result.id)


def _upsert_recipe(db: Session, *, activity: CatalogActivity, resource: CatalogResource, specific_consumption: float, waste_percentage: float, bronz: float, argint: float, aur: float, platinum: float, essential: bool):
    existing = db.execute(select(PriceAnalysisRecipe).where(PriceAnalysisRecipe.activity_id == activity.id, PriceAnalysisRecipe.resource_id == resource.id)).scalar_one_or_none()
    payload = PriceAnalysisRecipeCreate(activity_id=activity.id, resource_id=resource.id, specific_consumption=specific_consumption, consumption_unit=resource.unit, waste_percentage=waste_percentage, waste_formula="repair_default", coefficient_bronz=bronz, coefficient_argint=argint, coefficient_aur=aur, coefficient_platinum=platinum, level_coefficients={"BRONZ": bronz, "ARGINT": argint, "AUR": aur, "PLATINUM": platinum}, caen_nace_link={"caen_codes": ["4322"], "nace_codes": ["4322"]}, is_essential=essential)
    if existing is None:
        result = create_recipe(db, payload)
        if isinstance(result, str):
            raise RuntimeError(result)
        return db.get(PriceAnalysisRecipe, result.id)
    existing.specific_consumption = payload.specific_consumption
    existing.consumption_unit = payload.consumption_unit
    existing.waste_percentage = payload.waste_percentage
    existing.waste_formula = payload.waste_formula
    existing.coefficient_bronz = payload.coefficient_bronz
    existing.coefficient_argint = payload.coefficient_argint
    existing.coefficient_aur = payload.coefficient_aur
    existing.coefficient_platinum = payload.coefficient_platinum
    existing.level_coefficients = payload.level_coefficients
    existing.caen_nace_link = payload.caen_nace_link
    existing.is_essential = payload.is_essential
    db.commit()
    db.refresh(existing)
    return existing


def _upsert_admin_price_config(db: Session, *, service_id: int, country_id: int, zone_id: int, currency: str, base_price: float):
    config = db.execute(select(AdminPriceConfig).where(AdminPriceConfig.service_id == service_id, AdminPriceConfig.country_id == country_id, AdminPriceConfig.zone_id == zone_id, AdminPriceConfig.currency == currency, AdminPriceConfig.legislation_code == "RO")).scalar_one_or_none()
    if config is None:
        config = AdminPriceConfig(service_id=service_id, country_id=country_id, zone_id=zone_id, currency=currency, legislation_code="RO", base_price=base_price, legislation_coefficient=1.0, zone_coefficient_override=1.0, urgency_coefficient=1.0, basic_level_coefficient=1.0, standard_level_coefficient=1.0, premium_level_coefficient=1.0, indirect_cost_percentage=0.10, platform_maintenance_percentage=0.03, mydarrin_platform_percentage=0.15, vat_percentage=0.21, platform_margin_coefficient=0.15, vat_coefficient=0.21, is_active=True)
        db.add(config)
    else:
        config.base_price = base_price
        config.legislation_coefficient = 1.0
        config.zone_coefficient_override = 1.0
        config.urgency_coefficient = 1.0
        config.basic_level_coefficient = 1.0
        config.standard_level_coefficient = 1.0
        config.premium_level_coefficient = 1.0
        config.indirect_cost_percentage = 0.10
        config.platform_maintenance_percentage = 0.03
        config.mydarrin_platform_percentage = 0.15
        config.vat_percentage = 0.21
        config.platform_margin_coefficient = 0.15
        config.vat_coefficient = 0.21
        config.is_active = True
    db.commit()
    db.refresh(config)
    return config


def _upsert_deviz_rules(db: Session, *, service_id: int, country_id: int, label_prefix: str):
    def clip(prefix: str, limit: int = 40) -> str:
        return prefix[:limit].rstrip()

    defaults = {DevizLevelName.BRONZ: (clip(f"Bronz {label_prefix}"), 1.0, "Interventie esentiala"), DevizLevelName.ARGINT: (clip(f"Argint {label_prefix}"), 1.06, "Interventie echilibrata"), DevizLevelName.AUR: (clip(f"Aur {label_prefix}"), 1.14, "Interventie extinsa"), DevizLevelName.PLATINUM: (clip(f"Platinum {label_prefix}"), 1.24, "Interventie premium completa")}
    for idx, (level, values) in enumerate(defaults.items(), start=1):
        label, multiplier, description = values
        rule = db.execute(select(AdminDevizRule).where(AdminDevizRule.service_id == service_id, AdminDevizRule.country_id == country_id, AdminDevizRule.level_name == level.value)).scalar_one_or_none()
        if rule is None:
            db.add(AdminDevizRule(service_id=service_id, country_id=country_id, level_name=level.value, label=label, multiplier=multiplier, description=description, sort_order=idx, is_active=True))
        else:
            rule.label = label
            rule.multiplier = multiplier
            rule.description = description
            rule.sort_order = idx
            rule.is_active = True
    db.commit()


def _ensure_service_attachments(db: Session, *, service: Service):
    existing = db.execute(select(EntityAttachment).where(EntityAttachment.entity_type == "service", EntityAttachment.entity_id == service.id)).scalars().all()
    existing_types = {item.attachment_type for item in existing}
    if "IMAGE" not in existing_types:
        seed_attachment_file(db, entity_type="service", entity_id=service.id, attachment_type="IMAGE", file_name="reparat-calorifer-demo.svg", content=b"<svg xmlns='http://www.w3.org/2000/svg' width='800' height='400'><rect width='100%' height='100%' fill='#fff3e8'/><text x='40' y='180' font-size='36'>Reparat calorifer</text><text x='40' y='235' font-size='22'>Imagine demo serviciu</text></svg>", mime_type="image/svg+xml", level_name="ARGINT")
    if "DOCUMENT" not in existing_types:
        seed_attachment_file(db, entity_type="service", entity_id=service.id, attachment_type="DOCUMENT", file_name="reparat-calorifer-instructiuni.pdf", content=b"%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF", mime_type="application/pdf")
    if "VIDEO" not in existing_types:
        seed_attachment_file(db, entity_type="service", entity_id=service.id, attachment_type="VIDEO", file_name="reparat-calorifer-demo.mp4", content=b"demo video reparat calorifer", mime_type="video/mp4")


def _ensure_variant_attachments(db: Session, *, service: Service, variant: dict[str, Any]):
    existing = db.execute(select(EntityAttachment).where(EntityAttachment.entity_type == "service", EntityAttachment.entity_id == service.id)).scalars().all()
    existing_types = {item.attachment_type for item in existing}
    svg = f"<svg xmlns='http://www.w3.org/2000/svg' width='800' height='400'><rect width='100%' height='100%' fill='#f1f7ff'/><text x='36' y='170' font-size='34'>{variant['service_name']}</text><text x='36' y='220' font-size='21'>{variant['description']}</text></svg>".encode("utf-8")
    if "IMAGE" not in existing_types:
        seed_attachment_file(db, entity_type="service", entity_id=service.id, attachment_type="IMAGE", file_name=f"{variant['service_slug']}.svg", content=svg, mime_type="image/svg+xml", level_name="ARGINT")
    if "DOCUMENT" not in existing_types:
        seed_attachment_file(db, entity_type="service", entity_id=service.id, attachment_type="DOCUMENT", file_name=f"{variant['service_slug']}-demo-instructiuni.pdf", content=b"%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF", mime_type="application/pdf")
    if "VIDEO" not in existing_types:
        seed_attachment_file(db, entity_type="service", entity_id=service.id, attachment_type="VIDEO", file_name=f"{variant['service_slug']}-demo-video.mp4", content=f"demo video {variant['service_name']}".encode("utf-8"), mime_type="video/mp4")


def _build_material_specs(variant: dict[str, Any]) -> dict[str, Any]:
    if "fonta" in variant["service_slug"]:
        return {"category": "radiator-cast-iron", "reference_variant": "calorifer fonta 10 elementi", "reference_weight_kg": 65, "supported_dimensions_mm": ["580x900", "580x1200"], "variant_note": "Greutatea mare creste timpul de manipulare si costul de transport."}
    if "aluminiu" in variant["service_slug"]:
        return {"category": "radiator-aluminium", "reference_variant": "calorifer aluminiu modular 10 elementi", "reference_weight_kg": 12, "supported_dimensions_mm": ["600x800", "600x1000"], "variant_note": "Varianta modulara, mai usoara, cu manipulare mai rapida."}
    return {"category": "radiator-steel", "reference_variant": "panou otel tip 22, 600x1000 mm", "reference_weight_kg": 22, "supported_dimensions_mm": ["600x800", "600x1000", "600x1200"], "variant_note": "Pretul demo trebuie recalibrat in productie in functie de tip, dimensiuni si greutate."}


def _ensure_shared_resources(db: Session, *, country: Country, zone: Zone, locality: Locality) -> dict[str, CatalogResource]:
    labor = _ensure_resource(db, name_ro="Mecanic instalatii termice", name_en="Thermal installations mechanic", resource_type=ResourceType.LABOR, unit="ora", base_price=145.0, esco_code=THERMAL_LABOR_ESCO, technical_specs={"source": "ESCO", "trade": "thermal-mechanic"})
    material = _ensure_resource(db, name_ro="Calorifer otel", name_en="Steel radiator", resource_type=ResourceType.MATERIAL, unit="buc", base_price=420.0, technical_specs=_build_material_specs(REPARAT_CALORIFER_VARIANTS[3]))
    equipment = _ensure_resource(
        db,
        name_ro="Nacela / Transpalet",
        name_en="Lift / pallet jack",
        resource_type=ResourceType.EQUIPMENT,
        unit="ora",
        base_price=120.0,
        technical_specs={
            "object_kind": "RENTAL",
            "equipment_type": "nacela",
            "pivot_actions": ["Inchiriere utilaj"],
            "bundle": "thermal-repair-rental",
        },
    )
    transport = _ensure_resource(db, name_ro="Van service", name_en="Service van", resource_type=ResourceType.TRANSPORT, unit="km", base_price=5.5, technical_specs={"vehicle_type": "service-van"})
    _upsert_resource_price(db, resource=labor, country_id=country.id, zone_id=None, locality_id=None, currency=country.currency, base_price=145.0)
    _upsert_resource_price(db, resource=labor, country_id=country.id, zone_id=zone.id, locality_id=locality.id, currency=country.currency, base_price=158.0)
    _upsert_resource_price(db, resource=material, country_id=country.id, zone_id=zone.id, locality_id=locality.id, currency=country.currency, base_price=420.0)
    _upsert_resource_price(db, resource=equipment, country_id=country.id, zone_id=zone.id, locality_id=locality.id, currency=country.currency, base_price=85.0)
    _upsert_resource_price(db, resource=transport, country_id=country.id, zone_id=zone.id, locality_id=locality.id, currency=country.currency, base_price=5.5)
    return {"labor": labor, "material": material, "equipment": equipment, "transport": transport}


def _upsert_variant_recipes(db: Session, *, activity: CatalogActivity, resources: dict[str, CatalogResource], variant: dict[str, Any]):
    recipe = variant["recipes"]
    _upsert_recipe(db, activity=activity, resource=resources["labor"], specific_consumption=recipe["labor_hours"], waste_percentage=0.0, bronz=0.8, argint=1.0, aur=1.15, platinum=1.3, essential=True)
    if recipe["material_units"] > 0:
        _upsert_recipe(db, activity=activity, resource=resources["material"], specific_consumption=recipe["material_units"], waste_percentage=2.0, bronz=0.55, argint=1.0, aur=1.05, platinum=1.12, essential="aerisire" not in variant["service_slug"])
    _upsert_recipe(db, activity=activity, resource=resources["equipment"], specific_consumption=recipe["equipment_hours"], waste_percentage=0.0, bronz=0.45, argint=0.8, aur=1.0, platinum=1.1, essential=False)
    _upsert_recipe(db, activity=activity, resource=resources["transport"], specific_consumption=recipe["transport_km"], waste_percentage=0.0, bronz=0.5, argint=0.85, aur=1.0, platinum=1.15, essential=True)


def _variant_match_score(message: str, variant: dict[str, Any]) -> tuple[int, list[str]]:
    normalized = message.casefold()
    matched = [keyword for keyword in variant["symptom_keywords"] if keyword.casefold() in normalized]
    score = len(matched) * 3
    if variant["service_name"].casefold() in normalized:
        score += 3
    if variant["subcategory_name_ro"].casefold() in normalized:
        score += 2
    return score, matched


def ensure_reparat_calorifer_setup(db: Session) -> ReparatCaloriferContext:
    country, zone, locality = _get_ro_context(db)
    subcategory = _ensure_thermal_subcategory(db)
    service = _ensure_service(db, subcategory)
    activity = _ensure_activity(db, subcategory)
    resources = _ensure_shared_resources(db, country=country, zone=zone, locality=locality)
    _upsert_variant_recipes(db, activity=activity, resources=resources, variant={"service_slug": SERVICE_SLUG, "recipes": {"labor_hours": 1.2, "material_units": 1.0, "equipment_hours": 0.7, "transport_km": 8.0}})
    _upsert_admin_price_config(db, service_id=service.id, country_id=country.id, zone_id=zone.id, currency=country.currency, base_price=60.0)
    _upsert_deviz_rules(db, service_id=service.id, country_id=country.id, label_prefix="Reparat Calorifer")
    _ensure_service_attachments(db, service=service)
    ensure_reparat_calorifer_variants(db)
    return ReparatCaloriferContext(service_id=service.id, activity_id=activity.id, country_id=country.id, zone_id=zone.id, locality_id=locality.id, currency=country.currency)


def ensure_reparat_calorifer_variants(db: Session) -> list[ReparatCaloriferVariantContext]:
    country, zone, locality = _get_ro_context(db)
    umbrella_subcategory = _ensure_thermal_subcategory(db)
    category = db.get(Category, umbrella_subcategory.category_id)
    resources = _ensure_shared_resources(db, country=country, zone=zone, locality=locality)
    contexts: list[ReparatCaloriferVariantContext] = []
    for variant in REPARAT_CALORIFER_VARIANTS:
        subcategory = _ensure_subcategory_for_variant(db, category=category, variant=variant)
        service = _ensure_variant_service(db, subcategory=subcategory, variant=variant)
        activity = _ensure_variant_activity(db, subcategory=subcategory, variant=variant)
        _upsert_variant_recipes(db, activity=activity, resources=resources, variant=variant)
        _upsert_admin_price_config(db, service_id=service.id, country_id=country.id, zone_id=zone.id, currency=country.currency, base_price=variant["base_price"])
        _upsert_deviz_rules(db, service_id=service.id, country_id=country.id, label_prefix=variant["service_name"])
        _ensure_variant_attachments(db, service=service, variant=variant)
        contexts.append(ReparatCaloriferVariantContext(service_id=service.id, service_slug=service.slug, service_name=service.name, activity_id=activity.id, activity_code=activity.uniclass_code, country_id=country.id, zone_id=zone.id, locality_id=locality.id, currency=country.currency))
    return contexts


def match_reparat_calorifer_variant(db: Session, *, message: str, preferred_service_id: int | None = None) -> ReparatCaloriferVariantMatch | None:
    variants = ensure_reparat_calorifer_variants(db)
    variant_by_slug = {item.service_slug: item for item in variants}
    preferred = db.get(Service, preferred_service_id) if preferred_service_id else None
    best_variant: ReparatCaloriferVariantContext | None = None
    best_keywords: list[str] = []
    best_score = 0
    for definition in REPARAT_CALORIFER_VARIANTS:
        current = variant_by_slug.get(definition["service_slug"])
        if current is None:
            continue
        score, matched_keywords = _variant_match_score(message, definition)
        if preferred and preferred.slug == definition["service_slug"]:
            score += 1
        if score > best_score:
            best_variant = current
            best_keywords = matched_keywords
            best_score = score
    if best_variant is None or best_score == 0:
        if preferred and preferred.slug.startswith("reparat-calorifer-"):
            return ReparatCaloriferVariantMatch(selected_service_id=preferred.id, selected_service_slug=preferred.slug, selected_service_name=preferred.name, confidence=0.56, matched_keywords=[])
        return None
    confidence = 0.58 + min(best_score, 8) * 0.05
    return ReparatCaloriferVariantMatch(selected_service_id=best_variant.service_id, selected_service_slug=best_variant.service_slug, selected_service_name=best_variant.service_name, confidence=round(min(confidence, 0.93), 2), matched_keywords=best_keywords)


def _calculate_variant_payload(db: Session, *, service_id: int, activity_id: int, country_id: int, zone_id: int, locality_id: int, currency: str, source_message: str) -> dict:
    deviz = generate_deviz(db, DevizRequest(service_id=service_id, country_id=country_id, zone_id=zone_id, locality_id=locality_id, currency=currency, legislation_code="RO", urgency=False, service_level=ServiceLevel.STANDARD, recipe_level=RecipeLevelName.ARGINT, activity_ids=[activity_id], resources=[], source_message=source_message))
    if isinstance(deviz, str):
        raise RuntimeError(deviz)
    draft = calculate_draft(db, CostDraftRequest(service_id=service_id, country_id=country_id, zone_id=zone_id, locality_id=locality_id, currency=currency, legislation_code="RO", urgency=False, service_level=ServiceLevel.STANDARD, recipe_level=RecipeLevelName.ARGINT, activity_ids=[activity_id], resources=[]))
    if isinstance(draft, str):
        raise RuntimeError(draft)
    return {"base_calculation": draft.model_dump(), "deviz": deviz.model_dump()}


def calculate_reparat_calorifer_levels(db: Session) -> dict:
    context = ensure_reparat_calorifer_setup(db)
    payload = _calculate_variant_payload(db, service_id=context.service_id, activity_id=context.activity_id, country_id=context.country_id, zone_id=context.zone_id, locality_id=context.locality_id, currency=context.currency, source_message="Test reparat calorifer Bucuresti")
    return {"context": asdict(context), **payload}


def calculate_reparat_calorifer_variant_levels(db: Session, *, service_slug: str) -> dict:
    contexts = ensure_reparat_calorifer_variants(db)
    context = next((item for item in contexts if item.service_slug == service_slug), None)
    if context is None:
        raise RuntimeError(f"Variant service not found: {service_slug}")
    payload = _calculate_variant_payload(db, service_id=context.service_id, activity_id=context.activity_id, country_id=context.country_id, zone_id=context.zone_id, locality_id=context.locality_id, currency=context.currency, source_message=f"Test {context.service_name} Bucuresti")
    return {"context": asdict(context), **payload}


def summarize_reparat_calorifer_output(payload: dict) -> dict:
    levels = [{"level_name": level["level_name"], "label": level["label"], "net_total": level["net_total"], "vat_value": level["vat_value"], "gross_total": level["gross_total"], "recommended": level["recommended"]} for level in payload["deviz"]["levels"]]
    return {"context": payload["context"], "levels": levels, "resource_rows": payload["base_calculation"]["calculation"]["resources"], "price_analysis": {"resource_subtotal": payload["base_calculation"]["price_analysis"]["resource_subtotal"], "base_price": payload["base_calculation"]["price_analysis"]["base_price"], "adjusted_subtotal": payload["base_calculation"]["price_analysis"]["adjusted_subtotal"]}}


def summarize_reparat_calorifer_final_price(payload: dict) -> dict:
    levels = []
    for level in payload["deviz"]["levels"]:
        levels.append(
            {
                "level_name": level["level_name"],
                "label": level["label"],
                "cost_direct_per_nivel": level["cost_direct_per_nivel"],
                "indirecte": level["indirecte"],
                "platform_maintenance": level["platform_maintenance"],
                "mydarrin_platform": level["mydarrin_platform"],
                "vat_value": level["vat_value"],
                "pret_final_net": level["pret_final_net"],
                "pret_final_gross": level["pret_final_gross"],
                "recommended": level["recommended"],
            }
        )
    return {"context": payload["context"], "levels": levels}


def calculate_all_reparat_calorifer_variant_final_prices(db: Session) -> list[dict]:
    outputs = []
    for variant in REPARAT_CALORIFER_VARIANTS:
        payload = calculate_reparat_calorifer_variant_levels(db, service_slug=variant["service_slug"])
        outputs.append(summarize_reparat_calorifer_final_price(payload))
    return outputs
