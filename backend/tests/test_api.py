from unittest.mock import MagicMock, patch
from fastapi import HTTPException
from fastapi.datastructures import UploadFile

from app.main import root
from app.api.v1.endpoints.health import health_check, check_redis_socket
from app.api.v1.endpoints.extraction import (
    get_sample_data,
    check_task_status,
)


def test_root_endpoint():
    res = root()
    assert res["service"] == "DocuQuant AI"
    assert "version" in res
    assert res["status"] == "online"
    assert res["docs_url"] == "/docs"


def test_health_check_endpoint():
    res = health_check()
    assert res["service"] == "DocuQuant AI"
    assert "status" in res
    assert "uptime_seconds" in res


def test_check_redis_socket():
    assert check_redis_socket("redis://127.0.0.1:59999/0", timeout=0.1) is False


def test_sample_data_endpoint():
    sample = get_sample_data()
    assert sample["is_approved"] is True
    assert "data" in sample
    assert len(sample["data"]["metrics"]) > 0
    assert len(sample["data"]["key_risks"]) > 0


def test_check_task_status_polling_success():
    with patch("app.api.v1.endpoints.extraction.AsyncResult") as mock_async_result:
        mock_res = MagicMock()
        mock_res.state = "SUCCESS"
        mock_res.result = {"is_approved": True, "revision_count": 1, "data": {}}
        mock_async_result.return_value = mock_res

        status_res = check_task_status("task-123")
        assert status_res["status"] == "SUCCESS"
        assert status_res["result"]["is_approved"] is True


def test_check_task_status_polling_failure():
    with patch("app.api.v1.endpoints.extraction.AsyncResult") as mock_async_result:
        mock_res = MagicMock()
        mock_res.state = "FAILURE"
        mock_res.info = "PDF parsing syntax error"
        mock_async_result.return_value = mock_res

        status_res = check_task_status("task-error-456")
        assert status_res["status"] == "FAILURE"
        assert "error" in status_res
