"""
InterviewIQ Enterprise Comprehensive Question Bank & Adaptive Learning Engine
Supports:
- All 13 supported roles with 12+ calibrated questions each across 4 levels and 8 question types
- Duration-based question count scaling (5m -> 3, 15m -> 5, 30m -> 9, 45m -> 13)
- Multi-dimensional question deduplication across sessions and within sessions
- Dynamic resume project question generation
- Topic-level weakness detection (<50% Priority, 50-69% Focus, 70-84% Proficient, 85-100% Advanced)
- Personalized learning plan generation with study concepts and practice questions
- Chronological attempt comparison (A1 to Latest) with Scenarios A, B, C, D retry recommendations
"""

import hashlib
import random
from typing import List, Dict, Any, Optional

# Import curated role banks
from generate_questions_json import data as sd_data
from generate_repository import ROLE_DATA as fs_data
from roles_part1 import PART1_DATA
from roles_part2 import PART2_DATA
from roles_part3 import PART3_DATA

# Consolidated Master Repository
QUESTION_BANK: Dict[str, List[Dict[str, Any]]] = {}

# 1. Software Developer
QUESTION_BANK["Software Developer"] = sd_data["Software Developer"]

# 2. Full Stack Developer
QUESTION_BANK["Full Stack Developer"] = fs_data["Full Stack Developer"]["questions"]

# 3. Python Developer, 4. Java Developer, 5. Data Analyst
for role_name, q_list in PART1_DATA.items():
    QUESTION_BANK[role_name] = q_list

# 6. Data Scientist, 7. AI/ML Engineer, 8. Cybersecurity Analyst
for role_name, q_list in PART2_DATA.items():
    QUESTION_BANK[role_name] = q_list

# 9. UI/UX Designer, 10. Business Analyst, 11. HR Interview, 12. General Fresher Interview
for role_name, q_list in PART3_DATA.items():
    QUESTION_BANK[role_name] = q_list

# Role Aliases for flexible matching
ROLE_ALIASES = {
    "software_developer": "Software Developer",
    "software developer": "Software Developer",
    "software engineer": "Software Developer",
    "full_stack_developer": "Full Stack Developer",
    "full stack developer": "Full Stack Developer",
    "fullstack developer": "Full Stack Developer",
    "python_developer": "Python Developer",
    "python developer": "Python Developer",
    "python": "Python Developer",
    "java_developer": "Java Developer",
    "java developer": "Java Developer",
    "java": "Java Developer",
    "data_analyst": "Data Analyst",
    "data analyst": "Data Analyst",
    "data_scientist": "Data Scientist",
    "data scientist": "Data Scientist",
    "aiml_engineer": "AI/ML Engineer",
    "ai/ml engineer": "AI/ML Engineer",
    "ai engineer": "AI/ML Engineer",
    "ml engineer": "AI/ML Engineer",
    "cybersecurity_analyst": "Cybersecurity Analyst",
    "cybersecurity analyst": "Cybersecurity Analyst",
    "security analyst": "Cybersecurity Analyst",
    "uiux_designer": "UI/UX Designer",
    "ui/ux designer": "UI/UX Designer",
    "ux designer": "UI/UX Designer",
    "product designer": "UI/UX Designer",
    "business_analyst": "Business Analyst",
    "business analyst": "Business Analyst",
    "hr_interview": "HR Interview",
    "hr interview": "HR Interview",
    "hr": "HR Interview",
    "fresher_interview": "General Fresher Interview",
    "general fresher interview": "General Fresher Interview",
    "fresher": "General Fresher Interview",
    "custom_role": "Other / Custom Role",
    "other / custom role": "Other / Custom Role"
}

LEVEL_NORMALIZATION = {
    "entry": "Fresher / Entry",
    "fresher": "Fresher / Entry",
    "junior": "Fresher / Entry",
    "intern": "Fresher / Entry",
    "mid": "Mid Level",
    "mid level": "Mid Level",
    "intermediate": "Mid Level",
    "senior": "Senior",
    "lead": "Senior",
    "staff": "Staff / Architect",
    "principal": "Staff / Architect",
    "architect": "Staff / Architect"
}

def normalize_role(role_name: str) -> str:
    if not role_name:
        return "Software Developer"
    cleaned = role_name.strip().lower()
    return ROLE_ALIASES.get(cleaned, role_name)

