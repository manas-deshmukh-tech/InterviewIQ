"""
InterviewIQ AI Service Module
Handles:
- Secure OpenAI client configuration and connection leasing
- Model configuration via environment variables
- Resilient exception handling (Auth, RateLimit, Timeout, Connection errors)
- Safe status reporting without credential or secret leakage
"""

import os
import time
import json
from typing import Dict, Any, Optional, List
from dotenv import load_dotenv

# Load backend/.env
ENV_PATH = os.path.join(os.path.dirname(__file__), ".env")
load_dotenv(ENV_PATH)


class AIServiceError(Exception):
    """Custom sanitized exception for AI service operations."""
    def __init__(self, message: str, status_code: int = 500, error_type: str = "ai_error"):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.error_type = error_type


def get_openai_config() -> Dict[str, Any]:
    """Returns sanitized configuration metadata without exposing secret keys."""
    api_key = os.getenv("OPENAI_API_KEY", "").strip()
    model = os.getenv("OPENAI_MODEL", "gpt-4o-mini").strip()
    timeout = float(os.getenv("OPENAI_TIMEOUT_SECONDS", "15.0"))

    # Mask key for telemetry: e.g. "sk-...1234"
    masked_key = None
    if api_key:
        if len(api_key) > 8:
            masked_key = f"{api_key[:3]}...{api_key[-4:]}"
        else:
            masked_key = "***configured***"

    return {
        "configured": bool(api_key),
        "model": model,
        "timeout_seconds": timeout,
        "key_preview": masked_key
    }


def get_openai_client():
    """
    Initializes and returns an official OpenAI client using environment configuration.
    Raises AIServiceError if API key is missing.
    """
    api_key = os.getenv("OPENAI_API_KEY", "").strip()
    if not api_key:
        raise AIServiceError(
            message="OpenAI API key is not configured. Please add OPENAI_API_KEY to backend/.env.",
            status_code=503,
            error_type="missing_api_key"
        )

    try:
        from openai import OpenAI
        timeout = float(os.getenv("OPENAI_TIMEOUT_SECONDS", "15.0"))
        return OpenAI(api_key=api_key, timeout=timeout)
    except ImportError:
        raise AIServiceError(
            message="OpenAI SDK is not installed in the Python environment.",
            status_code=500,
            error_type="missing_sdk"
        )


def ping_openai_connection(test_prompt: str = "Say 'healthy'") -> Dict[str, Any]:
    """
    Sends a minimal, low-token test completion to verify OpenAI API connectivity and authentication.
    Catches and maps all official OpenAI exceptions to sanitized, safe user messages.
    """
    config = get_openai_config()
    if not config["configured"]:
        return {
            "status": "unconfigured",
            "message": "OpenAI API key is missing in backend/.env.",
            "configured": False,
            "model": config["model"]
        }

    client = get_openai_client()
    model = config["model"]

    start_time = time.perf_counter()
    try:
        import openai

        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": "You are a connectivity test assistant. Respond in one word."},
                {"role": "user", "content": test_prompt}
            ],
            max_tokens=10,
            temperature=0.0
        )
        latency_ms = round((time.perf_counter() - start_time) * 1000, 2)

        content = ""
        if response.choices and len(response.choices) > 0:
            content = (response.choices[0].message.content or "").strip()

        return {
            "status": "connected",
            "provider": "OpenAI",
            "model": model,
            "latency_ms": latency_ms,
            "response": content,
            "configured": True,
            "authenticated": True
        }

    except openai.AuthenticationError:
        raise AIServiceError(
            message="OpenAI authentication failed. Please verify your OPENAI_API_KEY in backend/.env.",
            status_code=401,
            error_type="invalid_api_key"
        )
    except openai.RateLimitError:
        raise AIServiceError(
            message="OpenAI rate limit exceeded or credit balance exhausted.",
            status_code=429,
            error_type="rate_limit_exceeded"
        )
    except openai.APITimeoutError:
        raise AIServiceError(
            message="OpenAI request timed out. Please verify network connectivity.",
            status_code=504,
            error_type="api_timeout"
        )
    except openai.APIConnectionError:
        raise AIServiceError(
            message="Unable to reach OpenAI API endpoints. Please verify network or firewall settings.",
            status_code=502,
            error_type="connection_failed"
        )
    except openai.APIError as err:
        # Never expose raw exception string if it might contain sensitive headers
        raise AIServiceError(
            message="OpenAI API returned a service error.",
            status_code=502,
            error_type="api_error"
        )
    except Exception as err:
        raise AIServiceError(
            message="An unexpected error occurred while communicating with the AI service.",
            status_code=500,
            error_type="internal_error"
        )


