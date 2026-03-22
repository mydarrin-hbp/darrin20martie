from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.core.security import get_current_admin_user
from app.db.session import get_db
from app.schemas.price_analysis import (
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
    EntityAttachmentListResponse,
    IndicatorCalculationResponse,
    PriceAnalysisRecipeCreate,
    PriceAnalysisRecipeImportResponse,
    PriceAnalysisRecipeResponse,
    PriceAnalysisRecipeUpdate,
    RecipeLevelName,
    ResourceType,
)
from app.services.attachment_service import create_entity_attachment, get_attachment_file, list_entity_attachments
from app.services.price_analysis_service import (
    calculate_indicators_for_activity,
    create_activity,
    create_recipe,
    create_resource,
    create_resource_price_config,
    delete_activity,
    delete_recipe,
    delete_resource,
    delete_resource_price_config,
    get_activity,
    get_resource,
    import_historical_indicators,
    import_resource_prices,
    import_uniclass_activities,
    list_activities,
    list_recipes,
    list_resources,
    list_resource_price_configs,
    parse_indicator_import_file,
    parse_uniclass_import_file,
    update_activity,
    update_recipe,
    update_resource,
    update_resource_price_config,
)

router = APIRouter(dependencies=[Depends(get_current_admin_user)])
public_router = APIRouter()


@router.get("/activities", response_model=list[CatalogActivityResponse])
def list_catalog_activities(
    domain_id: int | None = Query(default=None),
    category_id: int | None = Query(default=None),
    subcategory_id: int | None = Query(default=None),
    db: Session = Depends(get_db),
):
    return list_activities(
        db,
        domain_id=domain_id,
        category_id=category_id,
        subcategory_id=subcategory_id,
    )


@router.get("/activities/{activity_id}", response_model=CatalogActivityResponse)
def read_catalog_activity(activity_id: int, db: Session = Depends(get_db)):
    activity = get_activity(db, activity_id)
    if not activity:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Activity not found")
    return activity


@router.post("/activities", response_model=CatalogActivityResponse, status_code=status.HTTP_201_CREATED)
def create_catalog_activity(data: CatalogActivityCreate, db: Session = Depends(get_db)):
    result = create_activity(db, data)
    if result == "invalid_taxonomy_context":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid taxonomy context")
    if result == "duplicate_uniclass_code":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Uniclass code already exists")
    return result


@router.put("/activities/{activity_id}", response_model=CatalogActivityResponse)
def update_catalog_activity(activity_id: int, data: CatalogActivityUpdate, db: Session = Depends(get_db)):
    result = update_activity(db, activity_id, data)
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Activity not found")
    if result == "invalid_taxonomy_context":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid taxonomy context")
    if result == "duplicate_uniclass_code":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Uniclass code already exists")
    return result


@router.delete("/activities/{activity_id}")
def delete_catalog_activity(activity_id: int, db: Session = Depends(get_db)):
    result = delete_activity(db, activity_id)
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Activity not found")
    return {"message": "Activity deleted"}


@router.get("/resources", response_model=list[CatalogResourceResponse])
def list_catalog_resources(resource_type: ResourceType | None = Query(default=None), db: Session = Depends(get_db)):
    return list_resources(db, resource_type=resource_type)


@router.get("/resources/prices", response_model=list[AdminResourcePriceConfigResponse])
def list_catalog_resource_prices(
    resource_id: int | None = Query(default=None),
    country_id: int | None = Query(default=None),
    locality_id: int | None = Query(default=None),
    db: Session = Depends(get_db),
):
    return list_resource_price_configs(db, resource_id=resource_id, country_id=country_id, locality_id=locality_id)


@router.get("/resources/{resource_id}", response_model=CatalogResourceResponse)
def read_catalog_resource(resource_id: int, db: Session = Depends(get_db)):
    resource = get_resource(db, resource_id)
    if not resource:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resource not found")
    return resource


@router.post("/resources", response_model=CatalogResourceResponse, status_code=status.HTTP_201_CREATED)
def create_catalog_resource(data: CatalogResourceCreate, db: Session = Depends(get_db)):
    return create_resource(db, data)


@router.put("/resources/{resource_id}", response_model=CatalogResourceResponse)
def update_catalog_resource(resource_id: int, data: CatalogResourceUpdate, db: Session = Depends(get_db)):
    resource = update_resource(db, resource_id, data)
    if not resource:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resource not found")
    return resource


@router.delete("/resources/{resource_id}")
def delete_catalog_resource(resource_id: int, db: Session = Depends(get_db)):
    result = delete_resource(db, resource_id)
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resource not found")
    return {"message": "Resource deleted"}


