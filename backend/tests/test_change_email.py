"""
InterviewIQ — Secure Email Change & Verification Test Suite
Tests:
1. Unauthenticated request rejection (HTTP 401)
2. Email format validation and same-email rejection (HTTP 400)
3. Case-insensitive MySQL uniqueness validation (HTTP 400)
4. 60-second resend cooldown enforcement (HTTP 429)
5. Honest SMTP delivery failure reporting (HTTP 502)
6. Secure OTP hashing (never stored or returned in plaintext)
7. Full successful email change and JWT re-issuance
8. Incorrect OTP tracking & 5-attempt limit lockout
9. 10-minute OTP expiration enforcement
10. Account login using new email with preserved password
11. Historical interviews and reports preservation under original user_id
12. Database transaction integrity & constraint rollback
"""

import os
import sys
import time
from datetime import datetime, timedelta
from unittest.mock import patch
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


def get_auth_header(user_dict: dict) -> dict:
    token = sec.create_access_token({
        "sub": user_dict["id"],
        "role": user_dict.get("role", "Candidate"),
        "email": user_dict["email"]
    })
    return {"Authorization": f"Bearer {token}"}


def create_ephemeral_user(email: str, name: str = "Test Candidate") -> dict:
    """Helper to create a temporary candidate user for test cases."""
    user_id = f"usr_test_{int(time.time() * 1000)}_{os.urandom(3).hex()}"
    pw_hash = sec.hash_password("Password123#")
    now_iso = datetime.utcnow().isoformat()
    record = {
        "id": user_id,
        "name": name,
        "email": email.strip().lower(),
        "password_hash": pw_hash,
        "role": "Candidate",
        "verified": 1,
        "verification_otp": None,
        "otp_expires_at": None,
        "otp_attempts": 0,
        "otp_last_sent_at": now_iso,
        "consent_date": now_iso,
        "target_role": "Full Stack Engineer",
        "level": "Mid Level",
        "avatar": "https://api.dicebear.com/7.x/initials/svg?seed=Test",
        "created_at": now_iso
    }
    return db.create_user(record)


# ---------------------------------------------------------------------------
# 1. Unauthenticated Requests Rejected
# ---------------------------------------------------------------------------
def test_unauthenticated_change_email_requests_rejected(client):
    res_req = client.post("/api/auth/change-email/request", json={"newEmail": "new@test.com"})
    assert res_req.status_code == 401

    res_ver = client.post("/api/auth/change-email/verify", json={"otp": "123456"})
    assert res_ver.status_code == 401


# ---------------------------------------------------------------------------
# 2. Email Validation: Format and Same-as-Current
# ---------------------------------------------------------------------------
def test_change_email_validation(client):
    user = create_ephemeral_user(f"valid_cand_{os.urandom(3).hex()}@test.com")
    headers = get_auth_header(user)

    # Invalid email format
    res_invalid = client.post(
        "/api/auth/change-email/request",
        json={"newEmail": "not-an-email"},
        headers=headers
    )
    assert res_invalid.status_code == 400
    assert "Invalid email address format" in res_invalid.json()["detail"]

    # Same email as current
    res_same = client.post(
        "/api/auth/change-email/request",
        json={"newEmail": user["email"]},
        headers=headers
    )
    assert res_same.status_code == 400
    assert "different from your current email" in res_same.json()["detail"]


# ---------------------------------------------------------------------------
# 3. Case-Insensitive MySQL Uniqueness Validation
# ---------------------------------------------------------------------------
def test_change_email_already_registered(client):
    email_a = f"existing_{os.urandom(3).hex()}@test.com"
    email_b = f"candidate_b_{os.urandom(3).hex()}@test.com"

    user_a = create_ephemeral_user(email_a)
    user_b = create_ephemeral_user(email_b)

    headers_b = get_auth_header(user_b)

    # User B attempts to change email to User A's email (uppercase variation)
    res = client.post(
        "/api/auth/change-email/request",
        json={"newEmail": email_a.upper()},
        headers=headers_b
    )
    assert res.status_code == 400
    assert "already exists" in res.json()["detail"]


# ---------------------------------------------------------------------------
# 4. Resend Cooldown Rate-Limiting (60 seconds)
# ---------------------------------------------------------------------------
def test_change_email_resend_cooldown(client):
    user = create_ephemeral_user(f"cooldown_{os.urandom(3).hex()}@test.com")
    headers = get_auth_header(user)
    new_email = f"target_{os.urandom(3).hex()}@test.com"

    with patch("email_service.send_otp_email", return_value=True):
        res1 = client.post(
            "/api/auth/change-email/request",
            json={"newEmail": new_email},
            headers=headers
        )
        assert res1.status_code == 200

        # Immediate second request triggers 429
        res2 = client.post(
            "/api/auth/change-email/request",
            json={"newEmail": new_email},
            headers=headers
        )
        assert res2.status_code == 429
        assert "Please wait" in res2.json()["detail"]


