import os
import sys
import time
from datetime import datetime, timedelta, timezone
import pytest
from fastapi.testclient import TestClient

# Ensure backend directory is in Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from main import app
from security import (
    hash_password,
    verify_password,
    generate_secure_otp,
    verify_otp_timestamp,
    create_access_token,
    decode_access_token,
)
from database import (
    get_connection,
    sanitize_user,
    get_user_by_email,
    get_user_by_id,
    create_user,
    update_user,
    save_interview,
    get_interview_by_id,
    list_interviews,
)


@pytest.fixture(scope="session")
def client():
    with TestClient(app) as test_client:
        yield test_client


# ---------------------------------------------------------
# 1. Server-Side Bcrypt Password Hashing & Legacy Upgrade
# ---------------------------------------------------------
def test_bcrypt_hashing_and_verification():
    raw_pass = "SuperSecure#2026"
    hashed = hash_password(raw_pass)

    # Must be valid bcrypt hash starting with $2b$
    assert hashed.startswith("$2b$12$")
    assert len(hashed) >= 60

    # Verification must succeed for valid password
    valid = verify_password(raw_pass, hashed)
    assert valid is True

    # Verification must fail for wrong password
    invalid = verify_password("WrongPassword123", hashed)
    assert invalid is False


def test_legacy_sha256_transparent_verification():
    # Legacy unsalted SHA-256 for 'password123'
    legacy_sha256 = "ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f"
    valid = verify_password("password123", legacy_sha256)
    assert valid is True

    # Negative verification for wrong plain text against legacy hash
    invalid = verify_password("wrongpass", legacy_sha256)
    assert invalid is False


# ---------------------------------------------------------
# 2. Cryptographic OTP Generation & Expiration
# ---------------------------------------------------------
def test_otp_generation_and_expiry():
    otp, expires_at = generate_secure_otp()

    # Must be 6 digits string
    assert len(otp) == 6
    assert otp.isdigit()

    # Expiry must be a valid future ISO timestamp ~10 minutes ahead
    exp_dt = datetime.fromisoformat(expires_at)
    now_dt = datetime.utcnow()
    diff_sec = (exp_dt - now_dt).total_seconds()
    assert 550 < diff_sec <= 601

    # Verification must succeed with correct OTP and valid timestamp
    assert verify_otp_timestamp(otp, expires_at, otp) is True

    # Verification must reject incorrect OTP
    assert verify_otp_timestamp(otp, expires_at, "999999") is False

    # Verification must reject the hardcoded bypass '123456' unless that was explicitly generated
    if otp != "123456":
        assert verify_otp_timestamp(otp, expires_at, "123456") is False

    # Verification must reject expired timestamp
    past_timestamp = (datetime.utcnow() - timedelta(minutes=1)).isoformat()
    assert verify_otp_timestamp(otp, past_timestamp, otp) is False


# ---------------------------------------------------------
# 3. JWT Creation, Verification & Expiry
# ---------------------------------------------------------
def test_jwt_access_token():
    payload = {"sub": "usr_test_123", "email": "test@example.com", "role": "Candidate"}
    token = create_access_token(payload, expires_delta=timedelta(minutes=15))

    decoded = decode_access_token(token)
    assert decoded["sub"] == "usr_test_123"
    assert decoded["email"] == "test@example.com"
    assert decoded["role"] == "Candidate"
    assert "exp" in decoded


def test_jwt_expired_token_rejection():
    payload = {"sub": "usr_expired_123", "email": "expired@example.com", "role": "Candidate"}
    # Token that expired 5 seconds ago
    expired_token = create_access_token(payload, expires_delta=timedelta(seconds=-5))

    with pytest.raises(Exception) as exc_info:
        decode_access_token(expired_token)
    assert "expired" in str(exc_info.value).lower() or "401" in str(exc_info.value)


