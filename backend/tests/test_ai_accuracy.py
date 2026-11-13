import os
import sys
from unittest.mock import MagicMock, patch
import pytest
from fastapi.testclient import TestClient

# Ensure backend directory is in path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from main import app
from nlp_analyzer import NLPInterviewAnalyzer
import ai_service


@pytest.fixture(scope="session")
def client():
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def analyzer():
    return NLPInterviewAnalyzer()


# ---------------------------------------------------------
# 1. Zero Score for Empty or Silent Answers
# ---------------------------------------------------------
def test_empty_or_whitespace_answer_scored_zero(client, analyzer):
    # Direct Analyzer Unit Test
    res_empty = analyzer.analyze_answer("Explain database indexing.", "")
    assert res_empty["overallScore"] == 0
    assert res_empty["rubric"]["correctness"]["score"] == 0
    assert "No audible or typed response" in res_empty["rubric"]["correctness"]["evaluation"]

    res_spaces = analyzer.analyze_answer("Explain database indexing.", "   \n\t  ")
    assert res_spaces["overallScore"] == 0

    # API Endpoint Integration Test
    api_res = client.post("/api/evaluate", json={
        "question": "Explain database indexing.",
        "answer": "",
        "idealAnswer": "B-Tree indexes speed up lookups from O(N) to O(log N).",
        "idealKeywords": ["b-tree", "indexing", "lookup", "o(log n)"]
    })
    assert api_res.status_code == 200
    data = api_res.json()["data"]
    assert data["overallScore"] == 0
    assert data["rubric"]["correctness"]["score"] == 0


# ---------------------------------------------------------
# 2. Strict Off-Topic Detection & Score Cap
# ---------------------------------------------------------
def test_strictly_off_topic_answer_scored_low(client, analyzer):
    off_topic_answer = "I really love playing cricket and eating cheese pizza with my friends on sunny weekends."
    tech_question = "Explain the difference between TCP and UDP protocols in computer networking."

    res = analyzer.analyze_answer(
        question=tech_question,
        answer=off_topic_answer,
        ideal_answer="TCP is connection-oriented and reliable with 3-way handshake; UDP is connectionless with low latency.",
        ideal_keywords=["tcp", "udp", "connection-oriented", "connectionless", "handshake", "reliable", "latency"]
    )

    assert res["overallScore"] <= 10
    assert res["rubric"]["correctness"]["score"] <= 10
    assert "Off-Topic" in res["rubric"]["correctness"]["evaluation"]

    # API Endpoint Integration Test
    api_res = client.post("/api/evaluate", json={
        "question": tech_question,
        "answer": off_topic_answer,
        "idealAnswer": "TCP is connection-oriented and reliable; UDP is connectionless.",
        "idealKeywords": ["tcp", "udp", "connection-oriented", "connectionless"]
    })
    assert api_res.status_code == 200
    data = api_res.json()["data"]
    assert data["overallScore"] <= 10


# ---------------------------------------------------------
# 3. Candidate Self-Introduction Calibration
# ---------------------------------------------------------
def test_self_introduction_foundational_calibration(client, analyzer):
    intro_question = "Tell me about yourself."
    manaj_answer = "My name is Manaj Deshmukh I have completed my bachelors degree in computer application and I am from Naik"

    res = analyzer.analyze_answer(
        question=intro_question,
        answer=manaj_answer,
        ideal_answer="Candidate introduces name, educational degree (BCA/MCA), technical skills (Python, SQL), and projects.",
        ideal_keywords=["experience", "degree", "projects", "skills", "fullstack", "bachelors", "computer"]
    )

    # Must NOT be marked off-topic
    assert "Off-Topic" not in res["rubric"]["correctness"]["evaluation"]
    # Must be given calibrated foundational credit (38-48) for opening introduction with identity and degree
    assert 38 <= res["overallScore"] <= 48
    # Must include actionable 3-part formula in coaching tips
    tips = res["growthRecommendations"]
    assert any("3-Part" in t or "Self-Introduction" in t for t in tips)


# ---------------------------------------------------------
# 4. High-Quality Technical Response Scoring
# ---------------------------------------------------------
def test_deep_technical_answer_high_score(client, analyzer):
    question = "Explain the difference between TCP and UDP protocols."
    answer = (
        "TCP is a connection-oriented protocol that guarantees delivery using a three-way handshake, "
        "flow control, and error checking mechanisms. In contrast, UDP is connectionless and prioritizes "
        "low latency without packet delivery guarantees, making it suitable for live streaming, gaming, and DNS lookups."
    )
    ideal_keywords = ["tcp", "udp", "connection-oriented", "connectionless", "handshake", "latency", "reliable"]

    res = analyzer.analyze_answer(
        question=question,
        answer=answer,
        ideal_answer="TCP is reliable and connection-oriented with 3-way handshake; UDP is connectionless.",
        ideal_keywords=ideal_keywords
    )

    assert res["overallScore"] >= 75
    assert res["rubric"]["correctness"]["score"] >= 80
    assert len(res["rubric"]["correctness"]["matchedKeywords"]) >= 4


