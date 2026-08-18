from pydantic import BaseModel, Field
from typing import List, Optional

class FinancialMetric(BaseModel):
    metric_name: str = Field(
        description="Standardized name of the metric (e.g., 'Total Revenue', 'Net Income', 'Operating Margin', 'EBITDA')"
    )
    value: str = Field(
        description="The extracted value formatted as string to preserve units (e.g., '$4.5B', '18.2%')"
    )
    period: str = Field(
        description="Reporting timeframe (e.g., 'Q2 2024', 'FY 2023', 'Three months ended June 30')"
    )
    source_quote: str = Field(
        description="The verbatim excerpt from the document validating this metric"
    )

class AuditResult(BaseModel):
    is_valid: bool = Field(
        description="True if all metrics and quotes match the source text with zero hallucinations, False otherwise"
    )
    critique: str = Field(
        description="Specific list of inaccuracies or 'APPROVED' if perfectly accurate"
    )

class ExtractionReport(BaseModel):
    company_name: str = Field(description="Name of the reporting entity")
    reporting_period: str = Field(description="Primary period covered by the document")
    metrics: List[FinancialMetric] = Field(description="List of all extracted financial metrics")
    key_risks: List[str] = Field(description="Summary of operational or market risk factors identified")