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
    verify_password_with_status,
    check_password_strength,
    validate_password_strength,
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


# ---------------------------------------------------------
# 8. Password Policy & Security Hardening Tests
# ---------------------------------------------------------
def test_password_strength_unit_validation():
    # Boundary checks: below 8 characters (7 chars and fewer)
    short_examples = ["", "1", "1234", "12345", "123456", "pass123", "abcdefg", "1234567"]
    for pw in short_examples:
        valid, msg = check_password_strength(pw)
        assert valid is False, f"Password '{pw}' (len {len(pw)}) should have failed min length check"
        assert "at least 8 characters" in msg or "cannot be empty" in msg

    # Exact 8-character valid boundary checks
    valid_8_char_examples = ["Secure8!", "MyPass8#", "Valid_8x", "Passw0rd", "custom88"]
    for pw in valid_8_char_examples:
        valid, msg = check_password_strength(pw)
        assert valid is True, f"8-character password '{pw}' should have passed validation but got: {msg}"

    # 9 to 128 characters valid checks
    valid_mid_length_examples = [
        "Password9",                     # 9 chars
        "Password123",                   # 11 chars
        "correct horse battery staple",   # 28 chars
        "SuperSecure#2026!",             # 17 chars
        "A" * 64 + "B" * 63 + "1"        # 128 chars
    ]
    for pw in valid_mid_length_examples:
        valid, msg = check_password_strength(pw)
        assert valid is True, f"Password '{pw}' (len {len(pw)}) should have passed validation but got: {msg}"

    # Whitespace-only passwords
    whitespace_examples = ["        ", "            ", "   \t   \n  "]
    for pw in whitespace_examples:
        valid, msg = check_password_strength(pw)
        assert valid is False, f"Whitespace password should have failed"
        assert "whitespace" in msg

    # Maximum length check: 128 chars
    valid_128 = "A" + ("b" * 126) + "1"
    assert len(valid_128) == 128
    valid, msg = check_password_strength(valid_128)
    assert valid is True

    invalid_129 = valid_128 + "x"
    assert len(invalid_129) == 129
    valid, msg = check_password_strength(invalid_129)
    assert valid is False
    assert "cannot exceed 128 characters" in msg

    # Common weak passwords (even if >= 8 characters)
    weak_examples = ["password", "12345678", "admin123", "123456789012", "password1234", "admin12345678", "qwerty123456"]
    for pw in weak_examples:
        valid, msg = check_password_strength(pw)
        assert valid is False, f"Weak password '{pw}' should have failed"
        assert "common" in msg or "guessed" in msg

    # Repetitive character passwords
    repetitive_examples = ["aaaaaaaa", "11111111", "aaaaaaaaaaaa", "111111111111"]
    for pw in repetitive_examples:
        valid, msg = check_password_strength(pw)
        assert valid is False, f"Repetitive password '{pw}' should have failed"
        assert "simple" in msg


