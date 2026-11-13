"""
InterviewIQ Comprehensive Evaluation Dataset
Contains representative test cases across diverse roles, levels, and scenario types
for rigorous, repeatable accuracy and calibration benchmarking.
"""

from typing import List, Dict, Any

EVALUATION_DATASET: List[Dict[str, Any]] = [
    # -------------------------------------------------------------------------
    # 1. Correct Technical Answers (Mid & Senior Level)
    # -------------------------------------------------------------------------
    {
        "id": "TC-TECH-CORRECT-01",
        "case_type": "correct_technical",
        "role": "Backend Engineer",
        "experience_level": "Mid Level",
        "category": "Technical",
        "question": "Explain the difference between TCP and UDP protocols and when to use each.",
        "ideal_answer": "TCP is a connection-oriented protocol that guarantees delivery using a 3-way handshake, sequence numbers, and retransmission. UDP is connectionless and best-effort with minimal latency overhead, ideal for real-time streaming, gaming, and DNS.",
        "ideal_keywords": ["tcp", "udp", "connection-oriented", "connectionless", "handshake", "reliable", "latency"],
        "answer": "TCP is a connection-oriented protocol requiring a three-way handshake to establish reliability, flow control, and ordered packet delivery. In contrast, UDP is connectionless and transmits datagrams with minimal overhead and no retransmission. I use TCP for critical transactions like HTTP and file transfer, whereas UDP is ideal for gaming, VoIP, and DNS queries where low latency matters more than packet loss.",
        "expected_band": (80, 96),
        "is_off_topic": False,
        "max_acceptable_score": 100,
        "min_acceptable_score": 75
    },
    {
        "id": "TC-TECH-CORRECT-02",
        "case_type": "correct_technical",
        "role": "Full Stack Engineer",
        "experience_level": "Senior / Lead",
        "category": "System Design",
        "question": "What is database indexing, how does a B-Tree index work, and what are its trade-offs?",
        "ideal_answer": "Database indexing creates balanced B-Tree structures to reduce search time complexity from O(N) full table scans to O(log N). Trade-offs include write amplification during INSERT/UPDATE and storage overhead.",
        "ideal_keywords": ["b-tree", "lookup", "performance", "query", "o(log n)", "overhead", "write"],
        "answer": "A database index creates an auxiliary balanced tree data structure, typically a B+ Tree, allowing select queries to locate records in O(log N) operations instead of O(N) full table scans. The key trade-off is write overhead: every INSERT, UPDATE, or DELETE requires rebalancing tree nodes and updating index pages on disk, plus additional storage.",
        "expected_band": (78, 95),
        "is_off_topic": False,
        "max_acceptable_score": 100,
        "min_acceptable_score": 72
    },

    # -------------------------------------------------------------------------
    # 2. Partially Correct Answers (Missing Core Depth or Trade-offs)
    # -------------------------------------------------------------------------
    {
        "id": "TC-PARTIAL-01",
        "case_type": "partially_correct",
        "role": "Backend Engineer",
        "experience_level": "Mid Level",
        "category": "Technical",
        "question": "What is database indexing and why is it used?",
        "ideal_answer": "Database indexing creates balanced tree or hash structures to speed up lookups from O(N) to O(log N) at the cost of write latency and storage.",
        "ideal_keywords": ["b-tree", "lookup", "performance", "query", "o(log n)", "primary key"],
        "answer": "Indexing is used in databases to make search queries faster. It works like an index at the back of a book so MySQL doesn't have to scan every row.",
        "expected_band": (50, 68),
        "is_off_topic": False,
        "max_acceptable_score": 70,
        "min_acceptable_score": 45
    },

    # -------------------------------------------------------------------------
    # 3. Completely Irrelevant / Off-Topic Answers
    # -------------------------------------------------------------------------
    {
        "id": "TC-OFFTOPIC-01",
        "case_type": "completely_irrelevant",
        "role": "Frontend Engineer",
        "experience_level": "Entry Level",
        "category": "Technical",
        "question": "What is the Virtual DOM in React and how does reconciliation work?",
        "ideal_answer": "The Virtual DOM is an in-memory lightweight representation of the real DOM. Reconciliation diffs virtual trees and applies batch updates to the real DOM.",
        "ideal_keywords": ["virtual dom", "reconciliation", "diffing", "batch", "render"],
        "answer": "I really love going to the beach on weekends and playing football with my college friends. Afterwards we usually order cheese pizza and watch movies.",
        "expected_band": (0, 10),
        "is_off_topic": True,
        "max_acceptable_score": 10,
        "min_acceptable_score": 0
    },

    # -------------------------------------------------------------------------
    # 4. Empty and Extremely Short Answers
    # -------------------------------------------------------------------------
    {
        "id": "TC-EMPTY-01",
        "case_type": "empty_answer",
        "role": "Software Developer",
        "experience_level": "Mid Level",
        "category": "Technical",
        "question": "How do you handle race conditions in multi-threaded applications?",
        "ideal_answer": "Use mutexes, locks, atomic variables, or optimistic concurrency control.",
        "ideal_keywords": ["mutex", "lock", "atomic", "concurrency", "thread"],
        "answer": "",
        "expected_band": (0, 0),
        "is_off_topic": False,
        "max_acceptable_score": 0,
        "min_acceptable_score": 0
    },
    {
        "id": "TC-VERY-SHORT-01",
        "case_type": "extremely_short",
        "role": "Software Developer",
        "experience_level": "Mid Level",
        "category": "Technical",
        "question": "How do you handle race conditions in multi-threaded applications?",
        "ideal_answer": "Use mutexes, locks, atomic operations, or semaphores.",
        "ideal_keywords": ["mutex", "lock", "atomic", "concurrency", "thread"],
        "answer": "use lock",
        "expected_band": (15, 30),
        "is_off_topic": False,
        "max_acceptable_score": 35,
        "min_acceptable_score": 10
    },

    # -------------------------------------------------------------------------
    # 5. Long Answers Containing Incorrect Information / Confident Fluff
    # -------------------------------------------------------------------------
    {
        "id": "TC-CONFIDENT-FLUFF-01",
        "case_type": "confident_incorrect",
        "role": "Backend Engineer",
        "experience_level": "Senior / Lead",
        "category": "Technical",
        "question": "Explain the difference between TCP and UDP protocols in computer networking.",
        "ideal_answer": "TCP is connection-oriented and reliable. UDP is connectionless and unreliable.",
        "ideal_keywords": ["tcp", "udp", "connection-oriented", "connectionless", "handshake", "reliable"],
        "answer": "In our enterprise architecture, UDP is the primary connection-oriented protocol that guarantees delivery through a strict three-way handshake and ordered sequencing. Meanwhile, TCP is completely connectionless and best-effort without any delivery confirmations or flow control, making TCP the preferred protocol for rapid streaming.",
        "expected_band": (20, 38),
        "is_off_topic": False,
        "max_acceptable_score": 40,
        "min_acceptable_score": 15
    },
    {
        "id": "TC-LONG-INCORRECT-02",
        "case_type": "long_incorrect",
        "role": "Data Scientist",
        "experience_level": "Mid Level",
        "category": "Technical",
        "question": "Why is HTTP considered a stateless protocol and how do web applications maintain user sessions?",
        "ideal_answer": "HTTP is stateless because each request is executed independently without retaining server context. Sessions are maintained via cookies, tokens, or server-side session stores.",
        "ideal_keywords": ["stateless", "cookie", "session", "token", "request", "header"],
        "answer": "As we know from standard computer science, HTTP is inherently stateful and maintains persistent memory across requests without needing any client tokens, cookies, or database lookups. The protocol automatically saves user logins across different machines naturally.",
        "expected_band": (20, 38),
        "is_off_topic": False,
        "max_acceptable_score": 40,
        "min_acceptable_score": 15
    },

    # -------------------------------------------------------------------------
    # 6. Technically Correct Paraphrased Answers (Robustness & Consistency)
    # -------------------------------------------------------------------------
    {
        "id": "TC-PARAPHRASE-A",
        "case_type": "paraphrase_pair_a",
        "role": "Full Stack Engineer",
        "experience_level": "Mid Level",
        "category": "Technical",
        "question": "What is database indexing and why is it used?",
        "ideal_answer": "Database indexing creates B-Tree data structures to speed up query lookups from O(N) to O(log N) at the cost of write overhead.",
        "ideal_keywords": ["b-tree", "lookup", "performance", "query", "o(log n)", "primary key"],
        "answer": "Database indexing creates a B-Tree data structure to speed up query lookups from O(N) to O(log N) at the cost of write overhead.",
        "expected_band": (60, 75),
        "is_off_topic": False,
        "max_acceptable_score": 85,
        "min_acceptable_score": 55
    },
    {
        "id": "TC-PARAPHRASE-B",
        "case_type": "paraphrase_pair_b",
        "role": "Full Stack Engineer",
        "experience_level": "Mid Level",
        "category": "Technical",
        "question": "What is database indexing and why is it used?",
        "ideal_answer": "Database indexing creates B-Tree data structures to speed up query lookups from O(N) to O(log N) at the cost of write overhead.",
        "ideal_keywords": ["b-tree", "lookup", "performance", "query", "o(log n)", "primary key"],
        "answer": "An index in a database uses B-Tree structures to accelerate select queries, reducing time complexity to O(log N) while adding some insert overhead.",
        "expected_band": (60, 75),
        "is_off_topic": False,
        "max_acceptable_score": 85,
        "min_acceptable_score": 55
    },

    # -------------------------------------------------------------------------
    # 7. Answers with Spelling and Grammatical Mistakes / Speech-to-Text Artifacts
    # -------------------------------------------------------------------------
    {
        "id": "TC-TYPO-SPELLING-01",
        "case_type": "spelling_typos",
        "role": "Backend Engineer",
        "experience_level": "Entry Level",
        "category": "Technical",
        "question": "What is database indexing and why is it used?",
        "ideal_answer": "Database indexing creates B-Tree structures to speed up lookups.",
        "ideal_keywords": ["indexing", "b-tree", "lookup", "query", "performance"],
        "answer": "indeksing in db uses b-tre data structur to mak serch queri faster and avoid scaning every singel row.",
        "expected_band": (50, 70),
        "is_off_topic": False,
        "max_acceptable_score": 75,
        "min_acceptable_score": 45
    },

    # -------------------------------------------------------------------------
    # 8. Answers with Technical Terminology Without Substance (Keyword Soup)
    # -------------------------------------------------------------------------
    {
        "id": "TC-KEYWORD-SOUP-01",
        "case_type": "keyword_soup",
        "role": "Full Stack Engineer",
        "experience_level": "Mid Level",
        "category": "Technical",
        "question": "How does React manage state and trigger re-renders?",
        "ideal_answer": "React manages state using useState or useReducer hooks; updates trigger reconciliation.",
        "ideal_keywords": ["state", "reconciliation", "hooks", "usestate", "render"],
        "answer": "React state reconciliation hooks usestate render virtual dom component lifecycle javascript framework cloud microservice kubernetes docker ai.",
        "expected_band": (25, 45),
        "is_off_topic": False,
        "max_acceptable_score": 48,
        "min_acceptable_score": 20
    },

    # -------------------------------------------------------------------------
    # 9. Valid Self-Introductions with 4 Graduated Detail Levels
    # -------------------------------------------------------------------------
    # Level 1: Name + Degree + City (Manaj Deshmukh intro) -> Expected ~38-46
    {
        "id": "TC-INTRO-LEVEL-1",
        "case_type": "intro_level_1",
        "role": "Full Stack Engineer",
        "experience_level": "Entry Level",
        "category": "Behavioral",
        "question": "Tell me about yourself.",
        "ideal_answer": "Candidate introduces identity, educational foundation, technical stack, and a key project.",
        "ideal_keywords": ["degree", "bachelors", "computer", "skills", "projects", "experience"],
        "answer": "My name is Manaj Deshmukh I have completed my bachelors degree in computer application and I am from Naik",
        "expected_band": (38, 48),
        "is_off_topic": False,
        "max_acceptable_score": 50,
        "min_acceptable_score": 35
    },
    # Level 2: Identity + Education + Technical Stack -> Expected ~60-68
    {
        "id": "TC-INTRO-LEVEL-2",
        "case_type": "intro_level_2",
        "role": "Backend Engineer",
        "experience_level": "Entry Level",
        "category": "Behavioral",
        "question": "Tell me about yourself.",
        "ideal_answer": "Candidate introduces identity, educational foundation, technical stack, and a key project.",
        "ideal_keywords": ["degree", "bachelors", "computer", "skills", "projects", "experience"],
        "answer": "My name is Rohan Patil, a BCA graduate from Pune University. I specialize in backend development using Python, FastAPI, and MySQL databases.",
        "expected_band": (58, 68),
        "is_off_topic": False,
        "max_acceptable_score": 72,
        "min_acceptable_score": 55
    },
    # Level 3: Identity + Education + Technical Stack + Real Project -> Expected ~80-88
    {
        "id": "TC-INTRO-LEVEL-3",
        "case_type": "intro_level_3",
        "role": "Full Stack Engineer",
        "experience_level": "Mid Level",
        "category": "Behavioral",
        "question": "Tell me about yourself.",
        "ideal_answer": "Candidate introduces identity, educational foundation, technical stack, and a key project.",
        "ideal_keywords": ["degree", "bachelors", "computer", "skills", "projects", "experience"],
        "answer": "I am Rohan Patil, a Computer Applications graduate specializing in Python, FastAPI, and React. In my final year capstone project, I developed and deployed an automated interview platform that reduced latency by 35% and processed real-time speech telemetry for 200 student users.",
        "expected_band": (78, 88),
        "is_off_topic": False,
        "max_acceptable_score": 92,
        "min_acceptable_score": 75
    },
    # Level 4: Complete 4-Pillar Intro with Career Trajectory -> Expected ~89-96
    {
        "id": "TC-INTRO-LEVEL-4",
        "case_type": "intro_level_4",
        "role": "Full Stack Engineer",
        "experience_level": "Mid Level",
        "category": "Behavioral",
        "question": "Tell me about yourself.",
        "ideal_answer": "Candidate introduces identity, educational foundation, technical stack, key projects, and career aspirations.",
        "ideal_keywords": ["degree", "bachelors", "computer", "skills", "projects", "experience", "goals"],
        "answer": "My name is Rohan Patil, a Computer Applications graduate from Pune University. Over the past two years, I have specialized in full stack software engineering with Python, FastAPI, React, and MySQL. In my recent capstone project, I designed a microservices-based evaluation engine that scaled to 500 concurrent sessions, which reduced server latency by 40%. My career goal is to join an engineering-driven team where I can architect resilient backend systems and solve high-scale distributed data challenges.",
        "expected_band": (88, 96),
        "is_off_topic": False,
        "max_acceptable_score": 98,
        "min_acceptable_score": 85
    },

    # -------------------------------------------------------------------------
    # 10. Correct but Poorly Structured / Run-On Answer
    # -------------------------------------------------------------------------
    {
        "id": "TC-POOR-STRUCTURE-01",
        "case_type": "poor_structure",
        "role": "Backend Engineer",
        "experience_level": "Mid Level",
        "category": "Technical",
        "question": "What is database indexing and why is it used?",
        "ideal_answer": "Database indexing creates balanced tree structures to speed up lookups.",
        "ideal_keywords": ["b-tree", "lookup", "performance", "query", "o(log n)"],
        "answer": "indexing is basically b-tree in database and queries get faster because lookups drop to o(log n) instead of full scan but write performance gets slower when you insert rows and disk space increases too.",
        "expected_band": (55, 72),
        "is_off_topic": False,
        "max_acceptable_score": 75,
        "min_acceptable_score": 50
    }
]

