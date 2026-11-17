"""
InterviewIQ Accuracy, Calibration & Reliability Benchmark Test Suite
Runs the comprehensive evaluation dataset across all scenario types,
measures Mean Absolute Error (MAE), enforces anti-fluff / false-positive guardrails,
and verifies graduated self-introduction calibration and paraphrase consistency.
"""

import pytest
from typing import Dict, Any, List
from nlp_analyzer import NLPInterviewAnalyzer
from tests.evaluation_dataset import EVALUATION_DATASET


@pytest.fixture(scope="module")
def analyzer():
    return NLPInterviewAnalyzer()


# -----------------------------------------------------------------------------
# 1. Full Dataset Calibration Benchmark
# -----------------------------------------------------------------------------
def test_comprehensive_benchmark_calibration(analyzer):
    total_cases = len(EVALUATION_DATASET)
    within_band_count = 0
    errors = []
    category_metrics: Dict[str, List[float]] = {}
    level_metrics: Dict[str, List[float]] = {}

    for tc in EVALUATION_DATASET:
        res = analyzer.analyze_answer(
            question=tc["question"],
            answer=tc["answer"],
            ideal_answer=tc["ideal_answer"],
            ideal_keywords=tc["ideal_keywords"],
            candidate_role=tc["role"],
            question_category=tc["category"],
            experience_level=tc["experience_level"]
        )

        score = res["overallScore"]
        band_low, band_high = tc["expected_band"]
        midpoint = (band_low + band_high) / 2.0
        error = abs(score - midpoint)
        errors.append(error)

        cat = tc["category"]
        category_metrics.setdefault(cat, []).append(error)

        lvl = tc["experience_level"]
        level_metrics.setdefault(lvl, []).append(error)

        # Off-topic alignment check
        if tc["is_off_topic"]:
            assert res.get("is_off_topic") or score <= 10, f"Failed off-topic check for {tc['id']}"

        # Hard boundary enforcement: Catch false positives and false negatives
        assert tc["min_acceptable_score"] <= score <= tc["max_acceptable_score"], (
            f"Test case {tc['id']} ({tc['case_type']}) score {score} outside acceptable range "
            f"[{tc['min_acceptable_score']}, {tc['max_acceptable_score']}]. Expected band: {tc['expected_band']}"
        )

        if band_low <= score <= band_high:
            within_band_count += 1

    mae = sum(errors) / total_cases
    band_accuracy_pct = (within_band_count / total_cases) * 100

    print(f"\n================ BENCHMARK REPORT ================")
    print(f"Total Test Cases Evaluated: {total_cases}")
    print(f"Mean Absolute Error (MAE): {mae:.2f} points (Target: < 7.0)")
    print(f"Exact Target Band Accuracy: {band_accuracy_pct:.1f}% ({within_band_count}/{total_cases})")
    print(f"False Positives Detected: 0 (100% guarded against confident fluff / keyword soup)")
    print(f"False Negatives Detected: 0 (100% guarded on correct technical answers)")

    for cat, errs in category_metrics.items():
        print(f"  Category '{cat}' MAE: {sum(errs)/len(errs):.2f} pts (n={len(errs)})")
    for lvl, errs in level_metrics.items():
        print(f"  Level '{lvl}' MAE: {sum(errs)/len(errs):.2f} pts (n={len(errs)})")
    print("==================================================\n")

    # MAE must be less than 7 points across all edge cases
    assert mae < 7.0, f"Mean Absolute Error too high: {mae:.2f}"
    # At least 80% of edge-case answers must fall strictly inside target calibration band
    assert band_accuracy_pct >= 80.0


# -----------------------------------------------------------------------------
# 2. Anti-Fluff & Contradiction Guardrail Tests
# -----------------------------------------------------------------------------
def test_confident_fluff_penalized(analyzer):
    """Confident but factually inverted answers must NEVER receive passing scores."""
    fluff_case = next(tc for tc in EVALUATION_DATASET if tc["id"] == "TC-CONFIDENT-FLUFF-01")
    res = analyzer.analyze_answer(
        question=fluff_case["question"],
        answer=fluff_case["answer"],
        ideal_keywords=fluff_case["ideal_keywords"]
    )
    # Must be capped at <= 38
    assert res["overallScore"] <= 38
    assert res["rubric"]["correctness"]["score"] <= 30
    assert any("Factual Inversion" in q for q in res["evidenceDossier"]["extractedQuotes"])


def test_keyword_soup_without_substance(analyzer):
    """Answers merely reciting technical keywords without sentences must score low."""
    soup_case = next(tc for tc in EVALUATION_DATASET if tc["id"] == "TC-KEYWORD-SOUP-01")
    res = analyzer.analyze_answer(
        question=soup_case["question"],
        answer=soup_case["answer"],
        ideal_keywords=soup_case["ideal_keywords"]
    )
    assert res["overallScore"] <= 45


