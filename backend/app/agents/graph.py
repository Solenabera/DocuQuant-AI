from langgraph.graph import StateGraph, END
from .state import ExtractionState
from .nodes import extractor_node, auditor_node

def decide_next_step(state: ExtractionState) -> str:
    """Evaluates whether to terminate or re-prompt extractor."""
    if state.get("is_approved", False):
        return "end"
    
    # Circuit breaker: stop after 3 attempts to prevent infinite loops
    if state.get("revision_count", 0) >= 3:
        return "end"
        
    return "re_extract"

def build_extraction_graph():
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
            "end": END
        }
    )
    
    return workflow.compile()

app_graph = build_extraction_graph()