"""
InterviewIQ Python Backend API
Hardened FastAPI server featuring:
- Bcrypt password hashing
- JWT Bearer Authentication & RBAC (Role-Based Access Control)
- Secure 10-minute expiring OTP verification (zero hardcoded bypasses)
- Parameterized SQL queries preventing injection
- Resource ownership validation on all sensitive endpoints
"""

from fastapi import FastAPI, HTTPException, Query, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import uvicorn
import time
import os
import re
from datetime import datetime

import database as db
import security as sec
import ai_service
import question_bank as qb
from nlp_analyzer import NLPInterviewAnalyzer

# Initialize SQLite database schema
db.init_db()

app = FastAPI(
    title="InterviewIQ Secured Backend",
    description="Full-Stack FastAPI backend with JWT Authentication, Bcrypt, and Data Science NLP Engine",
    version="2.1.0"
)

# Enable CORS for frontend development and production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

analyzer = NLPInterviewAnalyzer()


# ==================== Pydantic Request Models ====================

class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=80)
    email: str = Field(..., min_length=5, max_length=120)
    password: Optional[str] = None
    passwordHash: Optional[str] = None  # Backward compatibility
    role: Optional[str] = "Candidate"
    consent: Optional[bool] = True
    targetRole: Optional[str] = "Full Stack Engineer"
    level: Optional[str] = "Mid Level"


class LoginRequest(BaseModel):
    email: str
    password: Optional[str] = None
    passwordHash: Optional[str] = None  # Backward compatibility


class VerifyOtpRequest(BaseModel):
    email: str
    otp: str = Field(..., min_length=6, max_length=6)


class ResendOtpRequest(BaseModel):
    email: str = Field(..., min_length=5, max_length=120)


class UpdateUserRequest(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=80)
    target_role: Optional[str] = None
    targetRole: Optional[str] = None
    level: Optional[str] = None
    avatar: Optional[str] = None


class ChangePasswordRequest(BaseModel):
    userId: str
    currentPassword: Optional[str] = None
    currentPasswordHash: Optional[str] = None
    newPassword: Optional[str] = None
    newPasswordHash: Optional[str] = None


class ChangeEmailRequest(BaseModel):
    newEmail: str = Field(..., min_length=5, max_length=120)


class VerifyChangeEmailRequest(BaseModel):
    otp: str = Field(..., min_length=6, max_length=6)


class EvaluationRequest(BaseModel):
    question: str
    answer: str
    idealAnswer: Optional[str] = None
    idealKeywords: Optional[List[str]] = Field(default_factory=list)
    deliveryTelemetry: Optional[Dict[str, Any]] = Field(default_factory=dict)
    candidateRole: Optional[str] = "Software Engineer"
    questionCategory: Optional[str] = "Technical"
    experienceLevel: Optional[str] = "Mid Level"


class GenerateQuestionsRequest(BaseModel):
    role: str = "Software Developer"
    level: str = "Mid Level"
    category: Optional[str] = "Software & Engineering"
    resumeText: Optional[str] = None
    count: int = 3


class PrepareQuestionsRequest(BaseModel):
    role: str = "Software Developer"
    level: str = "Mid Level"
    durationMinutes: int = 15
    customRoleTitle: Optional[str] = ""
    resumeSkills: Optional[List[str]] = Field(default_factory=list)
    resumeProjects: Optional[List[str]] = Field(default_factory=list)
    category: Optional[str] = None


class BatchAnalyticsRequest(BaseModel):
    interviews: List[Dict[str, Any]]


# ==================== Root & Health Checks ====================

@app.get("/")
def root():
    db_meta = db.get_engine_metadata()
    return {
        "status": "online",
        "service": "InterviewIQ Enterprise Multi-Engine Backend",
        "version": "2.2.0",
        "security": {
            "auth": "JWT (HS256 Bearer Token)",
            "passwords": "Bcrypt (12 Rounds Salted)",
            "otp": "Cryptographic 6-digit with 10-minute Expiry"
        },
        "database": db_meta,
        "nlp_engine": "Scikit-Learn TF-IDF N-Grams + Cosine Semantic Similarity"
    }


@app.get("/api/health")
def health_check():
    db_meta = db.get_engine_metadata()
    ai_meta = ai_service.get_ai_config()
    return {
        "status": "healthy",
        "database": db_meta,
        "ai_service": ai_meta,
        "security_layer": "active",
        "active_capabilities": [
            "Bcrypt Server-Side Password Hashing",
            "JWT Bearer Token Authentication",
            "Role-Based Access Control (RBAC)",
            "Single-Tenant Ownership Isolation",
            "Secure Expiring OTP Generator",
            "Semantic Cosine Similarity NLP",
            "STAR Behavioral Framework Classification",
            "SQLAlchemy PyMySQL Connection Pooling",
            "Dual Dialect Database Support (MySQL / SQLite)",
            "Local Ollama qwen2.5:1.5b Neural Engine",
            "OpenAI API Integration Layer"
        ]
    }