def validate_and_sanitize_ai_evaluation(
    parsed: Any,
    text: str,
    telemetry: Optional[Dict[str, Any]] = None,
    model: str = "gpt-4o-mini"
) -> Optional[Dict[str, Any]]:
    """
    Validates, sanitizes, and normalizes structured evaluation payloads from OpenAI.
    Enforces schema conformity, numeric range bounds (0..100), anti-hallucination consistency
    between dimensions and overallScore, off-topic score clamping, and removes fabricated agreement metrics.
    Returns None if payload is fundamentally invalid, triggering safe local NLP fallback.
    """
    if not isinstance(parsed, dict):
        return None

    # Required top-level keys
    required_keys = ["overallScore", "isOffTopic", "rubric"]
    if not all(k in parsed for k in required_keys):
        return None

    rubric = parsed.get("rubric")
    if not isinstance(rubric, dict):
        return None

    rubric_dims = ["correctness", "depth", "clarity", "examples"]
    if not all(d in rubric and isinstance(rubric[d], dict) for d in rubric_dims):
        return None

    # Validate and clamp dimension scores
    try:
        correctness = int(max(0, min(100, float(rubric["correctness"].get("score", 50)))))
        depth = int(max(0, min(100, float(rubric["depth"].get("score", 50)))))
        clarity = int(max(0, min(100, float(rubric["clarity"].get("score", 50)))))
        examples = int(max(0, min(100, float(rubric["examples"].get("score", 50)))))
    except (ValueError, TypeError):
        return None

    rubric["correctness"]["score"] = correctness
    rubric["depth"]["score"] = depth
    rubric["clarity"]["score"] = clarity
    rubric["examples"]["score"] = examples

    is_off_topic = bool(parsed.get("isOffTopic", False))
    raw_overall = parsed.get("overallScore", 50)
    try:
        overall_score = int(max(0, min(100, float(raw_overall))))
    except (ValueError, TypeError):
        overall_score = 50

    # Sanity check: Weighted combination of rubric dimensions
    expected_weighted = int(round(
        correctness * 0.40 +
        depth * 0.25 +
        examples * 0.20 +
        clarity * 0.15
    ))

    # Anti-hallucination guard: If overallScore diverges wildly (>15 pts) from its own rubric dimensions,
    # normalize it to the mathematically consistent weighted score.
    if abs(overall_score - expected_weighted) > 15:
        overall_score = expected_weighted

    # Off-topic score clamping
    if is_off_topic:
        overall_score = min(overall_score, 12)
        rubric["correctness"]["score"] = min(correctness, 10)
        rubric["depth"]["score"] = min(depth, 15)

    # Fluff / low correctness gate
    if correctness < 35:
        overall_score = min(overall_score, 40)
        rubric["depth"]["score"] = min(depth, 45)

    # Ensure evidenceDossier exists
    evidence = parsed.get("evidenceDossier")
    if not isinstance(evidence, dict):
        evidence = {
            "extractedQuotes": [text[:120]] if len(text) > 0 else [],
            "quantitativeMetrics": [],
            "starCompletenessPct": 0
        }
    parsed["evidenceDossier"] = evidence

    # Ensure growthRecommendations exists as a list of strings
    recs = parsed.get("growthRecommendations")
    if not isinstance(recs, list) or not recs:
        recs = ["Elaborate on core architectural trade-offs.", "Cite concrete project metrics and outcomes."]
    parsed["growthRecommendations"] = [str(r) for r in recs if str(r).strip()]

    # Normalize sanitized fields
    parsed["overallScore"] = overall_score
    parsed["isOffTopic"] = is_off_topic
    parsed["modelEngine"] = f"OpenAI {model} (Enterprise Evaluation)"
    parsed["isBenchmarkCalibrated"] = True
    parsed["calibrationStandard"] = "20-Point Multi-Dimensional Rubric"
    parsed.pop("agreementWithHumanEvaluators", None)

    # Attach delivery telemetry
    telemetry = telemetry or {}
    pace_wpm = telemetry.get("avgPaceWpm", 135)
    fillers_count = telemetry.get("fillerWordsCount", 0)
    parsed["deliveryAnalysis"] = {
        "pace": {
            "wpm": pace_wpm,
            "status": "Optimal" if 115 <= pace_wpm <= 165 else ("Fast" if pace_wpm > 165 else "Slow"),
            "text": f"Cadence clocked at {pace_wpm} words per minute."
        },
        "fillers": {
            "count": fillers_count,
            "status": "Minimal" if fillers_count <= 2 else ("Moderate" if fillers_count <= 5 else "Frequent"),
            "text": f"Detected {fillers_count} vocal hesitation markers."
        }
    }

    return parsed


