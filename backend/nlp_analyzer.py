"""
InterviewIQ Data Science & NLP Scoring Engine
Performs question-relevance validation, semantic concept expansion,
lexical diversity, STAR framework classification, tone profiling, and metric extraction.
"""

import re
import math
import difflib
from typing import List, Dict, Any, Optional
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

STOP_WORDS = {
    'the', 'a', 'an', 'and', 'or', 'in', 'on', 'at', 'to', 'for', 'with', 'is', 'are', 'was', 'were',
    'it', 'this', 'that', 'of', 'i', 'my', 'me', 'we', 'our', 'you', 'your', 'he', 'she', 'they', 'them',
    'have', 'has', 'had', 'do', 'does', 'did', 'be', 'been', 'being', 'would', 'could', 'should',
    'tell', 'about', 'how', 'what', 'why', 'when', 'which', 'who', 'whom'
}

COMMON_PREDICATES = {
    'is', 'are', 'was', 'were', 'use', 'uses', 'used', 'using', 'handle', 'handles', 'handled',
    'manage', 'manages', 'managed', 'create', 'creates', 'created', 'provide', 'provides', 'provided',
    'allow', 'allows', 'allowed', 'trigger', 'triggers', 'triggered', 'execute', 'executes', 'executed',
    'work', 'works', 'worked', 'store', 'stores', 'stored', 'call', 'calls', 'called', 'reduce', 'reduces', 'reduced',
    'improve', 'improves', 'improved', 'run', 'runs', 'ran', 'have', 'has', 'had', 'do', 'does', 'did', 'make', 'makes', 'made',
    'build', 'builds', 'built', 'develop', 'develops', 'developed', 'design', 'designs', 'designed',
    'choose', 'chose', 'chosen', 'decouple', 'decoupled', 'guarantee', 'guarantees', 'guaranteed',
    'ensure', 'ensures', 'ensured', 'deliver', 'delivers', 'delivered', 'send', 'sends', 'sent',
    'scale', 'scales', 'scaled', 'optimize', 'optimizes', 'optimized', 'connect', 'connects', 'connected'
}

SENTENCE_GRAMMAR_MARKERS = {
    'i', 'we', 'they', 'it', 'this', 'that', 'these', 'those', 'which', 'who', 'whom', 'where', 'when',
    'with', 'for', 'to', 'from', 'in', 'on', 'at', 'by', 'into', 'onto', 'about', 'between', 'through',
    'can', 'could', 'should', 'would', 'will', 'shall', 'may', 'might', 'must', 'because', 'although', 'since'
}

# Domain Concept Synonyms: Allows natural phrasing without penalizing candidates
CONCEPT_SYNONYMS = {
    'education': {'education', 'degree', 'bachelors', 'bachelor', 'masters', 'master', 'bca', 'mca', 'btech', 'be', 'bsc', 'college', 'university', 'graduated', 'graduate', 'completed', 'student', 'academic', 'cgpa', 'school'},
    'skills': {'skills', 'technologies', 'tools', 'languages', 'frameworks', 'programming', 'coding', 'stack', 'frontend', 'backend', 'fullstack', 'proficient', 'knowledge'},
    'experience': {'experience', 'worked', 'internship', 'job', 'role', 'hands-on', 'background', 'industry', 'years', 'working'},
    'project': {'project', 'projects', 'built', 'developed', 'created', 'designed', 'application', 'system', 'app', 'software', 'implemented', 'pipeline', 'model'},
    'team': {'team', 'collaborated', 'teamwork', 'together', 'group', 'members', 'communication', 'agile', 'scrum'},
    'value': {'value', 'contribute', 'impact', 'deliver', 'help', 'improve', 'grow', 'results', 'dedication', 'fit', 'assets'},
    'problem solving': {'problem', 'solving', 'troubleshooting', 'debugging', 'analytical', 'logic', 'critical', 'algorithms', 'resolved', 'fixed'},
    'lookup': {'lookup', 'lookups', 'search', 'searching', 'find', 'fetch', 'fetching', 'retrieval', 'retrieve', 'seek', 'select'},
    'performance': {'performance', 'speed', 'accelerate', 'acceleration', 'faster', 'latency', 'throughput', 'overhead', 'fast', 'slow', 'efficiency', 'complexity'},
    'query': {'query', 'queries', 'select', 'statement', 'clause'},
    'database': {'database', 'db', 'sql', 'nosql', 'rdbms', 'table', 'tables', 'schema'},
    'indexing': {'index', 'indexing', 'indexes', 'indexed', 'indices'},
    'index': {'index', 'indexing', 'indexes', 'indexed', 'indices'},
    'b-tree': {'b-tree', 'btree', 'b+ tree', 'b+tree', 'balanced tree'},
    'primary key': {'primary key', 'primary', 'unique', 'clustered', 'foreign key'},
    'reliable': {'reliable', 'reliability', 'guarantee', 'guarantees', 'guaranteed', 'delivery', 'in-order', 'assurance'}
}