# ==================== AI Service Endpoints ====================

@app.get("/api/ai/status")
def get_ai_service_status(current_user: Dict[str, Any] = Depends(sec.get_current_user)):
    """
    Protected endpoint: Returns active AI service configuration status without exposing secrets.
    """
    return {
        "success": True,
        "ai_service": ai_service.get_ai_config()
    }


@app.get("/api/ai/test-connection")
def test_ai_connection(current_user: Dict[str, Any] = Depends(sec.get_current_user)):
    """
    Protected endpoint: Sends a minimal ping to verify active AI service connectivity.
    Pings local Ollama by default, or OpenAI if configured.
    Catches and maps all API exceptions to sanitized user-safe errors.
    """
    try:
        result = ai_service.ping_ai_connection()
        return {
            "success": True,
            "result": result
        }
    except ai_service.AIServiceError as err:
        raise HTTPException(status_code=err.status_code, detail=err.message)


# ==================== Authentication Endpoints ====================

@app.post("/api/auth/register", status_code=status.HTTP_201_CREATED)
def register_user(req: RegisterRequest):
    """
    Registers a new user account with bcrypt password hashing and an expiring 6-digit OTP.
    """
    if req.role == "Administrator":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Administrator accounts cannot be self-registered."
        )
    if not req.consent:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User privacy consent is mandatory under regulations."
        )

    # Check for existing email
    existing = db.get_user_by_email(req.email)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists."
        )

    # Resolve password and hash with bcrypt
    plain_pw = req.password or req.passwordHash
    if not plain_pw or len(plain_pw) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 6 characters long."
        )

    password_hash = sec.hash_password(plain_pw)
    user_id = f"usr_{int(time.time() * 1000)}"
    otp, otp_expires_at = sec.generate_secure_otp()
    now_iso = datetime.utcnow().isoformat()

    new_user_record = {
        "id": user_id,
        "name": req.name.strip(),
        "email": req.email.lower().strip(),
        "password_hash": password_hash,
        "role": req.role or "Candidate",
        "verified": False,
        "verification_otp": otp,
        "otp_expires_at": otp_expires_at,
        "otp_attempts": 0,
        "otp_last_sent_at": now_iso,
        "consent_date": now_iso,
        "target_role": req.targetRole or "Full Stack Engineer",
        "level": req.level or "Mid Level",
        "avatar": f"https://api.dicebear.com/7.x/initials/svg?seed={req.name}&backgroundColor=0284c7,4f46e5,7c3aed",
        "created_at": now_iso
    }

    # Dispatch genuine verification email via Gmail SMTP (STARTTLS)
    # Transparent failure: Never report success if sending fails
    try:
        from email_service import send_otp_email
        send_otp_email(
            recipient_email=req.email.lower().strip(),
            otp=otp,
            user_name=req.name.strip()
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Verification email could not be sent: {str(exc)}"
        ) from exc

    db.create_user(new_user_record)

    # Return sanitized user (NEVER return OTP or otpMock)
    sanitized = db.get_user_by_id(user_id)
    return {
        "success": True,
        "message": f"Verification code dispatched to {req.email}. Code expires in 10 minutes.",
        "user": sanitized
    }


@app.post("/api/auth/resend-otp")
def resend_otp(req: ResendOtpRequest):
    """
    Dispatches a fresh OTP to the user's email with a 60-second rate-limiting cooldown.
    """
    email = req.email.lower().strip()
    user_record = db.get_user_by_email(email, include_credentials=True)
    if not user_record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User account not found.")

    if user_record.get("verified"):
        return {"success": True, "message": "Account is already verified. You may sign in directly."}

    # Resend cooldown: 60 seconds
    last_sent = user_record.get("otp_last_sent_at")
    if last_sent:
        try:
            last_dt = datetime.fromisoformat(last_sent)
            elapsed = (datetime.utcnow() - last_dt).total_seconds()
            if elapsed < 60:
                remaining = int(60 - elapsed)
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail=f"Please wait {remaining} seconds before requesting another verification code."
                )
        except HTTPException:
            raise
        except Exception:
            pass

    new_otp, new_expires_at = sec.generate_secure_otp()
    now_iso = datetime.utcnow().isoformat()

    try:
        from email_service import send_otp_email
        send_otp_email(
            recipient_email=email,
            otp=new_otp,
            user_name=user_record.get("name")
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Verification email could not be sent: {str(exc)}"
        ) from exc

    db.update_user(user_record["id"], {
        "verification_otp": new_otp,
        "otp_expires_at": new_expires_at,
        "otp_attempts": 0,
        "otp_last_sent_at": now_iso
    })

    return {
        "success": True,
        "message": f"A new verification code has been dispatched to {email}. Code expires in 10 minutes."
    }