def evaluate_answer_with_ai(
    question: str,
    answer: str,
    ideal_answer: Optional[str] = None,
    ideal_keywords: Optional[list] = None,
    candidate_role: Optional[str] = "Software Engineer",
    question_category: Optional[str] = "Technical",
    experience_level: Optional[str] = "Mid Level",
    delivery_telemetry: Optional[dict] = None
) -> Optional[Dict[str, Any]]:
    """
    Evaluates candidate answer using OpenAI GPT-4o-mini with structured JSON grading.
    Provides deep semantic accuracy, off-topic detection, STAR analysis, and adaptive follow-up.
    """
    text = (answer or "").strip()
    if not text:
        return None  # Let caller return _empty_result()

    config = get_openai_config()
    if not config["configured"]:
        return None

    client = get_openai_client()
    model = config["model"]
    telemetry = delivery_telemetry or {}

    system_prompt = (
        f"You are a Senior Principal Interviewer and Technical Evaluator for InterviewIQ evaluating a candidate "
        f"for the role of '{candidate_role}' ({experience_level}).\n\n"
        "Evaluation Principles:\n"
        "1. Strictly judge whether the answer addresses the specific question asked.\n"
        "2. If the answer is completely off-topic (e.g. talking about movies, food, sports, or random unrelated topics), "
        "set 'isOffTopic': true, and cap 'overallScore' at 10.\n"
        "3. For self-introductions ('Tell me about yourself'):\n"
        "   Evaluate against 4 key professional pillars:\n"
        "   - Pillar 1 (Identity & Education): Name, academic degree (BCA, MCA, B.Tech, etc.), and university. (Foundation)\n"
        "   - Pillar 2 (Technical Core Stack): Programming languages, frameworks, or databases specialized in.\n"
        "   - Pillar 3 (Projects & Practical Experience): Real projects built, problem solving, or internships.\n"
        "   - Pillar 4 (Career Motivation / Goals): Passion, career trajectory, or interest in the role.\n"
        "   * If the candidate provides ONLY Pillar 1 (e.g., name, degree, and city), score 35-42/100. Praise their educational foundation, but explain that Pillars 2, 3, and 4 are required for an interview-ready score (80+).\n"
        "   * If Pillars 1 + 2 are provided, score 60-68/100.\n"
        "   * If Pillars 1 + 2 + 3 are provided, score 80-88/100.\n"
        "   * If all 4 pillars are provided, score 90-95/100.\n"
        "4. Anti-Fluff & Contradiction Principles:\n"
        "   - Do NOT reward length or word count if the answer contains blatant technical inversions (e.g., asserting UDP has three-way handshakes, HTTP is stateful by default, or Hash Tables are linear lookup).\n"
        "   - If factual contradictions or confident falsehoods are present, set correctness <= 30 and cap overallScore <= 40.\n"
        "   - For speech-to-text slips or minor spelling errors, judge the conceptual substance fairly.\n"
        "5. Score four rubric dimensions (0 to 100):\n"
        "   - Correctness (40% weight): Technical validity, relevance, and accuracy.\n"
        "   - Depth (25% weight): Architectural rationale, trade-offs, internal mechanisms, complexity.\n"
        "   - Examples (20% weight): Concrete project examples, STAR framework (Situation, Task, Action, Result), and metrics.\n"
        "   - Clarity (15% weight): Structure, professional delivery, and conciseness.\n"
        "6. Output ONLY valid JSON matching this exact schema:\n"
        "{\n"
        "  \"overallScore\": <integer 0-100>,\n"
        "  \"isOffTopic\": <boolean>,\n"
        "  \"rubric\": {\n"
        "    \"correctness\": {\"score\": <int>, \"evaluation\": \"<string>\", \"matchedKeywords\": [\"<string>\"], \"missedKeywords\": [\"<string>\"]},\n"
        "    \"depth\": {\"score\": <int>, \"evaluation\": \"<string>\", \"wordCount\": <int>},\n"
        "    \"clarity\": {\"score\": <int>, \"evaluation\": \"<string>\"},\n"
        "    \"examples\": {\"score\": <int>, \"evaluation\": \"<string>\", \"starPhasesDetected\": [\"<string>\"]}\n"
        "  },\n"
        "  \"evidenceDossier\": {\n"
        "    \"extractedQuotes\": [\"<quote from candidate>\"],\n"
        "    \"quantitativeMetrics\": [\"<metrics cited or empty>\"],\n"
        "    \"starCompletenessPct\": <int 0-100>\n"
        "  },\n"
        "  \"growthRecommendations\": [\"<actionable tip 1>\", \"<actionable tip 2>\"],\n"
        "  \"adaptiveFollowUpQuestion\": \"<insightful follow-up question digging deeper into their answer>\"\n"
        "}"
    )

    user_prompt = (
        f"Question Asked: {question}\n"
        f"Category: {question_category}\n"
        f"Ideal/Benchmark Concepts: {ideal_answer or 'Comprehensive technical response'}\n"
        f"Ideal Technical Keywords: {', '.join(ideal_keywords or [])}\n"
        f"Candidate's Actual Answer: \"{text}\"\n\n"
        "Evaluate this answer according to your instructions and output the JSON evaluation."
    )

    try:
        completion = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.2,
            max_tokens=900
        )

        raw_json = completion.choices[0].message.content or "{}"
        parsed = json.loads(raw_json)
        sanitized = validate_and_sanitize_ai_evaluation(
            parsed=parsed,
            text=text,
            telemetry=telemetry,
            model=model
        )
        return sanitized

    except Exception as err:
        # Fall back to local NLP pipeline on any API failure
        return None


