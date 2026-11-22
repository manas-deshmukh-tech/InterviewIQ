"""
InterviewIQ Enterprise Multi-Engine Database Layer
Supports:
- MySQL (Production Engine via SQLAlchemy + PyMySQL with QueuePool connection pooling)
- SQLite (Local Offline / Recovery / Fallback Engine)
- Strict parameterized queries, column whitelisting, and credential sanitization
- Zero exposure of password hashes or verification OTPs
"""

import os
import json
import re
from datetime import datetime
from typing import Dict, Any, List, Optional
from urllib.parse import quote_plus
from dotenv import load_dotenv

# Load environment configuration from backend/.env
ENV_PATH = os.path.join(os.path.dirname(__file__), ".env")
load_dotenv(ENV_PATH)

# ==================== Configuration ====================
DB_ENGINE_CONFIG = os.getenv("DB_ENGINE", "mysql").lower()
DB_HOST = os.getenv("DB_HOST", "127.0.0.1")
DB_PORT = int(os.getenv("DB_PORT", "3306"))
DB_USER = os.getenv("DB_USER", "interviewiq_app")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_NAME = os.getenv("DB_NAME", "interviewiq")
TEST_DB_NAME = os.getenv("TEST_DB_NAME", "interviewiq_test")

SQLITE_PATH = os.getenv("SQLITE_DB_PATH", os.path.join(os.path.dirname(__file__), "interviewiq.db"))
if not os.path.isabs(SQLITE_PATH):
    SQLITE_PATH = os.path.join(os.path.dirname(__file__), os.path.basename(SQLITE_PATH))

# Strict field whitelists preventing dynamic SQL column injection & privilege escalation
ALLOWED_USER_COLUMNS = {
    "name", "email", "password_hash", "verified",
    "verification_otp", "otp_expires_at", "consent_date",
    "target_role", "level", "avatar",
    "otp_attempts", "otp_last_sent_at",
    "pending_email", "pending_email_otp_hash",
    "pending_email_expires_at", "pending_email_attempts",
    "pending_email_last_sent_at",
    "reset_password_otp_hash", "reset_password_otp_expires_at",
    "reset_password_otp_attempts", "reset_password_otp_last_sent_at",
    "reset_password_token_hash", "reset_password_token_expires_at"
}

COLUMN_ALIASES = {
    "targetRole": "target_role",
    "passwordHash": "password_hash",
    "consentDate": "consent_date",
    "verificationOtp": "verification_otp",
    "otpExpiresAt": "otp_expires_at",
    "otpAttempts": "otp_attempts",
    "otpLastSentAt": "otp_last_sent_at",
    "pendingEmail": "pending_email",
    "pendingEmailOtpHash": "pending_email_otp_hash",
    "pendingEmailExpiresAt": "pending_email_expires_at",
    "pendingEmailAttempts": "pending_email_attempts",
    "pendingEmailLastSentAt": "pending_email_last_sent_at"
}

# ==================== Multi-Engine Initialization ====================
_mysql_engine = None
_test_mysql_engine = None
ACTIVE_ENGINE = "sqlite"

def _init_mysql_engine(database_name: str):
    """Creates a SQLAlchemy engine with QueuePool connection pooling for MySQL."""
    from sqlalchemy import create_engine
    from sqlalchemy.pool import QueuePool

    encoded_pw = quote_plus(DB_PASSWORD) if DB_PASSWORD else ""
    url = f"mysql+pymysql://{DB_USER}:{encoded_pw}@{DB_HOST}:{DB_PORT}/{database_name}?charset=utf8mb4"

    return create_engine(
        url,
        poolclass=QueuePool,
        pool_size=int(os.getenv("DB_POOL_SIZE", "10")),
        max_overflow=int(os.getenv("DB_MAX_OVERFLOW", "20")),
        pool_timeout=int(os.getenv("DB_POOL_TIMEOUT", "30")),
        pool_recycle=int(os.getenv("DB_POOL_RECYCLE", "3600")),
        pool_pre_ping=True
    )


# Probe MySQL availability if DB_ENGINE=mysql
ALLOW_SQLITE_FALLBACK = os.getenv("DB_ALLOW_SQLITE_FALLBACK", "false").lower() in ("true", "1", "yes")

if DB_ENGINE_CONFIG == "mysql":
    try:
        import pymysql
        _mysql_engine = _init_mysql_engine(DB_NAME)
        # Test connection ping
        with _mysql_engine.connect() as probe:
            probe.execute(__import__("sqlalchemy").text("SELECT 1"))
        ACTIVE_ENGINE = "mysql"
        print(f"[DATABASE] Connected to MySQL production database '{DB_NAME}' at {DB_HOST}:{DB_PORT} (Connection Pooling Active)")
    except Exception as err:
        if not ALLOW_SQLITE_FALLBACK:
            raise RuntimeError(
                f"[DATABASE FATAL ERROR] DB_ENGINE is configured as 'mysql', but connection to MySQL server at {DB_HOST}:{DB_PORT} failed for database '{DB_NAME}': "
                f"{err.__class__.__name__}: {err}. "
                f"Silent SQLite fallback is disabled to prevent data desynchronization."
            ) from err
        ACTIVE_ENGINE = "sqlite"
        print(f"[DATABASE NOTICE] MySQL connection to '{DB_NAME}' at {DB_HOST}:{DB_PORT} unavailable ({err.__class__.__name__}: {err}).")
        print(f"[DATABASE NOTICE] Operating safely on verified SQLite engine ({SQLITE_PATH}).")
        print(f"[DATABASE NOTICE] Once MySQL credentials are confirmed in backend/.env, restart server to engage MySQL.")
