from celery import Celery
from app.core.config import settings

# Initialize Celery app with Redis broker and backend configured from settings
celery_app = Celery(
    "docuquant_worker",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=["app.services.tasks"],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=300,  # 5 minutes maximum runtime
    worker_max_tasks_per_child=50,  # Prevent memory leakage from heavy PDF/ML models
)
