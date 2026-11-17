# Helper to build complete question bank for Python backend and JS frontend
import json
import os

ROLE_DATA = {
    "Software Developer": {
        "prefix": "sd",
        "categoryKey": "Software Developer",
        "questions": [
            {
                "id": "sd_entry_dsa_1",
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
                "id": "sd_entry_oop_1",
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
                "id": "sd_entry_os_1",
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
                "id": "sd_mid_dsa_1",
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
                "id": "sd_mid_os_1",
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
                "id": "sd_mid_db_1",
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
                "id": "sd_mid_code_1",
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
                "id": "sd_sr_sys_1",
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
                "id": "sd_sr_perf_1",
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
                "id": "sd_sr_db_1",
                "question": "Compare B-Tree and LSM-Tree (Log-Structured Merge-tree) storage engines. Which would you select for a write-intensive time-series ingest pipeline versus a read-heavy relational catalog?",
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
                "id": "sd_staff_arch_1",
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
                "id": "sd_staff_reliab_1",
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
    },

    "Full Stack Developer": {
        "prefix": "fs",
        "categoryKey": "Full Stack Developer",
        "questions": [
            {
                "id": "fs_entry_web_1",
                "question": "What happens when you enter a URL into a web browser? Walk through DNS lookup, TCP/TLS connection, and the browser rendering pipeline.",
                "topic": "Frontend Architecture & State",
                "questionType": "conceptual",
                "level": "Fresher / Entry",
                "idealKeywords": ["DNS lookup", "IP address", "TCP 3-way handshake", "TLS handshake", "DOM tree", "CSSOM", "Render tree", "Reflow and Repaint"],
                "rubric": {
                    "correctness": "Accurately sequences network resolution, transport security, and browser rendering.",
                    "depth": "Explains difference between layout/reflow and repaint.",
                    "clarity": "Logical chronological narrative.",
                    "examples": "References browser devtools network and performance tabs."
                },
                "followUp": "What is the critical rendering path and how can you optimize First Contentful Paint?"
            },
            {
                "id": "fs_entry_api_1",
                "question": "What is a RESTful API? Explain the common HTTP methods (GET, POST, PUT, PATCH, DELETE) and status code ranges (2xx, 3xx, 4xx, 5xx).",
                "topic": "API Design & REST/GraphQL",
                "questionType": "conceptual",
                "level": "Fresher / Entry",
                "idealKeywords": ["stateless", "resources", "idempotent", "PUT vs PATCH", "404 Not Found", "401 Unauthorized", "403 Forbidden", "500 Server Error"],
                "rubric": {
                    "correctness": "Correctly defines REST principles and distinguishes idempotent PUT from partial PATCH.",
                    "depth": "Understands HTTP status code semantics and error contracts.",
                    "clarity": "Clean, structured taxonomy.",
                    "examples": "Gives concrete user resource endpoint examples."
                },
                "followUp": "Why is GET expected to be safe and idempotent, and what happens if a GET endpoint alters database state?"
            },
            {
                "id": "fs_mid_state_1",
                "question": "Compare Server-Side Rendering (SSR), Client-Side Rendering (CSR), and Static Site Generation (SSG). Which would you recommend for an SEO-critical e-commerce storefront?",
                "topic": "Browser Performance & SSR",
                "questionType": "practical",
                "level": "Mid Level",
                "idealKeywords": ["SSR", "CSR", "SSG", "SEO", "Time to First Byte", "First Contentful Paint", "Hydration", "Next.js", "CDN caching"],
                "rubric": {
                    "correctness": "Correctly advocates for SSR or Incremental Static Regeneration (ISR) for dynamic e-commerce catalog.",
                    "depth": "Analyzes server load, TTFB, caching headers, and hydration overhead.",
                    "clarity": "Structured evaluation across performance and developer ergonomics.",
                    "examples": "Contrasts public product catalog (SSR/SSG) with private account dashboard (CSR)."
                },
                "followUp": "What causes hydration mismatch errors in modern frameworks like React or Vue?"
            },
            {
                "id": "fs_mid_auth_1",
                "question": "How do you implement secure user authentication and authorization using JWTs and refresh tokens? Where should tokens be stored on the client to protect against XSS and CSRF?",
                "topic": "Authentication & Security",
                "questionType": "practical",
                "level": "Mid Level",
                "idealKeywords": ["access token", "refresh token", "httpOnly cookie", "SameSite", "CSRF token", "XSS attack", "token revocation", "short expiry"],
                "rubric": {
                    "correctness": "Advocates httpOnly Secure SameSite cookies for refresh tokens rather than localStorage.",
                    "depth": "Addresses token rotation, replay attacks, and token invalidation on logout.",
                    "clarity": "Clear threat-modeling mindset.",
                    "examples": "Illustrates silent token refresh interceptor in axios or fetch."
                },
                "followUp": "How do you handle immediate token revocation if a user's account is compromised before token expiry?"
            },
            {
                "id": "fs_mid_cache_1",
                "question": "How do you implement Redis caching in a full-stack application using the Cache-Aside pattern? How do you prevent cache stampedes and stale data?",
                "topic": "Caching & Distributed Systems",
                "questionType": "optimization",
                "level": "Mid Level",
                "idealKeywords": ["Cache-Aside", "TTL", "cache invalidation", "cache stampede / thundering herd", "mutex lock", "write-through", "Redis"],
                "rubric": {
                    "correctness": "Accurately details Cache-Aside sequence (check cache -> miss -> query DB -> populate cache with TTL).",
                    "depth": "Proposes solutions for thundering herd (distributed locking or probabilistic early expiration).",
                    "clarity": "Diagram-like operational walkthrough.",
                    "examples": "Cites high-volume feed caching or pricing catalog."
                },
                "followUp": "What is the difference between Cache-Aside and Write-Through caching?"
            },
            {
                "id": "fs_mid_db_1",
                "question": "When designing an ORM-backed relational database schema, what causes the 'N+1 queries' problem, and how do you resolve it in SQL and modern ORMs?",
                "topic": "Database Optimization & ORM",
                "questionType": "troubleshooting",
                "level": "Mid Level",
                "idealKeywords": ["N+1 problem", "lazy loading", "eager loading", "JOIN", "pre-fetching", "ORM execution plan", "query batching"],
                "rubric": {
                    "correctness": "Accurately describes how iterative child record fetching triggers N individual queries.",
                    "depth": "Contrasts SQL INNER/LEFT JOIN solutions with ORM select_related / prefetch_related.",
                    "clarity": "Precise query profiling explanation.",
                    "examples": "Uses blog posts with authors or orders with line items."
                },
                "followUp": "Can eager loading cause memory bloat if fetching deep nested associations?"
            },
            {
                "id": "fs_sr_arch_1",
                "question": "How would you design a real-time collaborative application (like Google Docs or Figma) supporting concurrent edits, conflict resolution, and offline sync?",
                "topic": "Frontend Architecture & State",
                "questionType": "system_design",
                "level": "Senior",
                "idealKeywords": ["WebSockets", "Operational Transformation (OT)", "CRDTs", "conflict resolution", "eventual consistency", "IndexedDB", "optimistic UI"],
                "rubric": {
                    "correctness": "Selects Conflict-Free Replicated Data Types (CRDTs) or Operational Transformation (OT).",
                    "depth": "Addresses offline delta queues, reconnection bursts, and peer-to-peer or server-mediated sync.",
                    "clarity": "Architectural mastery spanning client local state and distributed server coordination.",
                    "examples": "References libraries like Yjs, Automerge, or WebSocket protocols."
                },
                "followUp": "How do you maintain user presence markers (cursors) without saturating network bandwidth?"
            },
            {
                "id": "fs_sr_perf_1",
                "question": "How do you optimize Core Web Vitals (LCP, INP, CLS) for a high-traffic web application that loads dynamic third-party scripts and analytics?",
                "topic": "Browser Performance & SSR",
                "questionType": "optimization",
                "level": "Senior",
                "idealKeywords": ["Largest Contentful Paint (LCP)", "Interaction to Next Paint (INP)", "Cumulative Layout Shift (CLS)", "code splitting", "Web Workers", "resource hints (preload, preconnect)", "lazy loading"],
                "rubric": {
                    "correctness": "Accurately targets LCP, INP, and CLS root causes.",
                    "depth": "Explains main thread blocking, aspect ratio containers for CLS, and offloading analytics to Web Workers (e.g. Partytown).",
                    "clarity": "Empirical engineering methodology with Lighthouse/Chrome UX Report metrics.",
                    "examples": "Demonstrates font-display: swap, responsive image srcsets, and dynamic script deferral."
                },
                "followUp": "Why did Google replace First Input Delay (FID) with Interaction to Next Paint (INP)?"
            },
            {
                "id": "fs_sr_api_1",
                "question": "Compare GraphQL and REST for microservice aggregation. Under what scenarios does GraphQL introduce performance risks, such as nested query depth and database denial of service?",
                "topic": "API Design & REST/GraphQL",
                "questionType": "practical",
                "level": "Senior",
                "idealKeywords": ["over-fetching", "under-fetching", "DataLoader batching", "query complexity analysis", "depth limiting", "caching difficulties", "persisted queries"],
                "rubric": {
                    "correctness": "Accurately articulates GraphQL strengths (flexible client payload) and risks (arbitrary nested queries).",
                    "depth": "Addresses DataLoader for solving N+1, query depth limiting, and persisted query security.",
                    "clarity": "Balanced trade-off assessment.",
                    "examples": "Contrasts mobile app optimized queries vs standard CDN HTTP caching in REST."
                },
                "followUp": "How do you implement HTTP-level caching with GraphQL given all queries usually use POST?"
            },
            {
                "id": "fs_staff_arch_1",
                "question": "How would you architect a Micro-Frontend architecture for an enterprise organization with 8 autonomous engineering teams deploying independently?",
                "topic": "Frontend Architecture & State",
                "questionType": "system_design",
                "level": "Staff / Architect",
                "idealKeywords": ["Module Federation", "Webpack 5", "independent CI/CD", "shared design system", "version drift", "cross-application routing", "performance overhead"],
                "rubric": {
                    "correctness": "Evaluates Module Federation, iframe isolation, or Web Components.",
                    "depth": "Addresses shared dependency management (React singletons), performance governance, and contract testing.",
                    "clarity": "Organizational and technical alignment (Conway's Law).",
                    "examples": "Presents runtime integration via Webpack 5 Module Federation."
                },
                "followUp": "How do you prevent CSS style leaks and global JavaScript namespace collisions across micro-frontends?"
            },
            {
                "id": "fs_staff_reliab_1",
                "question": "How do you orchestrate a multi-region Active-Active deployment for a full-stack platform, managing database synchronization and geo-DNS routing?",
                "topic": "Microservices & DevOps",
                "questionType": "system_design",
                "level": "Staff / Architect",
                "idealKeywords": ["Active-Active", "Geo-DNS / Anycast", "bidirectional database replication", "conflict resolution (LWW, CRDT)", "CAP theorem", "disaster recovery"],
                "rubric": {
                    "correctness": "Recognizes latency and consistency trade-offs of multi-master relational vs distributed NoSQL.",
                    "depth": "Explains partition handling, split-brain mitigation, and session affinity.",
                    "clarity": "Enterprise infrastructure resilience analysis.",
                    "examples": "References AWS Aurora Global Database, Cloudflare Anycast, or CockroachDB."
                },
                "followUp": "What is your data recovery procedure if a split-brain condition causes divergent writes across two continents?"
            },
            {
                "id": "fs_staff_sec_1",
                "question": "Walk me through an end-to-end security architecture audit for a fintech platform: covering API gateways, zero-trust network access, secrets management, and OWASP Top 10 mitigations.",
                "topic": "Authentication & Security",
                "questionType": "practical",
                "level": "Staff / Architect",
                "idealKeywords": ["Zero Trust", "mTLS", "HashiCorp Vault", "WAF", "SQL injection", "IDOR prevention", "content security policy (CSP)", "audit logging"],
                "rubric": {
                    "correctness": "Covers defense-in-depth across perimeter, transport, application, and data layers.",
                    "depth": "Details mutual TLS between services, dynamic database credentials, and cryptographic field-level encryption.",
                    "clarity": "Rigorous executive compliance and security posture.",
                    "examples": "References PCI-DSS, SOC2 compliance, and automated SAST/DAST pipelines."
                },
                "followUp": "How do you protect internal microservices from SSRF (Server-Side Request Forgery) attacks?"
            }
        ]
    }
}

print(f"Loaded base roles: {list(ROLE_DATA.keys())}")