else:
    ACTIVE_ENGINE = "sqlite"
    print(f"[DATABASE] Operating on SQLite engine ({SQLITE_PATH}).")


def get_active_engine_name() -> str:
    """Returns the currently active engine ('mysql' or 'sqlite')."""
    return ACTIVE_ENGINE


def get_engine_metadata() -> Dict[str, Any]:
    """Provides operational database health and pooling telemetry."""
    if ACTIVE_ENGINE == "mysql" and _mysql_engine:
        pool = _mysql_engine.pool
        return {
            "engine": "MySQL 8.0 (SQLAlchemy + PyMySQL)",
            "database": DB_NAME,
            "host": f"{DB_HOST}:{DB_PORT}",
            "pool_size": pool.size(),
            "checked_in_connections": pool.checkedin(),
            "checked_out_connections": pool.checkedout(),
            "overflow_connections": pool.overflow()
        }
    return {
        "engine": "SQLite 3",
        "database": os.path.basename(SQLITE_PATH),
        "path": SQLITE_PATH
    }


# ==================== Unified Connection Wrapper ====================

class RowDict(dict):
    """Dictionary that also supports integer index access (e.g. row[0], row['id'])."""
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._keys = list(self.keys())

    def __getitem__(self, item):
        if isinstance(item, int):
            return self[self._keys[item]]
        return super().__getitem__(item)


class UnifiedCursor:
    """Standardizes cursor operations across PyMySQL and sqlite3."""
    def __init__(self, raw_cursor, is_mysql: bool):
        self._raw = raw_cursor
        self._is_mysql = is_mysql

    def execute(self, query: str, params: Any = None):
        if self._is_mysql:
            # Adapt query placeholder from '?' to '%s'
            adapted = re.sub(r"\?", "%s", query)
            if params is None:
                return self._raw.execute(adapted)
            return self._raw.execute(adapted, tuple(params) if isinstance(params, list) else params)
        else:
            if params is None:
                return self._raw.execute(query)
            return self._raw.execute(query, tuple(params) if isinstance(params, list) else params)

    def executemany(self, query: str, seq_of_params: Any):
        if self._is_mysql:
            adapted = re.sub(r"\?", "%s", query)
            return self._raw.executemany(adapted, seq_of_params)
        return self._raw.executemany(query, seq_of_params)

    def fetchone(self) -> Optional[Dict[str, Any]]:
        row = self._raw.fetchone()
        if row is None:
            return None
        if isinstance(row, dict):
            return RowDict(row)
        try:
            return RowDict(dict(row))
        except Exception:
            return row

    def fetchall(self) -> List[Dict[str, Any]]:
        rows = self._raw.fetchall()
        if not rows:
            return []
        if isinstance(rows[0], dict):
            return [RowDict(r) for r in rows]
        try:
            return [RowDict(dict(r)) for r in rows]
        except Exception:
            return rows


class UnifiedConnection:
    """Manages connection leasing and commits uniformly across engines."""
    def __init__(self, raw_conn, is_mysql: bool):
        self._raw = raw_conn
        self._is_mysql = is_mysql

    def cursor(self):
        if self._is_mysql:
            import pymysql.cursors
            return UnifiedCursor(self._raw.cursor(pymysql.cursors.DictCursor), is_mysql=True)
        return UnifiedCursor(self._raw.cursor(), is_mysql=False)

    def commit(self):
        self._raw.commit()

    def rollback(self):
        self._raw.rollback()

    def close(self):
        self._raw.close()

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type:
            self.rollback()
        else:
            self.commit()
        self.close()


def get_connection(use_test_db: bool = False) -> UnifiedConnection:
    """
    Leases an active connection from the pool (MySQL) or opens an SQLite connection.
    """
    if ACTIVE_ENGINE == "mysql" and _mysql_engine:
        import pymysql.cursors
        if use_test_db:
            global _test_mysql_engine
            if _test_mysql_engine is None:
                _test_mysql_engine = _init_mysql_engine(TEST_DB_NAME)
            raw = _test_mysql_engine.raw_connection()
        else:
            raw = _mysql_engine.raw_connection()
        return UnifiedConnection(raw, is_mysql=True)

    # SQLite fallback / offline mode
    import sqlite3
    db_file = SQLITE_PATH
    if use_test_db:
        db_file = os.path.join(os.path.dirname(SQLITE_PATH), "test_temp.db")
    conn = sqlite3.connect(db_file)
    conn.row_factory = sqlite3.Row
    return UnifiedConnection(conn, is_mysql=False)


