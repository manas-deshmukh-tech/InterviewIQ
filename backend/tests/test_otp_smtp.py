"""
InterviewIQ Enterprise OTP & SMTP Email Verification Test Suite
Verifies:
1. Genuine SMTP email delivery handling and honest failure reporting (HTTP 502)
2. Accurate attempt limits (max 5 attempts before token invalidation)
3. Expiration enforcement (10-minute expiry)
4. Resend cooldown rate-limiting (60-second cooldown, HTTP 429)
5. Zero leakage of plain OTPs, passwords, or hashes in responses
6. Strict blocking of unverified accounts from protected endpoints (HTTP 403)
"""

import os
import sys
import time
from datetime import datetime, timedelta
from unittest.mock import patch, MagicMock
import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from main import app
import database as db
import security as sec
import email_service


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as test_client:
        yield test_client


def test_smtp_configuration_detection():
    """Verifies is_smtp_configured returns False when credentials are unset or placeholder."""
    with patch.dict(os.environ, {"SMTP_USERNAME": "", "SMTP_PASSWORD": ""}):
        assert email_service.is_smtp_configured() is False

    with patch.dict(os.environ, {"SMTP_USERNAME": "your-email@gmail.com", "SMTP_PASSWORD": "your-app-password"}):
        assert email_service.is_smtp_configured() is False

    with patch.dict(os.environ, {"SMTP_USERNAME": "test@gmail.com", "SMTP_PASSWORD": "validapppassword1"}):
        assert email_service.is_smtp_configured() is True


def test_smtp_delivery_failure_honesty(client):
    """
    Requirement 9: Handle SMTP failures honestly. Never report successful delivery if sending fails.
    If SMTP fails, API must return HTTP 502 and must not leave an orphaned user record.
    """
    test_email = f"fail_user_{int(time.time() * 1000)}@interviewiq.test"

    with patch("email_service.send_otp_email", side_effect=email_service.SMTPDeliveryError("Authentication failed")):
        res = client.post("/api/auth/register", json={
            "name": "SMTP Failure Candidate",
            "email": test_email,
            "password": "Password123#",
            "role": "Candidate",
            "consent": True
        })

        assert res.status_code == 502
        err_detail = res.json().get("detail", "")
        assert "Verification email could not be sent" in err_detail

        # Confirm user was not persisted
        assert db.get_user_by_email(test_email) is None


def test_successful_otp_registration_and_verification(client):
    """
    Requirements 5, 6, 7: Genuine OTP generation, zero OTP exposure in responses, successful verification.
    """
    test_email = f"success_user_{int(time.time() * 1000)}@interviewiq.test"

    with patch("email_service.send_otp_email", return_value=True) as mock_send:
        reg_res = client.post("/api/auth/register", json={
            "name": "Verified Candidate",
            "email": test_email,
            "password": "Password123#",
            "role": "Candidate",
            "consent": True
        })

        assert reg_res.status_code == 201
        data = reg_res.json()
        assert data["success"] is True

        # Ensure OTP is NEVER returned in response
        assert "otp" not in data
        assert "otpMock" not in data
        assert "verification_otp" not in data.get("user", {})

        # Verify mock_send was called with recipient email and genuine 6-digit OTP
        assert mock_send.called
        call_kwargs = mock_send.call_args[1]
        sent_otp = call_kwargs["otp"]
        assert len(sent_otp) == 6
        assert sent_otp.isdigit()

        # Retrieve user from DB to verify unverified state
        user_record = db.get_user_by_email(test_email, include_credentials=True)
        assert user_record["verified"] in (0, False)
        assert user_record["verification_otp"] == sent_otp

        # Verify OTP
        verify_res = client.post("/api/auth/verify-otp", json={
            "email": test_email,
            "otp": sent_otp
        })
        assert verify_res.status_code == 200
        verify_data = verify_res.json()
        assert verify_data["success"] is True
        assert "access_token" in verify_data
        assert verify_data["user"]["verified"] in (1, True)

        # Confirm OTP was wiped from DB on verification
        updated_record = db.get_user_by_email(test_email, include_credentials=True)
        assert updated_record["verification_otp"] is None

        # Clean up
        db.delete_user(user_record["id"])


def test_incorrect_otp_attempt_limits(client):
    """
    Requirement 7: Attempt limits (Max 5 attempts before invalidating OTP).
    """
    test_email = f"attempts_user_{int(time.time() * 1000)}@interviewiq.test"

    with patch("email_service.send_otp_email", return_value=True):
        client.post("/api/auth/register", json={
            "name": "Rate Limit Candidate",
            "email": test_email,
            "password": "Password123#",
            "role": "Candidate",
            "consent": True
        })

    user_record = db.get_user_by_email(test_email, include_credentials=True)
    real_otp = user_record["verification_otp"]

    try:
        # Submit 4 wrong attempts -> each must return 400 with remaining attempts count
        for i in range(1, 5):
            res = client.post("/api/auth/verify-otp", json={"email": test_email, "otp": "999999"})
            assert res.status_code == 400
            assert f"{5 - i} attempt(s) remaining" in res.json().get("detail", "")

        # 5th wrong attempt -> must invalidate the code
        res5 = client.post("/api/auth/verify-otp", json={"email": test_email, "otp": "999999"})
        assert res5.status_code == 400
        assert "Maximum verification attempts exceeded" in res5.json().get("detail", "")

        # Even with the real OTP now, it must fail because code was invalidated
        res_real = client.post("/api/auth/verify-otp", json={"email": test_email, "otp": real_otp})
        assert res_real.status_code == 400
        assert ("Maximum verification attempts exceeded" in res_real.json().get("detail", "") or
                "No active verification code found" in res_real.json().get("detail", ""))

    finally:
        db.delete_user(user_record["id"])


