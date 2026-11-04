import pytest
from app.agents.schemas import FinancialMetric, AuditResult, ExtractionReport
from app.agents.graph import decide_next_step
from app.agents.state import ExtractionState


def test_financial_metric_schema():
    metric = FinancialMetric(
        metric_name="Total Revenue",
        value="$15.80B",
        period="FY 2024",
        source_quote="Consolidated full-year revenue reached $15.80 billion.",
        category="Revenue & Growth",
    )
    assert metric.metric_name == "Total Revenue"
    assert metric.value == "$15.80B"
    assert metric.confidence_score == 0.98


def test_audit_result_schema():
    audit_pass = AuditResult(
        is_valid=True,
        critique="APPROVED",
    )
    assert audit_pass.is_valid is True

    audit_fail = AuditResult(
        is_valid=False,
        critique="Revenue metric of $15.80B not found in document.",
        discrepancies=["Revenue variance"],
    )
    assert audit_fail.is_valid is False
    assert len(audit_fail.discrepancies) == 1


def test_extraction_report_schema():
    report = ExtractionReport(
        company_name="Acme Corp",
        reporting_period="Q2 2024",
        currency="USD",
        metrics=[
            FinancialMetric(
                metric_name="Net Income",
                value="$3.40B",
                period="Q2 2024",
                source_quote="Net income rose 36% to $3.40 billion.",
            )
        ],
        key_risks=["Supply chain bottlenecks"],
    )
    assert report.company_name == "Acme Corp"
    assert len(report.metrics) == 1
    assert len(report.key_risks) == 1


def test_decide_next_step_approved():
    state: ExtractionState = {
        "is_approved": True,
        "revision_count": 1,
    }
    assert decide_next_step(state) == "end"


def test_decide_next_step_max_revisions_circuit_breaker():
    state: ExtractionState = {
        "is_approved": False,
        "revision_count": 3,
    }
    assert decide_next_step(state) == "end"


def test_decide_next_step_re_extract():
    state: ExtractionState = {
        "is_approved": False,
        "revision_count": 1,
    }
    assert decide_next_step(state) == "re_extract"