# ==================== Schema Creation & Seeding ====================

def init_db(use_test_db: bool = False):
    """
    Initializes database schema and default records.
    Idempotent and safe for repeated invocations.
    """
    conn = get_connection(use_test_db=use_test_db)
    cursor = conn.cursor()
    is_mysql = conn._is_mysql

    if is_mysql:
        # MySQL 8.0 DDL
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id VARCHAR(64) NOT NULL,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(191) NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                role VARCHAR(32) NOT NULL DEFAULT 'Candidate',
                verified TINYINT(1) NOT NULL DEFAULT 1,
                verification_otp VARCHAR(10) NULL,
                otp_expires_at VARCHAR(35) NULL,
                consent_date VARCHAR(35) NULL,
                target_role VARCHAR(100) NULL DEFAULT 'Full Stack Engineer',
                level VARCHAR(50) NULL DEFAULT 'Mid Level',
                avatar VARCHAR(500) NULL,
                created_at VARCHAR(35) NOT NULL,
                otp_attempts INT NOT NULL DEFAULT 0,
                otp_last_sent_at VARCHAR(35) NULL,
                pending_email VARCHAR(191) NULL,
                pending_email_otp_hash VARCHAR(128) NULL,
                pending_email_expires_at VARCHAR(35) NULL,
                pending_email_attempts INT NOT NULL DEFAULT 0,
                pending_email_last_sent_at VARCHAR(35) NULL,
                PRIMARY KEY (id),
                UNIQUE KEY uq_users_email (email),
                INDEX idx_users_role (role)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """)

        # Idempotent column upgrades for OTP rate limiting & pending email change
        for col_name, col_type in [
            ("otp_attempts", "INT NOT NULL DEFAULT 0"),
            ("otp_last_sent_at", "VARCHAR(35) NULL"),
            ("pending_email", "VARCHAR(191) NULL"),
            ("pending_email_otp_hash", "VARCHAR(128) NULL"),
            ("pending_email_expires_at", "VARCHAR(35) NULL"),
            ("pending_email_attempts", "INT NOT NULL DEFAULT 0"),
            ("pending_email_last_sent_at", "VARCHAR(35) NULL"),
            ("reset_password_otp_hash", "VARCHAR(128) NULL"),
            ("reset_password_otp_expires_at", "VARCHAR(35) NULL"),
            ("reset_password_otp_attempts", "INT NOT NULL DEFAULT 0"),
            ("reset_password_otp_last_sent_at", "VARCHAR(35) NULL"),
            ("reset_password_token_hash", "VARCHAR(128) NULL"),
            ("reset_password_token_expires_at", "VARCHAR(35) NULL")
        ]:
            try:
                cursor.execute(f"ALTER TABLE users ADD COLUMN {col_name} {col_type};")
            except Exception:
                pass

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS interview_sessions (
                id VARCHAR(64) NOT NULL,
                user_id VARCHAR(64) NOT NULL,
                title VARCHAR(255) NOT NULL,
                category VARCHAR(100) NOT NULL,
                role VARCHAR(100) NOT NULL,
                level VARCHAR(50) NOT NULL DEFAULT 'Mid Level',
                overall_score SMALLINT NOT NULL,
                mode VARCHAR(50) NOT NULL DEFAULT 'Technical Practice',
                metrics_json JSON NULL,
                report_json JSON NULL,
                created_at VARCHAR(35) NOT NULL,
                PRIMARY KEY (id),
                INDEX idx_interviews_user_id (user_id),
                INDEX idx_interviews_created_at (created_at DESC),
                CONSTRAINT fk_interviews_user FOREIGN KEY (user_id)
                    REFERENCES users (id)
                    ON DELETE CASCADE
                    ON UPDATE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """)

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS custom_questions (
                id VARCHAR(64) NOT NULL,
                category VARCHAR(100) NOT NULL,
                role VARCHAR(100) NOT NULL,
                question_text TEXT NOT NULL,
                ideal_keywords_json JSON NULL,
                created_at VARCHAR(35) NOT NULL,
                PRIMARY KEY (id),
                INDEX idx_questions_category_role (category, role)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """)

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS interview_question_history (
                id VARCHAR(64) NOT NULL,
                user_id VARCHAR(64) NOT NULL,
                interview_id VARCHAR(64) NOT NULL,
                question_id VARCHAR(64) NOT NULL,
                question_text TEXT NOT NULL,
                role VARCHAR(100) NOT NULL,
                topic VARCHAR(100) NOT NULL,
                category VARCHAR(100) NOT NULL,
                asked_at VARCHAR(35) NOT NULL,
                PRIMARY KEY (id),
                INDEX idx_qh_user_role (user_id, role),
                INDEX idx_qh_question_id (question_id),
                CONSTRAINT fk_qh_user FOREIGN KEY (user_id)
                    REFERENCES users (id)
                    ON DELETE CASCADE
                    ON UPDATE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """)

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS interview_attempts (
                id VARCHAR(64) NOT NULL,
                user_id VARCHAR(64) NOT NULL,
                role VARCHAR(100) NOT NULL,
                attempt_number INT NOT NULL,
                interview_id VARCHAR(64) NOT NULL,
                overall_score SMALLINT NOT NULL,
                topic_scores_json JSON NULL,
                weaknesses_json JSON NULL,
                recommendations_json JSON NULL,
                status VARCHAR(50) NOT NULL DEFAULT 'completed',
                created_at VARCHAR(35) NOT NULL,
                PRIMARY KEY (id),
                INDEX idx_attempts_user_role (user_id, role, attempt_number),
                CONSTRAINT fk_attempts_user FOREIGN KEY (user_id)
                    REFERENCES users (id)
                    ON DELETE CASCADE
                    ON UPDATE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """)

        # Idempotent column upgrades for interview_sessions
        for col_name, col_type in [
            ("attempt_number", "INT NOT NULL DEFAULT 1"),
            ("parent_attempt_id", "VARCHAR(64) NULL")
        ]:
            try:
                cursor.execute(f"ALTER TABLE interview_sessions ADD COLUMN {col_name} {col_type};")
            except Exception:
                pass

    else:
        # SQLite DDL
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'Candidate',
                verified INTEGER DEFAULT 1,
                verification_otp TEXT,
                otp_expires_at TEXT,
                consent_date TEXT,
                target_role TEXT DEFAULT 'Full Stack Engineer',
                level TEXT DEFAULT 'Mid Level',
                avatar TEXT,
                created_at TEXT,
                otp_attempts INTEGER DEFAULT 0,
                otp_last_sent_at TEXT,
                pending_email TEXT,
                pending_email_otp_hash TEXT,
                pending_email_expires_at TEXT,
                pending_email_attempts INTEGER DEFAULT 0,
                pending_email_last_sent_at TEXT
            )
        """)

        # Idempotent column upgrades for SQLite
        for col_name, col_type in [
            ("otp_attempts", "INTEGER DEFAULT 0"),
            ("otp_last_sent_at", "TEXT"),
            ("pending_email", "TEXT"),
            ("pending_email_otp_hash", "TEXT"),
            ("pending_email_expires_at", "TEXT"),
            ("pending_email_attempts", "INTEGER DEFAULT 0"),
            ("pending_email_last_sent_at", "TEXT"),
            ("reset_password_otp_hash", "TEXT"),
            ("reset_password_otp_expires_at", "TEXT"),
            ("reset_password_otp_attempts", "INTEGER DEFAULT 0"),
            ("reset_password_otp_last_sent_at", "TEXT"),
            ("reset_password_token_hash", "TEXT"),
            ("reset_password_token_expires_at", "TEXT")
        ]:
            try:
                cursor.execute(f"ALTER TABLE users ADD COLUMN {col_name} {col_type};")
            except Exception:
                pass

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS interview_sessions (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                title TEXT NOT NULL,
                category TEXT NOT NULL,
                role TEXT NOT NULL,
                level TEXT DEFAULT 'Mid Level',
                overall_score INTEGER NOT NULL,
                mode TEXT DEFAULT 'Technical Practice',
                metrics_json TEXT,
                report_json TEXT,
                created_at TEXT,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        """)

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS custom_questions (
                id TEXT PRIMARY KEY,
                category TEXT NOT NULL,
                role TEXT NOT NULL,
                question_text TEXT NOT NULL,
                ideal_keywords_json TEXT,
                created_at TEXT
            )
        """)

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS interview_question_history (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                interview_id TEXT NOT NULL,
                question_id TEXT NOT NULL,
                question_text TEXT NOT NULL,
                role TEXT NOT NULL,
                topic TEXT NOT NULL,
                category TEXT NOT NULL,
                asked_at TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        """)

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS interview_attempts (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                role TEXT NOT NULL,
                attempt_number INTEGER NOT NULL,
                interview_id TEXT NOT NULL,
                overall_score INTEGER NOT NULL,
                topic_scores_json TEXT,
                weaknesses_json TEXT,
                recommendations_json TEXT,
                status TEXT DEFAULT 'completed',
                created_at TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        """)

        # Idempotent column upgrades for SQLite interview_sessions
        for col_name, col_type in [
            ("attempt_number", "INTEGER DEFAULT 1"),
            ("parent_attempt_id", "TEXT")
        ]:
            try:
                cursor.execute(f"ALTER TABLE interview_sessions ADD COLUMN {col_name} {col_type};")
            except Exception:
                pass

    conn.commit()

    # Pre-calculated standard bcrypt hash for "password123"
    bcrypt_seed_hash = "$2b$12$S5P5JyAMVSsEUZxd1wFYC.Y5KkCvPrsAicBozMKvVFwIY/6uyXY5C"

    cursor.execute("SELECT COUNT(*) AS cnt FROM users")
    cnt_row = cursor.fetchone()
    count_users = cnt_row["cnt"] if isinstance(cnt_row, dict) else cnt_row[0]

    if count_users == 0:
        default_users = [
            (
                "usr_cand_1", "Candidate", "candidate@interviewiq.io",
                bcrypt_seed_hash, "Candidate", 1, None, None,
                datetime.utcnow().isoformat(), "Full Stack Engineer", "Mid Level",
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
                datetime.utcnow().isoformat()
            ),
            (
                "usr_mentor_1", "Dr. Sarah Chen", "sarah.chen@tech.org",
                bcrypt_seed_hash, "Mentor", 1, None, None,
                datetime.utcnow().isoformat(), "Lead Architect", "Senior",
                "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
                datetime.utcnow().isoformat()
            ),
            (
                "usr_admin_1", "Marcus Vance", "admin@interviewiq.internal",
                bcrypt_seed_hash, "Administrator", 1, None, None,
                datetime.utcnow().isoformat(), "System Director", "Staff",
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
                datetime.utcnow().isoformat()
            )
        ]
        cursor.executemany("""
            INSERT INTO users (id, name, email, password_hash, role, verified, verification_otp, otp_expires_at, consent_date, target_role, level, avatar, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, default_users)
        conn.commit()

    cursor.execute("SELECT COUNT(*) AS cnt FROM interview_sessions")
    cnt_row = cursor.fetchone()
    count_inv = cnt_row["cnt"] if isinstance(cnt_row, dict) else cnt_row[0]

    if count_inv == 0:
        sample_metrics = json.dumps({
            "correctness": 88,
            "depth": 82,
            "clarity": 85,
            "examples": 80,
            "avgPaceWpm": 138,
            "fillerWordsCount": 1
        })
        sample_report = json.dumps({
            "title": "Backend Engineering Simulation: Database Architect",
            "overallScore": 84,
            "category": "Software & Engineering",
            "role": "Database Architect",
            "feedbackSummary": "Superb architectural grounding in indexing and B-Tree structures. Add concrete query latency reduction metrics."
        })
        cursor.execute("""
            INSERT INTO interview_sessions (id, user_id, title, category, role, level, overall_score, mode, metrics_json, report_json, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            "inv_init_1", "usr_cand_1", "Backend Engineering Simulation: Database Architect",
            "Software & Engineering", "Database Architect", "Mid Level", 84,
            "Technical Practice", sample_metrics, sample_report, datetime.utcnow().isoformat()
        ))
        conn.commit()

    conn.close()


