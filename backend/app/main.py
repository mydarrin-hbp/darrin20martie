from fastapi import FastAPI
from app.modules.catalog.router import router as catalog_router

app = FastAPI(title="My Darrin API", version="0.1.0")

app.include_router(catalog_router)


@app.get("/health")
def health():
    return {"status": "ok"}