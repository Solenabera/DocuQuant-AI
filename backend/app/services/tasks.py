import os
import traceback
from app.core.celery_app import celery_app
from app.core.logging import logger
from app.services.parser import pdf_parser
from app.agents.graph import app_graph


@celery_app.task(bind=True, name="process_financial_document")
def process_document_task(self, file_path: str):
    """
    Celery background worker pipeline executing asynchronous PDF parsing
    followed by the LangGraph multi-agent self-correcting audit loop.
    """
    logger.info(f"Task {self.request.id} started for file: {file_path}")

    try:
        # Step 1: Document Table & Text Extraction
        self.update_state(
            state="PARSING_DOCUMENT",
            meta={
                "progress": "Parsing PDF layout, extracting structured markdown tables and text",
                "step": 1,
                "total_steps": 3,
            },
        )
        logger.info(f"Task {self.request.id}: Extracting PDF content...")

        parsed_result = pdf_parser.extract_from_file_path(file_path)
        combined_text = parsed_result.get("combined_text", "")
        total_pages = parsed_result.get("total_pages", 0)

        if not combined_text.strip():
            raise ValueError("No extractable textual or tabular content found in the PDF.")

        # Step 2: Multi-Agent Extraction & Audit
        self.update_state(
            state="AI_EXTRACTION_AND_AUDIT",
            meta={
                "progress": f"Executing LangGraph multi-agent audit ({total_pages} pages parsed)",
                "step": 2,
                "total_steps": 3,
                "total_pages": total_pages,
            },
        )
        logger.info(f"Task {self.request.id}: Invoking LangGraph agent workflow...")

        initial_state = {
            "document_text": combined_text,
            "extracted_data": None,
            "is_approved": False,
            "audit_feedback": None,
            "revision_count": 0,
        }

        final_state = app_graph.invoke(initial_state)

        extracted_data = final_state.get("extracted_data") or {}
        is_approved = final_state.get("is_approved", False)
        revision_count = final_state.get("revision_count", 0)

        logger.info(
            f"Task {self.request.id} completed. Approved: {is_approved}, Revisions: {revision_count}"
        )

        # Step 3: Return payload to Redis backend
        return {
            "is_approved": is_approved,
            "revision_count": revision_count,
            "audit_feedback": final_state.get("audit_feedback"),
            "data": extracted_data,
        }

    except Exception as exc:
        error_msg = f"Extraction failed: {str(exc)}"
        logger.error(f"Task {self.request.id} failure: {error_msg}\n{traceback.format_exc()}")
        raise Exception(error_msg)

    finally:
        # Guarantee removal of temporary PDF upload file from disk
        if file_path and os.path.exists(file_path):
            try:
                os.remove(file_path)
                logger.debug(f"Cleaned up temporary upload file: {file_path}")
            except OSError as cleanup_err:
                logger.warning(f"Failed to delete temp file {file_path}: {cleanup_err}")
