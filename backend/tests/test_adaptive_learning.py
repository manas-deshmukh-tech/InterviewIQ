"""
InterviewIQ Enterprise Comprehensive Adaptive Learning & Question Orchestration Test Suite
Covers:
1. Duration-based Question Count Scaling (5m: 3, 15m: 5, 30m: 9, 45m: 13)
2. Question Deduplication & History Filtering across multiple rounds
3. Experience Level Difficulty Calibration (Entry, Mid, Senior, Staff)
4. Resume-Targeted Project Defense Question Generation
5. Topic-Level Weakness Detection (<50% Priority, 50-69% Focus, 70-84% Proficient, 85-100% Advanced)
6. Personalized Learning Plan Generation with study concepts and practice questions
7. Chronological Attempt Progression (A1 -> Latest):
   - Scenario A: Initial attempt A1 < 50% triggers baseline remediation plan
   - Scenario B: Attempt A2 < 50% with recurring weaknesses triggers persistent gap alert
   - Scenario C: Attempt A3 >= 50% with positive delta celebrates improvement & resolved topics
   - Scenario D: Sustained high score >= 85% certifies benchmark readiness
"""

import pytest
from fastapi.testclient import TestClient
from main import app
import security as sec
import question_bank as qb
import database as db

client = TestClient(app)

# Helper: Generate authenticated headers for test candidate
def get_test_auth_headers(user_id="usr_cand_1", email="candidate@interviewiq.io", role="Candidate"):
    token = sec.create_access_token({"sub": user_id, "email": email, "role": role})
    return {"Authorization": f"Bearer {token}"}