# ==================== User Repository Methods ====================

def sanitize_user(user_dict: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    """Strips password hash and internal OTP secrets before returning to client."""
    if not user_dict:
        return None
    d = dict(user_dict)
    d.pop("password_hash", None)
    d.pop("verification_otp", None)
    d.pop("otp_expires_at", None)
    d.pop("otp_attempts", None)
    d.pop("otp_last_sent_at", None)
    d.pop("pending_email_otp_hash", None)
    d.pop("pending_email_expires_at", None)
    d.pop("pending_email_attempts", None)
    d.pop("pending_email_last_sent_at", None)
    d.pop("reset_password_otp_hash", None)
    d.pop("reset_password_otp_expires_at", None)
    d.pop("reset_password_otp_attempts", None)
    d.pop("reset_password_otp_last_sent_at", None)
    d.pop("reset_password_token_hash", None)
    d.pop("reset_password_token_expires_at", None)
    return d


def get_user_by_email(email: str, include_credentials: bool = False, use_test_db: bool = False) -> Optional[Dict[str, Any]]:
    """Retrieves user by email. Case-insensitive lookup."""
    conn = get_connection(use_test_db=use_test_db)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE LOWER(email) = LOWER(?)", (email.strip(),))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None
    res = dict(row)
    return res if include_credentials else sanitize_user(res)


def get_user_by_id(user_id: str, include_credentials: bool = False, use_test_db: bool = False) -> Optional[Dict[str, Any]]:
    """Retrieves user by unique ID."""
    conn = get_connection(use_test_db=use_test_db)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None
    res = dict(row)
    return res if include_credentials else sanitize_user(res)


def list_users(use_test_db: bool = False) -> List[Dict[str, Any]]:
    """Returns all users with sanitized fields (safe for rosters)."""
    conn = get_connection(use_test_db=use_test_db)
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, email, role, verified, target_role, level, avatar, created_at FROM users")
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]