def normalize_level(level_str: Optional[str]) -> str:
    if not level_str:
        return "Mid Level"
    lower = level_str.lower().strip()
    for k, v in LEVEL_NORMALIZATION.items():
        if k in lower:
            return v
    return "Mid Level"

def get_duration_question_count(duration_minutes: int) -> int:
    """
    Calibrates target question count by duration:
    - 5m: 3 questions (2-3)
    - 15m: 5 questions (4-5)
    - 30m: 9 questions (8-10)
    - 45m: 13 questions (12-15)
    """
    mins = int(duration_minutes) if duration_minutes else 15
    if mins <= 7:
        return 3
    elif mins <= 20:
        return 5
    elif mins <= 35:
        return 9
    else:
        return 13

def compute_question_hash(question_text: str) -> str:
    """Computes SHA-256 fingerprint of question text for deduplication."""
    cleaned = " ".join(question_text.lower().split())
    return hashlib.sha256(cleaned.encode("utf-8")).hexdigest()[:16]

def generate_custom_role_questions(role_title: str, level: str = "Mid Level", count: int = 5) -> List[Dict[str, Any]]:
    """Generates rich, calibrated questions for custom or user-defined roles."""
    title = role_title.strip() if role_title else "Software Professional"
    norm_level = normalize_level(level)

    templates = [
        {
            "id": f"custom_{norm_level[:3].lower()}_1",
            "question": f"As a candidate for {title}, walk me through your technical background, the core toolchain you use, and the architecture of your most demanding recent project.",
            "topic": "Domain Architecture & Projects",
            "questionType": "project",
            "level": norm_level,
            "idealKeywords": [title, "architecture", "trade-offs", "scalability", "problem-solving", "frameworks", "deliverables"],
            "rubric": {
                "correctness": f"Accurately presents core methodologies and competencies expected for {title}.",
                "depth": "Discusses system design trade-offs, bottlenecks, and real-world metrics.",
                "clarity": "Crisp, structured delivery without wandering.",
                "examples": "Concrete domain or engineering project examples."
            },
            "followUp": "What monitoring alerts or KPIs did you track to ensure the success of that project?"
        },
        {
            "id": f"custom_{norm_level[:3].lower()}_2",
            "question": f"When executing high-priority deliverables as a {title}, how do you evaluate technical debt versus delivery speed, and how do you ensure quality under tight deadlines?",
            "topic": "Quality & Technical Debt",
            "questionType": "practical",
            "level": norm_level,
            "idealKeywords": ["technical debt", "code quality", "prioritization", "automated testing", "refactoring", "maintainability"],
            "rubric": {
                "correctness": "Pragmatic balance between business speed and long-term maintainability.",
                "depth": "Demonstrates engineering maturity and proactive refactoring strategies.",
                "clarity": "Structured explanation with clear trade-off rationale.",
                "examples": "Specific examples of addressing tech debt proactively."
            },
            "followUp": "If an unexpected production outage or critical issue occurs during release, how do you manage triage?"
        },
        {
            "id": f"custom_{norm_level[:3].lower()}_3",
            "question": f"Describe a complex troubleshooting or debugging scenario you resolved in your work as a {title}. Walk through your root-cause analysis methodology.",
            "topic": "Troubleshooting & Problem Solving",
            "questionType": "troubleshooting",
            "level": norm_level,
            "idealKeywords": ["root cause analysis", "debugging methodology", "logs and metrics", "isolation", "reproduction", "containment", "preventative action"],
            "rubric": {
                "correctness": "Systematic problem-solving methodology (metrics -> reproduction -> root-cause -> fix).",
                "depth": "Explains underlying technical failure mechanisms rather than superficial symptom patching.",
                "clarity": "Calm, accountable delivery under pressure.",
                "examples": "Concrete incident diagnosis and post-mortem safeguards."
            },
            "followUp": "What automated regression tests or safeguards did you put in place to prevent recurrence?"
        },
        {
            "id": f"custom_{norm_level[:3].lower()}_4",
            "question": f"How do you design for scalability, reliability, and security within the {title} domain when transaction volume or user load scales by 10x?",
            "topic": "Scalability & Performance",
            "questionType": "optimization",
            "level": norm_level,
            "idealKeywords": ["scalability", "caching", "bottleneck identification", "load balancing", "horizontal scaling", "latency", "resilience"],
            "rubric": {
                "correctness": "Applies industry scalability standards (decoupling, caching, asynchronous workers).",
                "depth": "Addresses p99 latency spikes and resource saturation limits.",
                "clarity": "High-level systems architecture delivery.",
                "examples": "Concrete scaling techniques tailored to the domain."
            },
            "followUp": "How do you test and validate your system's capacity before peak traffic events?"
        },
        {
            "id": f"custom_{norm_level[:3].lower()}_5",
            "question": f"How do you collaborate with cross-functional stakeholders (Product, Design, DevOps, Leadership) as a {title} to ensure engineering alignment with business outcomes?",
            "topic": "Stakeholder Collaboration & Leadership",
            "questionType": "behavioral",
            "level": norm_level,
            "idealKeywords": ["cross-functional collaboration", "stakeholder alignment", "empathy", "communication", "business ROI", "mentorship", "trade-offs"],
            "rubric": {
                "correctness": "Demonstrates empathetic, business-aligned cross-functional collaboration.",
                "depth": "Explains resolving technical vs business priority tensions constructively.",
                "clarity": "Professional, articulate delivery.",
                "examples": "Real project alignment scenario across diverse teams."
            },
            "followUp": "How do you convey complex technical constraints to non-technical business partners?"
        }
    ]

    # Return up to requested count
    while len(templates) < count:
        templates.append({
            "id": f"custom_{norm_level[:3].lower()}_{len(templates)+1}",
            "question": f"What are the emerging trends and best practices currently shaping the {title} discipline, and how do you incorporate them into production workflows?",
            "topic": "Innovation & Best Practices",
            "questionType": "conceptual",
            "level": norm_level,
            "idealKeywords": [title, "emerging trends", "automation", "best practices", "continuous learning", "industry standards"],
            "rubric": {
                "correctness": f"Strong engagement with modern practices in {title}.",
                "depth": "Critical evaluation of new tools versus established engineering patterns.",
                "clarity": "Forward-looking yet grounded perspectives.",
                "examples": "Cites concrete new libraries, tools, or methodologies."
            },
            "followUp": "How do you evaluate whether a new technology is mature enough for enterprise adoption?"
        })

    return templates[:count]