@router.post("/resources/prices", response_model=AdminResourcePriceConfigResponse, status_code=status.HTTP_201_CREATED)
def create_catalog_resource_price(data: AdminResourcePriceConfigCreate, db: Session = Depends(get_db)):
    result = create_resource_price_config(db, data)
    if result == "resource_not_found":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resource not found")
    if result == "country_not_found":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Country not found")
    if result == "zone_not_found":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Zone not found")
    if result == "zone_country_mismatch":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Zone does not belong to the selected country")
    if result == "locality_not_found":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Locality not found")
    if result == "locality_country_mismatch":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Locality does not belong to the selected country")
    if result == "locality_zone_mismatch":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Locality does not belong to the selected zone")
    if result == "duplicate_context":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Resource price config already exists for this context")
    return result


@router.put("/resources/prices/{config_id}", response_model=AdminResourcePriceConfigResponse)
def update_catalog_resource_price(config_id: int, data: AdminResourcePriceConfigUpdate, db: Session = Depends(get_db)):
    result = update_resource_price_config(db, config_id, data)
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resource price config not found")
    if result == "zone_not_found":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Zone not found")
    if result == "zone_country_mismatch":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Zone does not belong to the selected country")
    if result == "locality_not_found":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Locality not found")
    if result == "locality_country_mismatch":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Locality does not belong to the selected country")
    if result == "locality_zone_mismatch":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Locality does not belong to the selected zone")
    if result == "duplicate_context":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Resource price config already exists for this context")
    return result


@router.delete("/resources/prices/{config_id}")
def delete_catalog_resource_price(config_id: int, db: Session = Depends(get_db)):
    result = delete_resource_price_config(db, config_id)
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resource price config not found")
    return {"message": "Resource price config deleted"}


@router.post("/resources/import", response_model=PriceAnalysisRecipeImportResponse)
async def import_resource_catalog_prices(
    file: UploadFile = File(...),
    country_id: int = Form(...),
    currency: str = Form(...),
    legislation_code: str = Form(...),
    zone_id: int | None = Form(default=None),
    locality_id: int | None = Form(default=None),
    db: Session = Depends(get_db),
):
    content = await file.read()
    try:
        rows = parse_indicator_import_file(file.filename or "resource-price-import.xlsx", content)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    result = import_resource_prices(
        db,
        rows,
        source_name=file.filename or "resource-price-import.xlsx",
        country_id=country_id,
        zone_id=zone_id,
        locality_id=locality_id,
        currency=currency,
        legislation_code=legislation_code,
    )
    if result == "country_not_found":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Country not found")
    if result == "zone_not_found":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Zone not found")
    if result == "zone_country_mismatch":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Zone does not belong to the selected country")
    if result == "locality_not_found":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Locality not found")
    if result == "locality_country_mismatch":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Locality does not belong to the selected country")
    if result == "locality_zone_mismatch":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Locality does not belong to the selected zone")
    return PriceAnalysisRecipeImportResponse(created=result.created, updated=result.updated, skipped=result.skipped)


@router.get("/price-analysis", response_model=list[PriceAnalysisRecipeResponse])
def list_price_analysis(activity_id: int | None = Query(default=None), db: Session = Depends(get_db)):
    return list_recipes(db, activity_id=activity_id)


@router.post("/price-analysis", response_model=PriceAnalysisRecipeResponse, status_code=status.HTTP_201_CREATED)
def create_price_analysis_recipe(data: PriceAnalysisRecipeCreate, db: Session = Depends(get_db)):
    result = create_recipe(db, data)
    if result == "activity_not_found":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Activity not found")
    if result == "resource_not_found":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resource not found")
    if result == "duplicate_recipe":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Recipe row already exists")
    return result


@router.put("/price-analysis/{recipe_id}", response_model=PriceAnalysisRecipeResponse)
def update_price_analysis_recipe(recipe_id: int, data: PriceAnalysisRecipeUpdate, db: Session = Depends(get_db)):
    result = update_recipe(db, recipe_id, data)
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recipe not found")
    if result == "activity_not_found":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Activity not found")
    if result == "resource_not_found":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resource not found")
    if result == "duplicate_recipe":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Recipe row already exists")
    return result


@router.delete("/price-analysis/{recipe_id}")
def delete_price_analysis_recipe(recipe_id: int, db: Session = Depends(get_db)):
    result = delete_recipe(db, recipe_id)
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recipe not found")
    return {"message": "Recipe deleted"}