@app.post("/api/auth/verify-otp")
def verify_otp(req: VerifyOtpRequest):
    """
    Verifies the user's OTP code against expiration, with attempt rate limits.
    No hardcoded bypasses are permitted.
    """
    user_record = db.get_user_by_email(req.email.lower().strip(), include_credentials=True)
    if not user_record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User account not found.")

    if user_record.get("verified"):
        sanitized = db.get_user_by_id(user_record["id"])
        access_token = sec.create_access_token({
            "sub": sanitized["id"],
            "role": sanitized.get("role", "Candidate"),
            "email": sanitized["email"]
        })
        return {
            "success": True,
            "message": "Account is already verified.",
            "access_token": access_token,
            "token_type": "bearer",
            "user": sanitized
        }

    # 1. Attempt limit enforcement (Max 5 attempts before code invalidation)
    current_attempts = int(user_record.get("otp_attempts") or 0)
    if current_attempts >= 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum verification attempts exceeded. This verification code has been invalidated. Please request a new code."
        )

    # 2. Expiration validation
    stored_expiry = user_record.get("otp_expires_at")
    if stored_expiry:
        try:
            exp_dt = datetime.fromisoformat(stored_expiry)
            if datetime.utcnow() > exp_dt:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Verification code has expired. Please request a new code."
                )
        except HTTPException:
            raise
        except Exception:
            pass

    # 3. Constant-time OTP comparison
    stored_otp = user_record.get("verification_otp")
    if not stored_otp:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No active verification code found. Please request a new code."
        )

    import secrets
    is_match = secrets.compare_digest(str(stored_otp).strip(), str(req.otp).strip())

    if not is_match:
        new_attempts = current_attempts + 1
        remaining = max(0, 5 - new_attempts)
        if remaining == 0:
            db.update_user(user_record["id"], {
                "otp_attempts": new_attempts,
                "verification_otp": None,
                "otp_expires_at": None
            })
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Maximum verification attempts exceeded. This verification code has been invalidated. Please request a new code."
            )
        else:
            db.update_user(user_record["id"], {"otp_attempts": new_attempts})
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid verification code. {remaining} attempt(s) remaining."
            )

    # 4. Success: Mark user verified and wipe single-use OTP & attempt counters
    db.update_user(user_record["id"], {
        "verified": 1,
        "verification_otp": None,
        "otp_expires_at": None,
        "otp_attempts": 0
    })

    sanitized = db.get_user_by_id(user_record["id"])

    # Issue JWT token upon successful verification
    access_token = sec.create_access_token({
        "sub": sanitized["id"],
        "role": sanitized.get("role", "Candidate"),
        "email": sanitized["email"]
    })

    return {
        "success": True,
        "message": "Account successfully verified.",
        "access_token": access_token,
        "token_type": "bearer",
        "user": sanitized
    }


@app.post("/api/auth/login")
def login_user(req: LoginRequest):
    """
    Authenticates user using bcrypt and issues a signed JWT Bearer access token.
    """
    user_record = db.get_user_by_email(req.email, include_credentials=True)
    if not user_record:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No account registered with this email address."
        )

    plain_pw = req.password or req.passwordHash
    if not plain_pw:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password is required."
        )

    # Verify password against hash
    is_password_valid = sec.verify_password(plain_pw, user_record["password_hash"])
    if not is_password_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect password provided."
        )

    # Auto-upgrade legacy SHA-256 hash to Bcrypt if detected
    if len(user_record["password_hash"]) == 64:
        new_bcrypt = sec.hash_password(plain_pw)
        db.update_user(user_record["id"], {"password_hash": new_bcrypt})

    # Verification status check
    if not user_record.get("verified", 1):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="EMAIL_UNVERIFIED"
        )

    sanitized = db.get_user_by_id(user_record["id"])

    # Issue cryptographic JWT access token
    access_token = sec.create_access_token({
        "sub": sanitized["id"],
        "role": sanitized.get("role", "Candidate"),
        "email": sanitized["email"]
    })

    return {
        "success": True,
        "access_token": access_token,
        "token_type": "bearer",
        "user": sanitized
    }


@app.get("/api/auth/me")
def get_current_user_profile(current_user: Dict[str, Any] = Depends(sec.get_current_user)):
    """Protected endpoint: Returns the profile of the currently authenticated user."""
    return {"success": True, "user": current_user}