def test_registration_password_policy_enforcement(client):
    from unittest.mock import patch

    # 1. Attempt registering with single-digit password '1' -> Must fail with 400
    res_1 = client.post("/api/auth/register", json={
        "name": "Weak User",
        "email": "weak1@test.com",
        "password": "1",
        "consent": True
    })
    assert res_1.status_code == 400
    assert "at least 8 characters" in res_1.json()["detail"]

    # 2. Attempt registering with 7-character password 'pass123' -> Must fail with 400
    res_7char = client.post("/api/auth/register", json={
        "name": "Weak User",
        "email": "weak2@test.com",
        "password": "pass123",
        "consent": True
    })
    assert res_7char.status_code == 400
    assert "at least 8 characters" in res_7char.json()["detail"]

    # 3. Attempt registering with weak common 8-char password 'password' -> Must fail with 400
    res_weak = client.post("/api/auth/register", json={
        "name": "Weak User",
        "email": "weak3@test.com",
        "password": "password",
        "consent": True
    })
    assert res_weak.status_code == 400
    assert "common" in res_weak.json()["detail"] or "guessed" in res_weak.json()["detail"]

    # 4. Attempt registering with whitespace-only -> Must fail with 400
    res_space = client.post("/api/auth/register", json={
        "name": "Weak User",
        "email": "weak4@test.com",
        "password": "        ",
        "consent": True
    })
    assert res_space.status_code == 400
    assert "whitespace" in res_space.json()["detail"]

    # 5. Direct API bypass: Attempting to send pre-hashed 'passwordHash' to bypass validation -> Must fail with 400
    res_bypass = client.post("/api/auth/register", json={
        "name": "Bypass Attacker",
        "email": "attacker@test.com",
        "passwordHash": "6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b",  # sha256 of '1'
        "consent": True
    })
    assert res_bypass.status_code == 400
    assert "not permitted" in res_bypass.json()["detail"]

    # 6. Valid registration with compliant 8-character password -> Must succeed with 201
    valid_email = f"valid_cand_{int(time.time())}@interviewiq.io"
    with patch("email_service.send_otp_email", return_value=True):
        res_ok = client.post("/api/auth/register", json={
            "name": "Policy Compliant",
            "email": valid_email,
            "password": "Secure8!",
            "role": "Candidate",
            "consent": True
        })
        assert res_ok.status_code == 201
        created_user = res_ok.json()["user"]
        from database import delete_user
        delete_user(created_user["id"])


