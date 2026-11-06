#!/usr/bin/env bash

# 1. Start the Celery worker in the background
celery -A app.core.celery_app worker --loglevel=info --pool=solo &

# 2. Start the FastAPI server on the port Render assigns
uvicorn app.main:app --host 0.0.0.0 --port $PORT