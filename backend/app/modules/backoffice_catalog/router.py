from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile, status
from sqlalchemy.orm import Session

from app.core.security import get_current_admin_user
from app.db.session import get_db
from app.schemas.backoffice_catalog import CatalogImportResponse
from app.schemas.backoffice_service_creation import BackofficeServiceCreateResponse
from app.schemas.category import CategoryBackofficeResponse, CategoryCreate, CategoryUpdate
from app.schemas.domain import DomainBackofficeResponse, DomainCreate, DomainUpdate
from app.schemas.subcategory import SubcategoryBackofficeResponse, SubcategoryCreate, SubcategoryUpdate
from app.services.backoffice_service_creation import create_backoffice_service_flow, parse_service_create_payload
from app.services.catalog_service import (
    create_category,
    create_domain,
    create_subcategory,
    delete_category,
    delete_domain,
    delete_subcategory,
    get_categories,
    get_domain,
    get_domains,
    get_subcategories,
    import_catalog_taxonomy,
    parse_catalog_import_file,
    update_category,
    update_domain,
    update_subcategory,
)

router = APIRouter(dependencies=[Depends(get_current_admin_user)])


@router.get("/domains", response_model=list[DomainBackofficeResponse])
def list_domains(db: Session = Depends(get_db)):
    return get_domains(db)


@router.get("/domains/{domain_id}", response_model=DomainBackofficeResponse)
def read_domain(domain_id: int, db: Session = Depends(get_db)):
    domain = get_domain(db, domain_id)
    if not domain:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Domain not found")
    return domain


@router.post("/domains", response_model=DomainBackofficeResponse, status_code=status.HTTP_201_CREATED)
def create_new_domain(domain: DomainCreate, db: Session = Depends(get_db)):
    created_domain = create_domain(db, domain)
    if created_domain == "duplicate_slug":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="A catalog slug with this value already exists")
    return created_domain


@router.put("/domains/{domain_id}", response_model=DomainBackofficeResponse)
def update_existing_domain(domain_id: int, domain_update: DomainUpdate, db: Session = Depends(get_db)):
    updated_domain = update_domain(db, domain_id, domain_update)
    if updated_domain is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Domain not found")
    if updated_domain == "duplicate_slug":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="A catalog slug with this value already exists")
    return updated_domain


@router.delete("/domains/{domain_id}")
def remove_domain(domain_id: int, db: Session = Depends(get_db)):
    result = delete_domain(db, domain_id)
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Domain not found")
    return {"message": "Domain deleted"}


@router.get("/categories", response_model=list[CategoryBackofficeResponse])
def list_categories(domain_id: int | None = Query(default=None), db: Session = Depends(get_db)):
    return get_categories(db, domain_id=domain_id)


@router.post("/categories", response_model=CategoryBackofficeResponse, status_code=status.HTTP_201_CREATED)
def create_new_category(category: CategoryCreate, db: Session = Depends(get_db)):
    created_category = create_category(db, category)
    if created_category == "domain_not_found":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Domain not found")
    if created_category == "duplicate_slug":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="A catalog slug with this value already exists")
    return created_category


@router.put("/categories/{category_id}", response_model=CategoryBackofficeResponse)
def update_existing_category(category_id: int, category_update: CategoryUpdate, db: Session = Depends(get_db)):
    updated_category = update_category(db, category_id, category_update)
    if updated_category is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    if updated_category == "domain_not_found":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Domain not found")
    if updated_category == "duplicate_slug":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="A catalog slug with this value already exists")
    return updated_category


@router.delete("/categories/{category_id}")
def remove_category(category_id: int, db: Session = Depends(get_db)):
    result = delete_category(db, category_id)
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    return {"message": "Category deleted"}


@router.get("/subcategories", response_model=list[SubcategoryBackofficeResponse])
def list_subcategories(
    domain_id: int | None = Query(default=None),
    category_id: int | None = Query(default=None),
    db: Session = Depends(get_db),
):
    return get_subcategories(db, category_id=category_id, domain_id=domain_id)


@router.post("/subcategories", response_model=SubcategoryBackofficeResponse, status_code=status.HTTP_201_CREATED)
def create_new_subcategory(subcategory: SubcategoryCreate, db: Session = Depends(get_db)):
    created_subcategory = create_subcategory(db, subcategory)
    if created_subcategory == "category_not_found":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    if created_subcategory == "duplicate_slug":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="A catalog slug with this value already exists")
    return created_subcategory


@router.put("/subcategories/{subcategory_id}", response_model=SubcategoryBackofficeResponse)
def update_existing_subcategory(subcategory_id: int, subcategory_update: SubcategoryUpdate, db: Session = Depends(get_db)):
    updated_subcategory = update_subcategory(db, subcategory_id, subcategory_update)
    if updated_subcategory is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subcategory not found")
    if updated_subcategory == "category_not_found":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    if updated_subcategory == "duplicate_slug":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="A catalog slug with this value already exists")
    return updated_subcategory


@router.delete("/subcategories/{subcategory_id}")
def remove_subcategory(subcategory_id: int, db: Session = Depends(get_db)):
    result = delete_subcategory(db, subcategory_id)
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subcategory not found")
    return {"message": "Subcategory deleted"}


@router.post("/import-caen-uniclass-esco", response_model=CatalogImportResponse)
async def import_caen_uniclass_esco(file: UploadFile = File(...), db: Session = Depends(get_db)):
    content = await file.read()
    try:
        rows = parse_catalog_import_file(file.filename or "catalog-import.csv", content)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    return import_catalog_taxonomy(db, rows)


@router.post("/services/create", response_model=BackofficeServiceCreateResponse, status_code=status.HTTP_201_CREATED)
async def create_service_from_backoffice(
    payload: str = Form(...),
    main_image: UploadFile | None = File(default=None),
    demo_video: UploadFile | None = File(default=None),
    instructions_pdf: UploadFile | None = File(default=None),
    db: Session = Depends(get_db),
):
    try:
        parsed_payload = parse_service_create_payload(payload)
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid payload: {exc}") from exc

    result = create_backoffice_service_flow(
        db,
        payload=parsed_payload,
        main_image=main_image,
        demo_video=demo_video,
        instructions_pdf=instructions_pdf,
    )
    if result == "subcategory_not_found":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subcategory not found")
    if result == "category_not_found":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    if result == "subcategory_category_mismatch":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Subcategory does not belong to category")
    if result == "category_domain_mismatch":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Category does not belong to domain")
    if result == "duplicate_slug":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="A service with this slug already exists")
    if result == "activity_required_for_recipe":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Each recipe requires a primary activity")
    if result == "activity_not_found":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Activity not found")
    if result == "activity_subcategory_mismatch":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Activity does not belong to the selected subcategory")
    if result == "resource_not_found":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resource not found")
    if result == "duplicate_recipe":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Recipe row already exists")
    if result == "entity_not_found":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not found for attachment upload")
    if result == "invalid_attachment_type":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid attachment type")
    return result
