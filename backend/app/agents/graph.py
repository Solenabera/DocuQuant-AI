from langgraph.graph import StateGraph, END
from app.core.config import settings
from app.core.logging import logger
from .state import ExtractionState
from .nodes import extractor_node, auditor_node


def decide_next_step(state: ExtractionState) -> str:
    """
    Evaluates whether the extracted data is verified or requires re-extraction.
    Includes a circuit-breaker to prevent infinite LLM re-prompt loops.
    """
    is_approved = state.get("is_approved", False)
    revision_count = state.get("revision_count", 0)
    max_revisions = settings.CIRCUIT_BREAKER_MAX_REVISIONS

    if is_approved:
        logger.info(f"Auditor approved extraction after {revision_count} revision(s). Completing pipeline.")
        return "end"

    if revision_count >= max_revisions:
        logger.warning(
            f"Circuit breaker triggered: Reached max revisions ({revision_count}/{max_revisions}). "
            "Terminating loop to prevent infinite token consumption."
        )
        return "end"

    logger.info(
        f"Auditor requested revision ({revision_count}/{max_revisions}). Re-routing to Extractor agent..."
    )
    return "re_extract"


def build_extraction_graph():
    """
    Constructs the LangGraph state machine orchestrating Extractor and Auditor agents.
    Flow: extractor -> auditor -> [approved/max revisions -> END | rejected -> extractor]
    """
    workflow = StateGraph(ExtractionState)

    workflow.add_node("extractor", extractor_node)
    workflow.add_node("auditor", auditor_node)

    workflow.set_entry_point("extractor")
    workflow.add_edge("extractor", "auditor")

    workflow.add_conditional_edges(
        "auditor",
        decide_next_step,
        {
            "re_extract": "extractor",
            "end": END,
        },
    )

    return workflow.compile()


# Compiled LangGraph instance ready for invocation
app_graph = build_extraction_graph()