# ---------------------------------------------------------
# 4. Sensitive Field Stripping
# ---------------------------------------------------------
def test_sensitive_user_fields_sanitization():
    raw_user = {
        "id": "usr_999",
        "name": "Jane Doe",
        "email": "jane@example.com",
        "password_hash": "$2b$12$someBcryptHashValueHere",
        "verification_otp": "654321",
        "otp_expires_at": "2026-11-07T12:00:00Z",
        "role": "Candidate",
        "verified": 1,
    }

    sanitized = sanitize_user(raw_user)
    assert "password_hash" not in sanitized
    assert "verification_otp" not in sanitized
    assert "otp_expires_at" not in sanitized
    assert sanitized["id"] == "usr_999"
    assert sanitized["name"] == "Jane Doe"
    assert sanitized["email"] == "jane@example.com"


# ---------------------------------------------------------
# 5. Route Protection & Authorization Tests (HTTP API)
# ---------------------------------------------------------
def test_unauthenticated_requests_blocked(client):
    # Calling protected endpoints without token must return 401
    res_me = client.get("/api/auth/me")
    assert res_me.status_code == 401

    res_interviews = client.get("/api/interviews")
    assert res_interviews.status_code == 401

    res_users = client.get("/api/auth/users")
    assert res_users.status_code == 401

    # Calling with invalid Bearer token must return 401
    bad_headers = {"Authorization": "Bearer fake.tampered.token"}
    res_bad = client.get("/api/auth/me", headers=bad_headers)
    assert res_bad.status_code == 401


def test_rbac_and_resource_ownership(client):
    # 1. Candidate Login
    cand_login = client.post("/api/auth/login", json={
        "email": "candidate@interviewiq.io",
        "password": "password123"
    })
    assert cand_login.status_code == 200
    cand_data = cand_login.json()
    cand_token = cand_data["access_token"]
    cand_headers = {"Authorization": f"Bearer {cand_token}"}

    # 2. Candidate access to self /api/auth/me succeeds
    cand_me = client.get("/api/auth/me", headers=cand_headers)
    assert cand_me.status_code == 200
    assert cand_me.json()["user"]["email"] == "candidate@interviewiq.io"

    # 3. RBAC Check: Candidate attempting to list all users must get 403 Forbidden
    cand_users = client.get("/api/auth/users", headers=cand_headers)
    assert cand_users.status_code == 403

    # 4. Admin Login
    admin_login = client.post("/api/auth/login", json={
        "email": "admin@interviewiq.internal",
        "password": "password123"
    })
    assert admin_login.status_code == 200
    admin_token = admin_login.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # 5. RBAC Check: Admin listing all users succeeds
    admin_users = client.get("/api/auth/users", headers=admin_headers)
    assert admin_users.status_code == 200
    assert "users" in admin_users.json()


def test_resource_ownership_isolation(client):
    # Log in Candidate
    cand_login = client.post("/api/auth/login", json={
        "email": "candidate@interviewiq.io",
        "password": "password123"
    })
    cand_token = cand_login.json()["access_token"]
    cand_headers = {"Authorization": f"Bearer {cand_token}"}

    # Candidate creates an interview
    unique_title = f"Test Isolation Session {int(time.time())}"
    create_res = client.post("/api/interviews", headers=cand_headers, json={
        "title": unique_title,
        "role": "Frontend Developer",
        "overallScore": 88,
        "metrics": {"correctness": 90}
    })
    assert create_res.status_code == 200
    cand_interview_id = create_res.json()["interview"]["id"]

    # Create and register a secondary test user (Candidate B) in DB
    cand_b_user = {
        "id": "usr_candidate_b_test",
        "name": "Candidate B",
        "email": "cand_b@test.com",
        "password_hash": hash_password("password123"),
        "role": "Candidate",
        "verified": 1
    }
    create_user(cand_b_user)

    try:
        cand_b_token = create_access_token({
            "sub": "usr_candidate_b_test",
            "email": "cand_b@test.com",
            "role": "Candidate"
        })
        cand_b_headers = {"Authorization": f"Bearer {cand_b_token}"}

        # Candidate B attempts to delete Candidate A's interview -> Must be 403 Forbidden
        delete_res = client.delete(f"/api/interviews/{cand_interview_id}", headers=cand_b_headers)
        assert delete_res.status_code == 403

        # Candidate B attempts to modify Candidate A's user profile -> Must be 403 Forbidden
        cand_a_id = cand_login.json()["user"]["id"]
        put_res = client.put(f"/api/auth/user/{cand_a_id}", headers=cand_b_headers, json={
            "targetRole": "Hacked Role"
        })
        assert put_res.status_code == 403
    finally:
        from database import delete_user
        delete_user("usr_candidate_b_test")

    # Clean up test interview using owner token
    cleanup_res = client.delete(f"/api/interviews/{cand_interview_id}", headers=cand_headers)
    assert cleanup_res.status_code == 200