def test_change_password_policy_enforcement(client):
    # Log in candidate
    cand_login = client.post("/api/auth/login", json={
        "email": "candidate@interviewiq.io",
        "password": "password123"
    })
    assert cand_login.status_code == 200
    token = cand_login.json()["access_token"]
    user_id = cand_login.json()["user"]["id"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Attempt changing password to 7-character 'pass123' -> Must fail with 400
    res_short = client.post("/api/auth/change-password", headers=headers, json={
        "userId": user_id,
        "currentPassword": "password123",
        "newPassword": "pass123"
    })
    assert res_short.status_code == 400
    assert "at least 8 characters" in res_short.json()["detail"]

    # 2. Attempt changing password using direct hash bypass -> Must fail with 400
    res_hash = client.post("/api/auth/change-password", headers=headers, json={
        "userId": user_id,
        "currentPassword": "password123",
        "newPasswordHash": "6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b"
    })
    assert res_hash.status_code == 400
    assert "not permitted" in res_hash.json()["detail"]

    # 3. Attempt changing password with wrong current password -> Must fail with 400
    res_wrong = client.post("/api/auth/change-password", headers=headers, json={
        "userId": user_id,
        "currentPassword": "WrongCurrentPassword123!",
        "newPassword": "ValidNewPass8#"
    })
    assert res_wrong.status_code == 400
    assert "incorrect" in res_wrong.json()["detail"]

    # 4. Successful password change with valid 8-character password
    res_valid = client.post("/api/auth/change-password", headers=headers, json={
        "userId": user_id,
        "currentPassword": "password123",
        "newPassword": "BrandNewSecurePassphrase#2026!"
    })
    assert res_valid.status_code == 200

    # 5. Log in with the new password
    new_login = client.post("/api/auth/login", json={
        "email": "candidate@interviewiq.io",
        "password": "BrandNewSecurePassphrase#2026!"
    })
    assert new_login.status_code == 200

    # Revert password back so subsequent tests maintain expected seed state
    revert_res = client.post("/api/auth/change-password", headers={"Authorization": f"Bearer {new_login.json()['access_token']}"}, json={
        "userId": user_id,
        "currentPassword": "BrandNewSecurePassphrase#2026!",
        "newPassword": "password123_temp"
    })
    # Reset directly in DB to standard test password123
    from database import update_user
    update_user(user_id, {"password_hash": hash_password("password123")})


def test_login_accepts_existing_short_password_account(client):
    """
    Requirement 6 & 7: Login must continue accepting existing accounts regardless of
    whether their old password is shorter than 8 characters. Do not apply new-password
    validation to login.
    """
    from database import create_user, delete_user
    short_pw = "short5"  # 6 characters (< 8 chars)
    test_email = f"short_legacy_{int(time.time())}@interviewiq.io"
    user_id = f"usr_short_{int(time.time() * 1000)}"
    user_record = {
        "id": user_id,
        "name": "Short Password Legacy User",
        "email": test_email,
        "password_hash": hash_password(short_pw),
        "role": "Candidate",
        "verified": 1,
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat()
    }
    create_user(user_record)

    try:
        # Existing account with < 8 chars must be able to log in successfully
        login_res = client.post("/api/auth/login", json={
            "email": test_email,
            "password": short_pw
        })
        assert login_res.status_code == 200
        data = login_res.json()
        assert data["success"] is True
        assert "access_token" in data
        assert data["user"]["email"] == test_email
    finally:
        delete_user(user_id)


def test_backward_compatible_login_and_hash_auto_upgrade(client):
    import hashlib
    # Create a test user with a legacy SHA-256 hash
    legacy_email = f"legacy_sha256_{int(time.time())}@test.com"
    plain_pw = "LegacySecret#2026"
    raw_sha256 = hashlib.sha256(plain_pw.encode("utf-8")).hexdigest()

    legacy_user = {
        "id": f"usr_legacy_{int(time.time())}",
        "name": "Legacy User",
        "email": legacy_email,
        "password_hash": raw_sha256,
        "role": "Candidate",
        "verified": 1
    }
    create_user(legacy_user)

    try:
        # Step 1: User logs in with plain text password
        login_res = client.post("/api/auth/login", json={
            "email": legacy_email,
            "password": plain_pw
        })
        assert login_res.status_code == 200
        assert "access_token" in login_res.json()

        # Step 2: Verify in database that hash was auto-upgraded to standard Bcrypt ($2b$)
        stored = get_user_by_email(legacy_email, include_credentials=True)
        assert stored["password_hash"].startswith("$2b$")
        assert len(stored["password_hash"]) >= 60

        # Step 3: Login again to verify standard Bcrypt authentication works
        login_again = client.post("/api/auth/login", json={
            "email": legacy_email,
            "password": plain_pw
        })
        assert login_again.status_code == 200

    finally:
        from database import delete_user
        delete_user(legacy_user["id"])


def test_prehashed_bcrypt_backward_compatibility(client):
    import hashlib
    # Simulate an account registered under the old architecture where
    # client sent sha256(pw) and backend saved bcrypt(sha256(pw))
    prehash_email = f"prehash_user_{int(time.time())}@test.com"
    plain_pw = "MyPreHashedPassword#2026"
    client_prehash = hashlib.sha256(plain_pw.encode("utf-8")).hexdigest()
    bcrypt_of_sha256 = hash_password(client_prehash)

    prehash_user = {
        "id": f"usr_prehash_{int(time.time())}",
        "name": "Prehash User",
        "email": prehash_email,
        "password_hash": bcrypt_of_sha256,
        "role": "Candidate",
        "verified": 1
    }
    create_user(prehash_user)

    try:
        # Step 1: User logs in with plain text password (new frontend behavior)
        login_res = client.post("/api/auth/login", json={
            "email": prehash_email,
            "password": plain_pw
        })
        assert login_res.status_code == 200
        assert "access_token" in login_res.json()

        # Step 2: The hash should be auto-upgraded to direct bcrypt(plain_pw)
        stored = get_user_by_email(prehash_email, include_credentials=True)
        assert stored["password_hash"].startswith("$2b$")
        # Direct verify should now work without pre-hashing
        import bcrypt
        assert bcrypt.checkpw(plain_pw.encode("utf-8"), stored["password_hash"].encode("utf-8"))

    finally:
        from database import delete_user
        delete_user(prehash_user["id"])
