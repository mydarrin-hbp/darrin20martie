from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, selectinload

from app.models.category import Category
from app.models.domain import Domain
from app.models.service import Service
from app.models.subcategory import SubCategory
from app.schemas.category import CategoryCreate, CategoryUpdate
from app.schemas.domain import DomainCreate, DomainUpdate
from app.schemas.service import ServiceCreate, ServiceUpdate
from app.schemas.subcategory import SubcategoryCreate, SubcategoryUpdate


def get_domains(db: Session):
    return db.execute(
        select(Domain).order_by(Domain.id)
    ).scalars().all()


def get_domain(db: Session, domain_id: int):
    return db.get(Domain, domain_id)


def get_domain_by_slug(db: Session, slug: str):
    return db.execute(
        select(Domain).where(Domain.slug == slug)
    ).scalar_one_or_none()


def create_domain(db: Session, domain: DomainCreate):
    existing_domain = get_domain_by_slug(db, domain.slug)
    if existing_domain:
        return None

    db_domain = Domain(**domain.model_dump())
    db.add(db_domain)

    try:
        db.commit()
        db.refresh(db_domain)
        return db_domain
    except IntegrityError:
        db.rollback()
        return None


def update_domain(db: Session, domain_id: int, domain_update: DomainUpdate):
    db_domain = db.get(Domain, domain_id)

    if not db_domain:
        return None

    update_data = domain_update.model_dump(exclude_unset=True)

    if "slug" in update_data:
        existing_domain = get_domain_by_slug(db, update_data["slug"])
        if existing_domain and existing_domain.id != domain_id:
            return "duplicate_slug"

    for field, value in update_data.items():
        setattr(db_domain, field, value)

    try:
        db.commit()
        db.refresh(db_domain)
        return db_domain
    except IntegrityError:
        db.rollback()
        return "duplicate_slug"


def delete_domain(db: Session, domain_id: int):
    db_domain = db.get(Domain, domain_id)

    if not db_domain:
        return None

    db.delete(db_domain)
    db.commit()

    return True


def get_categories(db: Session):
    return db.execute(
        select(Category).order_by(Category.id)
    ).scalars().all()


def get_category(db: Session, category_id: int):
    return db.get(Category, category_id)


def get_category_by_slug(db: Session, slug: str):
    return db.execute(
        select(Category).where(Category.slug == slug)
    ).scalar_one_or_none()


def create_category(db: Session, category: CategoryCreate):
    db_domain = db.get(Domain, category.domain_id)
    if not db_domain:
        return "domain_not_found"

    existing_category = get_category_by_slug(db, category.slug)
    if existing_category:
        return "duplicate_slug"

    db_category = Category(**category.model_dump())
    db.add(db_category)

    try:
        db.commit()
        db.refresh(db_category)
        return db_category
    except IntegrityError:
        db.rollback()
        return "duplicate_slug"


def update_category(db: Session, category_id: int, category_update: CategoryUpdate):
    db_category = db.get(Category, category_id)

    if not db_category:
        return None

    update_data = category_update.model_dump(exclude_unset=True)

    if "domain_id" in update_data:
        db_domain = db.get(Domain, update_data["domain_id"])
        if not db_domain:
            return "domain_not_found"

    if "slug" in update_data:
        existing_category = get_category_by_slug(db, update_data["slug"])
        if existing_category and existing_category.id != category_id:
            return "duplicate_slug"

    for field, value in update_data.items():
        setattr(db_category, field, value)

    try:
        db.commit()
        db.refresh(db_category)
        return db_category
    except IntegrityError:
        db.rollback()
        return "duplicate_slug"


def delete_category(db: Session, category_id: int):
    db_category = db.get(Category, category_id)

    if not db_category:
        return None

    db.delete(db_category)
    db.commit()

    return True


def get_subcategories(db: Session):
    return db.execute(
        select(SubCategory).order_by(SubCategory.id)
    ).scalars().all()


def get_subcategory(db: Session, subcategory_id: int):
    return db.get(SubCategory, subcategory_id)


def get_subcategory_by_slug(db: Session, slug: str):
    return db.execute(
        select(SubCategory).where(SubCategory.slug == slug)
    ).scalar_one_or_none()


