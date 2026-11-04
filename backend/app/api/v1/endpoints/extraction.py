import uuid
from pathlib import Path
from typing import Optional, Any, Dict
from fastapi import APIRouter, UploadFile, File, HTTPException, status
from pydantic import BaseModel
from celery.result import AsyncResult

from app.core.config import settings
from app.core.logging import logger
from app.core.celery_app import celery_app
from app.services.tasks import process_document_task

router = APIRouter()


class UploadResponse(BaseModel):
    message: str
    task_id: str
    status_url: str


class TaskStatusResponse(BaseModel):
    task_id: str
    status: str
    details: Optional[str] = None
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None


@router.post(
    "/extract",
    response_model=UploadResponse,
    status_code=status.HTTP_202_ACCEPTED,
    summary="Upload financial PDF for extraction",
    description="Accepts a PDF document, stores it temporarily, and dispatches a background extraction task to Celery.",
)
async def upload_financial_document(file: UploadFile = File(...)):
    """Uploads PDF, saves to deterministic upload dir, and queues Celery task."""
    is_pdf_content_type = file.content_type in ["application/pdf", "application/x-pdf", "application/octet-stream"]
    is_pdf_extension = file.filename and file.filename.lower().endswith(".pdf")

    if not (is_pdf_content_type or is_pdf_extension):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file format. Only PDF documents (.pdf) are supported.",
        )

    contents = await file.read()
    if len(contents) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded file is empty.",
        )

    if len(contents) > settings.max_file_size_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds maximum permissible size of {settings.MAX_FILE_SIZE_MB}MB.",
        )

    file_id = str(uuid.uuid4())
    destination: Path = settings.UPLOAD_DIR / f"{file_id}.pdf"

    try:
        with open(destination, "wb") as f:
            f.write(contents)
    except Exception as e:
        logger.error(f"Failed to persist uploaded PDF: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save uploaded file on server.",
        )

    try:
        task = process_document_task.delay(str(destination))
        logger.info(f"Queued extraction task {task.id} for file: {file.filename}")
    except Exception as e:
        if destination.exists():
            destination.unlink(missing_ok=True)
        logger.error(f"Failed to enqueue Celery task: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Task worker queue is temporarily unavailable. Please verify Redis connectivity.",
        )

    return UploadResponse(
        message="Document queued for background parsing and multi-agent audit.",
        task_id=task.id,
        status_url=f"/api/v1/status/{task.id}",
    )


@router.get(
    "/status/{task_id}",
    response_model=TaskStatusResponse,
    summary="Poll extraction task status",
    description="Polls Redis backend for current Celery task state and results.",
)
def check_task_status(task_id: str):
    """Polls Redis for the real-time status of the Celery task."""
    try:
        task_result = AsyncResult(task_id, app=celery_app)
        state = task_result.state

        response = {
            "task_id": task_id,
            "status": state,
        }

        if state in ["PARSING_DOCUMENT", "AI_EXTRACTION_AND_AUDIT"]:
            info = task_result.info
            if isinstance(info, dict):
                response["details"] = info.get("progress", "Processing document...")
            else:
                response["details"] = str(info)

        elif state == "SUCCESS":
            response["result"] = task_result.result
            response["details"] = "Extraction and audit completed successfully."

        elif state == "FAILURE":
            response["error"] = str(task_result.info)
            response["details"] = "Pipeline execution encountered an error."

        else:
            response["details"] = f"Task is currently {state.lower()}."

        return response
    except Exception as e:
        logger.error(f"Error querying task status for {task_id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error checking task status: {str(e)}",
        )


@router.get(
    "/sample",
    summary="Get sample financial audit data",
    description="Returns pre-extracted and verified enterprise financial audit data for demonstration purposes.",
)
def get_sample_data():
    """Returns realistic mock audit payload for quick demos."""
    return {
        "is_approved": True,
        "revision_count": 1,
        "audit_feedback": "APPROVED: All metrics verified against table rows and source disclosures.",
        "data": {
            "company_name": "Acme Global Technologies Inc.",
            "reporting_period": "FY 2024 Q4 & Full Year",
            "currency": "USD",
            "metrics": [
                {
                    "metric_name": "Total Revenue",
                    "value": "$15.80B",
                    "period": "FY 2024",
                    "source_quote": "Consolidated full-year revenue reached $15.80 billion, representing a 27.4% year-over-year expansion.",
                    "category": "Revenue & Growth",
                    "confidence_score": 0.99,
                },
                {
                    "metric_name": "Enterprise Cloud Revenue",
                    "value": "$6.20B",
                    "period": "FY 2024",
                    "source_quote": "Enterprise Cloud segment revenue expanded 51.2% to $6.20 billion.",
                    "category": "Revenue & Growth",
                    "confidence_score": 0.98,
                },
                {
                    "metric_name": "Operating Margin",
                    "value": "28.5%",
                    "period": "FY 2024 Q4",
                    "source_quote": "Operating margin improved 210 basis points to 28.5% in the fourth quarter.",
                    "category": "Profitability & Margins",
                    "confidence_score": 0.97,
                },
                {
                    "metric_name": "Diluted EPS",
                    "value": "$2.15",
                    "period": "FY 2024 Q4",
                    "source_quote": "Diluted earnings per share was $2.15, compared to $1.65 in the prior year period.",
                    "category": "Per Share",
                    "confidence_score": 0.99,
                },
                {
                    "metric_name": "Operating Cash Flow",
                    "value": "$4.50B",
                    "period": "FY 2024",
                    "source_quote": "Cash flow generated from operations surged 40.6% to $4.50 billion.",
                    "category": "Cash Flow & Liquidity",
                    "confidence_score": 0.98,
                },
                {
                    "metric_name": "Free Cash Flow",
                    "value": "$3.35B",
                    "period": "FY 2024",
                    "source_quote": "Free cash flow totaled $3.35 billion after capital expenditures of $1.15 billion.",
                    "category": "Cash Flow & Liquidity",
                    "confidence_score": 0.97,
                },
            ],
            "key_risks": [
                "Supply chain constraints for next-generation silicon accelerators could constrain fulfillment capacity.",
                "Foreign currency volatility across European and Asian-Pacific trading corridors.",
                "Evolving AI regulatory standards and stringent cross-border data sovereignty compliance mandates.",
                "Concentration of top enterprise customer contracts in financial services and healthcare verticals.",
            ],
            "audit_notes": "100% of reported figures correspond directly to certified financial tables and audited footnotes.",
        },
    }