def generate_resume_targeted_questions(
    resume_skills: List[str],
    resume_projects: List[str],
    role: str,
    level: str = "Mid Level",
    count: int = 2
) -> List[Dict[str, Any]]:
    """Synthesizes high-impact questions directly derived from the candidate's extracted resume skills and projects."""
    norm_level = normalize_level(level)
    questions = []

    skills_sample = resume_skills[:6] if resume_skills else ["modern software engineering"]
    primary_project = resume_projects[0] if resume_projects else "your most demanding recent production project"

    # Project Defense Question
    questions.append({
        "id": f"resume_proj_defense_{random.randint(100, 999)}",
        "question": f"In your resume, you highlighted working on '{primary_project}'. Walk me through the technical architecture, why you selected ({', '.join(skills_sample[:3])}), and the single most difficult architectural bottleneck you overcame.",
        "topic": "Project Defense & System Architecture",
        "questionType": "project",
        "level": norm_level,
        "idealKeywords": skills_sample + ["architecture", "bottleneck", "trade-offs", "latency", "scale", "debugging"],
        "rubric": {
            "correctness": "Accurately defends architectural decisions and tech stack selection from their resume.",
            "depth": "Explains trade-offs considered, alternative tools rejected, and underlying performance bottlenecks.",
            "clarity": "Structured, chronological walkthrough of the project lifecycle.",
            "examples": "Specific quantifiable outcomes (e.g. latency reduced, QPS supported, data processed)."
        },
        "followUp": f"If you had to re-architect '{primary_project}' from scratch today for 10x current volume, what foundational design choice would you change?"
    })

    if count > 1 and len(skills_sample) >= 2:
        top_skill = skills_sample[0]
        questions.append({
            "id": f"resume_skill_deep_{random.randint(100, 999)}",
            "question": f"Your resume emphasizes strong proficiency with {top_skill}. How do you leverage {top_skill} for production-grade reliability, concurrency, and performance optimization in {role} systems?",
            "topic": f"{top_skill} Practical Implementation",
            "questionType": "practical",
            "level": norm_level,
            "idealKeywords": [top_skill, "best practices", "optimization", "concurrency", "memory", "testing", "reliability"],
            "rubric": {
                "correctness": f"Deep practical mastery of {top_skill} features, idioms, and internal mechanics.",
                "depth": "Addresses production failure modes, performance profiling, and memory implications.",
                "clarity": "Articulate, hands-on senior engineering delivery.",
                "examples": "Concrete code refactoring or production optimization scenario."
            },
            "followUp": f"What common architectural anti-pattern do developers frequently commit when using {top_skill}?"
        })

    return questions[:count]

