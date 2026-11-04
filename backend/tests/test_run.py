from app.agents.graph import app_graph

sample_financial_text = """
Alphabet Inc. announced financial results for the quarter ended June 30, 2024.
Revenues were $84.74 billion, an increase of 14% year-over-year.
Google Services revenues increased 12% to $73.93 billion.
Google Cloud revenues increased 29% to $10.35 billion.
Operating income was $27.43 billion, and operating margin was 32%.
Net income was $23.62 billion, and diluted EPS was $1.89.
Risks noted: Rapid technological changes in AI infrastructure and high capital expenditures of $13.2 billion.
"""

if __name__ == "__main__":
    print("Executing DocuQuant AI extraction graph...")
    initial_state = {
        "document_text": sample_financial_text,
        "extracted_data": None,
        "is_approved": False,
        "audit_feedback": None,
        "revision_count": 0
    }
    
    result = app_graph.invoke(initial_state)
    
    print("\n--- EXTRACTION STATUS ---")
    print(f"Approved by Auditor: {result['is_approved']}")
    print(f"Revision Count: {result['revision_count']}")
    print(f"Auditor Critique: {result['audit_feedback']}")
    print("\n--- FINAL EXTRACTED JSON ---")
    import json
    print(json.dumps(result["extracted_data"], indent=2))