def create_user(user: Dict[str, Any], use_test_db: bool = False) -> Dict[str, Any]:
    """Inserts a new user record using strictly parameterized queries."""
    conn = get_connection(use_test_db=use_test_db)
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO users (id, name, email, password_hash, role, verified, verification_otp, otp_expires_at, consent_date, target_role, level, avatar, created_at, otp_attempts, otp_last_sent_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        user["id"], user["name"], user["email"], user["password_hash"],
        user.get("role", "Candidate"), 1 if user.get("verified", False) else 0,
        user.get("verification_otp"), user.get("otp_expires_at"),
        user.get("consent_date"), user.get("target_role", "Full Stack Engineer"),
        user.get("level", "Mid Level"), user.get("avatar"),
        user.get("created_at", datetime.utcnow().isoformat()),
        int(user.get("otp_attempts") or 0),
        user.get("otp_last_sent_at")
    ))
    conn.commit()
    conn.close()
    return sanitize_user(user)


def update_user(user_id: str, fields: Dict[str, Any], use_test_db: bool = False) -> Optional[Dict[str, Any]]:
    """
    Safely updates user attributes using strict column whitelisting and parameterized bindings.
    Rejects any unapproved column keys to prevent SQL injection & privilege escalation.
    """
    conn = get_connection(use_test_db=use_test_db)
    cursor = conn.cursor()

    set_clauses = []
    values = []
    for k, v in fields.items():
        actual_col = COLUMN_ALIASES.get(k, k)
        if actual_col in ALLOWED_USER_COLUMNS:
            set_clauses.append(f"{actual_col} = ?")
            values.append(v)

    if not set_clauses:
        conn.close()
        return get_user_by_id(user_id, use_test_db=use_test_db)

    values.append(user_id)
    query = f"UPDATE users SET {', '.join(set_clauses)} WHERE id = ?"
    cursor.execute(query, values)
    conn.commit()
    conn.close()
    return get_user_by_id(user_id, use_test_db=use_test_db)


