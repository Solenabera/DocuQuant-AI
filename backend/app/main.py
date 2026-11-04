import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.logging import logger
from app.api.v1.api import api_router
from app.api.v1.endpoints.health import router as health_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan management for initialization and clean shutdown."""
    logger.info(f"Starting {settings.PROJECT_NAME} v{settings.VERSION} [{settings.ENVIRONMENT}]")
    yield
    logger.info(f"Shutting down {settings.PROJECT_NAME}")


app = FastAPI(
    title=settings.PROJECT_NAME,
    description=settings.DESCRIPTION,
    version=settings.VERSION,
    openapi_url="/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Optional CDN patching for restricted corporate environments (opt-in)
if os.getenv("ENABLE_CDN_PATCH", "false").lower() == "true":
    try:
        import fastapi_cdn_host
        fastapi_cdn_host.patch_docs(app)
    except Exception as e:
        logger.warning(f"Failed to patch docs CDN: {e}")

# CORS Middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root level health and info endpoints
app.include_router(health_router, prefix="", tags=["System"])

# API V1 Router
app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/api/v1/docs", include_in_schema=False)
def redirect_api_docs():
    """Redirect /api/v1/docs to canonical /docs endpoint."""
    return RedirectResponse(url="/docs")


@app.get("/", tags=["System"])
def root():
    """Root info endpoint providing API documentation pointers."""
    return {
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "online",
        "docs_url": "/docs",
        "redoc_url": "/redoc",
        "api_v1": settings.API_V1_STR,
    }