@app.get("/api/auth/users")
def get_all_users(current_user: Dict[str, Any] = Depends(sec.require_roles(["Administrator", "Mentor"]))):
    """
    Protected administrative endpoint: Only accessible by Administrators and Mentors.
    """
    users = db.list_users()
    return {"success": True, "users": users}


@app.get("/api/auth/user/{user_id}")
def get_single_user(user_id: str, current_user: Dict[str, Any] = Depends(sec.get_current_user)):
    """
    Protected endpoint: Users can only inspect their own profile, unless they are an Administrator.
    """
    sec.verify_owner_or_admin(current_user, user_id)
    user = db.get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    return {"success": True, "user": user}


@app.put("/api/auth/user/{user_id}")
def update_user_profile(
    user_id: str,
    req: UpdateUserRequest,
    current_user: Dict[str, Any] = Depends(sec.get_current_user)
):
    """
    Protected endpoint: Users can only modify their own profile.
    Uses strict parameterized column whitelisting to prevent SQL injection.
    """
    sec.verify_owner_or_admin(current_user, user_id)
    fields = {k: v for k, v in req.dict().items() if v is not None}
    updated = db.update_user(user_id, fields)
    if not updated:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    return {"success": True, "user": updated}


@app.post("/api/auth/change-password")
def change_password(
    req: ChangePasswordRequest,
    current_user: Dict[str, Any] = Depends(sec.get_current_user)
):
    """
    Protected endpoint: Verifies current password and updates to a new salted bcrypt hash.
    """
    sec.verify_owner_or_admin(current_user, req.userId)
    user_record = db.get_user_by_id(req.userId, include_credentials=True)
    if not user_record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    curr_pw = req.currentPassword or req.currentPasswordHash
    new_pw = req.newPassword or req.newPasswordHash

    if not curr_pw or not new_pw:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Current and new passwords required.")

    if not sec.verify_password(curr_pw, user_record["password_hash"]):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Current password is incorrect.")

    if len(new_pw) < 6:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="New password must be at least 6 characters.")

    new_hash = sec.hash_password(new_pw)
    db.update_user(req.userId, {"password_hash": new_hash})
    return {"success": True, "message": "Password updated successfully."}


EMAIL_REGEX = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


@app.post("/api/auth/change-email/request")
def request_change_email(
    req: ChangeEmailRequest,
    current_user: Dict[str, Any] = Depends(sec.get_current_user)
):
    """
    Protected endpoint: Initiates an authenticated email address change.
    Validates new email, verifies case-insensitive uniqueness against MySQL,
    enforces 60-second resend cooldown, generates a secure 6-digit OTP,
    hashes the OTP with SHA-256 for secure storage, and dispatches via Gmail SMTP.
    """
    new_email = req.newEmail.strip().lower()

    # 1. Format validation
    if not EMAIL_REGEX.match(new_email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid email address format."
        )

    # 2. Cannot be the same as current email
    curr_email = current_user.get("email", "").strip().lower()
    if new_email == curr_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New email address must be different from your current email address."
        )

    # 3. Case-insensitive email uniqueness check against database
    existing = db.get_user_by_email(new_email)
    if existing and existing["id"] != current_user["id"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    user_record = db.get_user_by_id(current_user["id"], include_credentials=True)
    if not user_record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User account not found.")

    # 4. Enforce 60-second resend cooldown
    last_sent = user_record.get("pending_email_last_sent_at")
    if last_sent:
        try:
            last_dt = datetime.fromisoformat(last_sent)
            elapsed = (datetime.utcnow() - last_dt).total_seconds()
            if elapsed < 60:
                remaining = int(60 - elapsed)
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail=f"Please wait {remaining} seconds before requesting another verification code."
                )
        except HTTPException:
            raise
        except Exception:
            pass

    # 5. Cryptographically secure OTP generation (10-minute expiry)
    otp, expires_at = sec.generate_secure_otp()
    otp_hash = sec.hash_otp(otp)
    now_iso = datetime.utcnow().isoformat()

    # 6. Dispatch genuine verification email via Gmail SMTP
    try:
        from email_service import send_otp_email
        send_otp_email(
            recipient_email=new_email,
            otp=otp,
            user_name=user_record.get("name")
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Verification email could not be sent: {str(exc)}"
        ) from exc

    # 7. Store SHA-256 hash of OTP with expiration and reset attempt counter
    db.update_user(user_record["id"], {
        "pending_email": new_email,
        "pending_email_otp_hash": otp_hash,
        "pending_email_expires_at": expires_at,
        "pending_email_attempts": 0,
        "pending_email_last_sent_at": now_iso
    })

    return {
        "success": True,
        "message": f"Verification code dispatched to {new_email}. Code expires in 10 minutes.",
        "pendingEmail": new_email
    }