class TestAdaptiveLearningAndQuestionOrchestration:

    def test_duration_question_counts(self):
        """Verifies duration-based question count scaling (5m: 3, 15m: 5, 30m: 9, 45m: 13)."""
        headers = get_test_auth_headers()

        # 5 minutes -> 3 questions
        res5 = client.post("/api/interviews/questions/prepare", json={
            "role": "Python Developer",
            "level": "Mid Level",
            "durationMinutes": 5
        }, headers=headers)
        assert res5.status_code == 200
        data5 = res5.json()
        assert data5["success"] is True
        assert len(data5["questions"]) == 3
        assert data5["targetCount"] == 3

        # 15 minutes -> 5 questions
        res15 = client.post("/api/interviews/questions/prepare", json={
            "role": "Python Developer",
            "level": "Mid Level",
            "durationMinutes": 15
        }, headers=headers)
        assert res15.status_code == 200
        assert len(res15.json()["questions"]) == 5

        # 30 minutes -> 9 questions
        res30 = client.post("/api/interviews/questions/prepare", json={
            "role": "Python Developer",
            "level": "Mid Level",
            "durationMinutes": 30
        }, headers=headers)
        assert res30.status_code == 200
        assert len(res30.json()["questions"]) == 9

        # 45 minutes -> 13 questions
        res45 = client.post("/api/interviews/questions/prepare", json={
            "role": "Python Developer",
            "level": "Mid Level",
            "durationMinutes": 45
        }, headers=headers)
        assert res45.status_code == 200
        assert len(res45.json()["questions"]) == 13

    def test_level_calibration(self):
        """Verifies question selection prioritizes questions matching candidate seniority."""
        headers = get_test_auth_headers()

        # Entry Level
        res_entry = client.post("/api/interviews/questions/prepare", json={
            "role": "Java Developer",
            "level": "Fresher / Entry",
            "durationMinutes": 5
        }, headers=headers)
        assert res_entry.status_code == 200
        qs_entry = res_entry.json()["questions"]
        assert any("Entry" in q.get("level", "") or "Fresher" in q.get("level", "") for q in qs_entry)

        # Senior Level
        res_sr = client.post("/api/interviews/questions/prepare", json={
            "role": "Java Developer",
            "level": "Senior",
            "durationMinutes": 5
        }, headers=headers)
        assert res_sr.status_code == 200
        qs_sr = res_sr.json()["questions"]
        assert any("Senior" in q.get("level", "") or "Staff" in q.get("level", "") for q in qs_sr)

    def test_resume_targeted_question_injection(self):
        """Verifies candidate resume projects & skills are incorporated into custom questions."""
        headers = get_test_auth_headers()

        res = client.post("/api/interviews/questions/prepare", json={
            "role": "Python Developer",
            "level": "Mid Level",
            "durationMinutes": 15,
            "resumeSkills": ["FastAPI", "Celery", "PostgreSQL", "Redis"],
            "resumeProjects": ["High-Throughput Distributed Microservice"]
        }, headers=headers)
        assert res.status_code == 200
        qs = res.json()["questions"]
        assert len(qs) == 5

        # Must have at least one question referencing the resume project
        has_resume_q = any("High-Throughput Distributed Microservice" in q["question"] for q in qs)
        assert has_resume_q is True

    def test_cross_session_deduplication(self):
        """Verifies questions answered in previous sessions are excluded from future sessions."""
        import uuid
        user_id = f"usr_dedup_{uuid.uuid4().hex[:8]}"
        email = f"{user_id}@test.io"
        db.create_user({
            "id": user_id,
            "name": "Dedup Candidate",
            "email": email,
            "password_hash": "$2b$12$eXampleHashHereForTestingPurposesOnly1234567890",
            "role": "Candidate",
            "verified": 1
        })
        headers = get_test_auth_headers(user_id=user_id, email=email)

        # Session 1: Request 5 questions
        res1 = client.post("/api/interviews/questions/prepare", json={
            "role": "Software Developer",
            "level": "Mid Level",
            "durationMinutes": 15
        }, headers=headers)
        assert res1.status_code == 200
        q1_list = res1.json()["questions"]
        q1_ids = [q["id"] for q in q1_list]

        # Simulate candidate completing interview 1
        save_res = client.post("/api/interviews", json={
            "id": "inv_dedup_1",
            "role": "Software Developer",
            "level": "Mid Level",
            "overallScore": 60,
            "questions": q1_list,
            "answers": [
                {"questionId": q["id"], "question": q["question"], "topic": q.get("topic", "General"), "score": 60, "answer": "Sample answer"}
                for q in q1_list
            ]
        }, headers=headers)
        assert save_res.status_code == 200

        # Session 2: Request next 5 questions for same candidate and role
        res2 = client.post("/api/interviews/questions/prepare", json={
            "role": "Software Developer",
            "level": "Mid Level",
            "durationMinutes": 15
        }, headers=headers)
        assert res2.status_code == 200
        q2_list = res2.json()["questions"]
        q2_ids = [q["id"] for q in q2_list]

        # In pool of 12 questions, second 5 should be distinct from first 5
        overlap = set(q1_ids).intersection(set(q2_ids))
        assert len(overlap) == 0, f"Expected 0 overlap in 12-question bank, found: {overlap}"

    def test_topic_weakness_and_learning_plan_generation(self):
        """Verifies topic scoring bands (<50%, 50-69%, 70-84%, 85-100%) and learning plan generation."""
        answers = [
            {"topic": "Concurrency & GIL", "score": 40, "answer": "Vague answer"},
            {"topic": "Python Memory Management & GC", "score": 45, "answer": "Incomplete answer"},
            {"topic": "FastAPI & Microservices", "score": 75, "answer": "Good answer"},
            {"topic": "Testing & Pytest", "score": 90, "answer": "Excellent answer"}
        ]

        topic_eval = qb.evaluate_topic_breakdown(answers)
        assert "Concurrency & GIL" in topic_eval["topics"]
        assert topic_eval["topics"]["Concurrency & GIL"]["bandKey"] == "priority_improvement"
        assert topic_eval["topics"]["FastAPI & Microservices"]["bandKey"] == "skill_refinement"
        assert topic_eval["topics"]["Testing & Pytest"]["bandKey"] == "advanced_mastery"

        weaknesses = topic_eval["weaknesses"]
        assert len(weaknesses) == 2  # < 70%
        assert weaknesses[0]["topic"] == "Concurrency & GIL"

        learning_plan = qb.generate_learning_plan("Python Developer", weaknesses)
        assert len(learning_plan) == 2
        p1 = learning_plan[0]
        assert p1["topic"] == "Concurrency & GIL"
        assert p1["urgency"] == "High (Priority Focus)"
        assert len(p1["recommendedTasks"]) >= 2
        assert len(p1["practiceQuestions"]) >= 1

    def test_chronological_attempt_scenarios_a_b_c_d(self):
        """
        Comprehensive test of chronological attempt tracking:
        - Scenario A: A1 < 50% initial failure triggers remediation plan
        - Scenario B: A2 < 50% with recurring weak topics triggers persistent gap warning
        - Scenario C: A3 >= 50% with positive delta celebrates improvement and resolved topics
        - Scenario D: Attempt with score >= 85% certifies benchmark readiness
        """
        import uuid
        user_id = f"usr_scen_{uuid.uuid4().hex[:8]}"
        email = f"{user_id}@test.io"
        db.create_user({
            "id": user_id,
            "name": "Scenario Candidate",
            "email": email,
            "password_hash": "$2b$12$eXampleHashHereForTestingPurposesOnly1234567890",
            "role": "Candidate",
            "verified": 1
        })
        headers = get_test_auth_headers(user_id=user_id, email=email)

        # ==================== SCENARIO A: A1 < 50% ====================
        inv_a1 = {
            "id": "inv_scen_a1",
            "role": "Data Analyst",
            "level": "Mid Level",
            "overallScore": 44,
            "answers": [
                {"topic": "Advanced SQL & Window Functions", "score": 38, "answer": "Incorrect window syntax"},
                {"topic": "Data Cleaning & Wrangling", "score": 42, "answer": "Missed imputation trade-offs"},
                {"topic": "Business Metrics & KPI Analysis", "score": 52, "answer": "Basic definitions"}
            ]
        }
        res_a1 = client.post("/api/interviews", json=inv_a1, headers=headers)
        assert res_a1.status_code == 200
        data_a1 = res_a1.json()

        prog_a1 = data_a1["attemptProgression"]
        assert prog_a1["attemptNumber"] == 1
        assert prog_a1["attemptLabel"] == "A1"
        assert prog_a1["overallScore"] == 44
        assert prog_a1["scenario"] == "A"
        assert prog_a1["retryRecommended"] is True
        assert "Targeted Study" in prog_a1["headline"]

        # ==================== SCENARIO B: A2 < 50% (Recurring Weaknesses) ====================
        inv_a2 = {
            "id": "inv_scen_a2",
            "role": "Data Analyst",
            "level": "Mid Level",
            "overallScore": 46,
            "answers": [
                {"topic": "Advanced SQL & Window Functions", "score": 40, "answer": "Still struggling with window partition"},
                {"topic": "Data Cleaning & Wrangling", "score": 43, "answer": "Still low correctness"},
                {"topic": "Business Metrics & KPI Analysis", "score": 55, "answer": "Slight improvement"}
            ]
        }
        res_a2 = client.post("/api/interviews", json=inv_a2, headers=headers)
        assert res_a2.status_code == 200
        data_a2 = res_a2.json()

        prog_a2 = data_a2["attemptProgression"]
        assert prog_a2["attemptNumber"] == 2
        assert prog_a2["attemptLabel"] == "A2"
        assert prog_a2["overallScore"] == 46
        assert prog_a2["scenario"] == "B"
        assert prog_a2["retryRecommended"] is True
        assert len(prog_a2["recurringWeaknesses"]) >= 1
        assert any(rw["topic"] == "Advanced SQL & Window Functions" for rw in prog_a2["recurringWeaknesses"])
        assert "Persistent Topic Gap" in prog_a2["headline"]

        # ==================== SCENARIO C: A3 >= 50% (Improvement & Resolved Weaknesses) ====================
        inv_a3 = {
            "id": "inv_scen_a3",
            "role": "Data Analyst",
            "level": "Mid Level",
            "overallScore": 74,
            "answers": [
                {"topic": "Advanced SQL & Window Functions", "score": 78, "answer": "Mastered ROW_NUMBER and RANK difference"},
                {"topic": "Data Cleaning & Wrangling", "score": 72, "answer": "Solid explanation of median imputation and dropna"},
                {"topic": "Business Metrics & KPI Analysis", "score": 72, "answer": "Detailed cohort retention analysis"}
            ]
        }
        res_a3 = client.post("/api/interviews", json=inv_a3, headers=headers)
        assert res_a3.status_code == 200
        data_a3 = res_a3.json()

        prog_a3 = data_a3["attemptProgression"]
        assert prog_a3["attemptNumber"] == 3
        assert prog_a3["attemptLabel"] == "A3"
        assert prog_a3["overallScore"] == 74
        assert prog_a3["scenario"] == "C"
        assert prog_a3["deltaFromA1"] == 30.0  # 74 - 44 = +30
        assert len(prog_a3["resolvedWeaknesses"]) >= 2
        assert any(rw["topic"] == "Advanced SQL & Window Functions" for rw in prog_a3["resolvedWeaknesses"])
        assert "Measurable Improvement" in prog_a3["headline"]

        # ==================== SCENARIO D: A4 >= 85% (Benchmark Mastered) ====================
        inv_a4 = {
            "id": "inv_scen_a4",
            "role": "Data Analyst",
            "level": "Mid Level",
            "overallScore": 88,
            "answers": [
                {"topic": "Advanced SQL & Window Functions", "score": 90, "answer": "Flawless execution"},
                {"topic": "Data Cleaning & Wrangling", "score": 86, "answer": "Production grade pipeline"},
                {"topic": "Business Metrics & KPI Analysis", "score": 88, "answer": "Executive level metric defense"}
            ]
        }
        res_a4 = client.post("/api/interviews", json=inv_a4, headers=headers)
        assert res_a4.status_code == 200
        data_a4 = res_a4.json()

        prog_a4 = data_a4["attemptProgression"]
        assert prog_a4["attemptNumber"] == 4
        assert prog_a4["attemptLabel"] == "A4"
        assert prog_a4["overallScore"] == 88
        assert prog_a4["scenario"] == "D"
        assert "Benchmark Mastered" in prog_a4["headline"]
        assert prog_a4["retryRecommended"] is False

        # ==================== Test GET /api/candidates/progress ====================
        prog_endpoint_res = client.get("/api/candidates/progress?role=Data Analyst", headers=headers)
        assert prog_endpoint_res.status_code == 200
        pe_data = prog_endpoint_res.json()
        assert pe_data["success"] is True
        assert pe_data["totalAttempts"] == 4
        assert len(pe_data["attempts"]) == 4
        assert pe_data["latestAttempt"]["overallScore"] == 88
        assert pe_data["progression"]["scenario"] == "D"
        assert len(pe_data["progression"]["historyTrajectory"]) == 4

        # Verify A1 to A4 trajectory
        traj = pe_data["progression"]["historyTrajectory"]
        assert traj[0]["attempt"] == "A1"
        assert traj[0]["overallScore"] == 44.0
        assert traj[1]["attempt"] == "A2"
        assert traj[1]["overallScore"] == 46.0
        assert traj[2]["attempt"] == "A3"
        assert traj[2]["overallScore"] == 74.0
        assert traj[3]["attempt"] == "A4"
        assert traj[3]["overallScore"] == 88.0
