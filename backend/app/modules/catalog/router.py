from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.category import CategoryCreate, CategoryResponse, CategoryUpdate
from app.schemas.domain import DomainCreate, DomainResponse, DomainUpdate
from app.schemas.service import ServiceCreate, ServiceResponse, ServiceUpdate
from app.schemas.subcategory import (
    SubcategoryCreate,
    SubcategoryResponse,
    SubcategoryUpdate,
)
from app.services.catalog_service import (
    create_category,
    create_domain,
    create_service,
    create_subcategory,
    delete_category,
    delete_domain,
    delete_service,
    delete_subcategory,
    get_categories,
    get_domain,
    get_domains,
    get_service,
    get_services,
    get_subcategory,
    get_subcategories,
    update_category,
    update_domain,
    update_service,
    update_subcategory,
)

router = APIRouter()


@router.get("/domains", response_model=list[DomainResponse])
def list_domains(db: Session = Depends(get_db)):
    return get_domains(db)


@router.get("/domains/{domain_id}", response_model=DomainResponse)
def read_domain(domain_id: int, db: Session = Depends(get_db)):
    domain = get_domain(db, domain_id)

    if not domain:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Domain not found",
        )

    return domain


@router.post(
    "/domains",
    response_model=DomainResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_new_domain(
    domain: DomainCreate,
    db: Session = Depends(get_db),
):
    created_domain = create_domain(db, domain)

    if created_domain is None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A domain with this slug already exists",
        )

    return created_domain


@router.put("/domains/{domain_id}", response_model=DomainResponse)
def update_existing_domain(
    domain_id: int,
    domain_update: DomainUpdate,
    db: Session = Depends(get_db),
):
    updated_domain = update_domain(db, domain_id, domain_update)

    if updated_domain is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Domain not found",
        )

    if updated_domain == "duplicate_slug":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A domain with this slug already exists",
        )

    return updated_domain


@router.delete("/domains/{domain_id}")
def remove_domain(domain_id: int, db: Session = Depends(get_db)):
    result = delete_domain(db, domain_id)

    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Domain not found",
        )

    return {"message": "Domain deleted"}


@router.get("/categories", response_model=list[CategoryResponse])
def list_categories(db: Session = Depends(get_db)):
    return get_categories(db)


@router.get("/categories/{category_id}", response_model=CategoryResponse)
def read_category(category_id: int, db: Session = Depends(get_db)):
    category = get_category(db, category_id)

    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found",
        )

    return category


@router.post(
    "/categories",
    response_model=CategoryResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_new_category(
    category: CategoryCreate,
    db: Session = Depends(get_db),
):
    created_category = create_category(db, category)

    if created_category == "domain_not_found":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Domain not found",
        )

    if created_category == "duplicate_slug":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A category with this slug already exists",
        )

    return created_category


@router.put("/categories/{category_id}", response_model=CategoryResponse)
def update_existing_category(
    category_id: int,
    category_update: CategoryUpdate,
    db: Session = Depends(get_db),
):
    updated_category = update_category(db, category_id, category_update)

    if updated_category is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found",
        )

    if updated_category == "domain_not_found":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Domain not found",
        )

    if updated_category == "duplicate_slug":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A category with this slug already exists",
        )

    return updated_category


@router.delete("/categories/{category_id}")
def remove_category(category_id: int, db: Session = Depends(get_db)):
    result = delete_category(db, category_id)

    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found",
        )

    return {"message": "Category deleted"}


@router.get("/subcategories", response_model=list[SubcategoryResponse])
def list_subcategories(db: Session = Depends(get_db)):
    return get_subcategories(db)


@router.get("/subcategories/{subcategory_id}", response_model=SubcategoryResponse)
def read_subcategory(subcategory_id: int, db: Session = Depends(get_db)):
    subcategory = get_subcategory(db, subcategory_id)

    if not subcategory:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subcategory not found",
        )

    return subcategory


@router.post(
    "/subcategories",
    response_model=SubcategoryResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_new_subcategory(
    subcategory: SubcategoryCreate,
    db: Session = Depends(get_db),
):
    created_subcategory = create_subcategory(db, subcategory)

    if created_subcategory == "category_not_found":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found",
        )

    if created_subcategory == "duplicate_slug":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A subcategory with this slug already exists",
        )

    return created_subcategory


@router.put("/subcategories/{subcategory_id}", response_model=SubcategoryResponse)
def update_existing_subcategory(
    subcategory_id: int,
    subcategory_update: SubcategoryUpdate,
    db: Session = Depends(get_db),
):
    updated_subcategory = update_subcategory(db, subcategory_id, subcategory_update)

    if updated_subcategory is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subcategory not found",
        )

    if updated_subcategory == "category_not_found":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found",
        )

    if updated_subcategory == "duplicate_slug":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A subcategory with this slug already exists",
        )

    return updated_subcategory


@router.delete("/subcategories/{subcategory_id}")
def remove_subcategory(subcategory_id: int, db: Session = Depends(get_db)):
    result = delete_subcategory(db, subcategory_id)

    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subcategory not found",
        )

    return {"message": "Subcategory deleted"}


@router.get("/services", response_model=list[ServiceResponse])
def list_services(db: Session = Depends(get_db)):
    return [ServiceResponse.from_service(service) for service in get_services(db)]


@router.get("/services/{service_id}", response_model=ServiceResponse)
def read_service(service_id: int, db: Session = Depends(get_db)):
    service = get_service(db, service_id)

    if not service:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found",
        )

    return ServiceResponse.from_service(service)


@router.post(
    "/services",
    response_model=ServiceResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_new_service(
    service: ServiceCreate,
    db: Session = Depends(get_db),
):
    created_service = create_service(db, service)

    if created_service == "subcategory_not_found":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subcategory not found",
        )

    if created_service == "duplicate_slug":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A service with this slug already exists",
        )

    return ServiceResponse.from_service(created_service)


@router.put("/services/{service_id}", response_model=ServiceResponse)
def update_existing_service(
    service_id: int,
    service_update: ServiceUpdate,
    db: Session = Depends(get_db),
):
    updated_service = update_service(db, service_id, service_update)

    if updated_service is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found",
        )

    if updated_service == "subcategory_not_found":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Subcategory not found",
        )

    if updated_service == "duplicate_slug":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A service with this slug already exists",
        )

    return ServiceResponse.from_service(updated_service)


@router.delete("/services/{service_id}")
def remove_service(service_id: int, db: Session = Depends(get_db)):
    result = delete_service(db, service_id)

    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service not found",
        )

    return {"message": "Service deleted"}