# ---------------------------------------------------------------------------
# 5. Honest SMTP Delivery Failure Reporting (HTTP 502)
# ---------------------------------------------------------------------------
def test_change_email_smtp_delivery_failure(client):
    user = create_ephemeral_user(f"smtp_fail_{os.urandom(3).hex()}@test.com")
    headers = get_auth_header(user)
    new_email = f"target_{os.urandom(3).hex()}@test.com"

    with patch("email_service.send_otp_email", side_effect=email_service.SMTPDeliveryError("Connection refused by SMTP")):
        res = client.post(
            "/api/auth/change-email/request",
            json={"newEmail": new_email},
            headers=headers
        )
        assert res.status_code == 502
        assert "Verification email could not be sent" in res.json()["detail"]


# ---------------------------------------------------------------------------
# 6. Full Successful Email Change Flow & Secure OTP Hashing
# ---------------------------------------------------------------------------
def test_successful_email_change_flow(client):
    initial_email = f"initial_{os.urandom(3).hex()}@test.com"
    target_email = f"updated_{os.urandom(3).hex()}@test.com"
    user = create_ephemeral_user(initial_email)
    headers = get_auth_header(user)

    captured_otp = []

    def mock_send(recipient_email, otp, user_name):
        captured_otp.append(otp)
        return True

    with patch("email_service.send_otp_email", side_effect=mock_send):
        res_req = client.post(
            "/api/auth/change-email/request",
            json={"newEmail": target_email},
            headers=headers
        )
        assert res_req.status_code == 200
        req_json = res_req.json()
        assert req_json["success"] is True

        # Security check: OTP must NOT be exposed in the response
        assert "otp" not in req_json
        assert len(captured_otp) == 1
        otp = captured_otp[0]
        assert len(otp) == 6

        # Security check: Database must store SHA-256 hash, NEVER plaintext OTP
        raw_db_user = db.get_user_by_id(user["id"], include_credentials=True)
        assert raw_db_user["pending_email"] == target_email
        assert raw_db_user["pending_email_otp_hash"] == sec.hash_otp(otp)
        assert raw_db_user["pending_email_otp_hash"] != otp

        # Sanitized user check
        sanitized = db.get_user_by_id(user["id"])
        assert "pending_email_otp_hash" not in sanitized

        # Verify OTP
        res_ver = client.post(
            "/api/auth/change-email/verify",
            json={"otp": otp},
            headers=headers
        )
        assert res_ver.status_code == 200
        ver_json = res_ver.json()
        assert ver_json["success"] is True
        assert ver_json["user"]["email"] == target_email

        # Token must be updated with new email claim
        new_token = ver_json["access_token"]
        decoded = sec.decode_access_token(new_token)
        assert decoded["email"] == target_email
        assert decoded["sub"] == user["id"]

        # Database verification: Primary email updated, pending fields cleared
        final_db_user = db.get_user_by_id(user["id"], include_credentials=True)
        assert final_db_user["email"] == target_email
        assert final_db_user["pending_email"] is None
        assert final_db_user["pending_email_otp_hash"] is None


# ---------------------------------------------------------------------------
# 7. Incorrect OTP & 5-Attempt Lockout
# ---------------------------------------------------------------------------
def test_incorrect_otp_and_attempt_limit(client):
    user = create_ephemeral_user(f"attempt_test_{os.urandom(3).hex()}@test.com")
    headers = get_auth_header(user)
    new_email = f"target_{os.urandom(3).hex()}@test.com"

    with patch("email_service.send_otp_email", return_value=True):
        client.post(
            "/api/auth/change-email/request",
            json={"newEmail": new_email},
            headers=headers
        )

    # Attempts 1 through 4: Should decrement attempts
    for attempt_num in range(1, 5):
        res = client.post(
            "/api/auth/change-email/verify",
            json={"otp": "000000"},
            headers=headers
        )
        assert res.status_code == 400
        remaining = 5 - attempt_num
        assert f"{remaining} attempt(s) remaining" in res.json()["detail"]

    # Attempt 5: Exhausts attempts and invalidates OTP
    res_final = client.post(
        "/api/auth/change-email/verify",
        json={"otp": "000000"},
        headers=headers
    )
    assert res_final.status_code == 400
    assert "Maximum verification attempts exceeded" in res_final.json()["detail"]

    # Verify pending fields wiped in database
    db_user = db.get_user_by_id(user["id"], include_credentials=True)
    assert db_user["pending_email"] is None
    assert db_user["pending_email_otp_hash"] is None


