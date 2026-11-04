import io
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors

from app.services.parser import pdf_parser
from app.agents.graph import app_graph

def generate_mock_financial_pdf() -> bytes:
    """Generates an in-memory PDF containing narrative text and a structured table."""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    styles = getSampleStyleSheet()
    story = []

    # Title & Narrative
    story.append(Paragraph("Acme Corp - Q2 2024 Earnings Report", styles['Title']))
    story.append(Spacer(1, 12))
    story.append(Paragraph(
        "Acme Corp delivered exceptional quarterly performance driven by Enterprise Cloud adoption. "
        "Diluted earnings per share was $2.15, compared to $1.65 in the prior year period.",
        styles['Normal']
    ))
    story.append(Spacer(1, 14))

    # Financial Data Table
    data = [
        ["Financial Metric", "Q2 2023", "Q2 2024", "YoY Change"],
        ["Total Revenue", "$12.40B", "$15.80B", "+27.4%"],
        ["Cloud Revenue", "$4.10B", "$6.20B", "+51.2%"],
        ["Operating Income", "$3.20B", "$4.50B", "+40.6%"],
        ["Net Income", "$2.50B", "$3.40B", "+36.0%"]
    ]

    table = Table(data)
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#1e293b")),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 6),
        ('GRID', (0, 0), (-1, -1), 1, colors.HexColor("#cbd5e1")),
    ]))
    story.append(table)
    story.append(Spacer(1, 14))

    # Risk Factors
    story.append(Paragraph(
        "Key risks include ongoing global supply chain constraints and higher regulatory compliance costs in European markets.",
        styles['Normal']
    ))

    doc.build(story)
    buffer.seek(0)
    return buffer.read()

if __name__ == "__main__":
    print("[1] Generating mock financial PDF...")
    pdf_bytes = generate_mock_financial_pdf()

    print("[2] Parsing PDF with FinancialPDFParser...")
    parsed_result = pdf_parser.extract_from_bytes(pdf_bytes)
    
    print("\n--- EXTRACTED & STRUCTURED TEXT ---")
    print(parsed_result["combined_text"])

    print("\n[3] Passing structured text into LangGraph Self-Correcting Engine...")
    initial_state = {
        "document_text": parsed_result["combined_text"],
        "extracted_data": None,
        "is_approved": False,
        "audit_feedback": None,
        "revision_count": 0
    }

    final_state = app_graph.invoke(initial_state)

    print("\n--- AUDIT VERIFICATION ---")
    print(f"Approved by Auditor: {final_state['is_approved']}")
    print(f"Revision Count: {final_state['revision_count']}")

    print("\n--- FINAL EXTRACTED METRICS ---")
    import json
    print(json.dumps(final_state["extracted_data"], indent=2))