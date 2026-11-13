import os
import sys
from unittest.mock import MagicMock, patch
import pytest
from fastapi.testclient import TestClient

# Ensure backend directory is in path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from main import app
import ai_service
from security import create_access_token


@pytest.fixture(scope="session")
def client():
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def auth_headers():
    token = create_access_token({
        "sub": "usr_cand_1",
        "email": "candidate@interviewiq.io",
        "role": "Candidate"
    })
    return {"Authorization": f"Bearer {token}"}


# ---------------------------------------------------------
# 1. Configuration & Security Metadata Tests
# ---------------------------------------------------------
def test_openai_config_security():
    config = ai_service.get_openai_config()
    assert "configured" in config
    assert "model" in config
    assert "timeout_seconds" in config
    assert "key_preview" in config
    # Ensure raw secret is never returned
    assert "OPENAI_API_KEY" not in config
    if config["key_preview"]:
        assert not config["key_preview"].startswith("sk-proj-") or len(config["key_preview"]) < 15


# ---------------------------------------------------------
# 2. Missing API Key Handling (Zero Credits Consumed)
# ---------------------------------------------------------
def test_missing_api_key_handling():
    with patch.dict(os.environ, {"OPENAI_API_KEY": ""}):
        result = ai_service.ping_openai_connection()
        assert result["status"] == "unconfigured"
        assert result["configured"] is False
        assert "missing in backend/.env" in result["message"]

        with pytest.raises(ai_service.AIServiceError) as exc_info:
            ai_service.get_openai_client()
        assert exc_info.value.status_code == 503
        assert "not configured" in exc_info.value.message


# ---------------------------------------------------------
# 3. Successful Mocked AI Response
# ---------------------------------------------------------
def test_successful_openai_completion_mocked():
    mock_choice = MagicMock()
    mock_choice.message.content = "pong"
    mock_response = MagicMock()
    mock_response.choices = [mock_choice]

    with patch.dict(os.environ, {"OPENAI_API_KEY": "sk-mock-valid-key-for-test-only"}):
        with patch("openai.OpenAI") as mock_openai_cls:
            mock_client = MagicMock()
            mock_client.chat.completions.create.return_value = mock_response
            mock_openai_cls.return_value = mock_client

            result = ai_service.ping_openai_connection("ping")

            assert result["status"] == "connected"
            assert result["response"] == "pong"
            assert result["provider"] == "OpenAI"
            assert result["authenticated"] is True
            assert result["latency_ms"] >= 0


# ---------------------------------------------------------
# 4. Error Handling: Authentication, Rate Limit, Timeout
# ---------------------------------------------------------
def test_openai_authentication_error_handling(client, auth_headers):
    import openai

    # Mock official OpenAI AuthenticationError
    fake_response = MagicMock()
    fake_response.status_code = 401
    fake_response.headers = {}
    auth_err = openai.AuthenticationError(
        message="Incorrect API key provided.",
        response=fake_response,
        body={"error": {"message": "Invalid API key"}}
    )

    with patch.dict(os.environ, {"OPENAI_API_KEY": "sk-mock-invalid-key"}):
        with patch("openai.OpenAI") as mock_openai_cls:
            mock_client = MagicMock()
            mock_client.chat.completions.create.side_effect = auth_err
            mock_openai_cls.return_value = mock_client

            # Direct service call
            with pytest.raises(ai_service.AIServiceError) as exc_info:
                ai_service.ping_openai_connection()
            assert exc_info.value.status_code == 401
            assert "OPENAI_API_KEY" in exc_info.value.message

            # HTTP Endpoint call
            res = client.get("/api/ai/test-connection", headers=auth_headers)
            assert res.status_code == 401
            assert "authentication failed" in res.json()["detail"].lower()


def test_openai_rate_limit_error_handling(client, auth_headers):
    import openai

    fake_response = MagicMock()
    fake_response.status_code = 429
    fake_response.headers = {}
    rate_err = openai.RateLimitError(
        message="You exceeded your current quota.",
        response=fake_response,
        body={"error": {"message": "Rate limit reached"}}
    )

    with patch.dict(os.environ, {"OPENAI_API_KEY": "sk-mock-key"}):
        with patch("openai.OpenAI") as mock_openai_cls:
            mock_client = MagicMock()
            mock_client.chat.completions.create.side_effect = rate_err
            mock_openai_cls.return_value = mock_client

            res = client.get("/api/ai/test-connection", headers=auth_headers)
            assert res.status_code == 429
            assert "rate limit" in res.json()["detail"].lower()


def test_openai_timeout_error_handling(client, auth_headers):
    import openai

    timeout_err = openai.APITimeoutError(request=MagicMock())

    with patch.dict(os.environ, {"OPENAI_API_KEY": "sk-mock-key"}):
        with patch("openai.OpenAI") as mock_openai_cls:
            mock_client = MagicMock()
            mock_client.chat.completions.create.side_effect = timeout_err
            mock_openai_cls.return_value = mock_client

            res = client.get("/api/ai/test-connection", headers=auth_headers)
            assert res.status_code == 504
            assert "timed out" in res.json()["detail"].lower()


# ---------------------------------------------------------
# 5. Route Protection & Authorization
# ---------------------------------------------------------
def test_ai_endpoints_require_authentication(client):
    # Unauthenticated request to /api/ai/status must be blocked (401)
    res_status = client.get("/api/ai/status")
    assert res_status.status_code == 401

    # Unauthenticated request to /api/ai/test-connection must be blocked (401)
    res_test = client.get("/api/ai/test-connection")
    assert res_test.status_code == 401