# ---------------------------------------------------------------------------
# 8. Expired OTP Rejection
# ---------------------------------------------------------------------------
def test_expired_otp_rejected(client):
    user = create_ephemeral_user(f"expired_test_{os.urandom(3).hex()}@test.com")
    headers = get_auth_header(user)
    new_email = f"target_{os.urandom(3).hex()}@test.com"

    otp = "654321"
    otp_hash = sec.hash_otp(otp)
    # Set expiration to 1 minute in the past
    past_expiry = (datetime.utcnow() - timedelta(minutes=1)).isoformat()

    db.update_user(user["id"], {
        "pending_email": new_email,
        "pending_email_otp_hash": otp_hash,
        "pending_email_expires_at": past_expiry,
        "pending_email_attempts": 0
    })

    res = client.post(
        "/api/auth/change-email/verify",
        json={"otp": otp},
        headers=headers
    )
    assert res.status_code == 400
    assert "expired" in res.json()["detail"]


# ---------------------------------------------------------------------------
# 9. Existing Account Login with New Email & History Preservation
# ---------------------------------------------------------------------------
def test_login_with_new_email_and_history_preservation(client):
    original_email = f"original_{os.urandom(3).hex()}@test.com"
    new_email = f"new_login_{os.urandom(3).hex()}@test.com"
    password = "Password123#"

    # 1. Create candidate user
    user = create_ephemeral_user(original_email)
    headers = get_auth_header(user)

    # 2. Attach an interview session to this user
    interview_id = f"inv_{os.urandom(4).hex()}"
    db.save_interview({
        "id": interview_id,
        "userId": user["id"],
        "title": "Full Stack Practice",
        "category": "Software & Engineering",
        "role": "Full Stack Engineer",
        "level": "Mid Level",
        "overallScore": 88,
        "mode": "Technical Practice",
        "metrics": {"avgPaceWpm": 132},
        "report": {"feedback": "Strong architecture grounding"},
        "createdAt": datetime.utcnow().isoformat()
    })

    # 3. Perform email change
    captured_otp = []
    def record_otp(recipient_email, otp, user_name):
        captured_otp.append(otp)
        return True

    with patch("email_service.send_otp_email", side_effect=record_otp):
        res_change = client.post(
            "/api/auth/change-email/request",
            json={"newEmail": new_email},
            headers=headers
        )
        assert res_change.status_code == 200, res_change.text
        assert len(captured_otp) > 0
        res_ver = client.post(
            "/api/auth/change-email/verify",
            json={"otp": captured_otp[0]},
            headers=headers
        )
        assert res_ver.status_code == 200, res_ver.text

    # 4. Old email should no longer authenticate
    res_old_login = client.post("/api/auth/login", json={"email": original_email, "password": password})
    assert res_old_login.status_code == 401

    # 5. New email must authenticate successfully with original password
    res_new_login = client.post("/api/auth/login", json={"email": new_email, "password": password})
    assert res_new_login.status_code == 200
    login_data = res_new_login.json()
    assert login_data["success"] is True
    assert login_data["user"]["id"] == user["id"]
    assert login_data["user"]["email"] == new_email

    # 6. Verify all historical interviews remain accessible under the user
    new_headers = {"Authorization": f"Bearer {login_data['access_token']}"}
    res_interviews = client.get(f"/api/interviews?userId={user['id']}", headers=new_headers)
    assert res_interviews.status_code == 200
    inv_data = res_interviews.json()
    assert inv_data["success"] is True
    user_invs = [i for i in inv_data["interviews"] if i["id"] == interview_id]
    assert len(user_invs) == 1
    assert user_invs[0].get("overall_score") == 88 or user_invs[0].get("overallScore") == 88


# ---------------------------------------------------------------------------
# 10. Database Transaction Rollback on Conflict
# ---------------------------------------------------------------------------
def test_database_transaction_rollback_on_conflict():
    user1 = create_ephemeral_user(f"tx1_{os.urandom(3).hex()}@test.com")
    user2 = create_ephemeral_user(f"tx2_{os.urandom(3).hex()}@test.com")

    # Attempting to force complete_email_change of user2 to user1's email must fail
    # and rollback because of UNIQUE constraint uq_users_email
    with pytest.raises(Exception):
        db.complete_email_change(user2["id"], user1["email"])

    # User 2 email must remain intact and NOT corrupted
    check_user2 = db.get_user_by_id(user2["id"])
    assert check_user2["email"] == user2["email"]