def complete_email_change(user_id: str, new_email: str, use_test_db: bool = False) -> Optional[Dict[str, Any]]:
    """
    Atomically updates the user's primary email address inside a database transaction,
    clearing all pending email change fields.
    Rolls back automatically on any constraint violation (e.g. duplicate email).
    """
    with get_connection(use_test_db=use_test_db) as conn:
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE users SET
                email = ?,
                pending_email = NULL,
                pending_email_otp_hash = NULL,
                pending_email_expires_at = NULL,
                pending_email_attempts = 0,
                pending_email_last_sent_at = NULL
            WHERE id = ?
        """, (new_email.strip().lower(), user_id))
    return get_user_by_id(user_id, use_test_db=use_test_db)


def delete_user(user_id: str, use_test_db: bool = False):
    """Deletes a user and cascades their interview sessions."""
    conn = get_connection(use_test_db=use_test_db)
    cursor = conn.cursor()
    cursor.execute("DELETE FROM interview_sessions WHERE user_id = ?", (user_id,))
    cursor.execute("DELETE FROM users WHERE id = ?", (user_id,))
    conn.commit()
    conn.close()


# ==================== Interview Sessions Repository ====================

def get_interview_by_id(interview_id: str, use_test_db: bool = False) -> Optional[Dict[str, Any]]:
    """Fetches a single interview session by its unique ID."""
    conn = get_connection(use_test_db=use_test_db)
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM interview_sessions WHERE id = ?", (interview_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None
    d = dict(row)
    for json_col, target_key in [("metrics_json", "metrics"), ("report_json", "report")]:
        val = d.get(json_col)
        if val:
            if isinstance(val, (dict, list)):
                d[target_key] = val
            else:
                try:
                    d[target_key] = json.loads(val)
                except Exception:
                    d[target_key] = {}
    rep = d.get("report") if isinstance(d.get("report"), dict) else {}
    score = None
    if rep.get("overallScore") is not None:
        score = rep.get("overallScore")
    elif d.get("overall_score") is not None:
        score = d.get("overall_score")
    elif rep.get("overall_score") is not None:
        score = rep.get("overall_score")
    elif d.get("overallScore") is not None:
        score = d.get("overallScore")
    else:
        score = 0
    d["overallScore"] = score
    d["overall_score"] = score
    return d


def list_interviews(user_id: Optional[str] = None, use_test_db: bool = False) -> List[Dict[str, Any]]:
    """Lists interview sessions, optionally filtered by user ID."""
    conn = get_connection(use_test_db=use_test_db)
    cursor = conn.cursor()
    if user_id:
        cursor.execute("SELECT * FROM interview_sessions WHERE user_id = ? ORDER BY created_at DESC", (user_id,))
    else:
        cursor.execute("SELECT * FROM interview_sessions ORDER BY created_at DESC")
    rows = cursor.fetchall()
    conn.close()

    results = []
    for r in rows:
        d = dict(r)
        for json_col, target_key in [("metrics_json", "metrics"), ("report_json", "report")]:
            val = d.get(json_col)
            if val:
                if isinstance(val, (dict, list)):
                    d[target_key] = val
                else:
                    try:
                        d[target_key] = json.loads(val)
                    except Exception:
                        d[target_key] = {}
        rep = d.get("report") if isinstance(d.get("report"), dict) else {}
        score = None
        if rep.get("overallScore") is not None:
            score = rep.get("overallScore")
        elif d.get("overall_score") is not None:
            score = d.get("overall_score")
        elif rep.get("overall_score") is not None:
            score = rep.get("overall_score")
        elif d.get("overallScore") is not None:
            score = d.get("overallScore")
        else:
            score = 0
        d["overallScore"] = score
        d["overall_score"] = score
        results.append(d)
    return results


def save_interview(data: Dict[str, Any], enforced_user_id: Optional[str] = None, use_test_db: bool = False) -> Dict[str, Any]:
    """
    Saves or updates an interview session.
    Enforces user_id attribution from authenticated context.
    Uses ON DUPLICATE KEY UPDATE in MySQL and INSERT OR REPLACE in SQLite.
    """
    conn = get_connection(use_test_db=use_test_db)
    cursor = conn.cursor()
    is_mysql = conn._is_mysql

    inv_id = data.get("id") or ("inv_" + str(int(datetime.utcnow().timestamp() * 1000)))
    user_id = enforced_user_id or data.get("userId") or data.get("user_id") or "usr_cand_1"
    title = data.get("title") or "Technical AI Interview"
    category = data.get("category") or "Software & Engineering"
    role = data.get("role") or "Software Engineer"
    level = data.get("level") or "Mid Level"
    raw_score = data.get("overallScore")
    if raw_score is None:
        raw_score = data.get("overall_score")
    if raw_score is None and isinstance(data.get("report"), dict):
        raw_score = data["report"].get("overallScore") if data["report"].get("overallScore") is not None else data["report"].get("overall_score")
    if raw_score is not None:
        try:
            overall_score = int(round(float(raw_score)))
        except (ValueError, TypeError):
            overall_score = 0
    else:
        overall_score = 0
    mode = data.get("mode") or "Technical Practice"
    created_at = data.get("date") or datetime.utcnow().isoformat()
    attempt_number = int(data.get("attempt_number") or data.get("attemptNumber") or 1)
    parent_attempt_id = data.get("parent_attempt_id") or data.get("parentAttemptId")

    metrics_raw = data.get("metrics") or {}
    report_raw = data

    metrics_json = json.dumps(metrics_raw) if not isinstance(metrics_raw, str) else metrics_raw
    report_json = json.dumps(report_raw) if not isinstance(report_raw, str) else report_raw

    if is_mysql:
        cursor.execute("""
            INSERT INTO interview_sessions (id, user_id, title, category, role, level, overall_score, mode, metrics_json, report_json, created_at, attempt_number, parent_attempt_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                user_id = VALUES(user_id),
                title = VALUES(title),
                category = VALUES(category),
                role = VALUES(role),
                level = VALUES(level),
                overall_score = VALUES(overall_score),
                mode = VALUES(mode),
                metrics_json = VALUES(metrics_json),
                report_json = VALUES(report_json),
                created_at = VALUES(created_at),
                attempt_number = VALUES(attempt_number),
                parent_attempt_id = VALUES(parent_attempt_id)
        """, (
            inv_id, user_id, title, category, role, level, overall_score, mode, metrics_json, report_json, created_at, attempt_number, parent_attempt_id
        ))
    else:
        cursor.execute("""
            INSERT OR REPLACE INTO interview_sessions (id, user_id, title, category, role, level, overall_score, mode, metrics_json, report_json, created_at, attempt_number, parent_attempt_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            inv_id, user_id, title, category, role, level, overall_score, mode, metrics_json, report_json, created_at, attempt_number, parent_attempt_id
        ))

    conn.commit()
    conn.close()

    data["id"] = inv_id
    data["userId"] = user_id
    data["user_id"] = user_id
    data["date"] = created_at
    data["attempt_number"] = attempt_number
    data["attemptNumber"] = attempt_number
    data["parent_attempt_id"] = parent_attempt_id
    data["parentAttemptId"] = parent_attempt_id
    return data


