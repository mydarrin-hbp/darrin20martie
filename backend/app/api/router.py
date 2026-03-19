from fastapi import APIRouter

from app.modules.catalog.router import router as catalog_router
from app.api.v1.endpoints.admin import router as admin_router
from app.api.v1.endpoints.auth import router as auth_router

api_router = APIRouter()

# Include authentication endpoints
api_router.include_router(
    auth_router,
    prefix="/api/v1",
    tags=["Authentication"],
)

# Include admin endpoints
api_router.include_router(
    admin_router,
    prefix="/api/v1",
    tags=["Admin"],
)

# Include catalog endpoints
api_router.include_router(
    catalog_router,
    prefix="/api/v1/catalog",
    tags=["Catalog"],
)