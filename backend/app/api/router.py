from fastapi import APIRouter

from app.modules.catalog.router import router as catalog_router
from app.api.v1.endpoints.admin import router as admin_router
from app.api.v1.endpoints.auth import router as auth_router
from app.modules.activities.router import router as activities_router
from app.modules.ai_robot_darrin.router import router as ai_router
from app.modules.backoffice_catalog.router import router as backoffice_catalog_router
from app.modules.backoffice_contact.router import router as backoffice_contact_router
from app.modules.cost_engine.admin_config import router as cost_admin_router
from app.modules.cost_engine.router import router as cost_router
from app.modules.deviz_engine.admin_config import router as deviz_admin_router
from app.modules.deviz_engine.router import router as deviz_router
from app.modules.esco.backoffice_router import router as esco_backoffice_router
from app.modules.estimates.router import router as estimates_router
from app.modules.geo_fiscal_engine.router import router as geo_fiscal_router
from app.modules.geography.backoffice_router import router as geography_backoffice_router
from app.modules.geography.router import router as geography_router
from app.modules.price_analysis.router import public_router as price_analysis_public_router
from app.modules.price_analysis.router import router as price_analysis_router
from app.modules.site_content.router import admin_router as site_content_admin_router
from app.modules.site_content.router import public_router as site_content_public_router
from app.modules.sync.router import admin_router as sync_admin_router
from app.modules.sync.router import public_router as sync_public_router
from app.modules.test_support.router import router as test_support_router

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

api_router.include_router(
    backoffice_catalog_router,
    prefix="/api/v1/backoffice",
    tags=["BackofficeCatalog"],
)

api_router.include_router(
    backoffice_contact_router,
    prefix="/api/v1/backoffice",
    tags=["BackofficeContact"],
)

api_router.include_router(
    esco_backoffice_router,
    prefix="/api/v1/backoffice",
    tags=["BackofficeEsco"],
)

api_router.include_router(
    price_analysis_router,
    prefix="/api/v1/backoffice",
    tags=["BackofficePriceAnalysis"],
)

api_router.include_router(
    price_analysis_public_router,
    prefix="/api/v1/backoffice",
    tags=["BackofficeAttachments"],
)

api_router.include_router(
    site_content_public_router,
    prefix="/api/v1",
    tags=["PublicSiteContent"],
)

api_router.include_router(
    site_content_admin_router,
    prefix="/api/v1",
    tags=["AdminSiteContent"],
)

api_router.include_router(
    sync_public_router,
    prefix="/api/v1",
    tags=["PublicSync"],
)

api_router.include_router(
    sync_admin_router,
    prefix="/api/v1",
    tags=["AdminSync"],
)

api_router.include_router(
    activities_router,
    prefix="/api/v1",
    tags=["Activities"],
)

api_router.include_router(
    geography_router,
    prefix="/api/v1",
    tags=["Geography"],
)

api_router.include_router(
    geo_fiscal_router,
    prefix="/api/v1",
    tags=["GeoFiscalEngine"],
)

api_router.include_router(
    geography_backoffice_router,
    prefix="/api/v1/backoffice",
    tags=["BackofficeGeography"],
)

api_router.include_router(
    estimates_router,
    prefix="/api/v1",
    tags=["Estimates"],
)

api_router.include_router(
    cost_router,
    prefix="/api/v1",
    tags=["CostEngine"],
)

api_router.include_router(
    cost_admin_router,
    prefix="/api/v1",
    tags=["CostEngineAdmin"],
)

api_router.include_router(
    deviz_admin_router,
    prefix="/api/v1",
    tags=["DevizEngineAdmin"],
)

api_router.include_router(
    deviz_router,
    prefix="/api/v1",
    tags=["DevizEngine"],
)

api_router.include_router(
    ai_router,
    prefix="/api/v1",
    tags=["AIRobotDarrin"],
)

api_router.include_router(
    test_support_router,
    prefix="/api/v1",
    tags=["TestSupport"],
)
