import time
import socket
from urllib.parse import urlparse
from fastapi import APIRouter
from app.core.config import settings

router = APIRouter()
START_TIME = time.time()


def check_redis_socket(redis_url: str, timeout: float = 0.5) -> bool:
    """Quick non-blocking TCP socket ping to check if Redis broker is reachable."""
    try:
        parsed = urlparse(redis_url)
        host = parsed.hostname or "localhost"
        port = parsed.port or 6379
        with socket.create_connection((host, port), timeout=timeout):
            return True
    except Exception:
        return False


@router.get("/health", tags=["System"])
def health_check():
    """System health probe checking API uptime and Redis broker connectivity."""
    redis_connected = check_redis_socket(settings.REDIS_URL, timeout=0.5)

    return {
        "status": "healthy" if redis_connected else "degraded",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "redis_connected": redis_connected,
        "uptime_seconds": round(time.time() - START_TIME, 1),
    }