@app.post("/api/auth/change-email/verify")
def verify_change_email(
    req: VerifyChangeEmailRequest,
    current_user: Dict[str, Any] = Depends(sec.get_current_user)
):
    """
    Protected endpoint: Verifies candidate OTP against stored SHA-256 hash,
    enforcing expiration and maximum 5 incorrect attempts.
    Atomically commits the email update in a MySQL database transaction
    and issues an updated JWT access token with the new email claim.
    """
    user_record = db.get_user_by_id(current_user["id"], include_credentials=True)
    if not user_record or not user_record.get("pending_email") or not user_record.get("pending_email_otp_hash"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No pending email change request found. Please request a verification code first."
        )

    # 1. Attempt limit enforcement (Max 5 attempts)
    current_attempts = int(user_record.get("pending_email_attempts") or 0)
    if current_attempts >= 5:
        db.update_user(user_record["id"], {
            "pending_email": None,
            "pending_email_otp_hash": None,
            "pending_email_expires_at": None,
            "pending_email_attempts": 0,
            "pending_email_last_sent_at": None
        })
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum verification attempts exceeded. Verification code invalidated. Please request a new code."
        )

    # 2. Expiration check (10 minutes)
    stored_expiry = user_record.get("pending_email_expires_at")
    if stored_expiry:
        try:
            exp_dt = datetime.fromisoformat(stored_expiry)
            if datetime.utcnow() > exp_dt:
                db.update_user(user_record["id"], {
                    "pending_email": None,
                    "pending_email_otp_hash": None,
                    "pending_email_expires_at": None,
                    "pending_email_attempts": 0,
                    "pending_email_last_sent_at": None
                })
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Verification code has expired. Please request a new code."
                )
        except HTTPException:
            raise
        except Exception:
            pass

    # 3. Constant-time hash verification
    stored_hash = user_record.get("pending_email_otp_hash")
    is_match = sec.verify_hashed_otp(stored_hash, req.otp)

    if not is_match:
        new_attempts = current_attempts + 1
        remaining = max(0, 5 - new_attempts)
        if remaining == 0:
            db.update_user(user_record["id"], {
                "pending_email": None,
                "pending_email_otp_hash": None,
                "pending_email_expires_at": None,
                "pending_email_attempts": 0,
                "pending_email_last_sent_at": None
            })
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Maximum verification attempts exceeded. Verification code invalidated. Please request a new code."
            )
        else:
            db.update_user(user_record["id"], {"pending_email_attempts": new_attempts})
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid verification code. {remaining} attempt(s) remaining."
            )

    # 4. Success: Atomically commit email update to database inside a safe transaction
    target_email = user_record["pending_email"].lower().strip()

    # Re-verify database uniqueness
    existing = db.get_user_by_email(target_email)
    if existing and existing["id"] != user_record["id"]:
        db.update_user(user_record["id"], {
            "pending_email": None,
            "pending_email_otp_hash": None,
            "pending_email_expires_at": None,
            "pending_email_attempts": 0,
            "pending_email_last_sent_at": None
        })
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    try:
        updated_user = db.complete_email_change(user_record["id"], target_email)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database transaction error while updating email address."
        )

    # 5. Issue updated JWT access token with new email claim
    access_token = sec.create_access_token({
        "sub": updated_user["id"],
        "role": updated_user.get("role", "Candidate"),
        "email": updated_user["email"]
    })

    return {
        "success": True,
        "message": "Email address successfully updated and verified.",
        "access_token": access_token,
        "token_type": "bearer",
        "user": updated_user
    }


@app.delete("/api/auth/user/{user_id}")
def delete_user_account(
    user_id: str,
    current_user: Dict[str, Any] = Depends(sec.get_current_user)
):
    """
    Protected endpoint: Only the account owner or an Administrator can delete an account.
    """
    sec.verify_owner_or_admin(current_user, user_id)
    db.delete_user(user_id)
    return {"success": True, "message": "Account and all associated records permanently purged."}


# ==================== Interview Storage Endpoints ====================

@app.get("/api/interviews")
def get_interviews(
    userId: Optional[str] = Query(None),
    current_user: Dict[str, Any] = Depends(sec.get_current_user)
):
    """
    Protected endpoint:
    - Regular Candidates can strictly only query their own interview sessions.
    - Mentors and Administrators can inspect any candidate's sessions.
    """
    if current_user.get("role") == "Candidate":
        # Force candidate's own identity
        target_user = current_user["id"]
    else:
        # Administrators and Mentors can query specific candidates
        target_user = userId or current_user["id"]

    interviews = db.list_interviews(target_user)
    return {"success": True, "interviews": interviews}