def create_subcategory(db: Session, subcategory: SubcategoryCreate):
    db_category = db.get(Category, subcategory.category_id)
    if not db_category:
        return "category_not_found"

    existing_subcategory = get_subcategory_by_slug(db, subcategory.slug)
    if existing_subcategory:
        return "duplicate_slug"

    db_subcategory = SubCategory(**subcategory.model_dump())
    db.add(db_subcategory)

    try:
        db.commit()
        db.refresh(db_subcategory)
        return db_subcategory
    except IntegrityError:
        db.rollback()
        return "duplicate_slug"


def update_subcategory(
    db: Session,
    subcategory_id: int,
    subcategory_update: SubcategoryUpdate,
):
    db_subcategory = db.get(SubCategory, subcategory_id)

    if not db_subcategory:
        return None

    update_data = subcategory_update.model_dump(exclude_unset=True)

    if "category_id" in update_data:
        db_category = db.get(Category, update_data["category_id"])
        if not db_category:
            return "category_not_found"

    if "slug" in update_data:
        existing_subcategory = get_subcategory_by_slug(db, update_data["slug"])
        if existing_subcategory and existing_subcategory.id != subcategory_id:
            return "duplicate_slug"

    for field, value in update_data.items():
        setattr(db_subcategory, field, value)

    try:
        db.commit()
        db.refresh(db_subcategory)
        return db_subcategory
    except IntegrityError:
        db.rollback()
        return "duplicate_slug"


def delete_subcategory(db: Session, subcategory_id: int):
    db_subcategory = db.get(SubCategory, subcategory_id)

    if not db_subcategory:
        return None

    db.delete(db_subcategory)
    db.commit()

    return True


def get_services(db: Session):
    return db.execute(
        select(Service)
        .options(selectinload(Service.subcategories))
        .order_by(Service.id)
    ).scalars().all()


def get_service(db: Session, service_id: int):
    return db.execute(
        select(Service)
        .options(selectinload(Service.subcategories))
        .where(Service.id == service_id)
    ).scalar_one_or_none()


def get_service_by_slug(db: Session, slug: str):
    return db.execute(
        select(Service)
        .options(selectinload(Service.subcategories))
        .where(Service.slug == slug)
    ).scalar_one_or_none()


def get_subcategories_by_ids(db: Session, subcategory_ids: list[int]) -> list[SubCategory]:
    unique_ids = list(dict.fromkeys(subcategory_ids))
    subcategories = db.execute(
        select(SubCategory)
        .where(SubCategory.id.in_(unique_ids))
        .order_by(SubCategory.id)
    ).scalars().all()

    subcategory_map = {subcategory.id: subcategory for subcategory in subcategories}
    return [subcategory_map[subcategory_id] for subcategory_id in unique_ids if subcategory_id in subcategory_map]


def create_service(db: Session, service: ServiceCreate):
    db_subcategories = get_subcategories_by_ids(db, service.subcategory_ids)
    if len(db_subcategories) != len(set(service.subcategory_ids)):
        return "subcategory_not_found"

    existing_service = get_service_by_slug(db, service.slug)
    if existing_service:
        return "duplicate_slug"

    service_data = service.model_dump(exclude={"subcategory_ids"})
    db_service = Service(
        **service_data,
        legacy_subcategory_id=db_subcategories[0].id,
    )
    db_service.subcategories = db_subcategories
    db.add(db_service)

    try:
        db.commit()
        db.refresh(db_service)
        return db_service
    except IntegrityError:
        db.rollback()
        return "duplicate_slug"


def update_service(db: Session, service_id: int, service_update: ServiceUpdate):
    db_service = get_service(db, service_id)

    if not db_service:
        return None

    update_data = service_update.model_dump(exclude_unset=True)

    if "subcategory_ids" in update_data:
        db_subcategories = get_subcategories_by_ids(db, update_data["subcategory_ids"])
        if len(db_subcategories) != len(set(update_data["subcategory_ids"])):
            return "subcategory_not_found"
        db_service.subcategories = db_subcategories
        db_service.legacy_subcategory_id = db_subcategories[0].id
        update_data.pop("subcategory_ids")

    if "slug" in update_data:
        existing_service = get_service_by_slug(db, update_data["slug"])
        if existing_service and existing_service.id != service_id:
            return "duplicate_slug"

    for field, value in update_data.items():
        setattr(db_service, field, value)

    try:
        db.commit()
        db.refresh(db_service)
        return db_service
    except IntegrityError:
        db.rollback()
        return "duplicate_slug"


def delete_service(db: Session, service_id: int):
    db_service = db.get(Service, service_id)

    if not db_service:
        return None

    db.delete(db_service)
    db.commit()

    return True
