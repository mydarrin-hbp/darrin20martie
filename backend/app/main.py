import base64
import secrets

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.router import api_router
from app.core.config import settings
from app.db.base import Base
from app.db.session import engine

import app.models.domain  # noqa: F401
import app.models.category  # noqa: F401
import app.models.price_analysis  # noqa: F401
import app.models.subcategory  # noqa: F401
import app.models.service  # noqa: F401
import app.modules.activities.models  # noqa: F401
import app.modules.ai_robot_darrin.models  # noqa: F401
import app.modules.cost_engine.models  # noqa: F401
import app.modules.deviz_engine.models  # noqa: F401
import app.modules.esco.models  # noqa: F401
import app.modules.geography.models  # noqa: F401
import app.modules.site_content.models  # noqa: F401


app = FastAPI(title="My Darrin API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in settings.BACKEND_CORS_ORIGINS.split(",") if origin.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)


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


app.include_router(api_router)


@app.get("/health")
def health():
    return {"status": "ok"}