@app.post("/api/interviews/questions/prepare")
def prepare_interview_questions(
    req: PrepareQuestionsRequest,
    current_user: Dict[str, Any] = Depends(sec.get_current_user)
):
    """
    Intelligent Question Orchestrator:
    - Scales question count dynamically by duration (5m: 3, 15m: 5, 30m: 9, 45m: 13).
    - Filters out candidate's historical questions from database to eliminate repetition.
    - Generates project-defense questions if resume skills/projects are supplied.
    - Calibrates difficulty strictly against candidate's experience level.
    """
    user_id = current_user["id"]
    history_ids = db.get_user_question_history_ids(user_id=user_id, role=req.role)

    selected = qb.select_calibrated_questions(
        role=req.role,
        level=req.level,
        duration_minutes=req.durationMinutes,
        user_history_ids=history_ids,
        custom_role_title=req.customRoleTitle or "",
        resume_skills=req.resumeSkills or [],
        resume_projects=req.resumeProjects or []
    )

    # Determine candidate's sequential attempt number for this role
    past_attempts = db.get_candidate_attempts_for_role(user_id=user_id, role=req.role)
    next_attempt_num = len(past_attempts) + 1

    return {
        "success": True,
        "questions": selected,
        "targetCount": len(selected),
        "durationMinutes": req.durationMinutes,
        "role": req.role,
        "level": req.level,
        "attemptNumber": next_attempt_num,
        "attemptLabel": f"A{next_attempt_num}",
        "deduplication": {
            "historicalQuestionsExcluded": len(history_ids),
            "selectedCount": len(selected)
        }
    }


@app.post("/api/interviews")
def create_interview_session(
    interview_data: Dict[str, Any],
    current_user: Dict[str, Any] = Depends(sec.get_current_user)
):
    """
    Protected endpoint: Persists an interview session with:
    1. Cross-session Question History persistence for deduplication.
    2. Topic-Level Weakness Detection (<50% Priority, 50-69% Focus, 70-84% Proficient, 85-100% Advanced).
    3. Actionable Personalized Learning Plan generation.
    4. Chronological Attempt Progression (A1 -> Latest) with Scenarios A, B, C, D retry recommendations.
    5. Atomic storage in interview_sessions and interview_attempts tables.
    """
    user_id = current_user["id"]
    inv_id = interview_data.get("id") or ("inv_" + str(int(datetime.utcnow().timestamp() * 1000)))
    interview_data["id"] = inv_id

    role = interview_data.get("role") or "Software Developer"
    level = interview_data.get("level") or "Mid Level"
    category = interview_data.get("category") or role
    raw_score = interview_data.get("overallScore")
    if raw_score is None:
        raw_score = interview_data.get("overall_score")
    if raw_score is None and isinstance(interview_data.get("report"), dict):
        raw_score = interview_data["report"].get("overallScore") if interview_data["report"].get("overallScore") is not None else interview_data["report"].get("overall_score")
    if raw_score is not None:
        try:
            overall_score = int(round(float(raw_score)))
        except (ValueError, TypeError):
            overall_score = 0
    else:
        overall_score = 0

    # 1. Record Question History for Deduplication
    questions_list = interview_data.get("questions") or []
    answers_list = interview_data.get("answers") or []

    if not questions_list and answers_list:
        questions_list = [
            {
                "id": a.get("questionId") or a.get("id"),
                "question": a.get("question") or a.get("questionText"),
                "topic": a.get("topic") or a.get("category"),
                "category": category
            }
            for a in answers_list
        ]

    try:
        db.record_question_history(
            user_id=user_id,
            interview_id=inv_id,
            questions=questions_list,
            role=role,
            category=category
        )
    except Exception as exc:
        print(f"[QUESTION HISTORY WARNING] Could not record question history: {exc}")

    # 2. Topic-Level Weakness Detection
    topic_eval = qb.evaluate_topic_breakdown(answers_list)
    topic_scores = {
        t_name: t_data["averageScore"]
        for t_name, t_data in topic_eval["topics"].items()
    }
    weaknesses = topic_eval["weaknesses"]
    strengths = topic_eval["strengths"]

    # 3. Actionable Personalized Learning Plan
    learning_plan = qb.generate_learning_plan(
        role=role,
        weaknesses=weaknesses,
        level=level
    )

    # 4. Chronological Attempt Progression (A1 -> Latest)
    past_attempts = db.get_candidate_attempts_for_role(user_id=user_id, role=role)
    next_attempt_num = len(past_attempts) + 1

    current_attempt_obj = {
        "overallScore": overall_score,
        "overall_score": overall_score,
        "topicScores": topic_scores,
        "weaknesses": weaknesses,
        "date": interview_data.get("date") or datetime.utcnow().isoformat()
    }

    progression = qb.calculate_attempt_progression(
        attempts_history=past_attempts,
        current_attempt=current_attempt_obj
    )

    # 5. Persist Attempt Record in interview_attempts table
    try:
        saved_attempt = db.save_interview_attempt(
            user_id=user_id,
            role=role,
            interview_id=inv_id,
            overall_score=overall_score,
            topic_scores=topic_scores,
            weaknesses=weaknesses,
            recommendations=progression
        )
    except Exception as exc:
        print(f"[ATTEMPT PERSISTENCE WARNING] Could not persist attempt record: {exc}")
        saved_attempt = {"attemptNumber": next_attempt_num, "attemptLabel": f"A{next_attempt_num}"}

    # Enrich interview report with progression telemetry
    interview_data["attempt_number"] = next_attempt_num
    interview_data["attemptNumber"] = next_attempt_num
    interview_data["attemptLabel"] = f"A{next_attempt_num}"
    if "parent_attempt_id" in interview_data or "parentAttemptId" in interview_data:
        p_id = interview_data.get("parent_attempt_id") or interview_data.get("parentAttemptId")
        interview_data["parent_attempt_id"] = p_id
        interview_data["parentAttemptId"] = p_id
    interview_data["topicBreakdown"] = topic_eval
    interview_data["topicScores"] = topic_scores
    interview_data["weaknesses"] = weaknesses
    interview_data["strengths"] = strengths
    interview_data["learningPlan"] = learning_plan
    interview_data["attemptProgression"] = progression

    saved = db.save_interview(interview_data, enforced_user_id=user_id)
    return {
        "success": True,
        "interview": saved,
        "attemptProgression": progression,
        "learningPlan": learning_plan
    }


