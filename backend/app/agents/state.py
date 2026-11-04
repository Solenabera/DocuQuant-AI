from typing import TypedDict, Optional, Dict, Any, List


class ExtractionState(TypedDict, total=False):
    """LangGraph state representation passed through the multi-agent audit loop."""

    document_text: str
    extracted_data: Optional[Dict[str, Any]]
    is_approved: bool
    audit_feedback: Optional[str]
    revision_count: int
    audit_history: Optional[List[Dict[str, Any]]]
    error: Optional[str]
