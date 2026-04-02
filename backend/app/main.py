import base64
import secrets

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from slowapi import _rate_limit_exceeded_handler

from app.api.router import api_router
from app.core.config import settings
from app.core.limiter import limiter
from app.db.base import Base
from app.db.sqlite_compat import ensure_sqlite_runtime_schema
from app.db.session import engine
from app.services.observability_service import setup_observability

import app.models.domain  # noqa: F401
import app.models.category  # noqa: F401
import app.models.assets  # noqa: F401
import app.models.admin_rbac  # noqa: F401
import app.models.price_analysis  # noqa: F401
import app.models.subcategory  # noqa: F401
import app.models.service  # noqa: F401
import app.models.user  # noqa: F401
import app.modules.activities.models  # noqa: F401
import app.modules.ai_robot_darrin.models  # noqa: F401
import app.modules.cost_engine.models  # noqa: F401
import app.modules.deviz_engine.models  # noqa: F401
import app.modules.esco.models  # noqa: F401
import app.modules.geography.models  # noqa: F401
import app.modules.orders.models  # noqa: F401
import app.modules.site_content.models  # noqa: F401


app = FastAPI(title="My Darrin API")

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in settings.BACKEND_CORS_ORIGINS.split(",") if origin.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)
ensure_sqlite_runtime_schema(engine)
setup_observability(app, engine)


def _is_gate_authorized(request: Request) -> bool:
    raw_header = request.headers.get("x-gate-authorization") or request.headers.get("authorization")
    if not raw_header or not raw_header.startswith("Basic "):
        return False

    encoded = raw_header.split(" ", 1)[1].strip()
    try:
        decoded = base64.b64decode(encoded).decode("utf-8")
    except Exception:
        return False

    if ":" not in decoded:
        return False

    username, password = decoded.split(":", 1)
    return secrets.compare_digest(username, settings.BASIC_AUTH_GATE_USERNAME) and secrets.compare_digest(
        password,
        settings.BASIC_AUTH_GATE_PASSWORD,
    )


@app.middleware("http")
async def basic_auth_gate(request: Request, call_next):
    # Let CORS preflight requests pass through unchallenged so browser-based
    # clients can complete the actual authenticated request.
    if request.method == "OPTIONS":
        return await call_next(request)

    if settings.ENABLE_BASIC_AUTH_GATE and not _is_gate_authorized(request):
        return JSONResponse(
            status_code=401,
            content={"detail": "Basic Auth gate active"},
            headers={"WWW-Authenticate": 'Basic realm="My Darrin Gate"'},
        )

    return await call_next(request)


@app.middleware("http")
async def security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers.setdefault("X-Content-Type-Options", "nosniff")
    response.headers.setdefault("X-Frame-Options", "DENY")
    response.headers.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
    response.headers.setdefault("Permissions-Policy", "geolocation=(), microphone=(), camera=()")
    response.headers.setdefault(
        "Strict-Transport-Security",
        "max-age=63072000; includeSubDomains; preload",
    )
    return response


app.include_router(api_router)


@app.get("/health")
def health():
    return {"status": "ok"}