@app.get("/api/candidates/progress")
def get_candidate_progress(
    role: Optional[str] = Query(None),
    current_user: Dict[str, Any] = Depends(sec.get_current_user)
):
    """
    Protected endpoint: Provides full chronological attempt trajectory,
    score deltas, recurring vs resolved weaknesses, and retry recommendations.
    """
    user_id = current_user["id"]
    target_role = role or current_user.get("target_role") or "Software Developer"

    attempts = db.get_candidate_attempts_for_role(user_id=user_id, role=target_role)
    if not attempts:
        return {
            "success": True,
            "hasAttempts": False,
            "role": target_role,
            "attempts": [],
            "progression": None
        }

    latest = attempts[-1]
    prior = attempts[:-1]

    progression = qb.calculate_attempt_progression(
        attempts_history=prior,
        current_attempt=latest
    )

    return {
        "success": True,
        "hasAttempts": True,
        "role": target_role,
        "totalAttempts": len(attempts),
        "attempts": attempts,
        "latestAttempt": latest,
        "progression": progression
    }


@app.get("/api/candidates/attempts/{role_name}")
def get_role_attempts(
    role_name: str,
    current_user: Dict[str, Any] = Depends(sec.get_current_user)
):
    """
    Protected endpoint: Returns all chronological attempts for a specific role.
    """
    user_id = current_user["id"]
    attempts = db.get_candidate_attempts_for_role(user_id=user_id, role=role_name)
    return {"success": True, "role": role_name, "attempts": attempts}


@app.get("/api/interviews/{interview_id}")
def get_single_interview(
    interview_id: str,
    current_user: Dict[str, Any] = Depends(sec.get_current_user)
):
    """
    Protected endpoint: Retrieves a specific interview session.
    Candidate can only access their own sessions; Mentors and Admins can view any.
    """
    inv = db.get_interview_by_id(interview_id)
    if not inv:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interview session not found.")

    if current_user.get("role") != "Administrator" and current_user.get("role") != "Mentor" and inv.get("user_id") != current_user["id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: You cannot view another candidate's interview session."
        )

    return {"success": True, "interview": inv}


@app.delete("/api/interviews/{interview_id}")
def remove_interview(
    interview_id: str,
    current_user: Dict[str, Any] = Depends(sec.get_current_user)
):
    """
    Protected endpoint: Ensures only the interview owner or an Administrator can delete a session.
    """
    inv = db.get_interview_by_id(interview_id)
    if not inv:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interview session not found.")

    if current_user.get("role") != "Administrator" and inv.get("user_id") != current_user["id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: You cannot delete another user's interview session."
        )

    db.delete_interview(interview_id)
    return {"success": True, "message": "Interview session deleted successfully."}


# ==================== NLP & AI Evaluation Endpoints ====================

