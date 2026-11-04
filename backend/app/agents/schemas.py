from typing import List, Optional
from pydantic import BaseModel, Field


class FinancialMetric(BaseModel):
    """Represents a validated financial metric extracted from a disclosure."""

    metric_name: str = Field(
        ...,
        description="Standardized name of the metric (e.g., 'Total Revenue', 'Net Income', 'Operating Margin', 'Diluted EPS', 'EBITDA')",
    )
    value: str = Field(
        ...,
        description="The extracted value formatted as string preserving units and currency (e.g., '$15.80B', '28.4%', '$2.15')",
    )
    period: str = Field(
        ...,
        description="Reporting timeframe or fiscal period (e.g., 'Q2 2024', 'FY 2023', 'Three months ended June 30')",
    )
    source_quote: str = Field(
        ...,
        description="The verbatim excerpt from the document validating this metric",
    )
    category: Optional[str] = Field(
        default="General",
        description="Financial category: 'Revenue & Growth', 'Profitability & Margins', 'Cash Flow & Liquidity', 'Per Share', or 'Balance Sheet'",
    )
    confidence_score: Optional[float] = Field(
        default=0.98,
        description="Self-assessed extraction confidence from 0.0 to 1.0",
    )


class AuditResult(BaseModel):
    """Verification verdict produced by the auditor agent."""

    is_valid: bool = Field(
        ...,
        description="True if all metrics and quotes match the source text with zero hallucinations, False otherwise",
    )
    critique: str = Field(
        ...,
        description="Specific list of inaccuracies or discrepancies, or 'APPROVED' if perfectly accurate",
    )
    discrepancies: List[str] = Field(
        default_factory=list,
        description="Bullet list of identified discrepancies if any",
    )


class ExtractionReport(BaseModel):
    """Complete structured extraction payload of the financial document."""

    company_name: str = Field(
        ...,
        description="Official name of the reporting corporate entity",
    )
    reporting_period: str = Field(
        ...,
        description="Primary fiscal period covered by the document (e.g., 'Q2 2024', 'FY 2025')",
    )
    currency: Optional[str] = Field(
        default="USD",
        description="Primary currency reported (e.g., 'USD', 'EUR', 'GBP')",
    )
    metrics: List[FinancialMetric] = Field(
        default_factory=list,
        description="List of all extracted financial metrics with source quotes",
    )
    key_risks: List[str] = Field(
        default_factory=list,
        description="Summary of operational, regulatory, credit, or market risk factors identified in the filing",
    )
    audit_notes: Optional[str] = Field(
        default="",
        description="Summary remarks regarding the consistency and completeness of the document",
    )
