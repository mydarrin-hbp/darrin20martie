from fastapi import FastAPI

from app.api.router import api_router
from app.db.base import Base
from app.db.session import engine

import app.models.domain  # noqa: F401
import app.models.category  # noqa: F401
import app.models.subcategory  # noqa: F401
import app.models.service  # noqa: F401


app = FastAPI(title="My Darrin API")

Base.metadata.create_all(bind=engine)

app.include_router(api_router)


@app.get("/health")
def health():
    return {"status": "ok"}