import os
import sys
import time
from datetime import datetime, timedelta
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from main import app
import security as sec
import database as db
import ai_service
from nlp_analyzer import NLPInterviewAnalyzer

def run_release_validation():
    print("=" * 80)
    print("INTERVIEWIQ END-TO-END RELEASE VALIDATION RUNNER")
    print("=" * 80)

    client = TestClient(app)
    results = {}

    # -------------------------------------------------------------
    # 1. Health & Server Metadata
    # -------------------------------------------------------------
    print("\n[STEP 1] Validating Health & Database Connection...")
    res = client.get("/api/health")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    health_data = res.json()
    assert health_data["status"] == "healthy"
    db_engine = health_data["database"].get("engine", "Unknown")
    print(f"  ✓ API Health: Healthy")
    print(f"  ✓ Database Engine: {db_engine}")
    if "pool_size" in health_data["database"]:
        print(f"  ✓ Active Pool Size: {health_data['database']['pool_size']}")
    print(f"  ✓ AI Service Configured: {health_data['ai_service']['configured']} (Model: {health_data['ai_service']['model']})")
    results["HEALTH_CHECK"] = "PASS"

    # -------------------------------------------------------------
    # 2. Registration, Expiring OTP & Login
    # -------------------------------------------------------------
    print("\n[STEP 2] Validating Registration, OTP Verification, and Authentication...")
    test_email = f"release_val_{int(time.time())}@interviewiq.test"
    test_password = "ReleaseSecure#2026!"

    # 2.1 Registration
    reg_payload = {
        "name": "E2E Release Tester",
        "email": test_email,
        "password": test_password,
        "role": "Candidate",
        "targetRole": "Full Stack Architect",
        "level": "Senior",
        "consent": True
    }
    reg_res = client.post("/api/auth/register", json=reg_payload)
    assert reg_res.status_code == 201, f"Registration failed: {reg_res.text}"
    reg_data = reg_res.json()
    test_user_id = reg_data["user"]["id"]
    otp = reg_data.get("otpMock")
    print(f"  ✓ User Registered: {test_user_id} ({test_email})")
    print(f"  ✓ Verification OTP Dispatched: {otp}")

    # 2.2 Unverified Login Attempt (Must be rejected)
    unverified_res = client.post("/api/auth/login", json={"email": test_email, "password": test_password})
    assert unverified_res.status_code == 403, f"Unverified login should be 403: {unverified_res.status_code}"
    print("  ✓ Unverified Login Blocked: 403 Forbidden (EMAIL_UNVERIFIED)")

    # 2.3 Invalid OTP Verification (Must be rejected)
    bad_otp_res = client.post("/api/auth/verify-otp", json={"email": test_email, "otp": "000000"})
    assert bad_otp_res.status_code == 400, f"Bad OTP should be 400: {bad_otp_res.text}"
    print("  ✓ Invalid OTP Rejected: 400 Bad Request")

    # 2.4 Valid OTP Verification
    verify_res = client.post("/api/auth/verify-otp", json={"email": test_email, "otp": otp})
    assert verify_res.status_code == 200, f"Valid OTP failed: {verify_res.text}"
    print("  ✓ Valid OTP Accepted: Account Verified")

    # 2.5 Successful Login & JWT Token Issuance
    login_res = client.post("/api/auth/login", json={"email": test_email, "password": test_password})
    assert login_res.status_code == 200, f"Login failed: {login_res.text}"
    login_data = login_res.json()
    auth_token = login_data["access_token"]
    assert auth_token is not None and len(auth_token) > 20
    auth_headers = {"Authorization": f"Bearer {auth_token}"}
    print(f"  ✓ Login Succeeded: JWT Bearer Token Issued (Length: {len(auth_token)})")
    results["AUTH_FLOW"] = "PASS"

    # -------------------------------------------------------------
    # 3. Profile & Authorization Isolation
    # -------------------------------------------------------------
    print("\n[STEP 3] Validating Profile Access & Resource Ownership Isolation...")
    # 3.1 Fetch current user profile
    me_res = client.get("/api/auth/me", headers=auth_headers)
    assert me_res.status_code == 200
    me_data = me_res.json()["user"]
    assert me_data["id"] == test_user_id
    assert "password_hash" not in me_data
    assert "verification_otp" not in me_data
    print(f"  ✓ GET /api/auth/me: Sanitized profile returned (secrets redacted)")

    # 3.2 Update own profile
    update_res = client.put(f"/api/auth/user/{test_user_id}", headers=auth_headers, json={"level": "Staff / Architect"})
    assert update_res.status_code == 200
    assert update_res.json()["user"]["level"] == "Staff / Architect"
    print("  ✓ PUT /api/auth/user/{id}: Candidate successfully updated own profile")

    # 3.3 Attempt to modify another user's profile (Must be 403 Forbidden)
    forbidden_update = client.put("/api/auth/user/usr_cand_1", headers=auth_headers, json={"level": "Hacked Level"})
    assert forbidden_update.status_code == 403
    print("  ✓ Ownership Isolation: Candidate cannot modify another user's profile (403 Forbidden)")

    # 3.4 Unauthenticated request blocked
    unauth_res = client.get("/api/interviews")
    assert unauth_res.status_code == 401
    print("  ✓ Protected Endpoint: Unauthenticated access blocked (401 Unauthorized)")
    results["AUTHORIZATION_ISOLATION"] = "PASS"

    # -------------------------------------------------------------
    # 4. Question Generation & Custom Role Calibration
    # -------------------------------------------------------------
    print("\n[STEP 4] Validating Question Generation (Role, Level, Resume)...")
    q_gen_res = client.post("/api/ai/generate-questions", headers=auth_headers, json={
        "role": "Distributed Systems Engineer",
        "level": "Staff / Architect",
        "category": "Software & Engineering",
        "resumeText": "Built Raft consensus microservices in Python with high-throughput replication.",
        "count": 3
    })
    assert q_gen_res.status_code == 200
    q_data = q_gen_res.json()
    assert len(q_data["questions"]) == 3
    for q in q_data["questions"]:
        assert "question" in q and len(q["question"]) > 10
        assert "idealKeywords" in q and len(q["idealKeywords"]) > 0
        assert "followUp" in q and len(q["followUp"]) > 5
    print(f"  ✓ Generated {len(q_data['questions'])} calibrated questions with rubrics and adaptive follow-ups")
    results["QUESTION_GENERATION"] = "PASS"

    # -------------------------------------------------------------
    # 5. Dual AI & NLP Evaluation Testing (Multi-Scenario)
    # -------------------------------------------------------------
    print("\n[STEP 5] Validating AI Evaluation Across Diverse Scenarios...")
    test_cases = [
        {
            "id": "TC-CONCISE-CORRECT",
            "desc": "Concise factual conceptual definition",
            "question": "Explain TCP vs UDP and when to use each.",
            "answer": "TCP is a connection-oriented protocol that guarantees delivery using a three-way handshake and sequence acknowledgments. UDP is connectionless and best-effort without delivery guarantees, providing lower latency for gaming and live audio streaming.",
            "ideal": "TCP is connection-oriented and reliable with handshakes; UDP is connectionless and low-latency.",
            "keywords": ["tcp", "udp", "connection-oriented", "connectionless", "handshake", "latency", "reliable"],
            "min_score": 68,
            "max_score": 85
        },
        {
            "id": "TC-DETAILED-EXPERIENTIAL",
            "desc": "Detailed technical answer with metrics & architecture",
            "question": "Explain TCP vs UDP and when to use each.",
            "answer": "In our live streaming platform, we chose connection-oriented TCP with a three-way handshake for account authentication and state management to guarantee reliable delivery. For live media broadcast, we decoupled to connectionless UDP without delivery guarantees, which reduced our packet latency by 45% down to 95ms under 50k concurrent users.",
            "ideal": "TCP is connection-oriented and reliable with handshakes; UDP is connectionless and low-latency.",
            "keywords": ["tcp", "udp", "connection-oriented", "connectionless", "handshake", "latency", "reliable"],
            "min_score": 75,
            "max_score": 95
        },
        {
            "id": "TC-PARTIAL",
            "desc": "Partially correct foundational answer",
            "question": "How do database indexes work?",
            "answer": "Indexes help queries run faster by keeping a pointer to where the data is stored on disk.",
            "ideal": "Indexes use B-Trees to reduce search complexity from O(N) to O(log N).",
            "keywords": ["b-tree", "lookup", "o(log n)", "pointers", "disk"],
            "min_score": 45,
            "max_score": 75
        },
        {
            "id": "TC-INCORRECT-CONTRADICTION",
            "desc": "Factual contradiction (UDP has handshake / TCP unreliable)",
            "question": "Explain TCP vs UDP differences.",
            "answer": "UDP is connection-oriented and guarantees delivery through a strict three-way handshake. TCP is connectionless and unreliable.",
            "ideal": "TCP is reliable; UDP is connectionless.",
            "keywords": ["tcp", "udp", "handshake"],
            "min_score": 0,
            "max_score": 40
        },
        {
            "id": "TC-KEYWORD-SOUP",
            "desc": "Adversarial unlinked noun list",
            "question": "Explain microservices architecture.",
            "answer": "Docker kubernetes redis kafka rabbitmq postgresql grpc rest graphql aws ec2 microservices.",
            "ideal": "Microservices decompose an application into loosely coupled independent services communicating via APIs.",
            "keywords": ["docker", "kubernetes", "microservices", "loosely coupled", "apis"],
            "min_score": 0,
            "max_score": 35
        },
        {
            "id": "TC-OFF-TOPIC",
            "desc": "Completely irrelevant answer",
            "question": "What is dependency injection?",
            "answer": "I really enjoy watching football and playing tennis on weekends with friends.",
            "ideal": "Dependency injection is an inversion-of-control technique providing dependencies externally.",
            "keywords": ["dependency", "injection", "inversion", "control"],
            "min_score": 0,
            "max_score": 10
        },
        {
            "id": "TC-EMPTY",
            "desc": "Empty whitespace answer",
            "question": "Explain relational database transactions.",
            "answer": "   \n  \t  ",
            "ideal": "ACID compliance ensures Atomicity, Consistency, Isolation, and Durability.",
            "keywords": ["acid", "transactions", "atomicity"],
            "min_score": 0,
            "max_score": 0
        }
    ]

    for tc in test_cases:
        eval_res = client.post("/api/evaluate", json={
            "question": tc["question"],
            "answer": tc["answer"],
            "idealAnswer": tc["ideal"],
            "idealKeywords": tc["keywords"],
            "candidateRole": "Software Engineer",
            "questionCategory": "Technical"
        })
        assert eval_res.status_code == 200, f"Evaluation error on {tc['id']}: {eval_res.text}"
        eval_data = eval_res.json()["data"]
        score = eval_data["overallScore"]
        assert tc["min_score"] <= score <= tc["max_score"], (
            f"Score out of range for {tc['id']}: expected [{tc['min_score']}, {tc['max_score']}], got {score}"
        )
        assert "adaptiveFollowUpQuestion" in eval_data, f"Missing adaptiveFollowUpQuestion on {tc['id']}"
        assert "evidenceDossier" in eval_data
        print(f"  ✓ {tc['id']} ({tc['desc']}): Score {score}/100 [Expected {tc['min_score']}-{tc['max_score']}] | Follow-up: '{eval_data['adaptiveFollowUpQuestion'][:50]}...'")

    results["AI_EVALUATION"] = "PASS"

    # -------------------------------------------------------------
    # 6. MySQL Persistence, Retrieval & Ownership Checks
    # -------------------------------------------------------------
    print("\n[STEP 6] Validating Real MySQL Persistence & Session History...")
    test_session_id = f"inv_release_{int(time.time() * 1000)}"
    interview_payload = {
        "id": test_session_id,
        "title": "Software & Engineering Round: Full Stack Architect",
        "category": "Software & Engineering",
        "role": "Full Stack Architect",
        "level": "Staff / Architect",
        "mode": "Technical Simulation",
        "persona": "Vikram Malhotra",
        "projectName": "Core Application Platform",
        "recordingOptIn": True,
        "overallScore": 88,
        "status": "Completed",
        "metrics": {
            "correctness": 90,
            "depth": 86,
            "clarity": 88,
            "examples": 84,
            "responseDelaySec": 1.8,
            "avgPaceWpm": 140,
            "fillerWordsCount": 2,
            "fillerWordsList": ["like"],
            "pausesCount": 2
        },
        "questionsCount": 2,
        "answers": [
            {
                "question": "Explain TCP vs UDP.",
                "answerText": "TCP provides reliable, sequenced delivery with acknowledgments; UDP is best-effort.",
                "evaluation": {"overallScore": 88, "metrics": {"correctness": 90, "depth": 86, "clarity": 88, "examples": 84}}
            }
        ]
    }

    # 6.1 Save to database (enforcing authenticated candidate identity)
    save_res = client.post("/api/interviews", headers=auth_headers, json=interview_payload)
    assert save_res.status_code == 200, f"Save interview failed: {save_res.text}"
    saved_inv = save_res.json()["interview"]
    assert saved_inv["id"] == test_session_id
    assert saved_inv["user_id"] == test_user_id
    print(f"  ✓ Interview Session Persisted to MySQL: {test_session_id}")

    # 6.2 Retrieve interview sessions for this user
    list_res = client.get("/api/interviews", headers=auth_headers)
    assert list_res.status_code == 200
    user_invs = list_res.json()["interviews"]
    assert any(i["id"] == test_session_id for i in user_invs)
    print(f"  ✓ GET /api/interviews: Successfully queried {len(user_invs)} sessions for current user")

    # 6.3 Verify candidate cannot see another candidate's sessions
    other_list_res = client.get("/api/interviews?userId=usr_cand_1", headers=auth_headers)
    assert other_list_res.status_code == 200
    other_invs = other_list_res.json()["interviews"]
    # Even if passing another candidate's userId, regular Candidate role is forced to own identity
    for inv in other_invs:
        assert inv["user_id"] == test_user_id
    print("  ✓ Cross-Tenant Data Isolation: User query strictly scoped to own account ID")

    # 6.4 Delete test interview session
    del_res = client.delete(f"/api/interviews/{test_session_id}", headers=auth_headers)
    assert del_res.status_code == 200
    print(f"  ✓ DELETE /api/interviews/{test_session_id}: Session safely purged")
    results["MYSQL_PERSISTENCE"] = "PASS"

    # -------------------------------------------------------------
    # 7. Clean Up Test Account
    # -------------------------------------------------------------
    print("\n[STEP 7] Purging Test Account (Zero Orphaned Data)...")
    del_user_res = client.delete(f"/api/auth/user/{test_user_id}", headers=auth_headers)
    assert del_user_res.status_code == 200
    print(f"  ✓ Account {test_user_id} and all related records purged")
    results["CLEANUP"] = "PASS"

    print("\n" + "=" * 80)
    print("ALL RELEASE VALIDATION CHECKS COMPLETED SUCCESSFULLY")
    print("=" * 80)
    for check, status in results.items():
        print(f"  [{status}] {check}")
    return True

if __name__ == "__main__":
    success = run_release_validation()
    sys.exit(0 if success else 1)