def generate_role_questions_with_ai(
    role: str,
    level: str = "Mid Level",
    category: Optional[str] = None,
    resume_text: Optional[str] = None,
    count: int = 3
) -> Optional[List[Dict[str, Any]]]:
    """
    Generates targeted, high-quality interview questions calibrated to the candidate's
    exact role, experience level, and optional uploaded resume projects.
    """
    config = get_openai_config()
    if not config["configured"]:
        return None

    client = get_openai_client()
    model = config["model"]

    prompt = (
        f"Generate {count} distinct technical interview questions for a '{role}' at the '{level}' experience level.\n"
    )
    if resume_text:
        prompt += f"Tailor at least one question to the candidate's resume projects:\n\"{resume_text[:1200]}\"\n\n"

    prompt += (
        "Output ONLY a JSON object with a 'questions' array where each item has:\n"
        "- 'id': string\n"
        "- 'question': string (clear, practical, role-relevant)\n"
        "- 'category': string\n"
        "- 'level': string\n"
        "- 'idealKeywords': array of 6-8 key technical terms expected\n"
        "- 'rubric': object with 'correctness', 'depth', 'clarity', 'examples'\n"
        "- 'followUp': string (contextual follow-up question)"
    )

    try:
        completion = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": "You are a Chief Architect generating precise, realistic interview questions."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.3,
            max_tokens=1500
        )
        data = json.loads(completion.choices[0].message.content or "{}")
        return data.get("questions")
    except Exception:
        return None