# ---------------------------------------------------------
# 6. SQL Injection Defense & Whitelist Validation
# ---------------------------------------------------------
def test_sql_injection_defense():
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT id, role FROM users WHERE email = 'candidate@interviewiq.io'")
        row = cursor.fetchone()
        user_id = row[0]
        original_role = row[1]
    finally:
        conn.close()

    # Attempt to inject disallowed column 'role' or SQL snippet via update_user
    malicious_updates = {
        "role": "Administrator",
        "is_admin": 1,
        "fake_col'; DROP TABLE users; --": "exploit",
        "targetRole": "Senior AI Engineer"
    }

    updated = update_user(user_id, malicious_updates)

    # Permitted field targetRole was updated
    assert updated["target_role"] == "Senior AI Engineer"

    # Disallowed field 'role' was NOT injected/modified
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute("SELECT role FROM users WHERE id = ?", (user_id,))
        current_role = cursor.fetchone()[0]
        assert current_role == original_role
    finally:
        conn.close()


# ---------------------------------------------------------
# 7. End-to-End Registration & OTP Verification Flow
# ---------------------------------------------------------
def test_registration_and_otp_verification_flow(client):
    test_email = f"auto_cand_{int(time.time())}@interviewiq.io"

    # Step 1: Register User with mocked SMTP delivery
    from unittest.mock import patch
    with patch("email_service.send_otp_email", return_value=True):
        reg_res = client.post("/api/auth/register", json={
            "name": "Automated Tester",
            "email": test_email,
            "password": "SecurePassword#2026",
            "role": "Candidate",
            "consent": True,
            "targetRole": "Cloud Engineer"
        })
        assert reg_res.status_code == 201
        reg_data = reg_res.json()
        assert reg_data["success"] is True
        assert "user" in reg_data

    # Ensure sensitive credentials are stripped from registration response
    user_data = reg_data["user"]
    assert "password_hash" not in user_data
    assert "verification_otp" not in user_data
    assert "otp_expires_at" not in user_data

    # Obtain OTP generated for test verification directly from database record
    user_record = get_user_by_email(test_email, include_credentials=True)
    assert user_record is not None
    generated_otp = user_record["verification_otp"]
    assert len(generated_otp) == 6

    # Step 2: Attempt verification with invalid OTP -> Must fail
    bad_otp_res = client.post("/api/auth/verify-otp", json={
        "email": test_email,
        "otp": "000000"
    })
    assert bad_otp_res.status_code == 400

    # Step 3: Verify with genuine expiring OTP -> Must succeed and issue JWT
    good_otp_res = client.post("/api/auth/verify-otp", json={
        "email": test_email,
        "otp": generated_otp
    })
    assert good_otp_res.status_code == 200
    otp_data = good_otp_res.json()
    assert "access_token" in otp_data
    new_token = otp_data["access_token"]

    # Step 4: Use new JWT to access protected profile /api/auth/me
    me_res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {new_token}"})
    assert me_res.status_code == 200
    assert me_res.json()["user"]["email"] == test_email
    assert me_res.json()["user"]["verified"] == 1

    # Clean up test user
    from database import delete_user
    delete_user(user_data["id"])
