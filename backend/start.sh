#!/usr/bin/env bash
set -e

# Ensure uploads directory exists
mkdir -p uploads

# 1. Start Celery worker in the background
# Points to celery_app instance in app/core/celery_app.py
celery -A app.core.celery_app.celery_app worker --loglevel=info --pool=solo &

# 2. Start FastAPI server with dynamic port assigned by Render ($PORT)
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