def test_expired_otp_rejection(client):
    """
    Requirement 7: Expired OTP rejection.
    """
    test_email = f"expired_user_{int(time.time() * 1000)}@interviewiq.test"

    with patch("email_service.send_otp_email", return_value=True):
        client.post("/api/auth/register", json={
            "name": "Expired Candidate",
            "email": test_email,
            "password": "Password123#",
            "role": "Candidate",
            "consent": True
        })

    user_record = db.get_user_by_email(test_email, include_credentials=True)
    real_otp = user_record["verification_otp"]

    try:
        # Manually set expiration date to 5 minutes ago in DB
        past_time = (datetime.utcnow() - timedelta(minutes=5)).isoformat()
        db.update_user(user_record["id"], {"otp_expires_at": past_time})

        res = client.post("/api/auth/verify-otp", json={
            "email": test_email,
            "otp": real_otp
        })
        assert res.status_code == 400
        assert "expired" in res.json().get("detail", "").lower()

    finally:
        db.delete_user(user_record["id"])


def test_otp_resend_cooldown_rate_limit(client):
    """
    Requirement 7: Resend cooldown rate-limiting (60-second cooldown, HTTP 429).
    """
    test_email = f"resend_user_{int(time.time() * 1000)}@interviewiq.test"

    with patch("email_service.send_otp_email", return_value=True):
        client.post("/api/auth/register", json={
            "name": "Resend Candidate",
            "email": test_email,
            "password": "Password123#",
            "role": "Candidate",
            "consent": True
        })

    user_record = db.get_user_by_email(test_email, include_credentials=True)

    try:
        # Immediate resend attempt (within 60s of registration) -> Must return 429
        res_immediate = client.post("/api/auth/resend-otp", json={"email": test_email})
        assert res_immediate.status_code == 429
        assert "Please wait" in res_immediate.json().get("detail", "")

        # Simulate 61 seconds elapsed
        past_sent = (datetime.utcnow() - timedelta(seconds=61)).isoformat()
        db.update_user(user_record["id"], {"otp_last_sent_at": past_sent})

        # Resend should now succeed
        with patch("email_service.send_otp_email", return_value=True) as mock_resend:
            res_allowed = client.post("/api/auth/resend-otp", json={"email": test_email})
            assert res_allowed.status_code == 200
            assert mock_resend.called

    finally:
        db.delete_user(user_record["id"])


def test_unverified_account_blocked_from_protected_endpoints(client):
    """
    Requirement 8: Prevent unverified accounts from accessing protected features.
    """
    test_email = f"blocked_user_{int(time.time() * 1000)}@interviewiq.test"

    with patch("email_service.send_otp_email", return_value=True):
        client.post("/api/auth/register", json={
            "name": "Unverified User",
            "email": test_email,
            "password": "Password123#",
            "role": "Candidate",
            "consent": True
        })

    user_record = db.get_user_by_email(test_email, include_credentials=True)

    try:
        # 1. Login attempt before verification must return 403 Forbidden
        login_res = client.post("/api/auth/login", json={
            "email": test_email,
            "password": "Password123#"
        })
        assert login_res.status_code == 403
        assert "EMAIL_UNVERIFIED" in login_res.json().get("detail", "")

        # 2. Token created for unverified user must be rejected at protected endpoints
        unverified_token = sec.create_access_token({
            "sub": user_record["id"],
            "role": "Candidate",
            "email": test_email
        })
        auth_headers = {"Authorization": f"Bearer {unverified_token}"}

        res_me = client.get("/api/auth/me", headers=auth_headers)
        assert res_me.status_code == 403
        assert "ACCOUNT_UNVERIFIED" in res_me.json().get("detail", "")

        res_inv = client.get("/api/interviews", headers=auth_headers)
        assert res_inv.status_code == 403
        assert "ACCOUNT_UNVERIFIED" in res_inv.json().get("detail", "")

    finally:
        db.delete_user(user_record["id"])


def test_email_subject_exact_match_without_otp():
    """
    Verifies that the OTP email subject is exactly 'Your InterviewIQ Verification Code',
    and the actual OTP digits never appear in the subject header.
    """
    sent_messages = []

    class MockSMTP:
        def __init__(self, host, port, timeout=15):
            pass
        def __enter__(self):
            return self
        def __exit__(self, *args):
            pass
        def ehlo(self):
            pass
        def starttls(self, context=None):
            pass
        def login(self, user, password):
            pass
        def send_message(self, msg):
            sent_messages.append(msg)

    test_otp = "584920"
    with patch.dict(os.environ, {"SMTP_USERNAME": "test@gmail.com", "SMTP_PASSWORD": "apppassword1234"}):
        with patch("smtplib.SMTP", MockSMTP):
            result = email_service.send_otp_email(
                recipient_email="candidate@test.com",
                otp=test_otp,
                user_name="Alex"
            )
            assert result is True
            assert len(sent_messages) == 1
            msg = sent_messages[0]

            # 1. Subject must match exact string
            assert msg["Subject"] == "Your InterviewIQ Verification Code"

            # 2. Subject must NOT contain the OTP
            assert test_otp not in msg["Subject"]

            # 3. OTP must be contained inside message payloads (plain & HTML)
            decoded_payloads = [
                part.get_payload(decode=True).decode("utf-8")
                for part in msg.get_payload()
            ]
            found_in_body = any(test_otp in payload for payload in decoded_payloads)
            assert found_in_body is True