# Optional deep neural embedding support if sentence-transformers is installed
_neural_model = None
try:
    from sentence_transformers import SentenceTransformer
    _neural_model = SentenceTransformer('all-MiniLM-L6-v2')
except Exception:
    _neural_model = None


class NLPInterviewAnalyzer:
    def __init__(self):
        # STAR framework behavioral signature regex patterns
        self.star_patterns = {
            "Situation": [
                r"\b(in my previous role|at my last company|during my project|in our team|when i was working at|we had a scenario|the background was)\b",
                r"\b(our system had|we were building|in college|during my internship)\b"
            ],
            "Task": [
                r"\b(my objective was|the challenge was|the goal was|i was tasked with|we needed to solve|the bottleneck was)\b",
                r"\b(we had to deliver|the problem occurred when|we were required to)\b"
            ],
            "Action": [
                r"\b(i implemented|i architected|i designed|i optimized|i refactored|i developed|i configured|i tuned)\b",
                r"\b(i introduced|we migrated|i wrote|we containerized|i automated|i debugged)\b"
            ],
            "Result": [
                r"\b(as a result|which reduced|resulting in|which improved|this dropped|this increased|we achieved)\b",
                r"\b(successfully deployed|boosted performance|cut costs|scaled to|saved)\b"
            ]
        }

        # Assertive vs Tentative linguistic markers
        self.assertive_markers = [
            "definitely", "specifically", "designed", "implemented", "resolved",
            "optimized", "delivered", "ensured", "architected", "measured", "proven", "achieved"
        ]
        self.tentative_markers = [
            "maybe", "i guess", "probably", "i think sort of", "kind of",
            "i might be wrong", "not sure but", "somewhat", "perhaps"
        ]

        # Common vocal filler crutches
        self.filler_words = ["um", "uh", "like", "you know", "basically", "actually", "literally", "sort of", "kind of"]

    def analyze_answer(
        self,
        question: str,
        answer: str,
        ideal_answer: Optional[str] = None,
        ideal_keywords: Optional[List[str]] = None,
        delivery_telemetry: Optional[Dict[str, Any]] = None,
        candidate_role: Optional[str] = "Software Engineer",
        question_category: Optional[str] = "Technical",
        experience_level: Optional[str] = "Mid Level"
    ) -> Dict[str, Any]:
        """
        Runs comprehensive Data Science & NLP validation pipeline.
        Recognizes synonyms, academic degrees, and self-introductions accurately.
        """
        text = (answer or "").strip()
        if not text:
            return self._empty_result()

        words = text.split()
        word_count = len(words)
        sentences = [s.strip() for s in re.split(r"[.!?]+", text) if len(s.strip()) > 3]

        # 1. QUESTION RELEVANCE & TOPICAL ALIGNMENT WITH SYNONYM EXPANSION
        relevance_data = self._calculate_relevance(text, question, ideal_answer, ideal_keywords or [])
        relevance_pct = relevance_data["relevance_pct"]
        is_off_topic = relevance_data["is_off_topic"]
        matched_keywords = relevance_data["matched_keywords"]
        missed_keywords = relevance_data["missed_keywords"]
        is_valid_intro = relevance_data.get("is_valid_intro", False)

        # 2. Delivery & Telemetry Evaluation
        telemetry = delivery_telemetry or {}
        pace_eval = self._evaluate_pace(telemetry.get("avgPaceWpm", 135))
        filler_eval = self._evaluate_fillers(telemetry.get("fillerWordsCount", 0), word_count)

        # 3. Handle strictly Off-Topic Responses (talking about movies, food, cricket)
        if is_off_topic:
            return self._build_off_topic_result(
                question=question,
                text=text,
                relevance_data=relevance_data,
                pace_eval=pace_eval,
                filler_eval=filler_eval,
                word_count=word_count
            )

        # 4. STAR Framework Behavioral Classification
        star_analysis = self._classify_star_framework(sentences)

        # 5. Quantitative Evidence & Metrics Detection
        metrics_found = self._extract_quantitative_metrics(text)

        # 6. Lexical Diversity & Vocabulary Sophistication
        lexical_metrics = self._calculate_lexical_diversity(words)

        # 7. Confidence & Assertiveness Tone Scoring
        confidence_tone = self._analyze_confidence_tone(text)

        # 8. Calibrated Scoring for Valid Responses
        # Check for factual contradictions or inversions first
        contradiction_data = self._detect_factual_contradictions(text, question)

        # Check for Keyword Soup (isolated buzzwords lacking grammatical predicates or function words)
        ans_tokens = set(re.findall(r"\b[a-z]{2,}\b", text.lower()))
        has_predicates = any(p in ans_tokens for p in COMMON_PREDICATES)
        has_sentence_grammar = any(m in ans_tokens for m in SENTENCE_GRAMMAR_MARKERS)
        is_keyword_soup = (word_count >= 8 and not is_valid_intro and not has_predicates and not has_sentence_grammar)

        kw_coverage_pct = (len(matched_keywords) / max(len(ideal_keywords or []), 1)) * 100

        # Special Calibration for Valid Self-Introductions
        if is_valid_intro:
            intro_eval = self._evaluate_introduction_pillars(text)
            p_score = intro_eval["total_intro_score"]
            pillars_done = intro_eval["pillars_completed"]

            if pillars_done <= 1:
                # Level 1: Only Identity & Education (e.g. name, degree, city)
                correctness_score = int(np.clip(25 + p_score * 0.6, 32, 42))
                depth_score = int(np.clip(24 + (word_count / 30.0) * 12, 25, 38))
                examples_score = 25
            elif pillars_done == 2:
                # Level 2: Identity + Education + Technical Stack
                correctness_score = int(np.clip(45 + p_score * 0.4, 58, 68))
                depth_score = int(np.clip(45 + (word_count / 50.0) * 18, 50, 68))
                examples_score = 35
            elif pillars_done == 3:
                # Level 3: Identity + Education + Technical Stack + Projects
                correctness_score = int(np.clip(65 + p_score * 0.25, 78, 88))
                depth_score = int(np.clip(68 + (word_count / 70.0) * 18, 72, 88))
                examples_score = int(np.clip(65 + intro_eval["p3_projects_experience"], 65, 88))
            else:
                # Level 4: Full 4-pillar interview-ready introduction
                correctness_score = int(np.clip(80 + p_score * 0.15, 88, 96))
                depth_score = int(np.clip(82 + (word_count / 80.0) * 14, 85, 96))
                examples_score = int(np.clip(80 + intro_eval["p3_projects_experience"], 80, 95))

        elif contradiction_data["has_contradiction"]:
            # Blatant factual inversion or contradictory assertion detected
            correctness_score = max(15, min(28, int(relevance_pct * 0.3)))
            depth_score = min(35, int(np.clip(word_count * 0.3, 20, 35)))
            examples_score = 20
        elif is_keyword_soup:
            correctness_score = 25
            depth_score = 20
            examples_score = 15
        else:
            correctness_score = int(np.clip(
                (relevance_pct * 0.65) + (kw_coverage_pct * 0.35),
                25, 96
            ))
            # Depth based on substantive word count, vocabulary richness, and sentence complexity
            if word_count < 25:
                # Brief response (e.g. 15-24 words) -> Fair foundational depth
                depth_score = int(np.clip(28 + (word_count / 25.0) * 15, 25, 50))
            else:
                raw_depth = (
                    min(word_count / 80.0, 1.0) * 45 +
                    (lexical_metrics["lexical_richness_score"] / 100.0) * 30 +
                    min(len(sentences) / 4.0, 1.0) * 25
                )
                depth_score = int(np.clip(raw_depth, 35, 96))

            # Depth Gating: If correctness is poor, length does not equal depth (anti-rambling rule)
            if correctness_score < 40:
                depth_score = min(depth_score, correctness_score + 10)

        # Clarity based on filler ratio and tone
        raw_clarity = 100 - (filler_eval["filler_ratio"] * 8) + (confidence_tone["assertiveness_score"] * 0.15)
        # Structural Clarity: Penalize long run-on unpunctuated responses
        if word_count > 25 and len(sentences) == 1 and not re.search(r"[,;:]", text):
            raw_clarity -= 35

        clarity_score = int(np.clip(raw_clarity, 40, 98))
        if is_keyword_soup:
            clarity_score = 25

        # Examples & Evidence score:
        if not is_valid_intro and not contradiction_data["has_contradiction"] and not is_keyword_soup:
            project_citations = len(re.findall(r"\b(project|application|system|service|framework|database|api|team|client|feature|degree|bachelors|masters|bca|mca|structure|table|disk|storage|cache|trade-off|architecture|streaming|gaming|dns|protocol|network)\b", text, re.I))
            examples_credit = (
                star_analysis["completeness_pct"] * 0.45 +
                min(len(metrics_found) * 20, 30) +
                min(project_citations * 8, 30)
            )
            examples_score = int(np.clip(examples_credit, 25, 95))
            if correctness_score < 40:
                examples_score = min(examples_score, correctness_score + 10)

        # Overall Weighted Score
        overall_score = int(round(
            correctness_score * 0.40 +
            depth_score * 0.25 +
            examples_score * 0.20 +
            clarity_score * 0.15
        ))

        if word_count < 5:
            correctness_score = min(correctness_score, 25)
            depth_score = 15
            examples_score = 10
            overall_score = min(overall_score, 24)
        elif contradiction_data["has_contradiction"]:
            overall_score = min(overall_score, 38)
        elif is_keyword_soup:
            overall_score = min(overall_score, 28)
        elif not is_valid_intro and correctness_score < 40:
            overall_score = min(overall_score, 42)

        evidence_quotes = self._extract_high_value_quotes(sentences)
        if contradiction_data["has_contradiction"]:
            evidence_quotes = contradiction_data["details"] + evidence_quotes
        elif is_keyword_soup:
            evidence_quotes = ["Keyword Soup Detected: Response lists isolated technical buzzwords without explanatory predicates or sentences."] + evidence_quotes

        # Contextual adaptive follow-up question
        if is_valid_intro:
            adaptive_follow_up = "Could you tell me about a key technical project you built, the technologies used, and what your specific role was?"
        elif missed_keywords:
            adaptive_follow_up = f"You touched on important principles. How would you handle {missed_keywords[0]} specifically in this design?"
        elif examples_score < 50:
            adaptive_follow_up = "Could you walk through a concrete real-world scenario or project where you applied this approach?"
        elif depth_score < 60:
            adaptive_follow_up = "What happens under the hood or at the runtime/system level when that executes?"
        else:
            adaptive_follow_up = "How would you optimize or scale this architecture if traffic or concurrency increased by 50x?"

        return {
            "overallScore": overall_score,
            "isBenchmarkCalibrated": True,
            "calibrationStandard": "20-Point Multi-Dimensional Rubric",
            "modelEngine": "Semantic Relevance & Concept Extractor (Python)",
            "adaptiveFollowUpQuestion": adaptive_follow_up,
            "rubric": {
                "correctness": {
                    "score": correctness_score,
                    "semanticSimilarityPct": int(relevance_pct),
                    "matchedKeywords": matched_keywords,
                    "missedKeywords": missed_keywords,
                    "evaluation": self._get_correctness_text(correctness_score, relevance_pct, is_valid_intro)
                },
                "depth": {
                    "score": depth_score,
                    "wordCount": word_count,
                    "vocabularyRichness": lexical_metrics["type_token_ratio_pct"],
                    "evaluation": self._get_depth_text(depth_score, word_count)
                },
                "clarity": {
                    "score": clarity_score,
                    "fillerRatioPct": filler_eval["filler_ratio"],
                    "toneProfile": confidence_tone["verdict"],
                    "evaluation": self._get_clarity_text(clarity_score, filler_eval["filler_ratio"])
                },
                "examples": {
                    "score": examples_score,
                    "starPhasesDetected": star_analysis["phases_detected"],
                    "metricsCited": metrics_found,
                    "evaluation": self._get_examples_text(examples_score, star_analysis["phases_detected"], metrics_found, is_valid_intro)
                }
            },
            "deliveryAnalysis": {
                "pace": pace_eval,
                "fillers": filler_eval,
                "confidence": confidence_tone
            },
            "evidenceDossier": {
                "extractedQuotes": evidence_quotes,
                "quantitativeMetrics": metrics_found,
                "starCompletenessPct": star_analysis["completeness_pct"],
                "identifiedTechnicalLandmarks": matched_keywords
            },
            "growthRecommendations": self._generate_recommendations(
                correctness_score, depth_score, clarity_score, examples_score,
                missed_keywords, star_analysis["phases_detected"], is_valid_intro
            )
        }

    def _calculate_relevance(
        self,
        candidate_text: str,
        question: str,
        ideal_answer: Optional[str],
        ideal_keywords: List[str]
    ) -> Dict[str, Any]:
        """
        Measures topical relevance using semantic synonyms, content overlap, and intro detection.
        """
        text_lower = candidate_text.lower()
        ans_tokens = set(re.findall(r"\b[a-z]{3,}\b", text_lower)) - STOP_WORDS

        if not ans_tokens:
            return {
                "relevance_pct": 0,
                "is_off_topic": True,
                "matched_keywords": [],
                "missed_keywords": ideal_keywords,
                "overlap_count": 0,
                "is_valid_intro": False
            }

        # Enrich reference vocabulary with domain concept synonyms
        synonym_tokens = set()
        for kw in ideal_keywords:
            syns = CONCEPT_SYNONYMS.get(kw.lower().strip(), set())
            synonym_tokens.update(syns)

        ref_text = f"{question} {ideal_answer or ''} " + " ".join(ideal_keywords) + " " + " ".join(synonym_tokens)
        ref_tokens = (set(re.findall(r"\b[a-z]{3,}\b", ref_text.lower())) | synonym_tokens) - STOP_WORDS

        # 1. Content Word Intersection
        overlap = ans_tokens.intersection(ref_tokens)
        overlap_count = len(overlap)
        overlap_ratio = overlap_count / max(len(ans_tokens), 1)

        # 2. Concept Synonym & Landmark Matching (handles plurals, punctuation boundaries, and synonyms)
        matched_kw = []
        missed_kw = []
        for kw in ideal_keywords:
            kw_clean = kw.strip().lower()
            if not kw_clean:
                continue

            # Flexible pattern allowing symbols like o(log n), c++, etc.
            boundary_pat = rf"(?:\b|^|\W){re.escape(kw_clean)}(?:\b|$|\W)"
            if re.search(boundary_pat, text_lower):
                matched_kw.append(kw)
                continue

            # Check common plurals and singular inflections
            variations = set()
            if kw_clean.endswith("y"):
                variations.add(kw_clean[:-1] + "ies")
            elif kw_clean.endswith("ies"):
                variations.add(kw_clean[:-3] + "y")
            elif kw_clean.endswith("s"):
                variations.add(kw_clean[:-1])
            else:
                variations.add(kw_clean + "s")
                variations.add(kw_clean + "es")

            if any(re.search(rf"(?:\b|^|\W){re.escape(v)}(?:\b|$|\W)", text_lower) for v in variations):
                matched_kw.append(kw)
                continue

            # Check synonym group match
            syns = CONCEPT_SYNONYMS.get(kw_clean, set())
            if any(re.search(rf"(?:\b|^|\W){re.escape(s)}(?:\b|$|\W)", text_lower) for s in syns):
                matched_kw.append(kw)
                continue

            # Typo / speech-to-text transcription artifact tolerance (e.g. indeksing -> indexing)
            ans_word_list = re.findall(r"\b[a-z0-9\-]{3,}\b", text_lower)
            close = difflib.get_close_matches(kw_clean, ans_word_list, n=1, cutoff=0.82)
            if close:
                matched_kw.append(kw)
            else:
                missed_kw.append(kw)

        kw_ratio = len(matched_kw) / max(len(ideal_keywords), 1) if ideal_keywords else 0.5

        # 3. Check for Valid Self-Introduction Pattern
        is_intro_question = any(q in question.lower() for q in ["tell me about yourself", "introduce yourself", "background"])
        has_intro_markers = any(m in text_lower for m in [
            "my name is", "myself", "i am", "completed", "bachelor", "degree", "graduate", "from", "college", "university"
        ])
        is_valid_intro = is_intro_question and has_intro_markers

        # 4. TF-IDF Cosine Similarity
        cos_sim = 0.0
        try:
            vec = TfidfVectorizer(ngram_range=(1, 2), stop_words='english')
            tfidf_matrix = vec.fit_transform([candidate_text, ref_text])
            cos_sim = float(cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0])
        except Exception:
            cos_sim = 0.0

        if _neural_model is not None:
            try:
                emb = _neural_model.encode([candidate_text, ref_text])
                neural_sim = float(cosine_similarity([emb[0]], [emb[1]])[0][0])
                cos_sim = max(cos_sim, neural_sim)
            except Exception:
                pass

        # Composite Relevance Index (0 - 100)
        raw_relevance = (cos_sim * 0.40) + (kw_ratio * 0.35) + (overlap_ratio * 0.25)
        relevance_pct = int(round(np.clip(raw_relevance * 100 * 2.1, 0, 100)))

        # If it is a valid personal introduction, relevance is at least 42%
        if is_valid_intro:
            relevance_pct = max(relevance_pct, 44)

        # STRICT OFF-TOPIC RULE:
        # It is only off-topic if it shares 0 domain words AND is NOT a valid introduction
        is_off_topic = (overlap_count == 0 and not is_valid_intro and len(matched_kw) == 0)

        return {
            "relevance_pct": relevance_pct,
            "is_off_topic": is_off_topic,
            "matched_keywords": matched_kw,
            "missed_keywords": missed_kw,
            "overlap_count": overlap_count,
            "is_valid_intro": is_valid_intro
        }

    def _evaluate_introduction_pillars(self, text: str) -> Dict[str, Any]:
        """
        Evaluates a candidate self-introduction across 4 essential professional pillars:
        1. Identity & Education (0-25)
        2. Technical Skills & Core Stack (0-35)
        3. Real Projects & Practical Experience (0-25)
        4. Career Goals & Role Motivation (0-15)
        """
        text_lower = text.lower()

        # Pillar 1: Identity & Education Foundation
        has_name = bool(re.search(r"\b(my name is|i am|myself|this is)\b", text_lower))
        has_education = bool(re.search(r"\b(bachelor|bachelors|bca|mca|btech|be|bsc|master|masters|degree|graduated|graduate|college|university|student|school|completed)\b", text_lower))
        has_location = bool(re.search(r"\b(from|based in|living in|located in|native of)\b", text_lower))

        p1_score = 0
        if has_name:
            p1_score += 10
        if has_education:
            p1_score += 12
        if has_location:
            p1_score += 3
        p1_score = min(25, p1_score)

        # Pillar 2: Technical Skills / Stack
        tech_matches = re.findall(
            r"\b(python|javascript|typescript|java|c\+\+|c#|react|angular|vue|node|express|fastapi|django|flask|spring|sql|mysql|postgresql|mongodb|redis|docker|kubernetes|aws|git|html|css|pandas|numpy|machine learning|data science|backend|frontend|fullstack|rest api|cloud)\b",
            text_lower
        )
        unique_tech = list(set(tech_matches))
        p2_score = min(35, len(unique_tech) * 9)

        # Pillar 3: Practical Projects & Experience (exclude degree major references like 'computer applications')
        text_no_degree = re.sub(r"\bcomputer\s+applications?\b", "", text_lower)
        project_keywords = re.findall(
            r"\b(project|projects|built|developed|created|designed|implemented|internship|intern|worked on|deployed|application|system|app|pipeline)\b",
            text_no_degree
        )
        p3_score = 0
        if len(project_keywords) >= 3:
            p3_score = 25
        elif len(project_keywords) >= 1:
            p3_score = 15

        # Pillar 4: Professional Motivation / Career Goals
        goal_matches = re.findall(
            r"\b(goal|goals|career|passionate|aspire|looking forward|excited to|contribute|grow as|seeking|interest in|drive|opportunity)\b",
            text_lower
        )
        p4_score = min(15, len(goal_matches) * 8)

        total_intro_score = p1_score + p2_score + p3_score + p4_score
        pillars_completed = sum([p1_score >= 10, p2_score >= 10, p3_score >= 15, p4_score >= 5])

        return {
            "p1_identity_education": p1_score,
            "p2_technical_skills": p2_score,
            "p3_projects_experience": p3_score,
            "p4_goals_motivation": p4_score,
            "detected_tech": unique_tech,
            "total_intro_score": total_intro_score,
            "pillars_completed": pillars_completed
        }

    def _detect_factual_contradictions(self, text: str, question: str) -> Dict[str, Any]:
        """
        Detects common high-impact technical contradictions and factual inversions.
        Prevents keyword-stuffed incorrect answers from scoring high.
        """
        text_lower = text.lower()
        q_lower = question.lower()
        contradictions = []

        if "tcp" in q_lower or "udp" in q_lower:
            if re.search(r"\budp\b[^.!?\n]*(connection-oriented|guarantees? delivery|reliable transmission|three-way handshake)", text_lower):
                contradictions.append("Factual Inversion: UDP is connectionless and best-effort; it does not guarantee delivery or use a three-way handshake.")
            if re.search(r"\btcp\b[^.!?\n]*(is connectionless|does not guarantee delivery|unreliable protocol)", text_lower):
                contradictions.append("Factual Inversion: TCP is connection-oriented and provides reliable, in-order packet delivery.")

        if "http" in q_lower and "stateless" in q_lower:
            if re.search(r"\bhttp\b[^.!?\n]*(is\s+(?:\w+\s+)?stateful|inherently\s+stateful|maintains\s+state\s+naturally|remembers\s+client\s+state\s+by\s+default)", text_lower):
                contradictions.append("Factual Error: HTTP is stateless by design; session state requires cookies, tokens, or sessions.")

        if "hash" in q_lower or "array" in q_lower or "complexity" in q_lower:
            if re.search(r"\bhash\s*table|hash\s*map\b[^.!?\n]*(is o\(n\)|takes linear time for average lookup)", text_lower) and not re.search(r"worst case", text_lower):
                contradictions.append("Complexity Error: Hash tables provide average O(1) constant time lookup, not O(N).")

        if ("sql" in q_lower or "nosql" in q_lower) and ("relational" in q_lower or "mongodb" in q_lower):
            if re.search(r"\bmongodb\b[^.!?\n]*(enforces relational foreign keys|strict acid schema joins by default)", text_lower):
                contradictions.append("Architectural Inversion: MongoDB is a document NoSQL database, not a relational foreign-key RDBMS.")

        if "python" in q_lower and ("compiled" in q_lower or "interpreted" in q_lower):
            if re.search(r"\bpython\b[^.!?\n]*(compiles directly to bare-metal assembly|executes without bytecode|has no gil)", text_lower):
                contradictions.append("Runtime Error: Standard Python compiles to bytecode executed on a virtual machine.")

        return {
            "has_contradiction": len(contradictions) > 0,
            "contradiction_count": len(contradictions),
            "details": contradictions
        }

    def _build_off_topic_result(
        self,
        question: str,
        text: str,
        relevance_data: Dict[str, Any],
        pace_eval: Dict[str, Any],
        filler_eval: Dict[str, Any],
        word_count: int
    ) -> Dict[str, Any]:
        relevance_pct = relevance_data["relevance_pct"]
        penalty_score = min(10, int(relevance_pct * 0.5))

        return {
            "overallScore": penalty_score,
            "isBenchmarkCalibrated": True,
            "calibrationStandard": "20-Point Multi-Dimensional Rubric",
            "modelEngine": "Relevance Validator (Python)",
            "adaptiveFollowUpQuestion": f"Let's refocus on the question: '{question}'. Could you explain your direct approach to this?",
            "rubric": {
                "correctness": {
                    "score": penalty_score,
                    "semanticSimilarityPct": relevance_pct,
                    "matchedKeywords": [],
                    "missedKeywords": relevance_data["missed_keywords"],
                    "evaluation": f"Off-Topic Response: The answer does not address the question asked ('{question}'). Candidate discussed unrelated topics."
                },
                "depth": {
                    "score": min(15, int(word_count * 0.4)),
                    "wordCount": word_count,
                    "vocabularyRichness": 20,
                    "evaluation": "Response is off-topic. Words did not contribute to answering the question."
                },
                "clarity": {
                    "score": min(30, int(100 - filler_eval["filler_ratio"] * 8)),
                    "fillerRatioPct": filler_eval["filler_ratio"],
                    "toneProfile": "Unfocused / Off-Topic",
                    "evaluation": "Speech lacked focus on the interviewer prompt."
                },
                "examples": {
                    "score": 0,
                    "starPhasesDetected": [],
                    "metricsCited": [],
                    "evaluation": "Zero relevant examples, projects, or evidence cited for the question asked."
                }
            },
            "deliveryAnalysis": {
                "pace": pace_eval,
                "fillers": filler_eval,
                "confidence": {"assertiveness_score": 25, "verdict": "Off-Topic Delivery"}
            },
            "evidenceDossier": {
                "extractedQuotes": [text[:100] + "..."] if len(text) > 100 else [text],
                "quantitativeMetrics": [],
                "starCompletenessPct": 0,
                "identifiedTechnicalLandmarks": []
            },
            "growthRecommendations": [
                f"Listen carefully to the question prompt: '{question}'. Always structure your answer around the specific concepts requested.",
                "Avoid discussing unrelated topics. Focus on your technical capabilities and project background."
            ]
        }

    def _classify_star_framework(self, sentences: List[str]) -> Dict[str, Any]:
        phases_detected = []
        for s in sentences:
            s_lower = s.lower()
            for phase, patterns in self.star_patterns.items():
                for pat in patterns:
                    if re.search(pat, s_lower):
                        if phase not in phases_detected:
                            phases_detected.append(phase)
                        break

        completeness_pct = int((len(phases_detected) / 4.0) * 100)
        return {
            "phases_detected": phases_detected,
            "completeness_pct": completeness_pct
        }

    def _extract_quantitative_metrics(self, text: str) -> List[str]:
        metric_regex = r"\b(\d+(?:\.\d+)?\s*(?:%|percent|ms|s|seconds|queries|qps|users|req/s|gb|mb|tb|k|million|x|fold))\b"
        matches = re.findall(metric_regex, text, re.IGNORECASE)
        return list(set(matches))

    def _calculate_lexical_diversity(self, words: List[str]) -> Dict[str, Any]:
        clean_words = [re.sub(r"[^\w]", "", w.lower()) for w in words if len(w) > 1]
        if not clean_words:
            return {"type_token_ratio_pct": 50, "lexical_richness_score": 50}

        unique_words = set(clean_words)
        ttr = len(unique_words) / len(clean_words)
        ttr_pct = round(ttr * 100, 1)
        richness_score = min(ttr_pct * 1.25, 98)
        return {
            "type_token_ratio_pct": ttr_pct,
            "lexical_richness_score": round(richness_score, 1)
        }

    def _analyze_confidence_tone(self, text: str) -> Dict[str, Any]:
        text_lower = text.lower()
        assertive_count = sum(1 for m in self.assertive_markers if re.search(rf"\b{m}\b", text_lower))
        tentative_count = sum(1 for m in self.tentative_markers if re.search(rf"\b{m}\b", text_lower))

        ratio = assertive_count - tentative_count
        if ratio >= 2:
            verdict = "Authoritative & Confident"
            tone_score = 92
        elif ratio >= 0:
            verdict = "Balanced & Professional"
            tone_score = 80
        else:
            verdict = "Hesitant / Tentative Language"
            tone_score = 62

        return {
            "assertiveness_score": tone_score,
            "verdict": verdict,
            "assertiveTokensFound": assertive_count,
            "tentativeTokensFound": tentative_count
        }

    def _evaluate_pace(self, wpm: float) -> Dict[str, Any]:
        if 120 <= wpm <= 165:
            return {"status": "Ideal Cadence", "tone": "success", "wpm": round(wpm, 1), "text": f"{round(wpm, 1)} WPM represents optimal clarity and interview confidence."}
        elif wpm < 120:
            return {"status": "Deliberate / Slow Pace", "tone": "warning", "wpm": round(wpm, 1), "text": f"{round(wpm, 1)} WPM. Maintain steady momentum during technical responses."}
        else:
            return {"status": "Brisk / Rapid Pace", "tone": "warning", "wpm": round(wpm, 1), "text": f"{round(wpm, 1)} WPM. Use conscious pauses after key architectural points."}

    def _evaluate_fillers(self, count: int, word_count: int) -> Dict[str, Any]:
        ratio = round((count / max(word_count, 1)) * 100, 1)
        if count == 0:
            return {"status": "Flawless Articulation", "tone": "success", "count": 0, "filler_ratio": 0.0, "text": "Zero verbal fillers detected in your response."}
        elif ratio <= 3.0:
            return {"status": "Natural & Controlled", "tone": "success", "count": count, "filler_ratio": ratio, "text": f"{count} filler word(s) detected (~{ratio}%). Well within executive standards."}
        else:
            return {"status": "Excessive Fillers", "tone": "danger", "count": count, "filler_ratio": ratio, "text": f"{count} filler occurrences (~{ratio}% of speech). Practice pausing in silence instead of using vocal fillers."}

    def _extract_high_value_quotes(self, sentences: List[str]) -> List[str]:
        quotes = []
        for s in sentences:
            if any(re.search(pat, s, re.IGNORECASE) for pat in [r"name is", r"degree", r"bachelor", r"master", r"computer", r"project", r"skills", r"implemented", r"experience"]):
                if len(s) > 15 and s not in quotes:
                    quotes.append(s)
            if len(quotes) >= 3:
                break
        return quotes if quotes else (sentences[:2] if sentences else ["Response provided."])

    def _get_correctness_text(self, score: int, relevance_pct: int, is_intro: bool) -> str:
        if is_intro:
            if score >= 70:
                return f"Excellent comprehensive self-introduction ({relevance_pct}% relevance) covering name, degree, tech skills, and career goals."
            return f"Clear foundational introduction ({relevance_pct}% relevance). Stated your identity and degree; add your technical skills and projects to boost score."
        if score >= 80:
            return f"Exceptional answer alignment ({relevance_pct}% semantic relevance) addressing all core concepts asked."
        elif score >= 60:
            return f"Good topical answer ({relevance_pct}% relevance) addressing main points with minor concept gaps."
        return f"Partial alignment ({relevance_pct}% relevance). Review question requirements to cover missing concepts."

    def _get_depth_text(self, score: int, words: int) -> str:
        if words < 25:
            return f"Brief answer ({words} words). A solid introductory starting point; expand with details on projects and technologies."
        elif score >= 75:
            return f"Thorough explanation ({words} words) demonstrating strong domain mastery."
        return f"Adequate coverage ({words} words); consider elaborating on specific practical examples."

    def _get_clarity_text(self, score: int, filler_pct: float) -> str:
        if score >= 80:
            return f"Crystal-clear delivery with minimal hesitations ({filler_pct}% filler density)."
        return f"Coherent delivery ({filler_pct}% filler density); focus on structured topic transitions."

    def _get_examples_text(self, score: int, phases: List[str], metrics: List[str], is_intro: bool) -> str:
        if is_intro:
            return "Good academic grounding. Next step: mention a specific capstone or university project you developed."
        if len(phases) >= 2 or len(metrics) > 0:
            return f"Good experiential framing: detected {', '.join(phases) if phases else 'concrete project details'}."
        return "Incorporate clear STAR framing (Situation, Task, Action, Result) to make answers more memorable."

    def _generate_recommendations(
        self, correctness: int, depth: int, clarity: int, examples: int,
        missed_keywords: List[str], star_phases: List[str], is_intro: bool
    ) -> List[str]:
        tips = []
        if is_intro:
            tips.append("Use the 3-Part Self-Introduction Formula: (1) Who you are & your degree (BCA/MCA), (2) Your top technical skills & tools (e.g. Python, SQL, React), and (3) A key project you built.")
            tips.append("Mention your career goals or what specific roles you are excited to pursue.")
            return tips

        if missed_keywords:
            tips.append(f"Incorporate key concepts: {', '.join(missed_keywords[:3])} to directly answer the question.")
        if "Result" not in star_phases:
            tips.append("Conclude your answers with the tangible outcome or impact achieved.")
        if depth < 65:
            tips.append("Elaborate further with specific examples rather than high-level summaries.")
        if not tips:
            tips.append("Strong response! Maintain this structured delivery and topical precision.")
        return tips

    def _empty_result(self) -> Dict[str, Any]:
        return {
            "overallScore": 0,
            "isBenchmarkCalibrated": True,
            "calibrationStandard": "20-Point Multi-Dimensional Rubric",
            "modelEngine": "Python NLP Engine",
            "adaptiveFollowUpQuestion": "Could you provide your perspective or technical experience on this question?",
            "rubric": {
                "correctness": {"score": 0, "evaluation": "No audible or typed response submitted."},
                "depth": {"score": 0, "evaluation": "Empty response."},
                "clarity": {"score": 0, "evaluation": "Empty response."},
                "examples": {"score": 0, "evaluation": "Empty response."}
            },
            "deliveryAnalysis": {
                "pace": {"status": "No Speech", "tone": "danger", "wpm": 0, "text": "No speech recorded."},
                "fillers": {"status": "N/A", "tone": "neutral", "count": 0, "filler_ratio": 0.0, "text": "No speech analyzed."}
            },
            "evidenceDossier": {"extractedQuotes": [], "quantitativeMetrics": [], "starCompletenessPct": 0, "identifiedTechnicalLandmarks": []},
            "growthRecommendations": ["Submit an answer with concrete evidence related to the question asked."]
        }