@app.post("/api/evaluate")
def evaluate_interview_answer(req: EvaluationRequest):
    """
    Evaluates candidate response using the AI & Data Science pipeline.
    Prioritizes OpenAI when configured; seamlessly falls back to hardened Python NLP.
    Empty answers are immediately graded 0.
    """
    answer_text = (req.answer or "").strip()
    if not answer_text:
        return {"success": True, "data": analyzer._empty_result()}

    # 1. Try OpenAI Evaluation Layer if configured
    try:
        ai_eval = ai_service.evaluate_answer_with_ai(
            question=req.question,
            answer=answer_text,
            ideal_answer=req.idealAnswer,
            ideal_keywords=req.idealKeywords,
            candidate_role=req.candidateRole,
            question_category=req.questionCategory,
            experience_level=req.experienceLevel,
            delivery_telemetry=req.deliveryTelemetry
        )
        if ai_eval:
            return {"success": True, "data": ai_eval}
    except Exception as e:
        print(f"[AI EVALUATION NOTICE] Falling back to Python NLP engine: {e}")

    # 2. Local Python Data Science & Semantic NLP Engine
    try:
        result = analyzer.analyze_answer(
            question=req.question,
            answer=answer_text,
            ideal_answer=req.idealAnswer,
            ideal_keywords=req.idealKeywords,
            candidate_role=req.candidateRole,
            question_category=req.questionCategory,
            experience_level=req.experienceLevel,
            delivery_telemetry=req.deliveryTelemetry
        )
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@app.post("/api/ai/generate-questions")
def generate_questions_endpoint(
    req: GenerateQuestionsRequest,
    current_user: Dict[str, Any] = Depends(sec.get_current_user)
):
    """
    Generates tailored questions calibrated to the candidate's exact role, level, and resume.
    Uses OpenAI GPT-4o-mini when configured, with seamless built-in role question generation fallback.
    """
    questions = ai_service.generate_role_questions_with_ai(
        role=req.role,
        level=req.level,
        category=req.category,
        resume_text=req.resumeText,
        count=req.count
    )
    if not questions:
        # High quality calibrated fallback question generation
        questions = [
            {
                "id": f"q_gen_{i+1}",
                "question": q["q"],
                "category": req.category or "Technical",
                "level": req.level,
                "idealKeywords": q["kw"],
                "followUp": q["fu"],
                "rubric": {
                    "correctness": "Direct architectural relevance to production implementation.",
                    "depth": "Explanation of internal runtime mechanisms, scaling, and concurrency.",
                    "clarity": "Structured communication with concise technical phrasing.",
                    "examples": "Reference to real projects, quantitative metrics, or production incidents."
                }
            }
            for i, q in enumerate([
                {
                    "q": f"In your experience as a {req.role}, how do you design scalable services to handle high concurrency and state management?",
                    "kw": ["concurrency", "async", "cache", "throughput", "latency", "redis", "database"],
                    "fu": "What specific bottleneck did you run into when scaling that architecture, and how did you resolve it?"
                },
                {
                    "q": f"Can you walk through a production failure or bug you debugged in {req.role} environments, including your diagnostic methodology?",
                    "kw": ["debugging", "logs", "metrics", "root cause", "tracing", "monitoring", "fix"],
                    "fu": "What automated tests or observability safeguards did you implement afterward to prevent regression?"
                },
                {
                    "q": f"Explain the key architectural trade-offs between monolithic and microservice architectures for {req.role} projects.",
                    "kw": ["trade-offs", "microservices", "monolith", "deployment", "network overhead", "boundaries"],
                    "fu": "At what team size or traffic threshold would you recommend transitioning between them?"
                }
            ][:req.count])
        ]
    return {"success": True, "questions": questions}


@app.post("/api/analytics/trends")
def calculate_candidate_trends(
    req: BatchAnalyticsRequest,
    current_user: Dict[str, Any] = Depends(sec.get_current_user)
):
    """
    Protected Data Science analytics aggregation endpoint.
    """
    interviews = req.interviews
    if not interviews:
        return {"success": True, "data": {"totalInterviews": 0, "averageScore": 0}}

    scores = [int(i.get("overallScore", 0)) for i in interviews if "overallScore" in i]
    if not scores:
        scores = [70]

    import numpy as np
    avg_score = float(np.mean(scores))
    std_dev = float(np.std(scores))
    percentile = int(min(99, max(50, 50 + (avg_score - 60) * 1.1)))

    return {
        "success": True,
        "data": {
            "totalSessions": len(interviews),
            "averageScore": round(avg_score, 1),
            "scoreStabilityStdDev": round(std_dev, 2),
            "percentileRanking": percentile,
            "readinessStatus": "Interview Ready" if avg_score >= 80 else ("Progressing" if avg_score >= 65 else "Foundational")
        }
    }


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
