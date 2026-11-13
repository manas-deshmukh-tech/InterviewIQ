"""
InterviewIQ Security & Authentication Module
Handles:
- Server-side password hashing and verification using bcrypt
- Legacy SHA-256 hash upgrade verification
- Cryptographic JWT access token generation and validation (HS256)
- Secure 6-digit OTP generation with 10-minute expiration
- FastAPI dependency injection for route protection and Role-Based Access Control (RBAC)
"""

import os
import secrets
import hashlib
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
import bcrypt
import jwt
from fastapi import Depends, HTTPException, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

# Cryptographically sound secret key (>= 32 bytes for HS256)
JWT_SECRET_KEY = os.getenv(
    "JWT_SECRET_KEY",
    "interviewiq_super_secure_jwt_secret_token_key_2026_production_grade_32b_minimum"
)
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))  # 24 Hours
OTP_EXPIRE_MINUTES = 10

security_bearer = HTTPBearer(auto_error=False)


# ==================== Password Hashing & Verification ====================

def hash_password(password: str) -> str:
    """Hashes a plain-text password using bcrypt with automatic salt generation."""
    if not password:
        raise ValueError("Password cannot be empty.")
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifies a plain password against a stored hash.
    Supports standard bcrypt hashes and seamless backward compatibility for SHA-256.
    """
    if not hashed_password or not plain_password:
        return False

    # Standard Bcrypt ($2a$, $2b$, $2y$)
    if hashed_password.startswith("$2"):
        try:
            return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
        except Exception:
            return False

    # Legacy SHA-256 hash compatibility (64 hex characters)
    if len(hashed_password) == 64:
        import hashlib
        computed = hashlib.sha256(plain_password.encode("utf-8")).hexdigest()
        return secrets.compare_digest(computed.lower(), hashed_password.lower())

    return False


# ==================== OTP Generation & Verification ====================

def generate_secure_otp() -> tuple:
    """
    Generates a cryptographically secure 6-digit OTP and an ISO expiration timestamp (10 mins).
    """
    otp = str(secrets.randbelow(900000) + 100000)
    expires_at = (datetime.utcnow() + timedelta(minutes=OTP_EXPIRE_MINUTES)).isoformat()
    return otp, expires_at


def verify_otp_timestamp(stored_otp: Optional[str], stored_expiry: Optional[str], provided_otp: str) -> bool:
    """
    Strictly verifies OTP code and expiration timestamp.
    No hardcoded bypasses are permitted.
    """
    if not stored_otp or not provided_otp:
        return False

    # Time-constant string comparison to mitigate timing attacks
    if not secrets.compare_digest(str(stored_otp).strip(), str(provided_otp).strip()):
        return False

    if stored_expiry:
        try:
            exp_dt = datetime.fromisoformat(stored_expiry)
            if datetime.utcnow() > exp_dt:
                return False  # OTP has expired
        except Exception:
            return False

    return True


def hash_otp(otp: str) -> str:
    """Hashes a 6-digit OTP using SHA-256 for secure database persistence."""
    return hashlib.sha256(str(otp).strip().encode("utf-8")).hexdigest()


def verify_hashed_otp(stored_hash: Optional[str], provided_otp: str) -> bool:
    """Verifies a candidate OTP against a stored SHA-256 hash using constant-time comparison."""
    if not stored_hash or not provided_otp:
        return False
    candidate_hash = hash_otp(provided_otp)
    return secrets.compare_digest(stored_hash.lower(), candidate_hash.lower())


# ==================== JWT Token Management ====================

def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Creates a signed JWT access token containing subject identity and role."""
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({
        "exp": expire,
        "iat": datetime.utcnow()
    })
    return jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)


def decode_access_token(token: str) -> Dict[str, Any]:
    """Decodes and validates a JWT token signature and expiration."""
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token has expired. Please sign in again.",
            headers={"WWW-Authenticate": "Bearer"}
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token.",
            headers={"WWW-Authenticate": "Bearer"}
        )


# ==================== FastAPI Dependencies & RBAC ====================

async def get_current_user(
    auth: Optional[HTTPAuthorizationCredentials] = Security(security_bearer)
) -> Dict[str, Any]:
    """
    FastAPI dependency: authenticates the Bearer token and returns the sanitized user object.
    Never exposes password_hash or internal OTPs to routes or clients.
    """
    if not auth or not auth.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authentication credentials. Please provide a Bearer token.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    payload = decode_access_token(auth.credentials)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload: missing subject identifier.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    import database as db
    user = db.get_user_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authenticated user account not found in database.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    # Prevent unverified accounts from accessing protected features
    if not user.get("verified", 0):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="ACCOUNT_UNVERIFIED: Please verify your email with the OTP sent to your inbox before accessing protected features."
        )

    # Sanitize sensitive fields
    sanitized = dict(user)
    sanitized.pop("password_hash", None)
    sanitized.pop("verification_otp", None)
    sanitized.pop("otp_expires_at", None)
    sanitized.pop("otp_attempts", None)
    sanitized.pop("otp_last_sent_at", None)
    return sanitized


def require_roles(allowed_roles: List[str]):
    """Role-Based Access Control (RBAC) dependency factory."""
    async def role_checker(current_user: Dict[str, Any] = Depends(get_current_user)):
        user_role = current_user.get("role", "Candidate")
        if user_role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied: Insufficient privileges for role '{user_role}'. Required roles: {allowed_roles}"
            )
        return current_user
    return role_checker


def verify_owner_or_admin(current_user: Dict[str, Any], target_user_id: str):
    """
    Ensures that a user can only read/modify their own personal records,
    unless they hold the Administrator role.
    """
    if current_user.get("role") != "Administrator" and current_user.get("id") != target_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: You are only authorized to access or modify your own records."
        )

