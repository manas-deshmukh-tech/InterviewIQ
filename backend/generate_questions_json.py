import json

# Define the 13 roles and questions
data = {}

# 1. Software Developer
data["Software Developer"] = [
    {
        "id": "sd_entry_1",
        "question": "What is the difference between an Array and a Linked List in memory? When would you prefer one over the other for insertion and lookup operations?",
        "topic": "Data Structures & Algorithms",
        "questionType": "conceptual",
        "level": "Fresher / Entry",
        "idealKeywords": ["contiguous memory", "pointer traversal", "O(1) random access", "O(n) search", "O(1) insertion at head", "cache locality"],
        "rubric": {
            "correctness": "Accurately compares contiguous memory allocation with node pointers.",
            "depth": "Explains CPU cache line hits for arrays versus pointer overhead.",
            "clarity": "Structured comparison of access vs insertion time complexity.",
            "examples": "Provides practical example such as frequent inserts at head vs indexed lookup."
        },
        "followUp": "How would dynamic array resizing (amortized O(1)) affect your decision?"
    },
    {
        "id": "sd_entry_2",
        "question": "Explain the four core principles of Object-Oriented Programming (OOP) and give a practical software example of Polymorphism in action.",
        "topic": "Object-Oriented Design",
        "questionType": "conceptual",
        "level": "Fresher / Entry",
        "idealKeywords": ["Encapsulation", "Abstraction", "Inheritance", "Polymorphism", "method overriding", "method overloading", "interface"],
        "rubric": {
            "correctness": "Correctly defines Encapsulation, Abstraction, Inheritance, and Polymorphism.",
            "depth": "Differentiates compile-time (overloading) vs runtime (overriding) polymorphism.",
            "clarity": "Crisp definitions without confusing inheritance with composition.",
            "examples": "Uses an interface or shape/payment processor polymorphic hierarchy."
        },
        "followUp": "Why do senior engineers often favor composition over inheritance?"
    },
    {
        "id": "sd_entry_3",
        "question": "What is the fundamental difference between a Process and a Thread? How do they share or isolate memory and system resources?",
        "topic": "Operating Systems & Memory",
        "questionType": "conceptual",
        "level": "Fresher / Entry",
        "idealKeywords": ["independent address space", "shared heap", "thread stack", "context switching", "IPC", "overhead"],
        "rubric": {
            "correctness": "Accurately outlines memory isolation between processes versus shared heap among threads.",
            "depth": "Identifies context switching overhead differences and inter-process communication requirements.",
            "clarity": "Clear delineation of OS primitives.",
            "examples": "References multi-process browser architecture vs multithreaded web server."
        },
        "followUp": "What happens when one thread experiences an unhandled memory segmentation fault?"
    },
    {
        "id": "sd_mid_1",
        "question": "How would you choose between a Hash Table and a Balanced Binary Search Tree (such as a Red-Black Tree) for search-heavy operations? Explain their time complexities and collision handling.",
        "topic": "Data Structures & Algorithms",
        "questionType": "conceptual",
        "level": "Mid Level",
        "idealKeywords": ["O(1) average", "O(log n) guaranteed", "collision resolution", "chaining", "open addressing", "in-order traversal", "worst case O(n)", "sorted order"],
        "rubric": {
            "correctness": "Accurately articulates average O(1) for hash table vs guaranteed O(log n) for BST, and ordered traversal advantages of BST.",
            "depth": "Explains collision resolution strategies, cache locality, and worst-case hash degradation.",
            "clarity": "Logically structured with clear comparative terminology.",
            "examples": "Uses practical example like range queries vs exact key lookups."
        },
        "followUp": "How does the performance change when dealing with millions of concurrent read and write operations?"
    },
    {
        "id": "sd_mid_2",
        "question": "Explain the four necessary conditions for a Deadlock in an Operating System. How can an engineering system prevent or recover from deadlock situations?",
        "topic": "Operating Systems & Memory",
        "questionType": "troubleshooting",
        "level": "Mid Level",
        "idealKeywords": ["Mutual Exclusion", "Hold and Wait", "No Preemption", "Circular Wait", "Banker's algorithm", "resource allocation graph", "lock ordering"],
        "rubric": {
            "correctness": "Accurately lists Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait.",
            "depth": "Explains preventive techniques like strict lock ordering hierarchy and timeouts.",
            "clarity": "Methodical explanation with OS terminology.",
            "examples": "Describes a classic dining philosophers or database multi-table lock scenario."
        },
        "followUp": "What is the difference between deadlock, livelock, and starvation in multithreaded systems?"
    },
    {
        "id": "sd_mid_3",
        "question": "What is database normalization? Explain 1NF, 2NF, and 3NF, and discuss when intentional denormalization is justified in production systems.",
        "topic": "Database Management & Indexing",
        "questionType": "practical",
        "level": "Mid Level",
        "idealKeywords": ["atomic values", "partial dependency", "transitive dependency", "redundancy", "join latency", "read-heavy workloads", "write overhead"],
        "rubric": {
            "correctness": "Clearly explains 1NF (atomicity), 2NF (no partial dependency), 3NF (no transitive dependency).",
            "depth": "Weighs data integrity benefits against join query performance penalties at scale.",
            "clarity": "Logical progression through normal forms.",
            "examples": "Cites real e-commerce order snapshots or reporting read replicas."
        },
        "followUp": "How do you maintain data consistency when updating denormalized duplicate columns?"
    },
    {
        "id": "sd_mid_4",
        "question": "How do you approach writing clean, testable code adhering to the SOLID principles? Choose one principle and demonstrate a refactoring scenario.",
        "topic": "Object-Oriented Design",
        "questionType": "coding",
        "level": "Mid Level",
        "idealKeywords": ["Single Responsibility", "Open-Closed", "Liskov Substitution", "Interface Segregation", "Dependency Inversion", "decoupling", "unit testing"],
        "rubric": {
            "correctness": "Selects a principle and accurately details its architectural justification.",
            "depth": "Shows concrete before/after coupling analysis.",
            "clarity": "Articulate explanation of testability improvements.",
            "examples": "Presents refactoring from hardcoded instantiation to dependency injection."
        },
        "followUp": "How does Dependency Inversion differ from Dependency Injection?"
    },
    {
        "id": "sd_sr_1",
        "question": "How would you design a distributed rate limiter capable of handling 500,000 requests per second across multiple regional data centers?",
        "topic": "System Design & Concurrency",
        "questionType": "system_design",
        "level": "Senior",
        "idealKeywords": ["Token Bucket", "Leaky Bucket", "Sliding Window Log", "Redis cluster", "Lua script atomicity", "race conditions", "eventual consistency"],
        "rubric": {
            "correctness": "Selects appropriate algorithm (Token Bucket or Sliding Window Counter) and distributed storage.",
            "depth": "Addresses race conditions, network partition latency, and Lua script atomic execution.",
            "clarity": "High-level architectural blueprint with back-of-the-envelope calculations.",
            "examples": "References API gateway integrations like Kong, Envoy, or Cloudflare."
        },
        "followUp": "What is your fail-open versus fail-closed strategy during a Redis cluster outage?"
    },
    {
        "id": "sd_sr_2",
        "question": "Describe a scenario where a critical backend service suffered from sudden CPU spikes and thread pool exhaustion. How would you diagnose and isolate the root cause?",
        "topic": "Debugging & Reliability",
        "questionType": "troubleshooting",
        "level": "Senior",
        "idealKeywords": ["thread dumps", "profiling", "async I/O", "blocking calls", "garbage collection pauses", "connection pool starvation", "flame graphs"],
        "rubric": {
            "correctness": "Articulates systematic diagnostic workflow (metrics -> logs -> thread dumps -> profiling).",
            "depth": "Identifies common culprits like synchronized locks, runaway regex, or thread starvation.",
            "clarity": "Methodical, calm problem-solving delivery.",
            "examples": "Uses real-world tools such as jstack, pprof, VisualVM, or Datadog flame graphs."
        },
        "followUp": "How do you configure circuit breakers to stop cascading failures across downstream services?"
    },
    {
        "id": "sd_sr_3",
        "question": "Compare B-Tree and LSM-Tree storage engines. Which would you select for a write-intensive time-series ingest pipeline versus a read-heavy relational catalog?",
        "topic": "Database Management & Indexing",
        "questionType": "optimization",
        "level": "Senior",
        "idealKeywords": ["B-Tree random writes", "LSM sequential append", "MemTable", "SSTables", "compaction overhead", "write amplification", "read amplification"],
        "rubric": {
            "correctness": "Correctly pairs LSM-Tree for write-heavy append workloads (Cassandra/RocksDB) and B-Tree for balanced reads (Postgres/MySQL InnoDB).",
            "depth": "Deeply analyzes write amplification, bloom filters, and background compaction.",
            "clarity": "Comparative architectural trade-off analysis.",
            "examples": "Contrasts MySQL InnoDB vs Apache Cassandra or RocksDB."
        },
        "followUp": "How does compaction stall in LSM trees impact p99 tail latency?"
    },
    {
        "id": "sd_staff_1",
        "question": "As a Principal Architect, how do you define technical vision and govern architectural decision records (ADRs) when migrating a legacy monolith to event-driven microservices?",
        "topic": "System Design & Concurrency",
        "questionType": "system_design",
        "level": "Staff / Architect",
        "idealKeywords": ["Strangler Fig pattern", "domain-driven design", "bounded contexts", "event sourcing", "CQRS", "ADRs", "organizational alignment", "data consistency"],
        "rubric": {
            "correctness": "Proposes Strangler Fig pattern with clear domain boundary decomposition.",
            "depth": "Addresses dual-write challenges, distributed transactions (Saga), and change management.",
            "clarity": "Executive-level clarity with strong engineering empathy.",
            "examples": "References transactional outbox pattern and Apache Kafka/Debezium CDC."
        },
        "followUp": "How do you convince reluctant product managers to prioritize technical debt repayment and migration risks?"
    },
    {
        "id": "sd_staff_2",
        "question": "How do you design a zero-downtime database schema migration strategy for a high-traffic table with 500 million rows and 10,000 writes per second?",
        "topic": "Debugging & Reliability",
        "questionType": "optimization",
        "level": "Staff / Architect",
        "idealKeywords": ["Expand and Contract pattern", "online schema change", "gh-ost", "pt-online-schema-change", "shadow tables", "dual writing", "backward compatibility"],
        "rubric": {
            "correctness": "Applies Expand-and-Contract (multi-phase migration) or shadow copy tooling.",
            "depth": "Analyzes table locks, replication lag on replicas, and rollback safeguards.",
            "clarity": "Rigorous phase-by-phase rollout schedule.",
            "examples": "Details gh-ost binlog stream parsing or pt-osc trigger approaches."
        },
        "followUp": "How would you handle a schema change that requires backfilling computed values without locking rows?"
    }
]

print("Software Developer defined with", len(data["Software Developer"]), "questions.")
