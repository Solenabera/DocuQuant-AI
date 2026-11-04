from fastapi import APIRouter
from app.api.v1.endpoints import extraction, health

api_router = APIRouter()

api_router.include_router(extraction.router, tags=["Extraction & Audit"])
api_router.include_router(health.router, tags=["System Health"])