# ---------------------------------------------------------
# 5. Scoring Consistency Across Similar Phrasings
# ---------------------------------------------------------
def test_scoring_consistency_similar_answers(analyzer):
    question = "What is database indexing and why is it used?"
    ideal_keywords = ["b-tree", "lookup", "performance", "query", "o(log n)", "primary key"]

    ans_a = "Database indexing creates a B-Tree data structure to speed up query lookups from O(N) to O(log N) at the cost of write overhead."
    ans_b = "An index in a database uses B-Tree structures to accelerate select queries, reducing time complexity to O(log N) while adding some insert overhead."

    res_a = analyzer.analyze_answer(question, ans_a, ideal_keywords=ideal_keywords)
    res_b = analyzer.analyze_answer(question, ans_b, ideal_keywords=ideal_keywords)

    score_diff = abs(res_a["overallScore"] - res_b["overallScore"])
    # Scores must be consistent within 5 points
    assert score_diff <= 5


# ---------------------------------------------------------
# 6. Mocked OpenAI Advanced AI Evaluation
# ---------------------------------------------------------
def test_openai_ai_evaluation_mocked():
    mock_eval_payload = {
        "overallScore": 86,
        "isOffTopic": False,
        "rubric": {
            "correctness": {"score": 88, "evaluation": "Accurate technical explanation", "matchedKeywords": ["TCP", "UDP"], "missedKeywords": []},
            "depth": {"score": 84, "evaluation": "Clear trade-off coverage", "wordCount": 42},
            "clarity": {"score": 88, "evaluation": "Crisp and concise"},
            "examples": {"score": 82, "evaluation": "Cited streaming and gaming cases", "starPhasesDetected": ["Situation", "Action"]}
        },
        "evidenceDossier": {
            "extractedQuotes": ["TCP is a connection-oriented protocol that guarantees delivery"],
            "quantitativeMetrics": [],
            "starCompletenessPct": 50
        },
        "growthRecommendations": ["Elaborate on TCP windowing and congestion control."],
        "adaptiveFollowUpQuestion": "How does TCP handle head-of-line blocking in HTTP/2 compared to HTTP/3 over QUIC?"
    }

    mock_choice = MagicMock()
    mock_choice.message.content = str(mock_eval_payload).replace("'", '"').replace("False", "false")
    mock_response = MagicMock()
    mock_response.choices = [mock_choice]

    with patch.dict(os.environ, {"OPENAI_API_KEY": "sk-mock-valid-key-for-test"}):
        with patch("openai.OpenAI") as mock_openai_cls:
            mock_client = MagicMock()
            mock_client.chat.completions.create.return_value = mock_response
            mock_openai_cls.return_value = mock_client

            result = ai_service.evaluate_answer_with_ai(
                question="Explain TCP vs UDP.",
                answer="TCP is connection-oriented; UDP is connectionless.",
                candidate_role="Backend Engineer",
                experience_level="Mid Level"
            )

            assert result is not None
            assert result["overallScore"] == 86
            assert result["isOffTopic"] is False
            assert "adaptiveFollowUpQuestion" in result
            assert "HEAD-OF-LINE" in result["adaptiveFollowUpQuestion"].upper()
            assert result["modelEngine"].startswith("OpenAI")


def test_adaptive_follow_up_generated_by_nlp_analyzer(analyzer):
    # Case 1: Self intro prompts project deep dive
    intro_res = analyzer.analyze_answer(
        "Tell me about yourself.",
        "My name is Amit. I completed my Bachelor in Computer Applications."
    )
    assert "adaptiveFollowUpQuestion" in intro_res
    assert intro_res["adaptiveFollowUpQuestion"] is not None
    assert "project" in intro_res["adaptiveFollowUpQuestion"].lower()

    # Case 2: Missed keyword prompts follow up on that concept
    tech_res = analyzer.analyze_answer(
        "Explain Redis caching strategies.",
        "We used a cache to store session data in memory.",
        ideal_keywords=["cache-aside", "write-through", "eviction", "ttl"]
    )
    assert "adaptiveFollowUpQuestion" in tech_res
    assert tech_res["adaptiveFollowUpQuestion"] is not None


def test_generate_questions_endpoint_integration(client):
    import security
    token = security.create_access_token({"sub": "usr_cand_1", "role": "Candidate"})
    headers = {"Authorization": f"Bearer {token}"}

    res = client.post("/api/ai/generate-questions", headers=headers, json={
        "role": "Full Stack Engineer",
        "level": "Senior",
        "category": "Software & Engineering",
        "count": 2
    })
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert len(data["questions"]) == 2
    q1 = data["questions"][0]
    assert "question" in q1
    assert "idealKeywords" in q1
    assert "rubric" in q1