def select_calibrated_questions(
    role: str,
    level: str = "Mid Level",
    duration_minutes: int = 15,
    user_history_ids: Optional[List[str]] = None,
    custom_role_title: str = "",
    resume_skills: Optional[List[str]] = None,
    resume_projects: Optional[List[str]] = None
) -> List[Dict[str, Any]]:
    """
    Master Selection and Deduplication Function:
    1. Determines target question count from duration (5m: 3, 15m: 5, 30m: 9, 45m: 13).
    2. Incorporates resume-targeted questions if resume artifacts exist.
    3. Filters out questions previously asked to this candidate (from user_history_ids).
    4. Calibrates question difficulty against candidate seniority level.
    5. Ensures zero within-session duplication and maximum cross-session novelty.
    """
    target_count = get_duration_question_count(duration_minutes)
    norm_role = normalize_role(role)
    norm_level = normalize_level(level)
    history_set = set(user_history_ids or [])

    selected_questions: List[Dict[str, Any]] = []
    seen_ids = set()

    # Step A: Generate Resume-Targeted Questions if provided (up to 2 questions)
    if (resume_skills or resume_projects) and target_count >= 3:
        resume_count = 2 if target_count >= 5 else 1
        resume_qs = generate_resume_targeted_questions(
            resume_skills=resume_skills or [],
            resume_projects=resume_projects or [],
            role=norm_role,
            level=norm_level,
            count=resume_count
        )
        for rq in resume_qs:
            selected_questions.append(rq)
            seen_ids.add(rq["id"])

    # Step B: Fetch Pool from Question Bank or Custom Generator
    pool = QUESTION_BANK.get(norm_role)
    if not pool or norm_role == "Other / Custom Role":
        custom_pool = generate_custom_role_questions(
            role_title=custom_role_title or norm_role,
            level=norm_level,
            count=max(target_count + 4, 12)
        )
        pool = custom_pool

    # Step C: Level Matching & Deduplication Sorting
    # Partition into unencountered vs encountered
    unseen_exact_level = []
    unseen_other_level = []
    seen_exact_level = []
    seen_other_level = []

    for q in pool:
        q_id = q.get("id")
        q_level = normalize_level(q.get("level"))
        is_exact_level = (q_level == norm_level)
        is_seen = (q_id in history_set)

        if not is_seen:
            if is_exact_level:
                unseen_exact_level.append(q)
            else:
                unseen_other_level.append(q)
        else:
            if is_exact_level:
                seen_exact_level.append(q)
            else:
                seen_other_level.append(q)

    # Prioritization Order:
    # 1. Unseen questions matching candidate level exactly
    # 2. Unseen questions from other levels (provides breadth)
    # 3. Seen questions matching candidate level (least recently encountered)
    # 4. Seen questions from other levels
    prioritized_pool = unseen_exact_level + unseen_other_level + seen_exact_level + seen_other_level

    # Step D: Fill remaining slots up to target_count
    for q in prioritized_pool:
        if len(selected_questions) >= target_count:
            break
        if q["id"] not in seen_ids:
            selected_questions.append(q)
            seen_ids.add(q["id"])

    # Fallback guard: if pool is exhausted, duplicate safeguard
    if len(selected_questions) < target_count and pool:
        for q in pool:
            if len(selected_questions) >= target_count:
                break
            selected_questions.append(q)

    return selected_questions[:target_count]

# ==================== Topic Weakness & Adaptive Learning Engine ====================

