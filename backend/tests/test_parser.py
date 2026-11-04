import io
import pytest
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors

from app.services.parser import FinancialPDFParser, pdf_parser


def create_sample_pdf() -> bytes:
    """Helper creating an in-memory sample financial PDF."""
    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=letter)
    styles = getSampleStyleSheet()
    story = [
        Paragraph("Acme Corp - Q2 2024 Financial Report", styles["Title"]),
        Paragraph("Total revenue grew 27.4% to $15.80 billion for the second quarter.", styles["Normal"]),
    ]

    table_data = [
        ["Metric", "Q2 2023", "Q2 2024"],
        ["Total Revenue", "$12.40B", "$15.80B"],
        ["Operating Income", "$3.20B", "$4.50B"],
    ]
    t = Table(table_data)
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1e293b")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
    ]))
    story.append(t)
    doc.build(story)
    buf.seek(0)
    return buf.read()


def test_clean_text():
    parser = FinancialPDFParser()
    dirty = "  Total   Revenue:    $15.80B   \n\n\n   Operating  Margin:  28%   "
    cleaned = parser._clean_text(dirty)
    assert "Total Revenue: $15.80B" in cleaned
    assert "Operating Margin: 28%" in cleaned
    assert "    " not in cleaned


def test_table_to_markdown():
    parser = FinancialPDFParser()
    table = [
        ["Metric", "Value"],
        ["Revenue", "$100M"],
        ["Net Income", "$20M"],
    ]
    md = parser._table_to_markdown(table)
    assert "| Metric | Value |" in md
    assert "| --- | --- |" in md
    assert "| Revenue | $100M |" in md


def test_table_to_markdown_empty():
    parser = FinancialPDFParser()
    assert parser._table_to_markdown([]) == ""
    assert parser._table_to_markdown([[None, ""], ["", None]]) == ""


def test_extract_from_bytes():
    pdf_bytes = create_sample_pdf()
    result = pdf_parser.extract_from_bytes(pdf_bytes)

    assert result["total_pages"] >= 1
    assert "Acme Corp" in result["combined_text"]
    assert "Total Revenue" in result["combined_text"]
    assert len(result["pages"]) >= 1


def test_extract_from_empty_bytes():
    with pytest.raises(ValueError):
        pdf_parser.extract_from_bytes(b"")

