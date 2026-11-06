from typing import Dict, Any, Optional
from langchain_core.prompts import ChatPromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_groq import ChatGroq

from app.core.config import settings
from app.core.logging import logger
from .schemas import ExtractionReport, AuditResult
from .state import ExtractionState


def get_llm(temperature: float = 0.0):
    """
    Factory function returning the configured LLM instance with lazy instantiation
    and automatic multi-model fallback chain to ensure high reliability.
    """
    fallbacks = []

    # 1. Prepare Groq fallback if configured with a real API key
    groq_llm = None
    if settings.GROQ_API_KEY and settings.GROQ_API_KEY != "your_groq_api_key_here":
        try:
            groq_llm = ChatGroq(
                model_name=settings.GROQ_MODEL,
                temperature=temperature,
                api_key=settings.GROQ_API_KEY,
            )
        except Exception as e:
            logger.warning(f"Failed to initialize ChatGroq fallback: {e}")

    # 2. Google Gemini Provider with automatic candidate fallbacks
    if settings.DEFAULT_LLM_PROVIDER == "google" and settings.GOOGLE_API_KEY:
        try:
            primary_llm = ChatGoogleGenerativeAI(
                model=settings.GEMINI_MODEL,
                temperature=temperature,
                google_api_key=settings.GOOGLE_API_KEY,
                max_output_tokens=8192,
            )

            # Build fallback chain for Gemini
            candidate_models = ["gemini-3.5-flash", "gemini-3.5-flash-lite"]
            for fb_model in candidate_models:
                if fb_model != settings.GEMINI_MODEL:
                    try:
                        fallbacks.append(
                            ChatGoogleGenerativeAI(
                                model=fb_model,
                                temperature=temperature,
                                google_api_key=settings.GOOGLE_API_KEY,
                                max_output_tokens=8192,
                            )
                        )
                    except Exception:
                        pass

            if groq_llm:
                fallbacks.append(groq_llm)

            if fallbacks:
                return primary_llm.with_fallbacks(fallbacks)
            return primary_llm
        except Exception as e:
            logger.warning(f"Failed to initialize primary ChatGoogleGenerativeAI: {e}. Checking fallback...")

    # 3. Groq Fallback Provider
    if groq_llm:
        return groq_llm

    # 4. Default Google attempt with env key
    return ChatGoogleGenerativeAI(
        model=settings.GEMINI_MODEL,
        temperature=temperature,
        google_api_key=settings.GOOGLE_API_KEY or "DUMMY_KEY_FOR_INIT",
        max_output_tokens=8192,
    )


def extractor_node(state: ExtractionState) -> Dict[str, Any]:
    """
    Extractor Agent: Extracts standardized financial metrics, categories,
    and verbatim source quotes from raw financial report text.
    Aware of auditor critiques from previous iterations.
    """
    doc_text = state.get("document_text", "")
    feedback = state.get("audit_feedback", "")
    current_revisions = state.get("revision_count", 0)

    logger.info(f"Extractor node executing (Iteration {current_revisions + 1})...")

    prompt = ChatPromptTemplate.from_messages([
        (
            "system",
            (
                "You are a Senior Financial Intelligence Specialist and SEC Filing Analyst.\n"
                "Your objective is to extract complete, accurate financial metrics from the provided document into the requested schema.\n\n"
                "Strict Compliance Rules:\n"
                "1. Verbatim Quotes: Every metric MUST have a verbatim excerpt in 'source_quote' matching the text character-for-character.\n"
                "2. Zero Hallucination: Do not compute, extrapolate, or guess values. Only report explicitly stated data.\n"
                "3. Standardized Metrics: Extract core metrics such as Total Revenue, Gross Profit, Operating Income, Net Income, "
                "EBITDA, Diluted EPS, Operating Cash Flow, and Free Cash Flow if present.\n"
                "4. Categorization: Tag each metric into appropriate categories ('Revenue & Growth', 'Profitability & Margins', 'Cash Flow & Liquidity', 'Per Share', or 'Balance Sheet').\n"
                "5. Risk Factors: Extract all notable operational, market, regulatory, and credit risks stated in the filing.\n"
                "{feedback_instruction}"
            ),
        ),
        (
            "human",
            "Please analyze the following financial disclosure and extract the structured report:\n\n{text}",
        ),
    ])

    feedback_instruction = (
        f"\nCRITICAL CORRECTION REQUIRED:\nThe previous extraction was REJECTED by the Lead Compliance Auditor with the following critique:\n\"{feedback}\"\n"
        "You must address all flagged issues and correct the erroneous metrics or missing source quotes."
        if feedback
        else ""
    )

    try:
        llm = get_llm()
        structured_extractor = llm.with_structured_output(ExtractionReport)
        chain = prompt | structured_extractor

        result: ExtractionReport = chain.invoke({
            "text": doc_text,
            "feedback_instruction": feedback_instruction,
        })

        return {
            "extracted_data": result.model_dump(),
            "revision_count": current_revisions + 1,
        }
    except Exception as exc:
        logger.error(f"Error during extraction node execution: {exc}", exc_info=True)
        # Fallback empty extraction report to prevent complete crash
        return {
            "extracted_data": {
                "company_name": "Unknown Entity",
                "reporting_period": "Unspecified",
                "currency": "USD",
                "metrics": [],
                "key_risks": [f"Extraction failed: {str(exc)}"],
                "audit_notes": "Extraction encountered an exception during agent execution.",
            },
            "revision_count": current_revisions + 1,
            "error": str(exc),
        }


def auditor_node(state: ExtractionState) -> Dict[str, Any]:
    """
    Auditor Agent: Validates extracted financial metrics against the raw source text.
    Checks that values are correct and quotes exist verifiably without hallucination.
    """
    doc_text = state.get("document_text", "")
    extracted = state.get("extracted_data", {})

    logger.info("Auditor node executing validation check...")

    prompt = ChatPromptTemplate.from_messages([
        (
            "system",
            (
                "You are a Lead Financial Compliance Auditor and Regulatory Examiner.\n"
                "Your job is to rigorously audit extracted financial data against the raw source text.\n\n"
                "Verification Checklist:\n"
                "1. Source Quote Fidelity: Does every 'source_quote' appear verbatim in the document?\n"
                "2. Numeric Accuracy: Do the stated values, currency symbols, and signs (+/-) match the source exactly?\n"
                "3. Fiscal Period Alignment: Does the metric apply to the reported period?\n"
                "4. Risk Validity: Are the listed key risks genuinely articulated in the source?\n\n"
                "Verdict Guidelines:\n"
                "- If ANY metric is ungrounded or quotes cannot be verified in the text, set is_valid=False and detail the exact critique.\n"
                "- Set is_valid=True ONLY if 100% of the metrics are verified and faithful to the source."
            ),
        ),
        (
            "human",
            "Source Document:\n{doc}\n\nExtracted Financial Data to Verify:\n{json_data}",
        ),
    ])

    try:
        llm = get_llm()
        structured_auditor = llm.with_structured_output(AuditResult)
        chain = prompt | structured_auditor

        audit: AuditResult = chain.invoke({
            "doc": doc_text,
            "json_data": str(extracted),
        })

        logger.info(f"Auditor verdict: is_valid={audit.is_valid}, critique='{audit.critique}'")

        return {
            "is_approved": audit.is_valid,
            "audit_feedback": audit.critique,
        }
    except Exception as exc:
        logger.error(f"Error during auditor node execution: {exc}", exc_info=True)
        # If auditor LLM fails, flag approval as false with the error
        return {
            "is_approved": False,
            "audit_feedback": f"Auditor failed with error: {str(exc)}",
        }
