# ================================================================
# Multi-stage Dockerfile for DocuQuant AI Backend
# ================================================================
FROM python:3.11-slim as base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# Install system dependencies needed for PDF processing and compilation
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy and install python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source code
COPY . .

# Create uploads directory and set permissions
RUN mkdir -p uploads && chmod 777 uploads

# Non-root security user
RUN useradd -m docuuser && chown -R docuuser:docuuser /app
USER docuuser

EXPOSE 8000

# Default command starts FastAPI with uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