@router.post("/import-uniclass", response_model=PriceAnalysisRecipeImportResponse)
async def import_uniclass(
    file: UploadFile = File(...),
    domain_id: int | None = Form(default=None),
    category_id: int | None = Form(default=None),
    subcategory_id: int | None = Form(default=None),
    default_uom: str = Form(default="unit"),
    db: Session = Depends(get_db),
):
    content = await file.read()
    try:
        rows = parse_uniclass_import_file(file.filename or "uniclass-import.xlsx", content)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    result = import_uniclass_activities(
        db,
        rows,
        domain_id=domain_id,
        category_id=category_id,
        subcategory_id=subcategory_id,
        default_uom=default_uom,
    )
    if result == "invalid_taxonomy_context":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid taxonomy context")
    return PriceAnalysisRecipeImportResponse(
        created=result.created,
        updated=result.updated,
        skipped=result.skipped,
    )


@router.get("/indicators/calculate", response_model=IndicatorCalculationResponse)
def calculate_indicators(
    activity_id: int = Query(...),
    level: RecipeLevelName = Query(default=RecipeLevelName.ARGINT),
    country_id: int | None = Query(default=None),
    zone_id: int | None = Query(default=None),
    locality_id: int | None = Query(default=None),
    currency: str | None = Query(default=None),
    legislation_code: str | None = Query(default=None),
    db: Session = Depends(get_db),
):
    result = calculate_indicators_for_activity(
        db,
        activity_id,
        level,
        country_id=country_id,
        zone_id=zone_id,
        locality_id=locality_id,
        currency=currency,
        legislation_code=legislation_code,
    )
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Activity not found")
    return result


@router.post("/indicators/import", response_model=PriceAnalysisRecipeImportResponse)
async def import_indicators(file: UploadFile = File(...), db: Session = Depends(get_db)):
    content = await file.read()
    try:
        rows = parse_indicator_import_file(file.filename or "indicator-import.xlsx", content)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    result = import_historical_indicators(db, rows, source_name=file.filename or "indicator-import.xlsx")
    return PriceAnalysisRecipeImportResponse(
        created=result.created,
        updated=result.updated,
        skipped=result.skipped,
    )


@router.get("/activities/attachments", response_model=EntityAttachmentListResponse)
def list_activity_attachments(activity_id: int = Query(...), db: Session = Depends(get_db)):
    return EntityAttachmentListResponse(items=list_entity_attachments(db, entity_type="activity", entity_id=activity_id))


@router.post("/activities/attachments", response_model=EntityAttachmentResponse, status_code=status.HTTP_201_CREATED)
async def upload_activity_attachment(
    activity_id: int = Form(...),
    attachment_type: str = Form(...),
    level_name: str | None = Form(default=None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    content = await file.read()
    result = create_entity_attachment(
        db,
        entity_type="activity",
        entity_id=activity_id,
        attachment_type=attachment_type.upper(),
        level_name=level_name,
        file_name=file.filename or "attachment.bin",
        content=content,
        mime_type=file.content_type,
    )
    if result == "entity_not_found":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Activity not found")
    if result == "invalid_attachment_type":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid attachment type")
    if result == "invalid_level_name":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid level name")
    return result


@router.get("/services/attachments", response_model=EntityAttachmentListResponse)
def list_service_attachments(service_id: int = Query(...), db: Session = Depends(get_db)):
    return EntityAttachmentListResponse(items=list_entity_attachments(db, entity_type="service", entity_id=service_id))


@router.post("/services/attachments", response_model=EntityAttachmentResponse, status_code=status.HTTP_201_CREATED)
async def upload_service_attachment(
    service_id: int = Form(...),
    attachment_type: str = Form(...),
    level_name: str | None = Form(default=None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    content = await file.read()
    result = create_entity_attachment(
        db,
        entity_type="service",
        entity_id=service_id,
        attachment_type=attachment_type.upper(),
        level_name=level_name,
        file_name=file.filename or "attachment.bin",
        content=content,
        mime_type=file.content_type,
    )
    if result == "entity_not_found":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not found")
    if result == "invalid_attachment_type":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid attachment type")
    if result == "invalid_level_name":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid level name")
    return result


@public_router.get("/attachments/content/{attachment_id}")
def download_attachment_content(attachment_id: int, token: str = Query(...), db: Session = Depends(get_db)):
    result = get_attachment_file(db, attachment_id, token)
    if result is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Attachment not found")
    if result == "invalid_token":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid attachment token")
    if result == "file_not_found":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Attachment file not found")
    attachment, path = result
    return FileResponse(path=path, media_type=attachment.mime_type, filename=attachment.file_name)