def delete_interview(interview_id: str, use_test_db: bool = False):
    """Deletes an interview session by ID."""
    conn = get_connection(use_test_db=use_test_db)
    cursor = conn.cursor()
    cursor.execute("DELETE FROM interview_sessions WHERE id = ?", (interview_id,))
    conn.commit()
    conn.close()


# ==================== Question History & Deduplication Layer ====================

def record_question_history(
    user_id: str,
    interview_id: str,
    questions: List[Dict[str, Any]],
    role: str,
    category: str = "",
    use_test_db: bool = False
):
    """
    Persists asked questions into interview_question_history for session deduplication.
    """
    if not questions:
        return

    conn = get_connection(use_test_db=use_test_db)
    cursor = conn.cursor()
    now_iso = datetime.utcnow().isoformat()

    records = []
    import uuid
    for idx, q in enumerate(questions):
        qid = q.get("id") or f"q_{idx}_{uuid.uuid4().hex[:8]}"
        qtext = q.get("question") or ""
        topic = q.get("topic") or category or "General"
        cat = q.get("category") or category or role
        entry_id = f"qh_{uuid.uuid4().hex[:16]}"
        records.append((entry_id, user_id, interview_id, qid, qtext, role, topic, cat, now_iso))

    if conn._is_mysql:
        cursor.executemany("""
            INSERT IGNORE INTO interview_question_history (id, user_id, interview_id, question_id, question_text, role, topic, category, asked_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, records)
    else:
        cursor.executemany("""
            INSERT OR IGNORE INTO interview_question_history (id, user_id, interview_id, question_id, question_text, role, topic, category, asked_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, records)
    conn.commit()
    conn.close()


def get_user_question_history_ids(
    user_id: str,
    role: Optional[str] = None,
    limit: int = 150,
    use_test_db: bool = False
) -> List[str]:
    """
    Retrieves list of question IDs previously asked to this candidate (ordered from most recent).
    """
    conn = get_connection(use_test_db=use_test_db)
    cursor = conn.cursor()

    if role:
        cursor.execute("""
            SELECT question_id FROM interview_question_history
            WHERE user_id = ? AND role = ?
            ORDER BY asked_at DESC LIMIT ?
        """, (user_id, role, limit))
    else:
        cursor.execute("""
            SELECT question_id FROM interview_question_history
            WHERE user_id = ?
            ORDER BY asked_at DESC LIMIT ?
        """, (user_id, limit))

    rows = cursor.fetchall()
    conn.close()

    seen = set()
    result = []
    for r in rows:
        qid = r["question_id"] if isinstance(r, dict) else r[0]
        if qid not in seen:
            seen.add(qid)
            result.append(qid)
    return result


# ==================== Attempt Tracking (A1 -> Latest) Layer ====================

def get_candidate_attempts_for_role(
    user_id: str,
    role: str,
    use_test_db: bool = False
) -> List[Dict[str, Any]]:
    """
    Retrieves chronological attempt history for a specific role (A1, A2, A3...).
    """
    conn = get_connection(use_test_db=use_test_db)
    cursor = conn.cursor()
    cursor.execute("""
        SELECT * FROM interview_attempts
        WHERE user_id = ? AND role = ?
        ORDER BY attempt_number ASC
    """, (user_id, role))
    rows = cursor.fetchall()
    conn.close()

    attempts = []
    for r in rows:
        d = dict(r)
        for json_col, target_key in [
            ("topic_scores_json", "topicScores"),
            ("weaknesses_json", "weaknesses"),
            ("recommendations_json", "recommendations")
        ]:
            val = d.get(json_col)
            if val:
                if isinstance(val, (dict, list)):
                    d[target_key] = val
                else:
                    try:
                        d[target_key] = json.loads(val)
                    except Exception:
                        d[target_key] = {}
            else:
                d[target_key] = {} if target_key == "topicScores" else []
        d["overallScore"] = d.get("overall_score")
        d["attemptNumber"] = d.get("attempt_number")
        d["userId"] = d.get("user_id")
        d["interviewId"] = d.get("interview_id")
        d["createdAt"] = d.get("created_at")
        d["attemptLabel"] = f"A{d.get('attempt_number', 1)}"
        attempts.append(d)
    return attempts


def save_interview_attempt(
    user_id: str,
    role: str,
    interview_id: str,
    overall_score: int,
    topic_scores: Dict[str, Any],
    weaknesses: List[Dict[str, Any]],
    recommendations: Any,
    status: str = "completed",
    use_test_db: bool = False
) -> Dict[str, Any]:
    """
    Saves a formal attempt progression record (e.g. A1, A2, A3) for a candidate and role.
    """
    conn = get_connection(use_test_db=use_test_db)
    cursor = conn.cursor()

    # Determine next attempt number for this candidate and role
    cursor.execute("""
        SELECT COUNT(*) AS cnt FROM interview_attempts
        WHERE user_id = ? AND role = ?
    """, (user_id, role))
    cnt_row = cursor.fetchone()
    count_attempts = cnt_row["cnt"] if isinstance(cnt_row, dict) else cnt_row[0]
    attempt_num = int(count_attempts) + 1

    attempt_id = f"att_{user_id[:8]}_{attempt_num}_{int(datetime.utcnow().timestamp())}"
    now_iso = datetime.utcnow().isoformat()

    topic_scores_json = json.dumps(topic_scores)
    weaknesses_json = json.dumps(weaknesses)
    recommendations_json = json.dumps(recommendations)

    cursor.execute("""
        INSERT INTO interview_attempts (id, user_id, role, attempt_number, interview_id, overall_score, topic_scores_json, weaknesses_json, recommendations_json, status, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        attempt_id, user_id, role, attempt_num, interview_id, int(overall_score),
        topic_scores_json, weaknesses_json, recommendations_json, status, now_iso
    ))
    conn.commit()
    conn.close()

    return {
        "id": attempt_id,
        "userId": user_id,
        "role": role,
        "attemptNumber": attempt_num,
        "attemptLabel": f"A{attempt_num}",
        "interviewId": interview_id,
        "overallScore": overall_score,
        "topicScores": topic_scores,
        "weaknesses": weaknesses,
        "recommendations": recommendations,
        "status": status,
        "createdAt": now_iso
    }
