from typing import TypedDict, Optional, Dict, Any

class ExtractionState(TypedDict):
    document_text: str
    extracted_data: Optional[Dict[str, Any]]
    is_approved: bool
    audit_feedback: Optional[str]
    revision_count: int