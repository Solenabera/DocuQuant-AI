import os
from typing import Dict, Any
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from .schemas import ExtractionReport, AuditResult
from .state import ExtractionState

load_dotenv()

# Initialize free high-speed Groq model (Llama-3.3-70B) or (gpt-oss-120b)
llm = ChatGroq(
    model_name="openai/gpt-oss-120b",
    # model_name="llama-3.3-70b-versatile",
    temperature=0.0,
    api_key=os.getenv("GROQ_API_KEY")
)

extractor_llm = llm.with_structured_output(ExtractionReport)
auditor_llm = llm.with_structured_output(AuditResult)

def extractor_node(state: ExtractionState) -> Dict[str, Any]:
    """Extracts structured financial metrics with revision awareness."""
    doc_text = state["document_text"]
    feedback = state.get("audit_feedback", "")
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", (
            "You are a Senior Financial Intelligence Specialist. "
            "Your task is to extract exact financial data into the requested schema.\n"
            "Rules:\n"
            "1. Every extracted metric must contain the exact verbatim quote in 'source_quote'.\n"
            "2. Do not estimate, guess, or extrapolate numbers.\n"
            "{feedback_instruction}"
        )),
        ("human", "Analyze the following financial report excerpt:\n\n{text}")
    ])
    
    feedback_instruction = f"IMPORTANT: Your previous output was rejected. Auditor critique: {feedback}" if feedback else ""
    
    chain = prompt | extractor_llm
    result: ExtractionReport = chain.invoke({
        "text": doc_text,
        "feedback_instruction": feedback_instruction
    })
    
    return {
        "extracted_data": result.model_dump(),
        "revision_count": state.get("revision_count", 0) + 1
    }

def auditor_node(state: ExtractionState) -> Dict[str, Any]:
    """Audits extracted output against the raw source text to guarantee fidelity."""
    doc_text = state["document_text"]
    extracted = state["extracted_data"]
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", (
            "You are a Lead Financial Compliance Auditor.\n"
            "Validate whether the extracted JSON strictly reflects the raw source text.\n"
            "Checks:\n"
            "1. Are the values exact (no wrong currencies, signs, or unit multipliers)?\n"
            "2. Does the 'source_quote' literally exist in the document text?\n"
            "Set 'is_valid' to True ONLY if all data is 100% verified."
        )),
        ("human", "Source Document:\n{doc}\n\nExtracted JSON to Verify:\n{json_data}")
    ])
    
    chain = prompt | auditor_llm
    audit: AuditResult = chain.invoke({
        "doc": doc_text,
        "json_data": str(extracted)
    })
    
    return {
        "is_approved": audit.is_valid,
        "audit_feedback": audit.critique
    }