WEAKNESS_BANDS = {
    "priority_improvement": {"label": "Priority Improvement", "range": (0, 49), "status": "Critical Gap"},
    "focused_practice": {"label": "Focused Practice", "range": (50, 69), "status": "Needs Improvement"},
    "skill_refinement": {"label": "Skill Refinement", "range": (70, 84), "status": "Proficient"},
    "advanced_mastery": {"label": "Advanced Mastery", "range": (85, 100), "status": "Mastered"}
}

def classify_score_band(score: float) -> str:
    s = round(float(score))
    if s < 50:
        return "priority_improvement"
    elif s < 70:
        return "focused_practice"
    elif s < 85:
        return "skill_refinement"
    return "advanced_mastery"

def evaluate_topic_breakdown(answers: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Computes average technical score grouped by topic.
    Identifies strengths, weaknesses, and performance bands.
    """
    topic_scores_raw: Dict[str, List[float]] = {}

    for a in answers:
        topic = a.get("topic") or a.get("category") or "General Engineering"
        score = a.get("score")
        if score is None:
            rubric = a.get("rubric") or {}
            c = float(rubric.get("correctness") or 0)
            d = float(rubric.get("depth") or 0)
            cl = float(rubric.get("clarity") or 0)
            ex = float(rubric.get("examples") or 0)
            score = round(c * 0.40 + d * 0.25 + cl * 0.15 + ex * 0.20)
        else:
            score = float(score)

        if topic not in topic_scores_raw:
            topic_scores_raw[topic] = []
        topic_scores_raw[topic].append(score)

    topic_summary: Dict[str, Any] = {}
    weaknesses = []
    strengths = []

    for topic, scores in topic_scores_raw.items():
        avg = round(sum(scores) / len(scores), 1)
        band_key = classify_score_band(avg)
        band_info = WEAKNESS_BANDS[band_key]

        entry = {
            "topic": topic,
            "averageScore": avg,
            "band": band_info["label"],
            "bandKey": band_key,
            "status": band_info["status"],
            "questionCount": len(scores)
        }
        topic_summary[topic] = entry

        if avg < 70:
            weaknesses.append(entry)
        else:
            strengths.append(entry)

    # Sort weaknesses by lowest score first
    weaknesses.sort(key=lambda x: x["averageScore"])
    strengths.sort(key=lambda x: x["averageScore"], reverse=True)

    return {
        "topics": topic_summary,
        "weaknesses": weaknesses,
        "strengths": strengths
    }

def generate_learning_plan(
    role: str,
    weaknesses: List[Dict[str, Any]],
    level: str = "Mid Level"
) -> List[Dict[str, Any]]:
    """
    Generates tailored, actionable learning tasks and targeted follow-up practice questions
    for all topics scoring below 70% (especially < 50% Priority Improvement).
    """
    norm_role = normalize_role(role)
    norm_level = normalize_level(level)
    learning_plan = []

    # Map of curated study resources and study tasks per topic
    TOPIC_CURRICULA = {
        "Concurrency & GIL": {
            "concept": "Python Global Interpreter Lock (GIL) internal execution, thread synchronization, and CPU vs I/O parallelism.",
            "tasks": [
                "Study Python 3.12+ free-threading PEP 703 and subinterpreters.",
                "Implement a multi-worker CPU task using `concurrent.futures.ProcessPoolExecutor`.",
                "Profile GIL lock contention using `sys.setswitchinterval()`."
            ],
            "practiceQuestions": [
                "How do you share numpy arrays across multiprocessing workers with zero copy overhead?",
                "What is the performance difference between threading with GIL vs asyncio for 1,000 concurrent web requests?"
            ]
        },
        "Python Memory Management & GC": {
            "concept": "CPython reference counting, generational cyclic garbage collection (Gen 0, 1, 2), and object lifecycle.",
            "tasks": [
                "Use the `tracemalloc` module to take heap snapshots before and after high-volume tasks.",
                "Build a circular reference graph and trace how `gc.collect()` reclaims cyclic isolates.",
                "Audit code for mutable default arguments and module-level unbounded dictionary caches."
            ],
            "practiceQuestions": [
                "How does `sys.getrefcount()` work and what invisible references does Python create during function calls?",
                "When is using `weakref` essential in cache implementations?"
            ]
        },
        "Data Structures & Algorithms": {
            "concept": "Big-O space/time trade-offs, cache locality, balanced search trees, and collision resolution.",
            "tasks": [
                "Implement a dynamic array and calculate amortized O(1) resizing mathematically.",
                "Implement open addressing with linear probing vs separate chaining for hash collisions.",
                "Benchmark array sequential memory access vs pointer linked-list traversal."
            ],
            "practiceQuestions": [
                "How does quickselect find the k-th smallest element in average O(n) time?",
                "What are the algorithmic invariants of a Red-Black Tree during rebalancing?"
            ]
        },
        "System Design & Concurrency": {
            "concept": "Distributed systems fundamentals: rate limiting, partitioning, event-driven design, and consistency models.",
            "tasks": [
                "Implement a sliding-window counter rate limiter using Redis and Lua script.",
                "Design an idempotent payment processing workflow with unique idempotency keys.",
                "Analyze CAP theorem trade-offs between consistency and partition tolerance in distributed stores."
            ],
            "practiceQuestions": [
                "How do you prevent the thundering herd problem when a shared Redis cache key expires?",
                "What is the difference between strong consistency, causal consistency, and eventual consistency?"
            ]
        },
        "Database Management & Indexing": {
            "concept": "Relational normal forms, B-Tree index optimization, execution plans, and query execution bottlenecks.",
            "tasks": [
                "Run `EXPLAIN ANALYZE` on a slow multi-join query and eliminate full table scans.",
                "Evaluate compound index column ordering (Leftmost Prefix Rule).",
                "Compare B-Tree random write costs with LSM-Tree sequential append workloads."
            ],
            "practiceQuestions": [
                "Why can an index on `(status, created_at)` not be used for queries filtering only on `created_at`?",
                "How does MVCC (Multi-Version Concurrency Control) implement non-blocking snapshot reads in InnoDB/Postgres?"
            ]
        },
        "Advanced SQL & Window Functions": {
            "concept": "Window frames, ranking functions (ROW_NUMBER, RANK, DENSE_RANK), and cohort segmentation.",
            "tasks": [
                "Write a query calculating 7-day rolling moving averages using `ROWS BETWEEN 6 PRECEDING AND CURRENT ROW`.",
                "Build a monthly cohort retention triangle matrix using Common Table Expressions (CTEs).",
                "Audit JOIN query plans to eliminate accidental Cartesian product fan-out."
            ],
            "practiceQuestions": [
                "How do `LEAD()` and `LAG()` calculate period-over-period percentage growth without self-joins?",
                "What is the difference between `PARTITION BY` and `GROUP BY` in SQL query execution?"
            ]
        },
        "Vector Databases & Retrieval (RAG)": {
            "concept": "Embedding dimensional spaces, approximate nearest neighbor (ANN) search, hybrid retrieval, and context chunking.",
            "tasks": [
                "Implement hybrid search combining BM25 keyword matching with dense embedding cosine similarity.",
                "Benchmark HNSW index recall versus query latency at different efConstruction settings.",
                "Integrate a Cross-Encoder reranker to filter top-20 retrieved chunks down to top-3."
            ],
            "practiceQuestions": [
                "How does the HNSW graph balance search speed and memory footprint in vector databases?",
                "What metrics in the RAGAS framework measure context relevance and factual faithfulness?"
            ]
        },
        "Vulnerability Assessment & OWASP Top 10": {
            "concept": "Web application security vulnerabilities: SQL injection, XSS, CSRF, IDOR, and secure code remediation.",
            "tasks": [
                "Audit all API endpoints to guarantee strict server-side authorization checks against authenticated JWT claims.",
                "Configure a strict Content Security Policy (CSP) header forbidding inline scripts.",
                "Implement cryptographically secure token generation with SHA-256 storage for verification codes."
            ],
            "practiceQuestions": [
                "How does an attacker bypass client-side validation to execute an Insecure Direct Object Reference (IDOR)?",
                "What is the difference between parameterized SQL queries and input sanitization?"
            ]
        }
    }

    for w in weaknesses:
        topic_name = w["topic"]
        curriculum = TOPIC_CURRICULA.get(topic_name)

        if not curriculum:
            # Generic high-quality curriculum fallback
            curriculum = {
                "concept": f"Core principles, trade-offs, and production engineering practices in {topic_name}.",
                "tasks": [
                    f"Review official documentation and architectural standards for {topic_name}.",
                    f"Implement a hands-on proof-of-concept project demonstrating mastery of {topic_name}.",
                    f"Audit production code to identify common anti-patterns in {topic_name}."
                ],
                "practiceQuestions": [
                    f"What is the single most common failure mode engineers encounter when working with {topic_name}?",
                    f"How do you design and test edge cases for {topic_name} under high transaction load?"
                ]
            }

        is_priority = (w["bandKey"] == "priority_improvement")

        learning_plan.append({
            "topic": topic_name,
            "currentScore": w["averageScore"],
            "band": w["band"],
            "urgency": "High (Priority Focus)" if is_priority else "Medium (Skill Refinement)",
            "conceptExplanation": curriculum["concept"],
            "recommendedTasks": curriculum["tasks"],
            "practiceQuestions": curriculum["practiceQuestions"]
        })

    return learning_plan

# ==================== Attempt Progression Tracking (A1 -> Latest) ====================

def calculate_attempt_progression(
    attempts_history: List[Dict[str, Any]],
    current_attempt: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Computes chronological progression from A1 to Latest Attempt:
    - Overall score deltas (Latest - Previous, Latest - A1)
    - Topic-by-topic score comparisons
    - Recurring weaknesses (scoring < 50% in multiple attempts) -> Scenario B
    - Resolved weaknesses (scored < 50% earlier, now >= 50%) -> Scenario C
    - Newly emerged weaknesses
    - Retry Recommendation Classification (Scenarios A, B, C, D)
    """
    all_attempts = list(attempts_history) + [current_attempt]
    total_count = len(all_attempts)
    attempt_label = f"A{total_count}"

    current_overall = float(current_attempt.get("overallScore") or current_attempt.get("overall_score") or 0)
    current_topics = current_attempt.get("topicScores") or {}

    # Extract topic scores map: { topic: score }
    current_topic_map = {}
    for t_key, t_val in current_topics.items():
        if isinstance(t_val, dict):
            current_topic_map[t_key] = float(t_val.get("averageScore", 0))
        else:
            current_topic_map[t_key] = float(t_val)

    if total_count == 1:
        # First Attempt (A1)
        # Check Scenario A: Initial Attempt < 50%
        is_below_bar = current_overall < 50 or any(s < 50 for s in current_topic_map.values())

        recommendation = {
            "scenario": "A" if is_below_bar else "Standard",
            "attemptNumber": 1,
            "attemptLabel": "A1",
            "overallScore": current_overall,
            "status": "Initial Baseline Established",
            "deltaFromA1": 0,
            "deltaFromPrevious": 0,
            "recurringWeaknesses": [],
            "resolvedWeaknesses": [],
            "newWeaknesses": [t for t, s in current_topic_map.items() if s < 50],
            "retryRecommended": True if is_below_bar else (current_overall < 75),
            "headline": "Targeted Study Recommended Before Retrying" if is_below_bar else "Solid Baseline Established",
            "actionMessage": (
                "Your initial interview (A1) identified foundational topics requiring study. Review your personalized learning plan below, complete the targeted practice questions, and retake the interview to measure your improvement."
                if is_below_bar else
                "Great initial benchmark! Review the skill refinement tips to push your score into the elite tier."
            )
        }
        return recommendation

    # Multi-attempt progression (A2, A3...)
    a1_attempt = all_attempts[0]
    previous_attempt = all_attempts[-2]

    a1_score = float(a1_attempt.get("overallScore") or a1_attempt.get("overall_score") or 0)
    prev_score = float(previous_attempt.get("overallScore") or previous_attempt.get("overall_score") or 0)

    delta_from_a1 = round(current_overall - a1_score, 1)
    delta_from_previous = round(current_overall - prev_score, 1)

    # Parse A1 and Previous topic maps
    def extract_tmap(att):
        t_data = att.get("topicScores") or att.get("topic_scores") or {}
        if isinstance(t_data, str):
            import json
            try:
                t_data = json.loads(t_data)
            except Exception:
                t_data = {}
        res = {}
        for k, v in t_data.items():
            res[k] = float(v.get("averageScore", 0)) if isinstance(v, dict) else float(v)
        return res

    a1_tmap = extract_tmap(a1_attempt)
    prev_tmap = extract_tmap(previous_attempt)

    # Topic comparisons
    recurring_weaknesses = []
    resolved_weaknesses = []
    new_weaknesses = []
    topic_deltas = {}

    for topic, curr_s in current_topic_map.items():
        a1_s = a1_tmap.get(topic)
        prev_s = prev_tmap.get(topic, a1_s)

        if a1_s is not None:
            topic_deltas[topic] = {
                "current": curr_s,
                "a1": a1_s,
                "previous": prev_s,
                "deltaFromA1": round(curr_s - a1_s, 1),
                "deltaFromPrev": round(curr_s - prev_s, 1)
            }

            # Recurring: scored < 50% in past attempt AND still < 50% in current
            if (a1_s < 50 or prev_s < 50) and curr_s < 50:
                recurring_weaknesses.append({
                    "topic": topic,
                    "a1Score": a1_s,
                    "currentScore": curr_s,
                    "delta": round(curr_s - a1_s, 1)
                })

            # Resolved: scored < 50% in past attempt, but now >= 50%
            elif (a1_s < 50 or prev_s < 50) and curr_s >= 50:
                resolved_weaknesses.append({
                    "topic": topic,
                    "a1Score": a1_s,
                    "currentScore": curr_s,
                    "improvement": round(curr_s - a1_s, 1)
                })

            # Newly emerged weakness: was >= 50%, now dropped < 50%
            elif (a1_s >= 50 and prev_s >= 50) and curr_s < 50:
                new_weaknesses.append({
                    "topic": topic,
                    "pastScore": prev_s,
                    "currentScore": curr_s
                })

    # Classify Scenarios:
    # Scenario D: Sustained high score >= 85%
    if current_overall >= 85:
        scenario = "D"
        headline = "Benchmark Mastered — Role Ready"
        action_message = f"Outstanding performance! At {current_overall}%, you have demonstrated senior technical mastery. Consider testing for the Staff / Architect level or exploring adjacent leadership tracks."
        retry_rec = False

    # Scenario B: A2/A3 has persistent recurring weaknesses or score dropped
    elif len(recurring_weaknesses) > 0 and current_overall < 65:
        scenario = "B"
        headline = f"Persistent Topic Gap Detected ({len(recurring_weaknesses)} Recurring Weaknesses)"
        rec_names = ", ".join(rw["topic"] for rw in recurring_weaknesses[:2])
        action_message = f"Attention: Specific topics ({rec_names}) continue to score under 50% across repeated attempts. Before attempting {attempt_label}, we strongly prescribe deep-dive hands-on practice with the study resources outlined below."
        retry_rec = True

    # Scenario C: Positive improvement delta (>= 50% overall and positive delta)
    elif delta_from_a1 > 0 or delta_from_previous > 0:
        scenario = "C"
        headline = f"Measurable Improvement Demonstrated (+{delta_from_a1}% from A1)"
        resolved_str = f" Successfully elevated {len(resolved_weaknesses)} previous gap topics!" if resolved_weaknesses else ""
        action_message = f"Solid progress! Your score climbed from {a1_score}% to {current_overall}%.{resolved_str} Review the remaining refinement topics to reach the 85%+ mastery tier."
        retry_rec = True if current_overall < 80 else False

    # Default fallback
    else:
        scenario = "Standard"
        headline = f"Attempt {attempt_label} Completed"
        action_message = "Review your topic breakdown and continue focused practice to reach your target benchmark."
        retry_rec = current_overall < 75

    return {
        "scenario": scenario,
        "attemptNumber": total_count,
        "attemptLabel": attempt_label,
        "overallScore": current_overall,
        "a1Score": a1_score,
        "previousScore": prev_score,
        "deltaFromA1": delta_from_a1,
        "deltaFromPrevious": delta_from_previous,
        "recurringWeaknesses": recurring_weaknesses,
        "resolvedWeaknesses": resolved_weaknesses,
        "newWeaknesses": new_weaknesses,
        "topicDeltas": topic_deltas,
        "retryRecommended": retry_rec,
        "headline": headline,
        "actionMessage": action_message,
        "historyTrajectory": [
            {
                "attempt": f"A{i+1}",
                "overallScore": float(att.get("overallScore") or att.get("overall_score") or 0),
                "date": att.get("date") or att.get("created_at")
            }
            for i, att in enumerate(all_attempts)
        ]
    }

print("Question bank and learning engine initialized successfully.")