# -----------------------------------------------------------------------------
# 3. Graduated 4-Pillar Self-Introduction Monotonicity
# -----------------------------------------------------------------------------
def test_graduated_self_introduction_monotonicity(analyzer):
    """
    Validates that self-introduction scores strictly increase as candidates provide:
    Level 1 (Identity/Education) < Level 2 (+Stack) < Level 3 (+Projects) < Level 4 (+Goals)
    """
    tc_l1 = next(tc for tc in EVALUATION_DATASET if tc["id"] == "TC-INTRO-LEVEL-1")
    tc_l2 = next(tc for tc in EVALUATION_DATASET if tc["id"] == "TC-INTRO-LEVEL-2")
    tc_l3 = next(tc for tc in EVALUATION_DATASET if tc["id"] == "TC-INTRO-LEVEL-3")
    tc_l4 = next(tc for tc in EVALUATION_DATASET if tc["id"] == "TC-INTRO-LEVEL-4")

    res_l1 = analyzer.analyze_answer(tc_l1["question"], tc_l1["answer"], ideal_keywords=tc_l1["ideal_keywords"])
    res_l2 = analyzer.analyze_answer(tc_l2["question"], tc_l2["answer"], ideal_keywords=tc_l2["ideal_keywords"])
    res_l3 = analyzer.analyze_answer(tc_l3["question"], tc_l3["answer"], ideal_keywords=tc_l3["ideal_keywords"])
    res_l4 = analyzer.analyze_answer(tc_l4["question"], tc_l4["answer"], ideal_keywords=tc_l4["ideal_keywords"])

    s1 = res_l1["overallScore"]
    s2 = res_l2["overallScore"]
    s3 = res_l3["overallScore"]
    s4 = res_l4["overallScore"]

    # Monotonic progression
    assert s1 < s2 < s3 < s4, f"Introduction scores must strictly increase: L1={s1}, L2={s2}, L3={s3}, L4={s4}"
    # Specific calibrated bands
    assert 38 <= s1 <= 48, f"Level 1 intro score {s1} out of bounds [38, 48]"
    assert 58 <= s2 <= 70, f"Level 2 intro score {s2} out of bounds [58, 70]"
    assert 78 <= s3 <= 88, f"Level 3 intro score {s3} out of bounds [78, 88]"
    assert 88 <= s4 <= 96, f"Level 4 intro score {s4} out of bounds [88, 96]"


# -----------------------------------------------------------------------------
# 4. Paraphrase Consistency Test
# -----------------------------------------------------------------------------
def test_paraphrase_consistency(analyzer):
    """Paraphrased versions of the same technical concept must score within 5 points of each other."""
    tc_a = next(tc for tc in EVALUATION_DATASET if tc["id"] == "TC-PARAPHRASE-A")
    tc_b = next(tc for tc in EVALUATION_DATASET if tc["id"] == "TC-PARAPHRASE-B")

    res_a = analyzer.analyze_answer(tc_a["question"], tc_a["answer"], ideal_keywords=tc_a["ideal_keywords"])
    res_b = analyzer.analyze_answer(tc_b["question"], tc_b["answer"], ideal_keywords=tc_b["ideal_keywords"])

    diff = abs(res_a["overallScore"] - res_b["overallScore"])
    assert diff <= 5, f"Paraphrase score difference {diff} exceeds maximum tolerance of 5 points."


# -----------------------------------------------------------------------------
# 5. Speech-to-Text Typo & Transcription Artifact Resilience
# -----------------------------------------------------------------------------
def test_typo_and_transcription_resilience(analyzer):
    """Phonetic slips or minor spelling variations from voice recognition must not cause severe drops."""
    tc_typo = next(tc for tc in EVALUATION_DATASET if tc["id"] == "TC-TYPO-SPELLING-01")
    res = analyzer.analyze_answer(
        tc_typo["question"],
        tc_typo["answer"],
        ideal_keywords=tc_typo["ideal_keywords"]
    )
    # Should recognize indexing, b-tree, query despite typos
    assert res["overallScore"] >= 50
    assert len(res["rubric"]["correctness"]["matchedKeywords"]) >= 2


# -----------------------------------------------------------------------------
# 6. OpenAI AI Sanitization & Anti-Hallucination Guardrails
# -----------------------------------------------------------------------------
def test_ai_sanitization_enforces_numeric_bounds():
    from ai_service import validate_and_sanitize_ai_evaluation

    # AI returns out-of-bounds numbers (e.g. 150 correctness, -20 depth)
    malformed = {
        "overallScore": 120,
        "isOffTopic": False,
        "rubric": {
            "correctness": {"score": 150, "evaluation": "Good"},
            "depth": {"score": -20, "evaluation": "Brief"},
            "clarity": {"score": 90, "evaluation": "Clear"},
            "examples": {"score": 80, "evaluation": "Solid"}
        }
    }
    sanitized = validate_and_sanitize_ai_evaluation(malformed, text="some answer")
    assert sanitized is not None
    assert 0 <= sanitized["overallScore"] <= 100
    assert sanitized["rubric"]["correctness"]["score"] == 100
    assert sanitized["rubric"]["depth"]["score"] == 0


def test_ai_sanitization_realigns_hallucinated_overall_score():
    from ai_service import validate_and_sanitize_ai_evaluation

    # AI returns overallScore 95 despite rubric dimensions scoring poorly (20, 25, 30, 15)
    hallucinated = {
        "overallScore": 95,
        "isOffTopic": False,
        "rubric": {
            "correctness": {"score": 20, "evaluation": "Inaccurate"},
            "depth": {"score": 25, "evaluation": "Shallow"},
            "clarity": {"score": 30, "evaluation": "Muddled"},
            "examples": {"score": 15, "evaluation": "None"}
        }
    }
    sanitized = validate_and_sanitize_ai_evaluation(hallucinated, text="poor answer")
    assert sanitized is not None
    # Anti-hallucination check: overallScore must be realigned to weighted average (~22) and capped <= 40
    assert sanitized["overallScore"] <= 40


def test_ai_sanitization_rejects_missing_rubric():
    from ai_service import validate_and_sanitize_ai_evaluation

    # AI response missing required keys
    broken = {"overallScore": 85}
    sanitized = validate_and_sanitize_ai_evaluation(broken, text="incomplete json")
    assert sanitized is None  # Must return None to trigger safe local NLP fallback

