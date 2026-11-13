// Question banks with rubrics and human-validated benchmarks

export const INTERVIEW_ROLES = [
  {
    id: 'software_developer',
    roleNumber: 1,
    title: 'Software Developer',
    icon: '💻',
    categoryKey: 'Software Developer',
    badge: 'Core Tech',
    defaultInterviewerId: 'vikram',
    description: 'Practice technical interviews covering data structures, algorithms, OOP, DBMS, operating systems, and problem-solving.',
    tags: ['DSA', 'Algorithms', 'OOP', 'DBMS', 'OS', 'Problem-Solving']
  },
  {
    id: 'full_stack_developer',
    roleNumber: 2,
    title: 'Full Stack Developer',
    icon: '🌐',
    categoryKey: 'Full Stack Developer',
    badge: 'Web & Systems',
    defaultInterviewerId: 'rohan',
    description: 'Prepare for interviews covering frontend development, backend technologies, APIs, databases, and full-stack application development.',
    tags: ['Frontend', 'Backend', 'APIs', 'Databases', 'Full-Stack Apps']
  },
  {
    id: 'python_developer',
    roleNumber: 3,
    title: 'Python Developer',
    icon: '🐍',
    categoryKey: 'Python Developer',
    badge: 'Backend & Scripting',
    defaultInterviewerId: 'priya',
    description: 'Improve Python programming skills through questions on syntax, OOP, data structures, libraries, and practical coding problems.',
    tags: ['Python Syntax', 'OOP', 'Data Structures', 'AsyncIO', 'Libraries']
  },
  {
    id: 'java_developer',
    roleNumber: 4,
    title: 'Java Developer',
    icon: '☕',
    categoryKey: 'Java Developer',
    badge: 'Enterprise',
    defaultInterviewerId: 'vikram',
    description: 'Prepare for Java interviews covering Core Java, OOP, collections, exception handling, multithreading, and Spring Boot.',
    tags: ['Core Java', 'OOP', 'Collections', 'Multithreading', 'Spring Boot']
  },
  {
    id: 'data_analyst',
    roleNumber: 5,
    title: 'Data Analyst',
    icon: '📊',
    categoryKey: 'Data Analyst',
    badge: 'Analytics & BI',
    defaultInterviewerId: 'priya',
    description: 'Practice data analysis questions involving SQL, Python, Excel, statistics, data cleaning, and visualization tools such as Power BI.',
    tags: ['SQL', 'Python', 'Excel', 'Statistics', 'Data Cleaning', 'Power BI']
  },
  {
    id: 'data_scientist',
    roleNumber: 6,
    title: 'Data Scientist',
    icon: '🧪',
    categoryKey: 'Data Scientist',
    badge: 'Machine Learning',
    defaultInterviewerId: 'priya',
    description: 'Prepare for interviews covering statistics, probability, Python, machine learning algorithms, data modeling, and predictive analytics.',
    tags: ['Statistics', 'Probability', 'ML Algorithms', 'Data Modeling', 'Predictive Analytics']
  },
  {
    id: 'aiml_engineer',
    roleNumber: 7,
    title: 'AI/ML Engineer',
    icon: '🤖',
    categoryKey: 'AI/ML Engineer',
    badge: 'Deep Learning & AI',
    defaultInterviewerId: 'priya',
    description: 'Explore AI and machine learning concepts, neural networks, deep learning, model evaluation, NLP, and AI model deployment.',
    tags: ['Neural Networks', 'Deep Learning', 'NLP', 'Model Evaluation', 'AI Deployment']
  },
  {
    id: 'cybersecurity_analyst',
    roleNumber: 8,
    title: 'Cybersecurity Analyst',
    icon: '🛡️',
    categoryKey: 'Cybersecurity Analyst',
    badge: 'Security & SecOps',
    defaultInterviewerId: 'vikram',
    description: 'Practice questions on network security, vulnerabilities, threat detection, incident response, and security fundamentals.',
    tags: ['Network Security', 'Vulnerabilities', 'Threat Detection', 'Incident Response', 'SecOps']
  },
  {
    id: 'uiux_designer',
    roleNumber: 9,
    title: 'UI/UX Designer',
    icon: '🎨',
    categoryKey: 'UI/UX Designer',
    badge: 'Product Design',
    defaultInterviewerId: 'ananya',
    description: 'Prepare for design interviews covering UX research, user personas, wireframes, prototyping, usability testing, and design principles.',
    tags: ['UX Research', 'User Personas', 'Wireframes', 'Prototyping', 'Usability Testing']
  },
  {
    id: 'business_analyst',
    roleNumber: 10,
    title: 'Business Analyst',
    icon: '📈',
    categoryKey: 'Business Analyst',
    badge: 'Strategy & Ops',
    defaultInterviewerId: 'kavita',
    description: 'Practice business analysis questions on requirement gathering, stakeholder management, documentation, process modeling, and business cases.',
    tags: ['Requirement Gathering', 'Stakeholder Mgmt', 'BRD/FRD', 'Process Modeling', 'Business Cases']
  },
  {
    id: 'hr_interview',
    roleNumber: 11,
    title: 'HR Interview',
    icon: '👔',
    categoryKey: 'HR Interview',
    badge: 'Behavioral & Culture',
    defaultInterviewerId: 'ananya',
    description: 'Improve communication and behavioral interview skills through questions on self-introduction, strengths, weaknesses, teamwork, and workplace situations.',
    tags: ['Self-Introduction', 'Strengths & Weaknesses', 'Teamwork', 'Workplace Scenarios']
  },
  {
    id: 'general_fresher',
    roleNumber: 12,
    title: 'General Fresher Interview',
    icon: '🎓',
    categoryKey: 'General Fresher Interview',
    badge: 'Campus & Entry',
    defaultInterviewerId: 'rohan',
    description: 'Prepare for entry-level interviews covering personal introduction, academic background, projects, basic technical knowledge, aptitude, and HR questions.',
    tags: ['Personal Intro', 'Academics', 'Projects', 'Basic Tech', 'Aptitude', 'HR Basics']
  },
  {
    id: 'custom_role',
    roleNumber: 13,
    title: 'Other / Custom Role',
    icon: '✨',
    categoryKey: 'Other / Custom Role',
    badge: 'Tailored AI',
    defaultInterviewerId: 'priya',
    description: 'Enter any desired job title to generate a personalized AI interview with relevant questions and evaluation criteria.',
    tags: ['Custom Job Title', 'Personalized Questions', 'Dynamic Rubrics', 'Tailored Scoring']
  }
];

export const QUESTION_BANK = {
  "Software Developer": [
    {
      "id": "sd_entry_1",
      "question": "What is the difference between an Array and a Linked List in memory? When would you prefer one over the other for insertion and lookup operations?",
      "topic": "Data Structures & Algorithms",
      "questionType": "conceptual",
      "level": "Fresher / Entry",
      "idealKeywords": [
        "contiguous memory",
        "pointer traversal",
        "O(1) random access",
        "O(n) search",
        "O(1) insertion at head",
        "cache locality"
      ],
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
      "idealKeywords": [
        "Encapsulation",
        "Abstraction",
        "Inheritance",
        "Polymorphism",
        "method overriding",
        "method overloading",
        "interface"
      ],
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
      "idealKeywords": [
        "independent address space",
        "shared heap",
        "thread stack",
        "context switching",
        "IPC",
        "overhead"
      ],
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
      "idealKeywords": [
        "O(1) average",
        "O(log n) guaranteed",
        "collision resolution",
        "chaining",
        "open addressing",
        "in-order traversal",
        "worst case O(n)",
        "sorted order"
      ],
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
      "idealKeywords": [
        "Mutual Exclusion",
        "Hold and Wait",
        "No Preemption",
        "Circular Wait",
        "Banker's algorithm",
        "resource allocation graph",
        "lock ordering"
      ],
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
      "idealKeywords": [
        "atomic values",
        "partial dependency",
        "transitive dependency",
        "redundancy",
        "join latency",
        "read-heavy workloads",
        "write overhead"
      ],
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
      "idealKeywords": [
        "Single Responsibility",
        "Open-Closed",
        "Liskov Substitution",
        "Interface Segregation",
        "Dependency Inversion",
        "decoupling",
        "unit testing"
      ],
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
      "idealKeywords": [
        "Token Bucket",
        "Leaky Bucket",
        "Sliding Window Log",
        "Redis cluster",
        "Lua script atomicity",
        "race conditions",
        "eventual consistency"
      ],
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
      "idealKeywords": [
        "thread dumps",
        "profiling",
        "async I/O",
        "blocking calls",
        "garbage collection pauses",
        "connection pool starvation",
        "flame graphs"
      ],
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
      "idealKeywords": [
        "B-Tree random writes",
        "LSM sequential append",
        "MemTable",
        "SSTables",
        "compaction overhead",
        "write amplification",
        "read amplification"
      ],
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
      "idealKeywords": [
        "Strangler Fig pattern",
        "domain-driven design",
        "bounded contexts",
        "event sourcing",
        "CQRS",
        "ADRs",
        "organizational alignment",
        "data consistency"
      ],
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
      "idealKeywords": [
        "Expand and Contract pattern",
        "online schema change",
        "gh-ost",
        "pt-online-schema-change",
        "shadow tables",
        "dual writing",
        "backward compatibility"
      ],
      "rubric": {
        "correctness": "Applies Expand-and-Contract (multi-phase migration) or shadow copy tooling.",
        "depth": "Analyzes table locks, replication lag on replicas, and rollback safeguards.",
        "clarity": "Rigorous phase-by-phase rollout schedule.",
        "examples": "Details gh-ost binlog stream parsing or pt-osc trigger approaches."
      },
      "followUp": "How would you handle a schema change that requires backfilling computed values without locking rows?"
    }
  ],
  "Full Stack Developer": [
    {
      "id": "fs_entry_web_1",
      "question": "What happens when you enter a URL into a web browser? Walk through DNS lookup, TCP/TLS connection, and the browser rendering pipeline.",
      "topic": "Frontend Architecture & State",
      "questionType": "conceptual",
      "level": "Fresher / Entry",
      "idealKeywords": [
        "DNS lookup",
        "IP address",
        "TCP 3-way handshake",
        "TLS handshake",
        "DOM tree",
        "CSSOM",
        "Render tree",
        "Reflow and Repaint"
      ],
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
      "idealKeywords": [
        "stateless",
        "resources",
        "idempotent",
        "PUT vs PATCH",
        "404 Not Found",
        "401 Unauthorized",
        "403 Forbidden",
        "500 Server Error"
      ],
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
      "idealKeywords": [
        "SSR",
        "CSR",
        "SSG",
        "SEO",
        "Time to First Byte",
        "First Contentful Paint",
        "Hydration",
        "Next.js",
        "CDN caching"
      ],
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
      "idealKeywords": [
        "access token",
        "refresh token",
        "httpOnly cookie",
        "SameSite",
        "CSRF token",
        "XSS attack",
        "token revocation",
        "short expiry"
      ],
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
      "idealKeywords": [
        "Cache-Aside",
        "TTL",
        "cache invalidation",
        "cache stampede / thundering herd",
        "mutex lock",
        "write-through",
        "Redis"
      ],
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
      "idealKeywords": [
        "N+1 problem",
        "lazy loading",
        "eager loading",
        "JOIN",
        "pre-fetching",
        "ORM execution plan",
        "query batching"
      ],
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
      "idealKeywords": [
        "WebSockets",
        "Operational Transformation (OT)",
        "CRDTs",
        "conflict resolution",
        "eventual consistency",
        "IndexedDB",
        "optimistic UI"
      ],
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
      "idealKeywords": [
        "Largest Contentful Paint (LCP)",
        "Interaction to Next Paint (INP)",
        "Cumulative Layout Shift (CLS)",
        "code splitting",
        "Web Workers",
        "resource hints (preload, preconnect)",
        "lazy loading"
      ],
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
      "idealKeywords": [
        "over-fetching",
        "under-fetching",
        "DataLoader batching",
        "query complexity analysis",
        "depth limiting",
        "caching difficulties",
        "persisted queries"
      ],
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
      "idealKeywords": [
        "Module Federation",
        "Webpack 5",
        "independent CI/CD",
        "shared design system",
        "version drift",
        "cross-application routing",
        "performance overhead"
      ],
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
      "idealKeywords": [
        "Active-Active",
        "Geo-DNS / Anycast",
        "bidirectional database replication",
        "conflict resolution (LWW, CRDT)",
        "CAP theorem",
        "disaster recovery"
      ],
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
      "idealKeywords": [
        "Zero Trust",
        "mTLS",
        "HashiCorp Vault",
        "WAF",
        "SQL injection",
        "IDOR prevention",
        "content security policy (CSP)",
        "audit logging"
      ],
      "rubric": {
        "correctness": "Covers defense-in-depth across perimeter, transport, application, and data layers.",
        "depth": "Details mutual TLS between services, dynamic database credentials, and cryptographic field-level encryption.",
        "clarity": "Rigorous executive compliance and security posture.",
        "examples": "References PCI-DSS, SOC2 compliance, and automated SAST/DAST pipelines."
      },
      "followUp": "How do you protect internal microservices from SSRF (Server-Side Request Forgery) attacks?"
    }
  ],
  "Python Developer": [
    {
      "id": "py_entry_1",
      "question": "What is the difference between mutable and immutable data types in Python? Give three examples of each and explain how passing them into a function behaves.",
      "topic": "Python Memory Management & GC",
      "questionType": "conceptual",
      "level": "Fresher / Entry",
      "idealKeywords": [
        "mutable",
        "immutable",
        "list",
        "dict",
        "set",
        "int",
        "str",
        "tuple",
        "pass-by-assignment",
        "object reference",
        "id()"
      ],
      "rubric": {
        "correctness": "Accurately categorizes list/dict/set as mutable and int/str/tuple as immutable.",
        "depth": "Explains Python's pass-by-object-reference semantics and in-place modifications.",
        "clarity": "Clear definitions with memory address (id) intuition.",
        "examples": "Demonstrates appending to a list vs reassigning an integer inside a function."
      },
      "followUp": "Why is using a mutable default argument like `def add_item(item, lst=[])` considered a notorious anti-pattern?"
    },
    {
      "id": "py_entry_2",
      "question": "Explain list comprehensions in Python. How do they compare to traditional for-loops and the `map()` function in terms of readability and performance?",
      "topic": "Generators & Iterables",
      "questionType": "coding",
      "level": "Fresher / Entry",
      "idealKeywords": [
        "list comprehension",
        "for loop",
        "map()",
        "lambda",
        "bytecode",
        "C speed",
        "readability",
        "memory footprint"
      ],
      "rubric": {
        "correctness": "Correctly articulates syntax and semantics of list comprehensions.",
        "depth": "Notes that comprehensions run at C-level speed without Python bytecode overhead of append().",
        "clarity": "Concise comparison across readability and resource usage.",
        "examples": "Shows a filtering and transformation example with an `if` condition."
      },
      "followUp": "When would you prefer a generator expression `(x for x in ...)` over a list comprehension?"
    },
    {
      "id": "py_entry_3",
      "question": "What is the purpose of `*args` and `**kwargs` in Python function definitions? How does tuple and dictionary unpacking work?",
      "topic": "Generators & Iterables",
      "questionType": "practical",
      "level": "Fresher / Entry",
      "idealKeywords": [
        "*args",
        "**kwargs",
        "positional arguments",
        "keyword arguments",
        "tuple unpacking",
        "dict unpacking",
        "variadic functions"
      ],
      "rubric": {
        "correctness": "Correctly distinguishes positional tuple packing (*args) and keyword dict packing (**kwargs).",
        "depth": "Explains parameter ordering rules in function signatures.",
        "clarity": "Structured explanation.",
        "examples": "Provides a practical wrapper or logging decorator example."
      },
      "followUp": "How do keyword-only arguments after a bare `*` work in modern Python?"
    },
    {
      "id": "py_mid_1",
      "question": "Explain Python's Global Interpreter Lock (GIL). How does it impact multithreaded CPU-bound tasks versus I/O-bound tasks, and how can you achieve true parallelism in Python?",
      "topic": "Concurrency & GIL",
      "questionType": "conceptual",
      "level": "Mid Level",
      "idealKeywords": [
        "GIL",
        "CPython",
        "bytecode",
        "thread-safe",
        "multiprocessing",
        "concurrent.futures",
        "I/O-bound",
        "CPU-bound",
        "C extensions"
      ],
      "rubric": {
        "correctness": "Correctly states GIL restricts CPython execution to one thread at a time for Python bytecode.",
        "depth": "Distinguishes I/O release of GIL from CPU thrashing; suggests multiprocessing or native C extensions.",
        "clarity": "Precise systems explanation without conflating concurrency and parallelism.",
        "examples": "Contrasts downloading 100 web pages (threading/asyncio) vs image processing (multiprocessing)."
      },
      "followUp": "What recent Python improvements (e.g. PEP 703 free-threaded Python / subinterpreters) address the GIL?"
    },
    {
      "id": "py_mid_2",
      "question": "How do Python decorators work under the hood? Walk through writing a custom timing or retry decorator that accepts configuration arguments.",
      "topic": "Metaprogramming & Decorators",
      "questionType": "coding",
      "level": "Mid Level",
      "idealKeywords": [
        "first-class functions",
        "closures",
        "functools.wraps",
        "nested functions",
        "higher-order functions",
        "decorator with arguments"
      ],
      "rubric": {
        "correctness": "Accurately details three-level nested function structure for parameterized decorators.",
        "depth": "Highlights importance of `@functools.wraps` for preserving docstrings and `__name__` metadata.",
        "clarity": "Structured step-by-step code walkthrough.",
        "examples": "Demonstrates a retry decorator with max_attempts and backoff delay."
      },
      "followUp": "What happens to exception stack traces when a decorator does not use `functools.wraps`?"
    },
    {
      "id": "py_mid_3",
      "question": "How do Context Managers work in Python? Explain the protocol methods `__enter__` and `__exit__`, and how `@contextlib.contextmanager` simplifies creation.",
      "topic": "Python Memory Management & GC",
      "questionType": "practical",
      "level": "Mid Level",
      "idealKeywords": [
        "with statement",
        "__enter__",
        "__exit__",
        "resource management",
        "exception suppression",
        "contextlib",
        "generator yield"
      ],
      "rubric": {
        "correctness": "Correctly identifies the 4 parameters of `__exit__` (exc_type, exc_val, exc_tb).",
        "depth": "Explains how returning True from `__exit__` suppresses exceptions.",
        "clarity": "Clear resource leak prevention perspective.",
        "examples": "Shows database connection leasing or temporary directory cleanup."
      },
      "followUp": "What happens if an unhandled exception occurs inside a generator-based context manager before the yield?"
    },
    {
      "id": "py_mid_4",
      "question": "How does `asyncio` operate in Python? Explain the relationship between the Event Loop, Coroutines (`async/await`), Tasks, and Futures.",
      "topic": "AsyncIO & Event Loop",
      "questionType": "practical",
      "level": "Mid Level",
      "idealKeywords": [
        "Event Loop",
        "coroutines",
        "async/await",
        "asyncio.create_task",
        "Futures",
        "non-blocking I/O",
        "cooperative multitasking"
      ],
      "rubric": {
        "correctness": "Accurately explains single-threaded cooperative multitasking and non-blocking I/O multiplexing.",
        "depth": "Explains that awaiting a coroutine yields control back to the event loop.",
        "clarity": "Logical breakdown of async primitives.",
        "examples": "Contrasts `asyncio.gather` with sequential awaiting in FastAPI or aiohttp."
      },
      "followUp": "What happens if a developer executes `time.sleep(5)` or a synchronous database query inside an async coroutine?"
    },
    {
      "id": "py_sr_1",
      "question": "Deep dive into CPython's memory management: How does reference counting combine with the generational cyclic garbage collector (Generation 0, 1, 2) to reclaim unreferenced objects?",
      "topic": "Python Memory Management & GC",
      "questionType": "optimization",
      "level": "Senior",
      "idealKeywords": [
        "reference counting",
        "ob_refcnt",
        "cyclic reference",
        "gc module",
        "generational garbage collector",
        "thresholds",
        "weakref",
        "PyObject"
      ],
      "rubric": {
        "correctness": "Accurately distinguishes deterministic reference counting from periodic cyclic garbage collection.",
        "depth": "Explains generational heuristics (young objects die fast) and pointer traversal algorithm for isolated cycles.",
        "clarity": "Low-level systems rigor.",
        "examples": "References `gc.collect()`, `gc.disable()`, or circular linked node graphs."
      },
      "followUp": "Why do some high-throughput Python production services (like Instagram) disable generational GC for web worker processes?"
    },
    {
      "id": "py_sr_2",
      "question": "How do you build and optimize high-throughput REST or WebSocket APIs using FastAPI and Pydantic? Discuss asynchronous worker concurrency with Uvicorn and Gunicorn.",
      "topic": "FastAPI & Microservices",
      "questionType": "practical",
      "level": "Senior",
      "idealKeywords": [
        "FastAPI",
        "Starlette",
        "Pydantic v2",
        "Uvicorn",
        "Gunicorn process manager",
        "async def vs def threadpool",
        "dependency injection",
        "connection pooling"
      ],
      "rubric": {
        "correctness": "Accurately describes FastAPI's threadpool routing for `def` vs native event loop for `async def`.",
        "depth": "Discusses Pydantic v2 Rust-core serialization performance and async connection pool management.",
        "clarity": "Production deployment architecture mindset.",
        "examples": "Explains Gunicorn UvicornWorker process count (2 * cores + 1) and async DB drivers (asyncpg/motor)."
      },
      "followUp": "How do you prevent connection pool starvation when mixing CPU-intensive data transformations with async endpoints?"
    },
    {
      "id": "py_sr_3",
      "question": "How do Python Metaclasses work? Explain `type`, `__new__` vs `__init__` in class creation, and when `__init_subclass__` or descriptors offer a cleaner alternative.",
      "topic": "Metaprogramming & Decorators",
      "questionType": "coding",
      "level": "Senior",
      "idealKeywords": [
        "metaclass",
        "type",
        "__new__",
        "__init__",
        "class instantiation",
        "descriptors (__get__, __set__)",
        "__init_subclass__",
        "declarative ORM"
      ],
      "rubric": {
        "correctness": "Explains that classes are instances of metaclasses and `__new__` creates the class object.",
        "depth": "Compares complexity of metaclasses with cleaner PEP 487 `__init_subclass__` and descriptors.",
        "clarity": "Advanced Python language mechanics.",
        "examples": "Cites Django models, Pydantic BaseModel, or validation frameworks."
      },
      "followUp": "How do non-data descriptors differ from data descriptors in method lookup resolution?"
    },
    {
      "id": "py_staff_1",
      "question": "You are leading the architecture of a Python-based distributed task processing system handling 100M jobs daily. How do you design for idempotency, backpressure, and zero message loss?",
      "topic": "FastAPI & Microservices",
      "questionType": "system_design",
      "level": "Staff / Architect",
      "idealKeywords": [
        "Celery",
        "Kafka / RabbitMQ",
        "distributed locks",
        "idempotency keys",
        "dead letter queues (DLQ)",
        "worker prefetch limits",
        "exponential backoff",
        "ack_late"
      ],
      "rubric": {
        "correctness": "Addresses message broker persistence, visibility timeouts, and worker acknowledgement (ack_late).",
        "depth": "Proposes unique idempotency keys in Redis/Postgres and consumer backpressure via prefetch tuning.",
        "clarity": "Enterprise reliability blueprint.",
        "examples": "References Celery/Dramatiq with Redis/RabbitMQ, DLQs, and circuit breakers."
      },
      "followUp": "What is the danger of worker prefetching when job execution times have high variance?"
    },
    {
      "id": "py_staff_2",
      "question": "How do you detect, profile, and eliminate complex memory leaks in a long-running Python production service using tools like tracemalloc, objgraph, and memory_profiler?",
      "topic": "Profiling & Performance",
      "questionType": "troubleshooting",
      "level": "Staff / Architect",
      "idealKeywords": [
        "tracemalloc",
        "objgraph",
        "memory leak",
        "growing references",
        "unclosed generators",
        "module level cache",
        "gc.get_objects()",
        "C extension leaks"
      ],
      "rubric": {
        "correctness": "Systematic memory analysis workflow from snapshots to object back-references.",
        "depth": "Identifies common root causes like unbounded caches, global singletons, lambda closures, or C-level alloc leaks.",
        "clarity": "Executive debugging leadership under high stakes.",
        "examples": "Demonstrates `tracemalloc.take_snapshot()` diffing and `objgraph.show_most_common_types()`."
      },
      "followUp": "How would you determine whether a leak originates in Python heap or an unmanaged C extension like NumPy or PyTorch?"
    }
  ],
  "Java Developer": [
    {
      "id": "java_entry_1",
      "question": "Explain the difference between `String`, `StringBuilder`, and `StringBuffer` in Java. When should you use each regarding immutability and thread safety?",
      "topic": "Collections Framework & Generics",
      "questionType": "conceptual",
      "level": "Fresher / Entry",
      "idealKeywords": [
        "String immutability",
        "String constant pool",
        "StringBuilder mutable non-thread-safe",
        "StringBuffer synchronized thread-safe",
        "heap allocation"
      ],
      "rubric": {
        "correctness": "Correctly states String is immutable, StringBuilder is mutable (unsynchronized), StringBuffer is mutable (synchronized).",
        "depth": "Explains string pool memory reuse versus intermediate object creation in loops.",
        "clarity": "Crisp comparative taxonomy.",
        "examples": "Shows loop concatenation creating thousands of orphan String objects."
      },
      "followUp": "How does the Java compiler optimize simple string concatenations like `String s = a + b` internally?"
    },
    {
      "id": "java_entry_2",
      "question": "What is the difference between Checked and Unchecked (Runtime) Exceptions in Java? Give examples of both and explain best practices for exception handling.",
      "topic": "Exception Handling & Observability",
      "questionType": "conceptual",
      "level": "Fresher / Entry",
      "idealKeywords": [
        "Checked exceptions",
        "Unchecked exceptions",
        "RuntimeException",
        "IOException",
        "NullPointerException",
        "try-catch-finally",
        "throws keyword"
      ],
      "rubric": {
        "correctness": "Accurately identifies Checked exceptions compile-time enforcement vs RuntimeException unchecked nature.",
        "depth": "Discusses when to use checked (recoverable business condition) vs unchecked (programming defect).",
        "clarity": "Clear class hierarchy (Throwable -> Exception -> RuntimeException).",
        "examples": "Cites SQLException/IOException vs IllegalArgumentException/NPE."
      },
      "followUp": "Why do modern frameworks like Spring wrap checked exceptions into unchecked DataAccessExceptions?"
    },
    {
      "id": "java_entry_3",
      "question": "Compare `ArrayList` and `LinkedList` in Java Collections. How do their underlying data structures affect their Big-O performance for get, add, and remove operations?",
      "topic": "Collections Framework & Generics",
      "questionType": "coding",
      "level": "Fresher / Entry",
      "idealKeywords": [
        "ArrayList dynamic array",
        "LinkedList doubly linked list",
        "O(1) random access",
        "O(n) search",
        "O(1) insert at ends",
        "CPU cache locality",
        "memory overhead"
      ],
      "rubric": {
        "correctness": "Accurately details O(1) indexed lookup for ArrayList vs O(n) traversal for LinkedList.",
        "depth": "Notes that modern CPU cache prefetching makes ArrayList faster even for many middle inserts in practice.",
        "clarity": "Big-O structured breakdown.",
        "examples": "Points out node pointer overhead in 64-bit JVMs."
      },
      "followUp": "What is the default initial capacity of an ArrayList, and how does its growth factor (1.5x) work?"
    },
    {
      "id": "java_mid_1",
      "question": "How does `HashMap` work internally in Java 8+? Explain hashing, bucket index computation, collision resolution, and the transition from linked list to Red-Black Tree.",
      "topic": "Collections Framework & Generics",
      "questionType": "conceptual",
      "level": "Mid Level",
      "idealKeywords": [
        "hashCode()",
        "equals() contract",
        "bucket index",
        "bitwise AND",
        "TREEIFY_THRESHOLD (8)",
        "Red-Black Tree",
        "UNTREEIFY_THRESHOLD (6)",
        "O(1) to O(log n)"
      ],
      "rubric": {
        "correctness": "Accurately explains hashing, bucket masking `(n - 1) & hash`, and treeification at 8 entries.",
        "depth": "Explains why `hashCode` and `equals` must be overridden together to prevent lost or duplicate entries.",
        "clarity": "Deep algorithmic insight into JDK internals.",
        "examples": "Illustrates how a bad hash function degrading to a single bucket performs before and after Java 8."
      },
      "followUp": "Why is the capacity of a HashMap always maintained as a power of 2?"
    },
    {
      "id": "java_mid_2",
      "question": "Explain Spring Boot's Dependency Injection and Inversion of Control (IoC). Walk through the Spring Bean lifecycle and the differences between Singleton and Prototype scopes.",
      "topic": "Spring Boot & Dependency Injection",
      "questionType": "practical",
      "level": "Mid Level",
      "idealKeywords": [
        "IoC container",
        "ApplicationContext",
        "Dependency Injection",
        "Bean lifecycle",
        "@PostConstruct",
        "@PreDestroy",
        "Singleton scope",
        "Prototype scope"
      ],
      "rubric": {
        "correctness": "Accurately describes IoC container managing instantiation, configuration, and injection.",
        "depth": "Details bean phases: instantiation, populate properties, BeanNameAware, post-processors, init, destroy.",
        "clarity": "Structured enterprise delivery.",
        "examples": "Explains injecting a prototype scoped bean into a singleton bean and scoped proxy solutions."
      },
      "followUp": "What is the difference between `@Component`, `@Service`, and `@Repository` annotations in Spring?"
    },
    {
      "id": "java_mid_3",
      "question": "How do you manage concurrency in Java using `ExecutorService`, `ThreadPoolExecutor`, and `CompletableFuture`? What is the risk of using `Executors.newFixedThreadPool` under heavy load?",
      "topic": "Multithreading & Concurrency",
      "questionType": "practical",
      "level": "Mid Level",
      "idealKeywords": [
        "ThreadPoolExecutor",
        "corePoolSize",
        "maximumPoolSize",
        "LinkedBlockingQueue",
        "OutOfMemoryError",
        "CompletableFuture",
        "supplyAsync",
        "rejection policy"
      ],
      "rubric": {
        "correctness": "Explains `Executors.newFixedThreadPool` uses an unbounded LinkedBlockingQueue which can trigger OOM.",
        "depth": "Recommends explicitly sizing bounded queues with CallerRunsPolicy or AbortPolicy.",
        "clarity": "Production reliability mindset.",
        "examples": "Shows chaining asynchronous tasks with `CompletableFuture.thenCompose()`."
      },
      "followUp": "How do Java 21 Virtual Threads (Project Loom) change traditional thread pool sizing?"
    },
    {
      "id": "java_mid_4",
      "question": "What is the Hibernate / JPA N+1 select problem? How do you diagnose and eliminate it using `JOIN FETCH`, `@EntityGraph`, or batch fetching?",
      "topic": "JPA & Hibernate Performance",
      "questionType": "troubleshooting",
      "level": "Mid Level",
      "idealKeywords": [
        "N+1 problem",
        "Lazy loading",
        "JOIN FETCH",
        "@EntityGraph",
        "hibernate.default_batch_fetch_size",
        "Cartesian product",
        "SQL query count"
      ],
      "rubric": {
        "correctness": "Accurately details how loading 1 parent triggers N independent queries for child associations.",
        "depth": "Compares JOIN FETCH with EntityGraph and batch fetch size; warns about multiple collection JOIN FETCH Cartesian explosion.",
        "clarity": "Clear ORM database performance optimization workflow.",
        "examples": "Uses an Order -> OrderItems or Department -> Employees entity relationship."
      },
      "followUp": "Why does using `FetchType.EAGER` not solve the N+1 problem in JPQL queries?"
    },
    {
      "id": "java_sr_1",
      "question": "Deep dive into the JVM Garbage Collection architecture. Compare G1GC and ZGC in terms of heap partitioning, pause times, concurrent phases, and tuning parameters.",
      "topic": "JVM Architecture & Garbage Collection",
      "questionType": "optimization",
      "level": "Senior",
      "idealKeywords": [
        "G1GC",
        "ZGC",
        "colored pointers",
        "load barriers",
        "stop-the-world pauses",
        "sub-millisecond latency",
        "regions",
        "MaxGCPauseMillis",
        "Metaspace"
      ],
      "rubric": {
        "correctness": "Accurately compares G1GC region-based generational approach with ZGC ultra-low latency colored pointers.",
        "depth": "Explains concurrent marking, relocation, and sub-millisecond max pause targets of ZGC.",
        "clarity": "Deep JVM systems mastery.",
        "examples": "Cites real trading or microservice JVM flags like `-XX:+UseZGC -XX:MaxRAMPercentage=75`."
      },
      "followUp": "What is a Full GC in G1GC and what causes evacuation failures?"
    },
    {
      "id": "java_sr_2",
      "question": "Explain the Java Memory Model (JMM), instruction reordering, and the `volatile` keyword. How does `volatile` guarantee visibility and happens-before relationships without mutual exclusion?",
      "topic": "Multithreading & Concurrency",
      "questionType": "conceptual",
      "level": "Senior",
      "idealKeywords": [
        "Java Memory Model",
        "happens-before",
        "volatile",
        "memory barriers",
        "CPU cache coherency (MESI)",
        "instruction reordering",
        "atomic operations"
      ],
      "rubric": {
        "correctness": "Explains volatile forces read/write directly to main memory and prevents compiler/CPU instruction reordering.",
        "depth": "Distinguishes visibility from atomicity (e.g., `count++` is not thread-safe even if volatile).",
        "clarity": "Precise low-level concurrency reasoning.",
        "examples": "Illustrates Double-Checked Locking singleton pattern and why volatile is mandatory."
      },
      "followUp": "How do `AtomicInteger` and `VarHandle` achieve lock-free thread safety using Compare-And-Swap (CAS)?"
    },
    {
      "id": "java_sr_3",
      "question": "How do you implement microservices fault tolerance and resiliency in a Spring Cloud ecosystem using Resilience4j (Circuit Breakers, Rate Limiters, Bulkheads, and Retries)?",
      "topic": "Microservices & Resilience4j",
      "questionType": "practical",
      "level": "Senior",
      "idealKeywords": [
        "Resilience4j",
        "Circuit Breaker",
        "CLOSED to OPEN",
        "HALF_OPEN",
        "Bulkhead",
        "RateLimiter",
        "sliding window metrics",
        "fallback method"
      ],
      "rubric": {
        "correctness": "Accurately details circuit states (Closed -> Open -> Half-Open) based on failure rate threshold.",
        "depth": "Differentiates Bulkhead (thread isolation) from Rate Limiter (throughput throttle) and explains fallback contracts.",
        "clarity": "Enterprise microservice stability framework.",
        "examples": "Configures a payment service client with fallback handling and Micrometer metrics."
      },
      "followUp": "What happens if your fallback method also throws an exception or calls another failing service?"
    },
    {
      "id": "java_staff_1",
      "question": "How would you design a distributed transaction workflow across 4 independent microservices using the Saga Pattern (Choreography vs Orchestration) and the Transactional Outbox Pattern?",
      "topic": "Design Patterns & Enterprise Architecture",
      "questionType": "system_design",
      "level": "Staff / Architect",
      "idealKeywords": [
        "Saga pattern",
        "compensating transactions",
        "Choreography vs Orchestration",
        "Transactional Outbox",
        "Debezium CDC",
        "Kafka",
        "idempotency"
      ],
      "rubric": {
        "correctness": "Balances Choreography (event-driven, loose coupling) with Orchestration (centralized state machine, easier auditability).",
        "depth": "Solves dual-write problem with Transactional Outbox table in same local DB transaction and Change Data Capture.",
        "clarity": "Rigorous distributed systems architecture.",
        "examples": "Details an e-commerce checkout (Order -> Payment -> Inventory -> Shipping) with compensating refunds."
      },
      "followUp": "How do you handle a compensating transaction failure when rolling back a partially committed Saga?"
    },
    {
      "id": "java_staff_2",
      "question": "As Chief Architect, how do you structure an enterprise observability strategy across 50+ Java Spring Boot microservices using distributed tracing, metrics, and structured logs?",
      "topic": "Exception Handling & Observability",
      "questionType": "system_design",
      "level": "Staff / Architect",
      "idealKeywords": [
        "OpenTelemetry (OTel)",
        "Trace ID / Span ID",
        "Micrometer / Prometheus",
        "MDC (Mapped Diagnostic Context)",
        "context propagation",
        "tail-based sampling"
      ],
      "rubric": {
        "correctness": "Establishes standard W3C TraceContext propagation across HTTP and Kafka headers.",
        "depth": "Addresses high-cardinality metric overhead, log sampling, and correlated trace-to-log drilldowns in Grafana/Jaeger.",
        "clarity": "Executive engineering leadership and cross-service governance.",
        "examples": "Illustrates MDC trace injection into Logback JSON format and OpenTelemetry Java agent."
      },
      "followUp": "How do you manage observability storage costs when tracing billions of spans per day without losing error traces?"
    }
  ],
  "Data Analyst": [
    {
      "id": "da_entry_1",
      "question": "What is the difference between the `WHERE` and `HAVING` clauses in SQL? Give an example query demonstrating when both are used together.",
      "topic": "Advanced SQL & Window Functions",
      "questionType": "coding",
      "level": "Fresher / Entry",
      "idealKeywords": [
        "WHERE filters rows before aggregation",
        "HAVING filters aggregated groups",
        "GROUP BY",
        "aggregate functions (SUM, COUNT, AVG)",
        "execution order"
      ],
      "rubric": {
        "correctness": "Accurately specifies WHERE filters individual rows before grouping; HAVING filters aggregated groups.",
        "depth": "Explains SQL query logical execution order (FROM -> WHERE -> GROUP BY -> HAVING -> SELECT).",
        "clarity": "Clear syntax and semantic distinction.",
        "examples": "Provides query calculating total sales by category where individual price > $50 and total sales > $10,000."
      },
      "followUp": "Can you use column aliases defined in the `SELECT` clause inside the `WHERE` clause? Why or why not?"
    },
    {
      "id": "da_entry_2",
      "question": "Explain the differences between `INNER JOIN`, `LEFT JOIN`, `RIGHT JOIN`, and `FULL OUTER JOIN`. What happens to unmatched records in each?",
      "topic": "Advanced SQL & Window Functions",
      "questionType": "conceptual",
      "level": "Fresher / Entry",
      "idealKeywords": [
        "INNER JOIN matching rows",
        "LEFT JOIN all left rows",
        "NULL values",
        "FULL OUTER JOIN union of both",
        "join keys",
        "cartesian product"
      ],
      "rubric": {
        "correctness": "Accurately describes which rows are preserved and how unmatched sides produce NULLs.",
        "depth": "Identifies danger of accidental fan-out/duplicate rows when join keys are not unique.",
        "clarity": "Venn-diagram clarity translated into relational table concepts.",
        "examples": "Cites Customers and Orders tables."
      },
      "followUp": "How do you find all customers who have never placed an order using a `LEFT JOIN`?"
    },
    {
      "id": "da_entry_3",
      "question": "What are the common strategies for handling missing (NULL) values and duplicate rows in a dirty customer dataset in Python Pandas or Excel?",
      "topic": "Data Cleaning & Wrangling",
      "questionType": "practical",
      "level": "Fresher / Entry",
      "idealKeywords": [
        "dropna()",
        "fillna()",
        "imputation (mean/median/mode)",
        "drop_duplicates()",
        "subset deduplication",
        "data integrity",
        "MCAR / MAR"
      ],
      "rubric": {
        "correctness": "Accurately outlines dropping vs imputation tradeoffs.",
        "depth": "Explains why median is preferred over mean for skewed distributions when imputing.",
        "clarity": "Structured data cleaning pipeline thinking.",
        "examples": "Gives example of filling missing ages with group median and deduplicating on email ID."
      },
      "followUp": "What is the danger of blindly dropping all rows that have any missing values?"
    },
    {
      "id": "da_mid_1",
      "question": "Explain SQL Window Functions. How do `ROW_NUMBER()`, `RANK()`, and `DENSE_RANK()` differ when dealing with identical ranking values (ties)?",
      "topic": "Advanced SQL & Window Functions",
      "questionType": "coding",
      "level": "Mid Level",
      "idealKeywords": [
        "OVER (PARTITION BY ... ORDER BY ...)",
        "ROW_NUMBER unique sequential",
        "RANK skips ranks on tie (1, 2, 2, 4)",
        "DENSE_RANK consecutive ranks (1, 2, 2, 3)",
        "ties"
      ],
      "rubric": {
        "correctness": "Accurately explains the exact tie-breaking behavior of each function.",
        "depth": "Explains difference between window functions (retaining row granularity) and GROUP BY (collapsing rows).",
        "clarity": "Precise numerical example showing tie differences.",
        "examples": "Demonstrates finding the top 3 highest-earning employees per department."
      },
      "followUp": "How do `LEAD()` and `LAG()` window functions help in calculating period-over-period growth rates?"
    },
    {
      "id": "da_mid_2",
      "question": "How do you design an effective executive dashboard in Power BI or Tableau? What principles govern visual hierarchy, KPI card selection, and avoiding clutter?",
      "topic": "Data Visualization & Dashboard Design",
      "questionType": "practical",
      "level": "Mid Level",
      "idealKeywords": [
        "visual hierarchy",
        "data-ink ratio",
        "KPI cards",
        "drill-down",
        "color theory (semantic color)",
        "chart selection",
        "actionable insights",
        "executive summary"
      ],
      "rubric": {
        "correctness": "Applies Edward Tufte's data-ink ratio and clean top-down layout (High-level KPIs -> Trends -> Granular drilldown).",
        "depth": "Selects appropriate charts (line charts for trends, bar charts for discrete categories, avoiding 3D pie charts).",
        "clarity": "User-centric communication focused on stakeholder decision-making.",
        "examples": "Describes an executive revenue dashboard with YoY metrics and regional filters."
      },
      "followUp": "How do you optimize dashboard refresh performance when connecting to a multi-million row database?"
    },
    {
      "id": "da_mid_3",
      "question": "How do you detect, analyze, and treat outliers in business metrics? When should an outlier be removed versus investigated as a critical business signal?",
      "topic": "Statistical Analysis & Hypothesis Testing",
      "questionType": "practical",
      "level": "Mid Level",
      "idealKeywords": [
        "outliers",
        "IQR (Interquartile Range)",
        "Z-score",
        "box plot",
        "data entry error",
        "fraud detection",
        "robust statistics (median)",
        "winsorization"
      ],
      "rubric": {
        "correctness": "Accurately defines mathematical detection methods (1.5 * IQR or Z-score > 3).",
        "depth": "Understands that outliers in transactions often indicate fraud, system bugs, or VIP whale customers that must not be deleted.",
        "clarity": "Balanced data science and business domain thinking.",
        "examples": "Contrasts a typo ($99999 for coffee) with an authentic corporate bulk order."
      },
      "followUp": "How does extreme skewness affect standard deviation and t-tests?"
    },
    {
      "id": "da_mid_4",
      "question": "Walk through conducting a customer cohort retention analysis. How do you structure the SQL queries to calculate monthly retention curves from raw event tables?",
      "topic": "Business Metrics & KPI Analysis",
      "questionType": "practical",
      "level": "Mid Level",
      "idealKeywords": [
        "cohort analysis",
        "retention rate",
        "first purchase month",
        "cohort index",
        "self join / window functions",
        "churn rate",
        "heat map matrix"
      ],
      "rubric": {
        "correctness": "Accurately defines cohort indexing (Month 0, Month 1, Month 2...) based on user signup/first transaction.",
        "depth": "Structures SQL with CTEs (initial cohort assignment -> subsequent activity joins -> percentage retention).",
        "clarity": "Analytical rigor with clear business interpretation.",
        "examples": "Explains interpreting a retention triangle heatmap for a subscription SaaS app."
      },
      "followUp": "What is the difference between logo retention and net revenue retention (NRR)?"
    },
    {
      "id": "da_sr_1",
      "question": "Compare Star Schema and Snowflake Schema in modern Data Warehousing (e.g. Snowflake, BigQuery, Redshift). How do denormalized dimensions impact query performance and BI modeling?",
      "topic": "ETL Pipelines & Data Modeling",
      "questionType": "system_design",
      "level": "Senior",
      "idealKeywords": [
        "Star Schema",
        "Snowflake Schema",
        "Fact table",
        "Dimension table",
        "denormalization",
        "join complexity",
        "columnar storage",
        "OLAP vs OLTP"
      ],
      "rubric": {
        "correctness": "Accurately contrasts single-level dimensions in Star Schema vs normalized hierarchical dimensions in Snowflake Schema.",
        "depth": "Explains that modern columnar databases (Snowflake/BigQuery) optimize for Star Schema denormalization to minimize expensive joins.",
        "clarity": "Dimensional modeling expertise (Kimball methodology).",
        "examples": "Cites Fact_Sales with Dim_Customer, Dim_Date, and Dim_Store."
      },
      "followUp": "What are Slowly Changing Dimensions (SCD Type 1 vs Type 2) and how do you track historical changes?"
    },
    {
      "id": "da_sr_2",
      "question": "How do you design, run, and interpret an A/B test for a major product checkout flow change? How do you calculate required sample size and determine statistical significance?",
      "topic": "Statistical Analysis & Hypothesis Testing",
      "questionType": "practical",
      "level": "Senior",
      "idealKeywords": [
        "A/B testing",
        "Null Hypothesis (H0)",
        "p-value",
        "statistical significance (alpha = 0.05)",
        "statistical power (1 - beta = 0.80)",
        "MDE (Minimum Detectable Effect)",
        "sample size calculation"
      ],
      "rubric": {
        "correctness": "Formulates null and alternative hypotheses, power analysis, and significance testing (two-sample z-test/t-test for proportions).",
        "depth": "Warns about common pitfalls like peeking at p-values, sample ratio mismatch (SRM), and novelty effect.",
        "clarity": "Methodical scientific experiment design.",
        "examples": "Calculates conversion rate delta for a checkout button color/redesign."
      },
      "followUp": "What causes Sample Ratio Mismatch (SRM) and why does it invalidate test results?"
    },
    {
      "id": "da_sr_3",
      "question": "A key business KPI (e.g., Conversion Rate or Daily Active Users) suddenly drops by 18% week-over-week. Walk me through your step-by-step diagnostic triage framework.",
      "topic": "Business Metrics & KPI Analysis",
      "questionType": "troubleshooting",
      "level": "Senior",
      "idealKeywords": [
        "root cause analysis",
        "data pipeline validation",
        "segmentation (device, geography, traffic source)",
        "funnel analysis",
        "external factors",
        "release correlation"
      ],
      "rubric": {
        "correctness": "Sequences verification: 1. Data integrity/tracking bugs, 2. Internal releases/outages, 3. Multi-dimensional segmentation, 4. External factors.",
        "depth": "Breaks down metric into constituent formula (e.g. Conversion = Orders / Sessions) to isolate numerator vs denominator.",
        "clarity": "Calm, structured diagnostic leadership.",
        "examples": "Discovers tracking script dropped in an iOS release or a payment gateway outage in one country."
      },
      "followUp": "How do you communicate preliminary findings to anxious VP/C-level stakeholders before the full post-mortem is complete?"
    },
    {
      "id": "da_staff_1",
      "question": "As Lead Data Architect, how do you build a centralized Semantic Layer and Metric Store (e.g. dbt semantic layer, Cube) to ensure 'Single Source of Truth' across finance, product, and sales?",
      "topic": "ETL Pipelines & Data Modeling",
      "questionType": "system_design",
      "level": "Staff / Architect",
      "idealKeywords": [
        "Metric Layer / Semantic Store",
        "Single Source of Truth",
        "dbt",
        "standardized metric definitions",
        "governance",
        "version control",
        "headless BI"
      ],
      "rubric": {
        "correctness": "Addresses fragmented logic across multiple BI tools by centralizing metric definitions in code (dbt/YAML).",
        "depth": "Details version-controlled transformations, CI/CD data tests, and automated data documentation.",
        "clarity": "Enterprise strategic governance.",
        "examples": "Solves discrepancy where Sales and Finance calculated 'Monthly Active Customer' differently."
      },
      "followUp": "How do you handle breaking metric definition changes without disrupting active executive board reporting?"
    },
    {
      "id": "da_staff_2",
      "question": "How do you establish enterprise Data Governance, automated data quality testing, and SLA alerting across an enterprise modern data stack (Fivetran -> Snowflake -> dbt -> Tableau)?",
      "topic": "ETL Pipelines & Data Modeling",
      "questionType": "system_design",
      "level": "Staff / Architect",
      "idealKeywords": [
        "Data Governance",
        "dbt-expectations / Great Expectations",
        "data lineage",
        "anomaly detection",
        "Monte Carlo / Soda",
        "data contracts",
        "SLAs / SLIs"
      ],
      "rubric": {
        "correctness": "Proposes automated freshness and schema anomaly checks at ingestion, transformation, and presentation layers.",
        "depth": "Details upstream producer data contracts to prevent software engineers breaking downstream analytical tables.",
        "clarity": "Executive data platform leadership.",
        "examples": "Implements automated Slack/PagerDuty alerts when daily ETL pipeline fails or row counts drop unexpectedly."
      },
      "followUp": "How do you calculate and demonstrate the business ROI of investing in data quality and governance tools?"
    }
  ],
  "Data Scientist": [
    {
      "id": "ds_entry_1",
      "question": "Explain the Bias-Variance Trade-off in machine learning. How do high bias versus high variance manifest in model training and validation error curves?",
      "topic": "Overfitting, Regularization & Bias-Variance",
      "questionType": "conceptual",
      "level": "Fresher / Entry",
      "idealKeywords": [
        "Bias underfitting",
        "Variance overfitting",
        "training loss vs validation loss",
        "model complexity",
        "generalization error",
        "irreducible error"
      ],
      "rubric": {
        "correctness": "Accurately defines bias (simplifying assumptions / underfitting) and variance (sensitivity to training fluctuations / overfitting).",
        "depth": "Sketches error curve dynamics as model complexity increases.",
        "clarity": "Clear mathematical and conceptual explanation.",
        "examples": "Linear regression on non-linear data (high bias) vs deep decision tree with 1 sample per leaf (high variance)."
      },
      "followUp": "How do techniques like bagging and boosting individually impact bias and variance?"
    },
    {
      "id": "ds_entry_2",
      "question": "What is the difference between Precision, Recall, and F1-Score? Under what clinical or business scenarios would you strictly optimize for Recall over Precision?",
      "topic": "Model Evaluation & Cross-Validation",
      "questionType": "practical",
      "level": "Fresher / Entry",
      "idealKeywords": [
        "Precision (TP / TP + FP)",
        "Recall / Sensitivity (TP / TP + FN)",
        "F1-Score harmonic mean",
        "False Negatives costly",
        "False Positives costly",
        "medical diagnosis",
        "fraud detection"
      ],
      "rubric": {
        "correctness": "Accurately writes mathematical formulas for Precision, Recall, and F1-Score.",
        "depth": "Identifies that in cancer screening or fraud detection, missing a positive (False Negative) is catastrophic, justifying prioritizing Recall.",
        "clarity": "Confusion matrix structured reasoning.",
        "examples": "Contrasts malignant tumor detection (high recall required) with spam email filtering (high precision preferred)."
      },
      "followUp": "How do you select the optimal classification probability threshold using a Precision-Recall Curve or ROC Curve?"
    },
    {
      "id": "ds_entry_3",
      "question": "Compare L1 (Lasso) and L2 (Ridge) regularization in regression models. How does L1 induce feature sparsity while L2 shrinks coefficients asymptotically toward zero?",
      "topic": "Overfitting, Regularization & Bias-Variance",
      "questionType": "conceptual",
      "level": "Fresher / Entry",
      "idealKeywords": [
        "L1 absolute value penalty",
        "L2 squared penalty",
        "sparsity",
        "feature selection",
        "diamond vs circle contour constraint",
        "multicollinearity"
      ],
      "rubric": {
        "correctness": "Accurately states L1 adds sum of absolute weights; L2 adds sum of squared weights.",
        "depth": "Explains geometric intuition: diamond-shaped L1 constraint corners hit axes at exactly zero.",
        "clarity": "Strong mathematical intuition.",
        "examples": "Using Lasso to eliminate irrelevant noise features from a 200-column dataset."
      },
      "followUp": "What is ElasticNet regularization and when is it preferred over pure Lasso?"
    },
    {
      "id": "ds_mid_1",
      "question": "Compare Random Forest and Gradient Boosting (XGBoost / LightGBM). How do their tree building strategies (parallel bagging vs sequential residual fitting) differ?",
      "topic": "Supervised & Unsupervised ML",
      "questionType": "conceptual",
      "level": "Mid Level",
      "idealKeywords": [
        "Random Forest Bagging (bootstrap aggregation)",
        "parallel trees",
        "feature subsampling",
        "Gradient Boosting sequential",
        "pseudo-residuals",
        "learning rate (shrinkage)",
        "XGBoost second-order Taylor expansion"
      ],
      "rubric": {
        "correctness": "Accurately articulates Random Forest builds deep independent trees in parallel to reduce variance; Boosting builds shallow trees sequentially to reduce bias.",
        "depth": "Explains gradient descent in function space and shrinkage learning rates.",
        "clarity": "Ensemble algorithm comparative mastery.",
        "examples": "Highlights why LightGBM histogram-based binning is much faster on large tabular datasets than traditional XGBoost."
      },
      "followUp": "Why is Gradient Boosting more prone to overfitting than Random Forest if hyperparameters are untuned?"
    },
    {
      "id": "ds_mid_2",
      "question": "How do you handle severe class imbalance (e.g. 99.8% negative vs 0.2% positive) in binary classification problems without leaking data during cross-validation?",
      "topic": "Feature Engineering & Selection",
      "questionType": "practical",
      "level": "Mid Level",
      "idealKeywords": [
        "class imbalance",
        "SMOTE (Synthetic Minority Over-sampling Technique)",
        "undersampling",
        "class weights (scale_pos_weight)",
        "data leakage",
        "StratifiedKFold",
        "PR-AUC instead of ROC-AUC"
      ],
      "rubric": {
        "correctness": "Emphasizes that SMOTE must be performed ONLY on training folds within cross-validation loops (via imblearn Pipeline) to prevent data leakage.",
        "depth": "Recommends cost-sensitive learning (loss weighting) over synthetic generation for tabular numerical data.",
        "clarity": "Methodical validation hygiene.",
        "examples": "Cites financial fraud detection or rare hardware component failure."
      },
      "followUp": "Why is accuracy a completely misleading metric for imbalanced classification?"
    },
    {
      "id": "ds_mid_3",
      "question": "How do you detect Multicollinearity among features in regression and classification? Explain Variance Inflation Factor (VIF) and its impact on model interpretability.",
      "topic": "Feature Engineering & Selection",
      "questionType": "coding",
      "level": "Mid Level",
      "idealKeywords": [
        "Multicollinearity",
        "Variance Inflation Factor (VIF)",
        "correlation matrix",
        "R-squared of regressed feature",
        "inflated standard errors",
        "unstable p-values",
        "PCA"
      ],
      "rubric": {
        "correctness": "Defines VIF = 1 / (1 - R_i^2) and identifies VIF > 5 or 10 as severe multicollinearity.",
        "depth": "Explains that multicollinearity inflates coefficient standard errors, making significance tests unreliable even if prediction accuracy is unaffected.",
        "clarity": "Statistical rigor.",
        "examples": "Detects redundant features like age and birth year, or height in inches and centimeters."
      },
      "followUp": "How does Principal Component Analysis (PCA) eliminate multicollinearity while reducing dimensionality?"
    },
    {
      "id": "ds_mid_4",
      "question": "How do you evaluate clustering algorithms like K-Means and DBSCAN without ground truth labels? Explain the Silhouette Score and the Elbow Method.",
      "topic": "Supervised & Unsupervised ML",
      "questionType": "practical",
      "level": "Mid Level",
      "idealKeywords": [
        "Silhouette Coefficient",
        "intra-cluster distance (a)",
        "nearest-cluster distance (b)",
        "Elbow method (inertia / WCSS)",
        "DBSCAN density-based",
        "core points vs noise"
      ],
      "rubric": {
        "correctness": "Accurately writes Silhouette formula (b - a) / max(a, b), ranging from -1 to +1.",
        "depth": "Explains K-Means assumes spherical convex clusters; DBSCAN handles arbitrary density shapes and automatically detects noise/outliers.",
        "clarity": "Unsupervised geometry explanation.",
        "examples": "Demonstrates customer segmentation grouping based on purchase frequency and average basket size."
      },
      "followUp": "How do you select `eps` and `min_samples` hyperparameters in DBSCAN using k-distance graphs?"
    },
    {
      "id": "ds_sr_1",
      "question": "How do SHAP (SHapley Additive exPlanations) and LIME (Local Interpretable Model-agnostic Explanations) work for model interpretability? Compare cooperative game theory efficiency with local surrogate models.",
      "topic": "Model Evaluation & Cross-Validation",
      "questionType": "conceptual",
      "level": "Senior",
      "idealKeywords": [
        "SHAP values",
        "Shapley values (game theory)",
        "efficiency and additivity",
        "TreeSHAP",
        "LIME local surrogate linear model",
        "global vs local feature importance",
        "black-box models"
      ],
      "rubric": {
        "correctness": "Accurately articulates Shapley values allocate marginal contribution across all feature coalitions; LIME fits an interpretable linear model on perturbed local instances.",
        "depth": "Explains why SHAP guarantees consistency and additivity (sum of attributions equals prediction minus baseline).",
        "clarity": "State-of-the-art explainable AI (XAI) delivery.",
        "examples": "Explaining why a loan application was rejected to comply with fair lending credit regulations."
      },
      "followUp": "Why is TreeSHAP computationally feasible (O(TLD^2)) compared to exact exponential Shapley computation?"
    },
    {
      "id": "ds_sr_2",
      "question": "How do you detect and mitigate Data Drift (Covariate Shift) and Concept Drift in a production machine learning system? What statistical tests (e.g. KS-test, PSI) do you implement?",
      "topic": "MLOps & Model Monitoring",
      "questionType": "troubleshooting",
      "level": "Senior",
      "idealKeywords": [
        "Covariate Shift (P(X) changes)",
        "Concept Drift (P(Y|X) changes)",
        "Population Stability Index (PSI)",
        "Kolmogorov-Smirnov (KS) test",
        "Wasserstein distance",
        "model performance degradation",
        "automated retraining"
      ],
      "rubric": {
        "correctness": "Accurately distinguishes Covariate Shift (input distributions drift) from Concept Drift (underlying relationship between X and Y changes).",
        "depth": "Details PSI thresholds (<0.1 stable, 0.1-0.2 moderate drift, >0.2 significant shift) and two-sample Kolmogorov-Smirnov tests.",
        "clarity": "Enterprise MLOps lifecycle monitoring.",
        "examples": "Cites COVID-19 pandemic sudden shift in consumer shopping patterns causing model accuracy collapse."
      },
      "followUp": "How do you design a automated canary deployment for a retrained model without exposing all users to regression?"
    },
    {
      "id": "ds_sr_3",
      "question": "How do you design cross-validation for Time-Series forecasting models? Why does standard K-Fold cross-validation introduce fatal lookahead leakage, and how does TimeSeriesSplit (rolling origin) solve this?",
      "topic": "Model Evaluation & Cross-Validation",
      "questionType": "practical",
      "level": "Senior",
      "idealKeywords": [
        "Time-Series split",
        "lookahead bias / data leakage",
        "autocorrelation",
        "rolling window validation",
        "expanding window validation",
        "purged / embargoed CV"
      ],
      "rubric": {
        "correctness": "Explains random shuffling in standard K-Fold leaks future temporal data into past training folds.",
        "depth": "Details expanding vs sliding window validation and financial purging/embargoing to account for overlapping label horizons.",
        "clarity": "Temporal modeling hygiene.",
        "examples": "Forecasting daily retail demand or financial asset volatility."
      },
      "followUp": "How do you test for stationarity in a time series using the Augmented Dickey-Fuller (ADF) test?"
    },
    {
      "id": "ds_staff_1",
      "question": "As Lead Data Scientist, how do you architect an enterprise End-to-End MLOps Platform integrating Feature Stores (Feast), Model Registries (MLflow), and automated Continuous Training (CT) pipelines?",
      "topic": "MLOps & Model Monitoring",
      "questionType": "system_design",
      "level": "Staff / Architect",
      "idealKeywords": [
        "Feature Store (online low latency vs offline batch)",
        "Feast",
        "MLflow model registry",
        "Kubeflow / Airflow orchestration",
        "model lineage",
        "CI/CD/CT pipelines",
        "data version control (DVC)"
      ],
      "rubric": {
        "correctness": "Addresses the dual-storage feature store pattern (Redis for low-latency online inference + Snowflake/Parquet for training batch joins).",
        "depth": "Details automated model promotion gates (shadow mode, canary testing, business metric evaluation).",
        "clarity": "Enterprise machine learning architectural vision.",
        "examples": "Re-platforming 20 disparate data science notebooks into a standardized production ML pipeline."
      },
      "followUp": "How do you track training-serving skew when real-time features differ slightly from batch transformations?"
    },
    {
      "id": "ds_staff_2",
      "question": "How do you align technical machine learning metrics (e.g. Log Loss, AUC-ROC, RMSE) with enterprise P&L business impact (e.g. Revenue, Customer Lifetime Value, Churn Cost)?",
      "topic": "Experiment Design & A/B Testing",
      "questionType": "system_design",
      "level": "Staff / Architect",
      "idealKeywords": [
        "expected value framework",
        "cost-benefit matrix",
        "utility function",
        "decision threshold optimization",
        "P&L impact",
        "executive storytelling",
        "risk tolerance"
      ],
      "rubric": {
        "correctness": "Applies expected utility theory: Cost = FP * Cost_FP + FN * Cost_FN to find optimal business threshold rather than default 0.5.",
        "depth": "Demonstrates translating a 0.02 AUC improvement into quantified monetary gain ($2.4M saved in fraud chargebacks).",
        "clarity": "Executive cross-functional influence and business acumen.",
        "examples": "Optimizing customer retention outreach where marketing incentive costs $20 and saved customer LTV is $500."
      },
      "followUp": "How do you convince executive leadership when an algorithmically optimal model creates uncomfortable brand reputational risks?"
    }
  ],
  "AI/ML Engineer": [
    {
      "id": "aiml_entry_1",
      "question": "What is the Vanishing and Exploding Gradient problem in Deep Neural Networks? How do activation functions like ReLU and architectural innovations like Residual Connections mitigate it?",
      "topic": "Deep Neural Networks & Architectures",
      "questionType": "conceptual",
      "level": "Fresher / Entry",
      "idealKeywords": [
        "Vanishing gradient",
        "Exploding gradient",
        "chain rule backpropagation",
        "Sigmoid derivative (<0.25)",
        "ReLU activation",
        "Residual skip connections",
        "Batch Normalization",
        "gradient clipping"
      ],
      "rubric": {
        "correctness": "Accurately explains repeated chain rule multiplication of derivatives < 1 causing gradients to decay to zero.",
        "depth": "Explains why ReLU avoids vanishing gradients in positive domain and how ResNet skip connections allow identity gradient flow.",
        "clarity": "Deep learning mathematical intuition.",
        "examples": "Contrasts training a 50-layer network with Sigmoid vs ResNet-50."
      },
      "followUp": "What is the 'Dying ReLU' problem and how does Leaky ReLU or GeLU solve it?"
    },
    {
      "id": "aiml_entry_2",
      "question": "What are Vector Embeddings and how are they generated? How does cosine similarity measure semantic closeness between text chunks in high-dimensional vector spaces?",
      "topic": "Vector Databases & Retrieval (RAG)",
      "questionType": "conceptual",
      "level": "Fresher / Entry",
      "idealKeywords": [
        "dense vector",
        "high-dimensional space",
        "semantic similarity",
        "cosine similarity (dot product / magnitudes)",
        "Word2Vec / BERT embeddings",
        "normalized vectors"
      ],
      "rubric": {
        "correctness": "Accurately explains embeddings as continuous vector representations capturing semantic relationships.",
        "depth": "Writes cosine similarity formula cos(theta) = (A . B) / (||A|| * ||B||) and explains angle measurement.",
        "clarity": "Clear linear algebra and NLP foundation.",
        "examples": "King - Man + Woman = Queen vector arithmetic intuition."
      },
      "followUp": "When vectors are L2-normalized, why does cosine similarity become equivalent to simple dot product?"
    },
    {
      "id": "aiml_entry_3",
      "question": "Explain the role of Loss Functions and Optimizers in PyTorch. Compare Stochastic Gradient Descent (SGD) with Adam in terms of momentum and adaptive learning rates.",
      "topic": "Deep Neural Networks & Architectures",
      "questionType": "practical",
      "level": "Fresher / Entry",
      "idealKeywords": [
        "Loss function (CrossEntropyLoss, MSE)",
        "SGD",
        "Adam (Adaptive Moment Estimation)",
        "first moment (mean)",
        "second moment (uncentered variance)",
        "learning rate",
        "weight decay"
      ],
      "rubric": {
        "correctness": "Accurately distinguishes loss computation from optimizer parameter updates.",
        "depth": "Explains Adam maintains per-parameter adaptive learning rates combining momentum and RMSprop scaling.",
        "clarity": "PyTorch training loop mechanics (zero_grad -> backward -> step).",
        "examples": "Shows a standard PyTorch training loop snippet."
      },
      "followUp": "Why must you invoke `optimizer.zero_grad()` at the start of every training iteration in PyTorch?"
    },
    {
      "id": "aiml_mid_1",
      "question": "Walk me through the internal architecture of the Transformer model (Vaswani et al.). Explain Scaled Dot-Product Attention, Multi-Head Attention, and why Positional Encoding is required.",
      "topic": "NLP & Transformers / LLMs",
      "questionType": "conceptual",
      "level": "Mid Level",
      "idealKeywords": [
        "Query, Key, Value (Q, K, V)",
        "Attention formula: softmax(QK^T / sqrt(d_k)) * V",
        "Multi-Head Attention",
        "Positional Encoding (sinusoidal / learned)",
        "parallel training vs RNN sequential",
        "feed-forward network"
      ],
      "rubric": {
        "correctness": "Accurately articulates attention mathematical formula and scaling factor sqrt(d_k) to prevent vanishing softmax gradients.",
        "depth": "Explains Multi-Head allows the model to jointly attend to information from different representation subspaces.",
        "clarity": "Deep architectural explanation of self-attention mechanics.",
        "examples": "Traces pronoun resolution ('The animal didn't cross the street because it was too tired')."
      },
      "followUp": "Why do modern LLMs (like LLaMA) use Rotary Position Embeddings (RoPE) instead of traditional absolute positional encodings?"
    },
    {
      "id": "aiml_mid_2",
      "question": "How do you build a production Retrieval-Augmented Generation (RAG) pipeline? Walk through chunking strategies, vector database indexing (HNSW), hybrid search, and reranking.",
      "topic": "Vector Databases & Retrieval (RAG)",
      "questionType": "practical",
      "level": "Mid Level",
      "idealKeywords": [
        "RAG",
        "chunking with overlap",
        "Vector DB (Pinecone, Milvus, Qdrant)",
        "HNSW (Hierarchical Navigable Small World)",
        "Hybrid Search (BM25 + Dense)",
        "Cross-Encoder Reranker",
        "context window injection"
      ],
      "rubric": {
        "correctness": "Covers end-to-end RAG architecture: document ingestion -> chunking -> vector indexing -> hybrid retrieval -> reranking -> LLM generation.",
        "depth": "Explains why hybrid search (BM25 keyword + dense vector) prevents missed acronyms/exact part numbers.",
        "clarity": "Production AI systems blueprint.",
        "examples": "Cites Cohere Rerank or BGE-Reranker filtering top 20 candidates down to top 3 for context injection."
      },
      "followUp": "How do you evaluate RAG hallucination and context relevance using metrics from the RAGAS framework?"
    },
    {
      "id": "aiml_mid_3",
      "question": "Explain Model Quantization for Large Language Models. How do FP16, INT8 (LLM.int8()), and INT4 (AWQ / GPTQ) reduce memory footprints, and what is the trade-off in perplexity?",
      "topic": "Model Optimization & Quantization",
      "questionType": "optimization",
      "level": "Mid Level",
      "idealKeywords": [
        "Quantization",
        "FP16 vs FP32",
        "INT8 / INT4",
        "scale factor and zero point",
        "outlier features",
        "AWQ (Activation-aware Weight Quantization)",
        "GPTQ",
        "VRAM reduction",
        "perplexity"
      ],
      "rubric": {
        "correctness": "Accurately calculates VRAM savings (e.g. 70B model in FP16 needs ~140GB; in 4-bit needs ~35GB).",
        "depth": "Explains emergent outlier activations in LLMs >6.7B parameters and how AWQ protects salient weights from quantization noise.",
        "clarity": "Low-level model compression analysis.",
        "examples": "Deploying LLaMA-3-8B on a consumer single 16GB GPU (RTX 4090 / T4)."
      },
      "followUp": "What is the difference between Post-Training Quantization (PTQ) and Quantization-Aware Training (QAT)?"
    },
    {
      "id": "aiml_mid_4",
      "question": "How does Parameter-Efficient Fine-Tuning (PEFT) work? Deep dive into LoRA (Low-Rank Adaptation) and QLoRA: explain low-rank matrix decomposition (W = W0 + B*A) and rank r selection.",
      "topic": "NLP & Transformers / LLMs",
      "questionType": "practical",
      "level": "Mid Level",
      "idealKeywords": [
        "LoRA",
        "QLoRA",
        "low-rank decomposition (B * A)",
        "frozen base weights",
        "rank r (e.g. 8, 16)",
        "alpha scaling parameter",
        "NF4 (NormalFloat4) data type",
        "VRAM efficiency"
      ],
      "rubric": {
        "correctness": "Accurately details mathematical formulation delta W = B * A where B is d x r and A is r x k with r << min(d, k).",
        "depth": "Explains that base weights remain frozen; only low-rank matrices receive gradients, reducing trainable parameters by 99% with zero inference latency overhead after merging.",
        "clarity": "State-of-the-art fine-tuning mechanics.",
        "examples": "Fine-tuning a 7B model using QLoRA on a single 24GB GPU using bitsandbytes."
      },
      "followUp": "Can multiple LoRA adapters be loaded dynamically and swapped at runtime for different customer tenants?"
    },
    {
      "id": "aiml_sr_1",
      "question": "Compare distributed training paradigms for models that exceed single GPU memory: Data Parallel (DDP), Pipeline Parallelism, Tensor Parallelism (Megatron-LM), and ZeRO / FSDP.",
      "topic": "Distributed Training & GPU Acceleration",
      "questionType": "system_design",
      "level": "Senior",
      "idealKeywords": [
        "DistributedDataParallel (DDP)",
        "Tensor Parallelism",
        "Pipeline Parallelism",
        "ZeRO (Zero Redundancy Optimizer)",
        "FSDP (Fully Sharded Data Parallel)",
        "NCCL all-reduce",
        "NVLink bandwidth",
        "optimizer state sharding"
      ],
      "rubric": {
        "correctness": "Accurately categorizes ZeRO Stages: Stage 1 (optimizer states), Stage 2 (gradients), Stage 3 (parameter sharding).",
        "depth": "Explains Tensor Parallelism splits individual weight matrices across GPUs connected by high-bandwidth NVLink; Pipeline Parallelism partitions layers across nodes.",
        "clarity": "Supercomputer GPU cluster engineering rigor.",
        "examples": "Training a 70B parameter model across 8x H100 nodes."
      },
      "followUp": "What causes pipeline bubbles in pipeline parallelism and how does 1F1B (One-Forward-One-Backward) schedule reduce them?"
    },
    {
      "id": "aiml_sr_2",
      "question": "How do high-throughput LLM inference serving engines (e.g. vLLM, TensorRT-LLM, TGI) achieve 10x throughput gains over naive HuggingFace pipelines? Explain PagedAttention and Continuous Batching.",
      "topic": "Inference Latency & Serving",
      "questionType": "optimization",
      "level": "Senior",
      "idealKeywords": [
        "PagedAttention",
        "KV cache fragmentation",
        "Continuous / In-flight batching",
        "speculative decoding",
        "time-to-first-token (TTFT)",
        "inter-token latency (ITL)",
        "vLLM"
      ],
      "rubric": {
        "correctness": "Accurately explains that KV cache memory bloat and external fragmentation previously limited batch sizes; PagedAttention partitions KV cache like OS virtual memory pages.",
        "depth": "Explains continuous batching iterates at the token level rather than waiting for slowest sequence in the batch to complete.",
        "clarity": "Production inference optimization architecture.",
        "examples": "Benchmarking tokens-per-second and memory utilization under heavy concurrent user prompts."
      },
      "followUp": "How does Speculative Decoding use a small draft model to accelerate token generation of a large target model?"
    },
    {
      "id": "aiml_sr_3",
      "question": "How do you align Large Language Models with human preferences using RLHF (Reinforcement Learning from Human Feedback), DPO (Direct Preference Optimization), and Constitutional AI?",
      "topic": "NLP & Transformers / LLMs",
      "questionType": "practical",
      "level": "Senior",
      "idealKeywords": [
        "RLHF",
        "Reward Model",
        "PPO (Proximal Policy Optimization)",
        "KL-divergence penalty",
        "DPO (Direct Preference Optimization)",
        "implicit reward",
        "pair-wise chosen vs rejected",
        "alignment tax"
      ],
      "rubric": {
        "correctness": "Contrasts 3-stage RLHF (SFT -> Reward Model -> PPO) with DPO which mathematically solves the optimal policy directly from preference data without a separate reward model or RL loop.",
        "depth": "Explains KL-divergence constraint to prevent mode collapse / reward hacking.",
        "clarity": "Deep theoretical and practical alignment delivery.",
        "examples": "Dataset formatting with prompt, chosen answer, and rejected answer."
      },
      "followUp": "What is the 'alignment tax' and how does safety fine-tuning potentially degrade creative or complex coding capabilities?"
    },
    {
      "id": "aiml_staff_1",
      "question": "As Chief AI Architect, design an enterprise Generative AI Platform supporting multi-tenant LLM routing, semantic caching (GPTCache), prompt guardrails (NeMo / Llama Guard), and cost governance.",
      "topic": "NLP & Transformers / LLMs",
      "questionType": "system_design",
      "level": "Staff / Architect",
      "idealKeywords": [
        "AI Gateway",
        "semantic cache (vector similarity)",
        "model routing (small vs large models)",
        "prompt injection defense",
        "Llama Guard / NeMo Guardrails",
        "rate limiting & token quotas",
        "fallback cascading"
      ],
      "rubric": {
        "correctness": "Proposes unified AI Gateway architecture decoupling application logic from underlying model providers (OpenAI, Anthropic, self-hosted vLLM).",
        "depth": "Details semantic caching with cosine threshold (0.95) to serve identical questions at 0 cost and sub-10ms latency.",
        "clarity": "Enterprise platform security, latency, and cost governance.",
        "examples": "Routing simple classification queries to local 8B models and complex multi-step reasoning to GPT-4o."
      },
      "followUp": "How do you detect and neutralize indirect prompt injection embedded in external web search results or PDF attachments?"
    },
    {
      "id": "aiml_staff_2",
      "question": "How do you architect an enterprise Agentic AI Workflow using frameworks like LangGraph or AutoGen? Discuss state management, tool execution sandboxing, reflection loops, and deadlock prevention.",
      "topic": "NLP & Transformers / LLMs",
      "questionType": "system_design",
      "level": "Staff / Architect",
      "idealKeywords": [
        "Agentic AI",
        "LangGraph state machine",
        "ReAct loop (Reason + Act)",
        "tool calling",
        "code execution sandbox (Docker/gVisor)",
        "infinite loop guard",
        "human-in-the-loop (HITL)",
        "idempotent actions"
      ],
      "rubric": {
        "correctness": "Designs deterministic graph-based state machine (LangGraph) rather than unpredictable autonomous loops.",
        "depth": "Addresses isolated execution sandboxes for code generation, max-iteration recursion limits, and human-in-the-loop approval gates for destructive API calls.",
        "clarity": "Next-generation production AI systems blueprint.",
        "examples": "Multi-agent code review workflow (Planner -> Coder -> Test Runner -> Critic)."
      },
      "followUp": "How do you prevent cyclic hallucination when an agent fails a unit test and keeps repeating the same broken patch?"
    }
  ],
  "Cybersecurity Analyst": [
    {
      "id": "sec_entry_1",
      "question": "Explain the CIA Triad (Confidentiality, Integrity, Availability) in information security. Give an example of a cyber attack that violates each principle.",
      "topic": "Network Security & Firewalls",
      "questionType": "conceptual",
      "level": "Fresher / Entry",
      "idealKeywords": [
        "Confidentiality",
        "Integrity",
        "Availability",
        "CIA triad",
        "data breach / sniffing",
        "man-in-the-middle / tampering",
        "DDoS attack",
        "encryption",
        "hashing"
      ],
      "rubric": {
        "correctness": "Accurately defines all three principles and pairs them with correct attack vectors.",
        "depth": "Identifies appropriate controls: encryption for confidentiality, digital signatures/hashes for integrity, redundancy/DDoS mitigation for availability.",
        "clarity": "Foundational security model articulation.",
        "examples": "Eavesdropping (Confidentiality), unauthorized database alteration (Integrity), ransomware server lockout (Availability)."
      },
      "followUp": "How do you balance strong confidentiality controls against system availability and user usability?"
    },
    {
      "id": "sec_entry_2",
      "question": "Compare Symmetric and Asymmetric Cryptography. How does Public Key Infrastructure (PKI) use both to establish a secure HTTPS connection via TLS?",
      "topic": "Cryptography & PKI",
      "questionType": "conceptual",
      "level": "Fresher / Entry",
      "idealKeywords": [
        "Symmetric (AES, shared key, fast)",
        "Asymmetric (RSA, ECC, public/private key pair)",
        "TLS handshake",
        "Certificate Authority (CA)",
        "digital certificate",
        "session key",
        "hybrid encryption"
      ],
      "rubric": {
        "correctness": "Explains asymmetric encryption authenticates server and exchanges a random symmetric session key; symmetric cipher then encrypts payload data for performance.",
        "depth": "Details Certificate Authority chain of trust and digital signature validation.",
        "clarity": "Cryptographic protocol clarity.",
        "examples": "Walking through browser TLS 1.3 handshake."
      },
      "followUp": "What is Forward Secrecy (PFS) in TLS and why is Diffie-Hellman preferred over static RSA key exchange?"
    },
    {
      "id": "sec_entry_3",
      "question": "What is Phishing and Social Engineering? What technical and procedural safeguards (e.g. SPF, DKIM, DMARC, MFA) defend an organization against credential theft?",
      "topic": "Incident Response & Forensics",
      "questionType": "practical",
      "level": "Fresher / Entry",
      "idealKeywords": [
        "Phishing",
        "Social engineering",
        "Spear phishing",
        "SPF (Sender Policy Framework)",
        "DKIM (DomainKeys Identified Mail)",
        "DMARC",
        "Hardware security keys (FIDO2/WebAuthn)",
        "security awareness training"
      ],
      "rubric": {
        "correctness": "Accurately explains email authentication standards (SPF, DKIM, DMARC) and phishing-resistant MFA.",
        "depth": "Explains why SMS MFA is vulnerable to SIM-swapping and why FIDO2 WebAuthn prevents reverse-proxy phishing.",
        "clarity": "Practical defense-in-depth approach.",
        "examples": "Cites real adversary-in-the-middle (AitM) attacks like Evilginx bypass."
      },
      "followUp": "How does DMARC policy enforcement (`p=reject`) prevent unauthorized domain spoofing?"
    },
    {
      "id": "sec_mid_1",
      "question": "Walk through the OWASP Top 10 vulnerabilities: Focus on SQL Injection (SQLi), Cross-Site Scripting (XSS), and Broken Object Level Authorization (BOLA/IDOR). How do you remediate each in code?",
      "topic": "Vulnerability Assessment & OWASP Top 10",
      "questionType": "coding",
      "level": "Mid Level",
      "idealKeywords": [
        "SQL Injection",
        "Parameterized queries / Prepared statements",
        "Stored vs Reflected XSS",
        "Content Security Policy (CSP)",
        "Contextual output encoding",
        "IDOR / BOLA",
        "authorization ownership check"
      ],
      "rubric": {
        "correctness": "Provides code-level remediation: parameterized bindings for SQLi, contextual encoding/CSP for XSS, server-side session user_id checks for IDOR.",
        "depth": "Explains that ORMs do not automatically prevent SQLi if raw string formatting is used.",
        "clarity": "AppSec engineering precision.",
        "examples": "Shows vulnerable `SELECT * FROM users WHERE id = ' + input` vs safe parameterized query."
      },
      "followUp": "What is the difference between stored XSS and DOM-based XSS?"
    },
    {
      "id": "sec_mid_2",
      "question": "How do you analyze suspicious network traffic using Wireshark or tcpdump? What packet indicators distinguish normal user activity from a Port Scan, SYN Flood, or DNS Tunneling?",
      "topic": "Network Security & Firewalls",
      "questionType": "troubleshooting",
      "level": "Mid Level",
      "idealKeywords": [
        "Wireshark",
        "pcap analysis",
        "TCP SYN without ACK (half-open port scan)",
        "SYN Flood DDoS",
        "DNS Tunneling (high entropy, large TXT records, abnormal query frequency)",
        "TCP flags",
        "BPF filters"
      ],
      "rubric": {
        "correctness": "Identifies packet anomalies: thousands of SYN packets with no ACKs indicating port scan or SYN flood.",
        "depth": "Explains DNS tunneling indicators (unusual subdomain lengths, high Shannon entropy, base64 encoded queries to anomalous nameservers).",
        "clarity": "Packet-level forensics mindset.",
        "examples": "Writing Wireshark display filters like `tcp.flags.syn == 1 && tcp.flags.ack == 0`."
      },
      "followUp": "How do firewalls employ SYN cookies to mitigate SYN flood exhaustion?"
    },
    {
      "id": "sec_mid_3",
      "question": "Explain the Incident Response Lifecycle according to NIST SP 800-61 (Preparation, Detection & Analysis, Containment, Eradication, Recovery, Post-Incident Activity). How do you contain a live ransomware outbreak?",
      "topic": "Incident Response & Forensics",
      "questionType": "practical",
      "level": "Mid Level",
      "idealKeywords": [
        "NIST SP 800-61",
        "Containment (isolate infected hosts)",
        "network segmentation",
        "volatile memory capture (RAM dump)",
        "Eradication",
        "clean backup restoration",
        "Lessons Learned / Post-Mortem",
        "chain of custody"
      ],
      "rubric": {
        "correctness": "Strictly sequences NIST phases and prioritizes immediate network isolation (severing Ethernet/Wi-Fi, disabling compromised service accounts).",
        "depth": "Emphasizes taking forensic RAM dumps before powering off infected machines to preserve encryption keys and memory-resident malware.",
        "clarity": "Crisis management discipline.",
        "examples": "Restoring domain controllers and critical file shares from immutable air-gapped backups."
      },
      "followUp": "Why should you never communicate about a live ransomware incident over internal corporate email or Slack?"
    },
    {
      "id": "sec_mid_4",
      "question": "How do you build detection rules in a SIEM (e.g. Splunk, Microsoft Sentinel, Elastic)? Walk through correlating multiple low-severity alerts into a high-fidelity incident using the MITRE ATT&CK matrix.",
      "topic": "SIEM & Threat Detection",
      "questionType": "practical",
      "level": "Mid Level",
      "idealKeywords": [
        "SIEM",
        "Splunk SPL / KQL",
        "MITRE ATT&CK (Initial Access -> Execution -> Persistence -> Lateral Movement)",
        "alert correlation",
        "false positive reduction",
        "threshold rules",
        "UEBA"
      ],
      "rubric": {
        "correctness": "Maps sequence of events across MITRE ATT&CK tactics (e.g. Phishing email opened -> PowerShell encoded execution -> lsass memory dumping -> PsExec lateral movement).",
        "depth": "Explains how single events produce alert fatigue; correlation windows within 10 minutes reduce false positives by 95%.",
        "clarity": "SOC engineering perspective.",
        "examples": "Writes a correlation query detecting impossible travel logins followed by unusual cloud file downloads."
      },
      "followUp": "What is the difference between signature-based detection and User & Entity Behavior Analytics (UEBA)?"
    },
    {
      "id": "sec_sr_1",
      "question": "How do you conduct Threat Hunting using the MITRE ATT&CK framework? Walk me through hunting for Adversary Technique T1003 (OS Credential Dumping via LSASS) in an enterprise Windows environment.",
      "topic": "SIEM & Threat Detection",
      "questionType": "troubleshooting",
      "level": "Senior",
      "idealKeywords": [
        "MITRE ATT&CK T1003",
        "LSASS memory dumping",
        "Sysmon Event ID 10 (ProcessAccess)",
        "Mimikatz",
        "Procdump",
        "rundll32",
        "GrantedAccess masks (0x1010, 0x1F3FFF)",
        "Credential Guard"
      ],
      "rubric": {
        "correctness": "Identifies exact Windows Event logs: Sysmon Event ID 10 auditing processes accessing lsass.exe with PROCESS_VM_READ permissions.",
        "depth": "Discusses advanced adversary evasion (direct system calls, unhooking ntdll, minidump API) and defensive controls like LSA Protection and Credential Guard.",
        "clarity": "Elite offensive/defensive tradecraft.",
        "examples": "Writing Sigma or KQL rules to flag non-system processes inspecting LSASS memory."
      },
      "followUp": "How does Windows Defender Credential Guard use virtualization-based security (VBS) to isolate LSA secrets?"
    },
    {
      "id": "sec_sr_2",
      "question": "Explain Zero Trust Architecture (NIST SP 800-207). How do you transition an enterprise away from legacy VPN perimeter security to identity-aware proxies, microsegmentation, and continuous device posture evaluation?",
      "topic": "Network Security & Firewalls",
      "questionType": "system_design",
      "level": "Senior",
      "idealKeywords": [
        "Zero Trust (Never Trust, Always Verify)",
        "NIST SP 800-207",
        "Policy Decision Point (PDP) / Policy Enforcement Point (PEP)",
        "Identity-Aware Proxy (IAP)",
        "microsegmentation",
        "device health posture",
        "least privilege"
      ],
      "rubric": {
        "correctness": "Contrasts legacy castle-and-moat perimeter with continuous context-based authorization per request.",
        "depth": "Explains PDP/PEP architecture evaluating user identity, MFA strength, device compliance (EDR active, disk encrypted), and data sensitivity.",
        "clarity": "Enterprise enterprise security transformation leadership.",
        "examples": "References Google BeyondCorp, Cloudflare Zero Trust, or Microsoft Entra Private Access."
      },
      "followUp": "How do you handle legacy protocols (like SMB, SSH, or legacy database connections) that cannot easily go through an HTTP Identity-Aware Proxy?"
    },
    {
      "id": "sec_sr_3",
      "question": "How do you secure cloud infrastructure in AWS/Azure? Discuss IAM privilege escalation paths (e.g. PassRole, CreatePolicyVersion), CloudTrail immutability, and GuardDuty anomaly detection.",
      "topic": "Cloud Security & Compliance",
      "questionType": "practical",
      "level": "Senior",
      "idealKeywords": [
        "AWS IAM",
        "least privilege",
        "privilege escalation (iam:PassRole, iam:AttachUserPolicy)",
        "CloudTrail with log file validation",
        "S3 Object Lock (WORM)",
        "GuardDuty machine learning",
        "KMS envelope encryption"
      ],
      "rubric": {
        "correctness": "Accurately analyzes IAM policy risks where broad permissions allow an attacker to attach AdministratorAccess to their own role or launch an EC2 instance with elevated role.",
        "depth": "Details multi-account AWS Organizations strategy with Service Control Policies (SCPs) and immutable centralized logging.",
        "clarity": "Cloud security architecture mastery.",
        "examples": "Using tools like Pacu, ScoutSuite, or Prowler for automated cloud posture audits."
      },
      "followUp": "What is an IMDSv2 (Instance Metadata Service) SSRF attack and how does token-based session authentication protect EC2 credentials?"
    },
    {
      "id": "sec_staff_1",
      "question": "As Chief Information Security Officer (CISO) Advisor / Principal Security Architect, how do you architect a modern Security Operations Center (SOC) leveraging SOAR (Security Orchestration, Automation, and Response)?",
      "topic": "SIEM & Threat Detection",
      "questionType": "system_design",
      "level": "Staff / Architect",
      "idealKeywords": [
        "SOAR",
        "automated playbooks",
        "mean time to detect (MTTD)",
        "mean time to respond (MTTR)",
        "analyst burnout",
        "API integrations (EDR, Firewall, IAM)",
        "human-in-the-loop approvals"
      ],
      "rubric": {
        "correctness": "Architects end-to-end automation for tier-1 alerts (phishing analysis, endpoint isolation, user password reset) while preserving human governance for high-impact actions.",
        "depth": "Measures reduction in MTTR (from hours to seconds) and metrics on false positive triage.",
        "clarity": "Executive security leadership and operational scaling.",
        "examples": "Building automated playbooks in Cortex XSOAR or Splunk SOAR."
      },
      "followUp": "What safeguards prevent an automated SOAR playbook from accidentally isolating the CEO's laptop or the production database server during a false positive?"
    },
    {
      "id": "sec_staff_2",
      "question": "How do you design and execute an enterprise-wide Adversary Emulation / Red Team exercise? How do you maintain safety, establish rules of engagement (RoE), and ensure blameless Purple Team knowledge transfer?",
      "topic": "Vulnerability Assessment & OWASP Top 10",
      "questionType": "system_design",
      "level": "Staff / Architect",
      "idealKeywords": [
        "Red Team vs Blue Team",
        "Purple Team collaboration",
        "Rules of Engagement (RoE)",
        "deconfliction protocol",
        "threat intelligence led (TIBER-EU)",
        "crown jewels scoping",
        "remediation roadmap"
      ],
      "rubric": {
        "correctness": "Establishes clear Rules of Engagement, white-cell oversight, trusted agent emergency stop protocols, and formal deconfliction logging.",
        "depth": "Advocates for Purple Teaming where Red Team demonstrates exact attack telemetry to Blue Team engineers in real-time to immediately harden detection rules.",
        "clarity": "Elite executive governance and mature security culture.",
        "examples": "Simulating a sophisticated nation-state APT group targeting source code repositories and payment rails."
      },
      "followUp": "How do you report the outcomes of a devastatingly successful Red Team operation to the Board of Directors without causing panic or scapegoating?"
    }
  ],
  "UI/UX Designer": [
    {
      "id": "uiux_entry_1",
      "question": "What is the difference between UI (User Interface) and UX (User Experience)? How do qualitative user interviews differ from quantitative analytics in user research?",
      "topic": "User Research & Persona Building",
      "questionType": "conceptual",
      "level": "Fresher / Entry",
      "idealKeywords": [
        "UI visual touchpoints",
        "UX overall journey and feel",
        "qualitative insights (why users struggle)",
        "quantitative metrics (what users do)",
        "empathy",
        "usability",
        "wireframes vs visual design"
      ],
      "rubric": {
        "correctness": "Accurately articulates UI as visual design elements (typography, color, controls) and UX as holistic user satisfaction and efficiency.",
        "depth": "Contrasts qualitative observation (discovery of pain points) with quantitative analytics (bounce rate, drop-off funnels).",
        "clarity": "Clean, human-centered design terminology.",
        "examples": "References user interview transcripts vs Google Analytics funnel tracking."
      },
      "followUp": "How do you avoid confirmation bias when interviewing users about your own design concepts?"
    },
    {
      "id": "uiux_entry_2",
      "question": "Explain Jakob Nielsen's 10 Usability Heuristics. Choose two heuristics (e.g. 'Visibility of System Status' and 'Error Prevention') and explain how you implement them in modern web or mobile apps.",
      "topic": "Usability Testing & Heuristics",
      "questionType": "conceptual",
      "level": "Fresher / Entry",
      "idealKeywords": [
        "Nielsen heuristics",
        "Visibility of system status (spinners, progress bars)",
        "Error prevention (destructive confirm dialogs)",
        "User control and freedom (undo action)",
        "Consistency and standards",
        "Recognition over recall"
      ],
      "rubric": {
        "correctness": "Correctly names heuristics and illustrates accurate application.",
        "depth": "Explains progressive disclosure and immediate feedback mechanisms.",
        "clarity": "Structured design evaluation mindset.",
        "examples": "Cites Gmail 'Undo Send' banner or multi-step checkout progress bars."
      },
      "followUp": "Why is 'Recognition over Recall' especially critical for mobile screens?"
    },
    {
      "id": "uiux_entry_3",
      "question": "What is Visual Hierarchy in interface design? How do typography scales, white space, and color contrast guide a user's eye toward key calls-to-action (CTAs)?",
      "topic": "Visual Hierarchy & Typography",
      "questionType": "practical",
      "level": "Fresher / Entry",
      "idealKeywords": [
        "Visual hierarchy",
        "typographic scale (H1 to caption)",
        "negative / white space",
        "F-pattern and Z-pattern reading",
        "contrast ratio (WCAG 4.5:1)",
        "primary vs secondary CTA",
        "focal point"
      ],
      "rubric": {
        "correctness": "Accurately describes how size, weight, color, and spacing establish eye-tracking priority.",
        "depth": "References scanning patterns (F-pattern for text, Z-pattern for landing pages).",
        "clarity": "Aesthetic and cognitive balance.",
        "examples": "Contrasts high-contrast primary action button with muted ghost secondary button."
      },
      "followUp": "How do you test whether a screen has too many competing focal points?"
    },
    {
      "id": "uiux_mid_1",
      "question": "How do you design for Accessibility complying with WCAG 2.1 AA standards? Discuss color contrast ratios, screen reader accessibility (ARIA tags), and keyboard navigation states.",
      "topic": "Accessibility & WCAG Compliance",
      "questionType": "practical",
      "level": "Mid Level",
      "idealKeywords": [
        "WCAG 2.1 AA",
        "contrast ratio 4.5:1 for normal text (3:1 for large)",
        "ARIA attributes (aria-label, aria-live)",
        "focus visible indicators",
        "keyboard navigability (tabindex)",
        "screen reader semantics",
        "alt text"
      ],
      "rubric": {
        "correctness": "Accurately states WCAG 2.1 AA contrast requirements and interactive keyboard focus standards.",
        "depth": "Emphasizes that accessibility is not just for visually impaired users but benefits keyboard-only users, motor-impaired individuals, and situational limitations.",
        "clarity": "Inclusive design mindset.",
        "examples": "Designing accessible modal dialogs that trap focus and dismiss on ESC key."
      },
      "followUp": "Why should color never be used as the sole indicator for conveying status or validation errors?"
    },
    {
      "id": "uiux_mid_2",
      "question": "How do you construct and scale an atomic Design System in Figma? Explain Design Tokens (spacing, color, typography) and auto-layout component variants.",
      "topic": "Design Systems & Component Libraries",
      "questionType": "practical",
      "level": "Mid Level",
      "idealKeywords": [
        "Design System",
        "Design Tokens",
        "Atomic design (atoms, molecules, organisms)",
        "Figma Auto-layout",
        "component variants and properties",
        "semantic naming conventions",
        "developer handoff"
      ],
      "rubric": {
        "correctness": "Accurately breaks down design hierarchy into primitives, tokens, and reusable components.",
        "depth": "Explains how design tokens bridge Figma and code repositories (CSS variables / JSON token sync).",
        "clarity": "Modular design engineering.",
        "examples": "Demonstrates a Button component variant supporting sizes, states (default, hover, active, disabled), and leading icons."
      },
      "followUp": "How do you handle breaking changes in a design system without breaking active engineering sprints?"
    },
    {
      "id": "uiux_mid_3",
      "question": "How do you plan, recruit, and conduct a Moderated Usability Testing study on a newly redesigned onboarding workflow? How do you synthesize findings using an Affinity Diagram?",
      "topic": "Usability Testing & Heuristics",
      "questionType": "practical",
      "level": "Mid Level",
      "idealKeywords": [
        "Usability testing protocol",
        "screener questions",
        "think-aloud protocol",
        "unbiased task prompts",
        "Affinity diagram / clustering",
        "usability metrics (SUS, completion rate, time-on-task)",
        "actionable redesign recommendations"
      ],
      "rubric": {
        "correctness": "Outlines structured usability test (5-8 participants per persona, non-leading tasks, think-aloud observation).",
        "depth": "Synthesizes observations into thematic clusters (Affinity Map) to prioritize severity of UX friction.",
        "clarity": "Empirical researcher rigor.",
        "examples": "Identifies that 4 out of 5 users failed to find the 'Import CSV' button during onboarding."
      },
      "followUp": "What is the difference between moderated and unmoderated usability testing?"
    },
    {
      "id": "uiux_mid_4",
      "question": "How do you design complex Information Architecture (IA) and multi-step User Flows for enterprise B2B SaaS workflows? Explain Card Sorting and Tree Testing validation.",
      "topic": "Information Architecture & User Flows",
      "questionType": "practical",
      "level": "Mid Level",
      "idealKeywords": [
        "Information Architecture (IA)",
        "site map",
        "user flow",
        "Open vs Closed Card Sorting",
        "Tree Testing (findability test)",
        "cognitive load reduction",
        "progressive disclosure"
      ],
      "rubric": {
        "correctness": "Accurately contrasts Open Card Sorting (generative taxonomy discovery) with Tree Testing (evaluative navigational validation).",
        "depth": "Minimizes cognitive friction by chunking complex settings into intuitive hierarchical categories.",
        "clarity": "Systematic enterprise product thinking.",
        "examples": "Restructuring a chaotic settings menu with 80+ options into 5 logical categories."
      },
      "followUp": "How does Progressive Disclosure prevent cognitive overload for novice users while keeping power tools accessible?"
    },
    {
      "id": "uiux_sr_1",
      "question": "How do you establish seamless Design-to-Engineering Handoff and collaboration? How do you prevent 'design drift' and ensure high-fidelity implementation of animations and responsive edge cases?",
      "topic": "Stakeholder Collaboration & Design Handoff",
      "questionType": "practical",
      "level": "Senior",
      "idealKeywords": [
        "Design handoff",
        "design tokens sync",
        "Figma Dev Mode",
        "edge case documentation (empty states, error states, truncated text)",
        "motion specs (easing curves, duration)",
        "Design QA / visual review",
        "shared component governance"
      ],
      "rubric": {
        "correctness": "Advocates continuous engineering pairing rather than tossing designs 'over the wall' at sprint boundaries.",
        "depth": "Details comprehensive state specs: loading skeleton, empty state, partial failure, long internationalized strings, and responsive breakpoints.",
        "clarity": "Collaborative engineering empathy.",
        "examples": "Conducting weekly Design QA sessions to catch CSS misalignments before production release."
      },
      "followUp": "How do you resolve disagreements when developers claim a design is technically impossible or too time-consuming to build?"
    },
    {
      "id": "uiux_sr_2",
      "question": "How do you design, run, and evaluate A/B Testing and conversion rate optimization (CRO) experiments for a core product funnel? What metrics (drop-off rate, click-through rate, micro-conversions) guide iteration?",
      "topic": "User Research & Persona Building",
      "questionType": "practical",
      "level": "Senior",
      "idealKeywords": [
        "A/B testing",
        "CRO (Conversion Rate Optimization)",
        "funnel drop-off analysis",
        "hypothesis formulation",
        "micro-conversions vs primary KPI",
        "heatmaps and session recordings",
        "iterative design"
      ],
      "rubric": {
        "correctness": "Formulates testable UX hypothesis: 'By changing X for user persona Y, we expect Z metric increase because of cognitive trigger W.'",
        "depth": "Analyzes trade-offs between short-term conversion spikes (dark patterns) vs long-term brand retention.",
        "clarity": "Product-minded design leadership.",
        "examples": "Redesigning pricing plan comparison table and testing annual vs monthly toggle default."
      },
      "followUp": "How do you detect whether an increase in checkout clicks merely increased subsequent customer support refund tickets?"
    },
    {
      "id": "uiux_sr_3",
      "question": "How do you lead the UX overhaul of a fragmented legacy enterprise application without alienating existing power users who rely on ingrained muscle memory and keyboard shortcuts?",
      "topic": "Information Architecture & User Flows",
      "questionType": "troubleshooting",
      "level": "Senior",
      "idealKeywords": [
        "Legacy modernization",
        "muscle memory",
        "power users",
        "opt-in beta toggle",
        "in-app onboarding guided tours",
        "keyboard shortcut parity",
        "feedback loops",
        "telemetry tracking"
      ],
      "rubric": {
        "correctness": "Advocates incremental phased migration with opt-in preview mode rather than sudden disruptive cutover.",
        "depth": "Preserves keyboard shortcut efficiency and high-density information display while modernizing aesthetic clarity.",
        "clarity": "Strategic user change management.",
        "examples": "Modernizing a Bloomberg terminal-like trading interface or enterprise CRM."
      },
      "followUp": "How do you distinguish authentic user friction from temporary 'change aversion' during the first week of a major redesign?"
    },
    {
      "id": "uiux_staff_1",
      "question": "As Head of Design / Staff Product Designer, how do you align design strategy with company revenue goals and present UX ROI to C-level executives and the Board of Directors?",
      "topic": "Stakeholder Collaboration & Design Handoff",
      "questionType": "system_design",
      "level": "Staff / Architect",
      "idealKeywords": [
        "UX ROI",
        "customer lifetime value (LTV)",
        "churn reduction",
        "NPS / CSAT correlation with revenue",
        "support ticket deflection",
        "executive storytelling",
        "design maturity model"
      ],
      "rubric": {
        "correctness": "Quantifies UX impact in business language: cost savings from reduced support volume, increased enterprise renewal rates, faster sales velocity.",
        "depth": "Presents design maturity model shifting organization from reactive styling to proactive strategic product discovery.",
        "clarity": "Executive presence and commercial fluency.",
        "examples": "Demonstrating how a 2-click workflow simplification saved enterprise customers 12,000 collective hours annually, securing a $10M contract renewal."
      },
      "followUp": "How do you protect your team's creative capacity when executive leadership demands shipping hasty feature requests without research?"
    },
    {
      "id": "uiux_staff_2",
      "question": "How do you architect a global cross-platform design strategy spanning Web, iOS, Android, and Desktop that respects platform-native paradigms (Human Interface Guidelines vs Material Design) while maintaining unified brand identity?",
      "topic": "Design Systems & Component Libraries",
      "questionType": "system_design",
      "level": "Staff / Architect",
      "idealKeywords": [
        "Cross-platform design",
        "Apple HIG (Human Interface Guidelines)",
        "Google Material Design 3",
        "platform-native paradigms (bottom tab bar vs top navigation)",
        "unified brand voice",
        "responsive design",
        "design governance"
      ],
      "rubric": {
        "correctness": "Balances cross-platform brand cohesion with native user expectations (e.g. iOS back swipe gesture, native date pickers, system haptics).",
        "depth": "Establishes multi-platform design token architecture and governance council across product squads.",
        "clarity": "Global multi-platform design leadership.",
        "examples": "Designing a flagship productivity app with consistent brand colors and typography while adapting navigation to iOS TabBar and Android NavigationBar."
      },
      "followUp": "What is the danger of forcing an exact 1:1 pixel clone of an iOS design onto an Android application?"
    }
  ],
  "Business Analyst": [
    {
      "id": "ba_entry_1",
      "question": "What is the difference between Functional and Non-Functional Requirements (NFRs)? Give three concrete examples of each for an online banking mobile app.",
      "topic": "Requirements Gathering & User Stories",
      "questionType": "conceptual",
      "level": "Fresher / Entry",
      "idealKeywords": [
        "Functional requirements (what system does)",
        "Non-Functional requirements (how well system performs)",
        "user authentication",
        "fund transfer",
        "latency / response time (<200ms)",
        "availability (99.99%)",
        "security (encryption, PCI-DSS)"
      ],
      "rubric": {
        "correctness": "Accurately categorizes business capabilities (functional) vs system attributes (performance, security, scalability, usability).",
        "depth": "Explains that missing NFRs often cause catastrophic production failures even if all functional features work.",
        "clarity": "Clean requirements taxonomy.",
        "examples": "Contrasts 'User can transfer money' (Functional) with 'Transfer must complete within 2 seconds under 10k concurrent users' (NFR)."
      },
      "followUp": "How do you write measurable, verifiable acceptance criteria for a non-functional requirement like 'The app must be fast'?"
    },
    {
      "id": "ba_entry_2",
      "question": "What is a User Story? Explain the INVEST criteria (Independent, Negotiable, Valuable, Estimable, Small, Testable) for writing effective Agile user stories.",
      "topic": "Requirements Gathering & User Stories",
      "questionType": "conceptual",
      "level": "Fresher / Entry",
      "idealKeywords": [
        "User Story formula (As a [user], I want [action], so that [benefit])",
        "INVEST criteria",
        "Independent",
        "Negotiable",
        "Valuable",
        "Estimable",
        "Small",
        "Testable",
        "acceptance criteria"
      ],
      "rubric": {
        "correctness": "Accurately details user story standard syntax and every letter of the INVEST acronym.",
        "depth": "Explains why 'Negotiable' and 'Testable' stories prevent waterfall-style rigid specifications in Agile sprints.",
        "clarity": "Agile framework fluency.",
        "examples": "Provides a well-formed user story for password reset with clear acceptance criteria."
      },
      "followUp": "What is the difference between an Epic, a User Story, and a Task in Jira?"
    },
    {
      "id": "ba_entry_3",
      "question": "What is a SWOT Analysis (Strengths, Weaknesses, Opportunities, Threats) and a Gap Analysis? How does a Business Analyst use them during project initiation?",
      "topic": "Gap Analysis & Feasibility Study",
      "questionType": "practical",
      "level": "Fresher / Entry",
      "idealKeywords": [
        "SWOT Analysis (Internal vs External)",
        "Strengths",
        "Weaknesses",
        "Opportunities",
        "Threats",
        "Gap Analysis (Current State As-Is vs Future State To-Be)",
        "feasibility study",
        "business case"
      ],
      "rubric": {
        "correctness": "Accurately distinguishes internal factors (Strengths/Weaknesses) from external market factors (Opportunities/Threats).",
        "depth": "Explains how Gap Analysis identifies what technological, procedural, and personnel changes are required to reach the target state.",
        "clarity": "Strategic business framing.",
        "examples": "Evaluating whether a retail company should build its own e-commerce platform or adopt Shopify Plus."
      },
      "followUp": "How do you prioritize identified gaps to create an actionable project roadmap?"
    },
    {
      "id": "ba_mid_1",
      "question": "How do you map business processes using BPMN 2.0 (Business Process Model and Notation)? Explain pools, swimlanes, gateway types (Exclusive, Parallel, Inclusive), and handoffs between departments.",
      "topic": "Process Mapping & BPMN",
      "questionType": "practical",
      "level": "Mid Level",
      "idealKeywords": [
        "BPMN 2.0",
        "Pools and Swimlanes (department boundaries)",
        "Exclusive Gateway (XOR - one path)",
        "Parallel Gateway (AND - all paths concurrently)",
        "Inclusive Gateway (OR)",
        "Events (start, intermediate, end)",
        "process optimization / bottleneck removal"
      ],
      "rubric": {
        "correctness": "Accurately differentiates XOR (single decision), AND (fork into concurrent paths), and OR (one or more paths).",
        "depth": "Explains swimlanes as visual accountability containers identifying organizational handoff delays.",
        "clarity": "Process engineering rigor.",
        "examples": "Mapping a loan approval process across Applicant, Underwriting, and Compliance swimlanes."
      },
      "followUp": "How do you distinguish an As-Is process map from a To-Be process map when proposing workflow automation?"
    },
    {
      "id": "ba_mid_2",
      "question": "How do you write Acceptance Criteria using Gherkin syntax (Given-When-Then) for Behavior-Driven Development (BDD)? Write a complete test scenario for an e-commerce coupon code application.",
      "topic": "Use Case Modeling & Acceptance Criteria",
      "questionType": "coding",
      "level": "Mid Level",
      "idealKeywords": [
        "Given (precondition)",
        "When (user action)",
        "Then (expected outcome)",
        "And / But",
        "Gherkin syntax",
        "BDD (Behavior-Driven Development)",
        "Cucumber / SpecFlow",
        "edge cases (expired coupon, minimum order threshold)"
      ],
      "rubric": {
        "correctness": "Accurately crafts valid Gherkin scenario with Given (cart state), When (enters promo code), Then (discount applied).",
        "depth": "Provides both happy path and failure/edge conditions (expired promo code, cart total below minimum).",
        "clarity": "Precise testable contract between business, developers, and QA.",
        "examples": "Complete Scenario Outline with Examples data table."
      },
      "followUp": "How does BDD bridging between business analysts and automated QA engineers eliminate requirement misinterpretations?"
    },
    {
      "id": "ba_mid_3",
      "question": "How do you manage Scope Creep during an active software development project? What is the formal Change Control process for evaluating scope changes without derailing project delivery?",
      "topic": "Change Management & Business Value",
      "questionType": "practical",
      "level": "Mid Level",
      "idealKeywords": [
        "Scope Creep",
        "Change Request (CR)",
        "Impact Analysis (cost, schedule, resources, risk)",
        "Change Control Board (CCB)",
        "trade-off negotiation",
        "backlog reprioritization (MoSCoW)",
        "baseline requirements"
      ],
      "rubric": {
        "correctness": "Outlines structured change control: request capture -> impact assessment (triple constraint: scope, time, cost) -> stakeholder approval/rejection -> baseline update.",
        "depth": "Negotiates trade-offs using MoSCoW prioritization: swap an existing 'Could Have' feature for the new request to keep sprint delivery date fixed.",
        "clarity": "Diplomatic yet firm project governance.",
        "examples": "A client requests multi-currency support 2 weeks before a scheduled production launch."
      },
      "followUp": "How do you say 'no' to an influential executive without damaging the stakeholder relationship?"
    },
    {
      "id": "ba_mid_4",
      "question": "How do you elicit requirements from difficult or unaligned stakeholders? Compare elicitation techniques: Interviews, Focus Groups, Workshops (JAD), Surveys, and Document Analysis.",
      "topic": "Stakeholder Management & Negotiation",
      "questionType": "practical",
      "level": "Mid Level",
      "idealKeywords": [
        "Requirements elicitation",
        "Joint Application Development (JAD) workshops",
        "unaligned stakeholders",
        "conflict resolution",
        "active listening",
        "prototyping for alignment",
        "RACI matrix"
      ],
      "rubric": {
        "correctness": "Selects appropriate elicitation technique based on context (JAD for conflicting consensus, surveys for large distributed user base, observation for tacit knowledge).",
        "depth": "Identifies underlying root motives behind conflicting department requirements using the '5 Whys' technique.",
        "clarity": "Empathetic communication and stakeholder facilitation.",
        "examples": "Resolving a conflict where Marketing wanted zero authentication friction but Security required strict multi-factor authentication."
      },
      "followUp": "What is a RACI matrix (Responsible, Accountable, Consulted, Informed) and how does it resolve decision-making paralysis?"
    },
    {
      "id": "ba_sr_1",
      "question": "How do you construct a Requirements Traceability Matrix (RTM) across a multi-year enterprise transformation? How does it guarantee backward and forward traceability from business goals down to unit test cases?",
      "topic": "Requirements Gathering & User Stories",
      "questionType": "practical",
      "level": "Senior",
      "idealKeywords": [
        "Requirements Traceability Matrix (RTM)",
        "Forward traceability (Goal -> Feature -> Code -> Test)",
        "Backward traceability (Defect -> Requirement -> Business Need)",
        "compliance / audit readiness",
        "impact analysis",
        "orphan requirements"
      ],
      "rubric": {
        "correctness": "Accurately defines bidirectional traceability ensuring every business requirement has corresponding functional specs, user stories, and QA test cases.",
        "depth": "Explains how RTM enables instant impact analysis when a business rule changes or when evaluating regulatory audit compliance (SOX, FDA, GDPR).",
        "clarity": "Enterprise program governance mastery.",
        "examples": "Tracing a healthcare insurance compliance mandate down to database encryption and integration test assertions."
      },
      "followUp": "How do you maintain an RTM efficiently in modern Agile tooling (Jira + Confluence + Xray) without creating massive manual spreadsheet maintenance?"
    },
    {
      "id": "ba_sr_2",
      "question": "How do you build a comprehensive Cost-Benefit Analysis (CBA) and Financial Feasibility model for a multi-million dollar software investment? Explain ROI, Net Present Value (NPV), and Payback Period.",
      "topic": "Gap Analysis & Feasibility Study",
      "questionType": "practical",
      "level": "Senior",
      "idealKeywords": [
        "Cost-Benefit Analysis (CBA)",
        "ROI (Return on Investment)",
        "Net Present Value (NPV)",
        "Internal Rate of Return (IRR)",
        "Payback Period",
        "CapEx vs OpEx",
        "tangible vs intangible benefits",
        "total cost of ownership (TCO)"
      ],
      "rubric": {
        "correctness": "Accurately calculates financial metrics: NPV discounting future cash flows with cost of capital, Payback Period break-even point, and Total Cost of Ownership (software licenses, implementation, maintenance, training).",
        "depth": "Quantifies both tangible cost reductions and intangible strategic benefits (brand reputation, employee retention, regulatory penalty avoidance).",
        "clarity": "Executive financial acumen.",
        "examples": "Comparing building a custom in-house AI underwriting engine ($2.5M initial + $400k/yr) vs licensing SaaS ($800k/yr)."
      },
      "followUp": "What discount rate / hurdle rate do enterprise CFOs typically apply when evaluating software capital investments?"
    },
    {
      "id": "ba_sr_3",
      "question": "During User Acceptance Testing (UAT), the business sponsor rejects the build claiming 'It works as specified, but it doesn't solve our business problem.' How do you analyze what broke and guide resolution?",
      "topic": "Use Case Modeling & Acceptance Criteria",
      "questionType": "troubleshooting",
      "level": "Senior",
      "idealKeywords": [
        "User Acceptance Testing (UAT)",
        "validation vs verification",
        "root cause of misalignment",
        "gap between specs and business intent",
        "collaborative resolution",
        "triage framework",
        "lessons learned"
      ],
      "rubric": {
        "correctness": "Distinguishes Verification ('Did we build the system right?') from Validation ('Did we build the right system?').",
        "depth": "Does not deflect blame onto developers or business sponsor; facilitates an emergency discovery session to evaluate delta between delivered features and actual operational workflow.",
        "clarity": "Senior leadership, accountability, and political composure.",
        "examples": "Discovers that while batch CSV import worked, end-users needed real-time API sync during live sales calls."
      },
      "followUp": "How could rapid interactive prototyping during sprint discovery have prevented this late-stage UAT discovery?"
    },
    {
      "id": "ba_staff_1",
      "question": "As Lead Business Architect / Principal Business Analyst, how do you define enterprise business capability models and align IT software roadmaps with executive 5-year strategic corporate goals?",
      "topic": "Process Mapping & BPMN",
      "questionType": "system_design",
      "level": "Staff / Architect",
      "idealKeywords": [
        "Business Architecture",
        "Business Capability Modeling",
        "Strategic Alignment",
        "Target Operating Model (TOM)",
        "enterprise value stream mapping",
        "portfolio rationalization",
        "C-suite advisory"
      ],
      "rubric": {
        "correctness": "Deconstructs enterprise into stable business capabilities (independent of current organizational silos or software tools).",
        "depth": "Maps software systems to capabilities to expose redundancies, technical debt, and capability gaps.",
        "clarity": "Executive enterprise strategy delivery.",
        "examples": "Consolidating 4 duplicate CRM and billing systems across merged subsidiaries into a unified global capability model."
      },
      "followUp": "How do you guide executive committees through difficult portfolio rationalization decisions when sunsetting pet projects?"
    },
    {
      "id": "ba_staff_2",
      "question": "How do you design and govern an Enterprise Change Management framework (using ADKAR or Kotter's 8-Step model) to ensure high adoption when replacing a core enterprise ERP / CRM system?",
      "topic": "Change Management & Business Value",
      "questionType": "system_design",
      "level": "Staff / Architect",
      "idealKeywords": [
        "Change Management",
        "Prosci ADKAR model (Awareness, Desire, Knowledge, Ability, Reinforcement)",
        "Kotter's 8-Step Change model",
        "change champion network",
        "user adoption metrics",
        "resistance management",
        "training strategy"
      ],
      "rubric": {
        "correctness": "Applies established organizational change framework: technical rollout is useless if organizational adoption fails.",
        "depth": "Addresses user resistance proactively through stakeholder empathy, tailored communication cadences, hands-on champion coaching, and adoption telemetry.",
        "clarity": "Transformational enterprise leadership.",
        "examples": "Driving 95% active adoption of a new Salesforce/SAP rollout across 5,000 employees within 90 days of go-live."
      },
      "followUp": "How do you monitor and measure employee sentiment and system adoption drop-offs in the critical 30 days post-go-live?"
    }
  ],
  "HR Interview": [
    {
      "id": "hr_entry_1",
      "question": "Tell me about yourself. Walk me through your educational background, core technical skills, key projects you have built, and why you are interested in this role.",
      "topic": "Career Goals & Growth Trajectory",
      "questionType": "behavioral",
      "level": "Fresher / Entry",
      "idealKeywords": [
        "Pillar 1: Name and degree (BCA, MCA, B.Tech, etc.)",
        "Pillar 2: Technical stack and programming languages",
        "Pillar 3: Projects built and problem solving",
        "Pillar 4: Passion and career aspirations",
        "concise delivery (90-120 seconds)"
      ],
      "rubric": {
        "correctness": "Covers all 4 core pillars: Identity & Education, Technical Core Stack, Projects & Practical Experience, Career Motivation.",
        "depth": "Avoids rambling through entire life history; chronologically connects academic learning with hands-on project accomplishments.",
        "clarity": "Poised, confident, articulate verbal delivery.",
        "examples": "Mentions specific capstone project, languages used, and genuine alignment with company mission."
      },
      "followUp": "What is one technical skill you learned in the last 6 months outside of your regular college curriculum?"
    },
    {
      "id": "hr_entry_2",
      "question": "Why do you want to work for our organization specifically, and where do you see your career progressing over the next 3 to 5 years?",
      "topic": "Cultural Alignment & Core Values",
      "questionType": "behavioral",
      "level": "Fresher / Entry",
      "idealKeywords": [
        "Company research (products, culture, engineering blog)",
        "alignment with mission",
        "3-5 year growth trajectory",
        "continuous learning",
        "mentorship and ownership",
        "value contribution"
      ],
      "rubric": {
        "correctness": "Demonstrates genuine research into the company's domain, tech stack, and values rather than a generic boilerplate answer.",
        "depth": "Outlines realistic, ambitious growth trajectory (progressing from junior contributor to autonomous engineer/mentor).",
        "clarity": "Enthusiastic and professional tone.",
        "examples": "References a recent tech product, open-source initiative, or engineering accomplishment of the company."
      },
      "followUp": "How would you handle a situation where your daily assignment does not align with your initial career preference?"
    },
    {
      "id": "hr_entry_3",
      "question": "Describe a challenging situation or tight deadline you faced during an academic or team project. How did you prioritize your tasks and ensure successful delivery?",
      "topic": "Time Management & Prioritization",
      "questionType": "behavioral",
      "level": "Fresher / Entry",
      "idealKeywords": [
        "STAR framework (Situation, Task, Action, Result)",
        "time management",
        "prioritization",
        "overcoming obstacles",
        "team communication",
        "successful outcome"
      ],
      "rubric": {
        "correctness": "Structures response using STAR framework (Situation -> Task -> Action -> Result).",
        "depth": "Highlights proactive steps taken (breaking down backlog, asking for help early, reprioritizing non-essential features).",
        "clarity": "Clear narrative arc without blaming teammates.",
        "examples": "Cites college hackathon, final year semester submission, or internship deliverable."
      },
      "followUp": "What did you learn from that experience that you would apply differently next time?"
    },
    {
      "id": "hr_mid_1",
      "question": "Tell me about a time you had a significant disagreement or conflict with a teammate, tech lead, or cross-functional colleague. How did you approach resolving it professionally?",
      "topic": "Conflict Resolution & Team Dynamics",
      "questionType": "behavioral",
      "level": "Mid Level",
      "idealKeywords": [
        "Conflict resolution",
        "active listening",
        "focus on objective data / metrics",
        "empathy",
        "de-escalation",
        "collaborative compromise",
        "respectful communication"
      ],
      "rubric": {
        "correctness": "Demonstrates emotional maturity: separates personal ego from technical/business disagreements.",
        "depth": "Explains listening to the colleague's perspective, proposing an objective evaluation (proof-of-concept benchmark), and committing to the final team decision.",
        "clarity": "Constructive, accountable delivery.",
        "examples": "Disagreement over architectural framework selection or API contract design."
      },
      "followUp": "What is the Amazon leadership principle of 'Have Backbone; Disagree and Commit', and how do you practice it?"
    },
    {
      "id": "hr_mid_2",
      "question": "Describe a situation where a project you were responsible for failed, suffered a production outage, or missed a major deadline. How did you take ownership and respond?",
      "topic": "Work Ethic & Ownership",
      "questionType": "behavioral",
      "level": "Mid Level",
      "idealKeywords": [
        "Extreme ownership",
        "accountability",
        "containment",
        "blameless post-mortem",
        "root cause identification",
        "corrective actions implemented",
        "preventing regression"
      ],
      "rubric": {
        "correctness": "Takes complete radical ownership without deflecting blame onto junior peers, testing teams, or management.",
        "depth": "Explains immediate customer containment first, transparent stakeholder communication second, and systemic safeguards (automated regression tests, alarms) third.",
        "clarity": "Resilient, mature engineering mindset.",
        "examples": "A bad database migration script or unhandled null pointer causing partial service degradation."
      },
      "followUp": "How did you rebuild trust with stakeholders after resolving the incident?"
    },
    {
      "id": "hr_mid_3",
      "question": "How do you handle ambiguous requirements and rapidly shifting business priorities when goals change midway through a development sprint?",
      "topic": "Adaptability & Handling Ambiguity",
      "questionType": "behavioral",
      "level": "Mid Level",
      "idealKeywords": [
        "Adaptability",
        "navigating ambiguity",
        "clarifying questions",
        "lean MVP approach",
        "agile mindset",
        "focus on business value",
        "calm temperament"
      ],
      "rubric": {
        "correctness": "Views changing business requirements as a natural market reality rather than personal frustration.",
        "depth": "Deploys proactive discovery: interviews product managers, identifies core customer intent, and builds modular decoupled components that accommodate change.",
        "clarity": "Adaptable, solutions-oriented delivery.",
        "examples": "A sudden regulatory policy shift or competitor launch requiring immediate feature redesign."
      },
      "followUp": "How do you help your teammates stay motivated when their hard work gets deprioritized?"
    },
    {
      "id": "hr_mid_4",
      "question": "Tell me about a time you received difficult constructive feedback from a manager, peer, or client. How did you process it and what concrete changes did you implement?",
      "topic": "Resilience & Handling Feedback",
      "questionType": "behavioral",
      "level": "Mid Level",
      "idealKeywords": [
        "Growth mindset",
        "receptiveness to feedback",
        "non-defensive reaction",
        "self-reflection",
        "actionable improvement plan",
        "measurable progress"
      ],
      "rubric": {
        "correctness": "Demonstrates a growth mindset: welcomes critique as an opportunity for professional elevation rather than a personal attack.",
        "depth": "Explains reflecting on the feedback, seeking clarification, setting up measurable checkpoints, and following up with the manager 30 days later.",
        "clarity": "Accountable, humble, and self-aware.",
        "examples": "Feedback regarding PR review thoroughness, communication tone in meetings, or cross-functional visibility."
      },
      "followUp": "How do you approach giving constructive feedback to a peer whose work is falling behind schedule?"
    },
    {
      "id": "hr_sr_1",
      "question": "How do you approach mentoring, coaching, and sponsoring junior or mid-level engineers on your team? Give an example of an engineer you helped advance in their career.",
      "topic": "Leadership & Mentorship",
      "questionType": "behavioral",
      "level": "Senior",
      "idealKeywords": [
        "Mentorship",
        "coaching vs directive management",
        "empathy",
        "pairing sessions",
        "delegating stretch assignments",
        "psychological safety",
        "career growth celebration"
      ],
      "rubric": {
        "correctness": "Demonstrates servant leadership: measures own success by the growth, promotion, and independence of their mentees.",
        "depth": "Explains identifying growth areas, providing safe stretch projects, conducting constructive code reviews, and advocating for them in promotion calibration.",
        "clarity": "Warm, inspiring, and generous engineering mentorship.",
        "examples": "Helped a struggling junior engineer master asynchronous design and lead their first production microservice deployment."
      },
      "followUp": "How do you coach an engineer who is technically brilliant but struggles with defensive communication and team collaboration?"
    },
    {
      "id": "hr_sr_2",
      "question": "How do you manage high-stakes engineering pressure, tight quarterly deadlines, and prevent developer burnout across your engineering team?",
      "topic": "Time Management & Prioritization",
      "questionType": "behavioral",
      "level": "Senior",
      "idealKeywords": [
        "Sustainable engineering cadence",
        "burnout prevention",
        "work-life balance",
        "pushing back on unrealistic deadlines",
        "prioritizing high-leverage tasks",
        "protecting team focus"
      ],
      "rubric": {
        "correctness": "Understands that sustained 80-hour workweeks lead to tech debt, bugs, and costly engineer turnover.",
        "depth": "Advocates for data-driven capacity planning, ruthless scope negotiation with product managers, and encouraging team disconnect during off-hours.",
        "clarity": "Empathetic, sustainable leadership.",
        "examples": "Resetting executive delivery expectations using team velocity data during a crunch period."
      },
      "followUp": "What early warning signs indicate that a high-performing engineer on your team is quietly experiencing burnout?"
    },
    {
      "id": "hr_sr_3",
      "question": "Tell me about a time you had to influence a major architectural, product, or organizational decision across leadership and cross-functional teams without formal managerial authority.",
      "topic": "Cultural Alignment & Core Values",
      "questionType": "behavioral",
      "level": "Senior",
      "idealKeywords": [
        "Influence without authority",
        "stakeholder consensus",
        "data-backed proposal (RFC / POC)",
        "building coalitions",
        "empathizing with business constraints",
        "clear technical communication"
      ],
      "rubric": {
        "correctness": "Demonstrates horizontal leadership: gains consensus through compelling evidence, working prototypes, and listening to opposing concerns rather than executive mandate.",
        "depth": "Walks through identifying key decision-makers, addressing individual security and cost concerns in 1-on-1s, and presenting a unified RFC.",
        "clarity": "Persuasive, highly credible executive delivery.",
        "examples": "Championing the migration to Kubernetes, adoption of TypeScript, or implementation of automated CI/CD security scanning."
      },
      "followUp": "How do you proceed when a key executive stakeholder remains unconvinced despite your data?"
    },
    {
      "id": "hr_staff_1",
      "question": "As an Engineering Director / Principal Staff Leader, how do you intentionally cultivate an engineering culture of psychological safety, high accountability, and continuous innovation?",
      "topic": "Cultural Alignment & Core Values",
      "questionType": "system_design",
      "level": "Staff / Architect",
      "idealKeywords": [
        "Psychological safety (Amy Edmondson)",
        "blameless culture",
        "high accountability",
        "calculated risk-taking",
        "transparent communication",
        "rewarding thoughtful failures",
        "diversity of thought"
      ],
      "rubric": {
        "correctness": "Accurately articulates that psychological safety does not mean lowering standards; it creates an environment where engineers openly voice risks, ask questions, and propose bold experiments without fear of humiliation.",
        "depth": "Institutes structural practices: blameless post-mortems, hackathons, open RFC forums, and transparent retrospective actions.",
        "clarity": "Inspiring organizational leadership.",
        "examples": "Transforming a siloed, fearful engineering department into a collaborative, empowered high-velocity unit."
      },
      "followUp": "How do you eliminate toxic high-performers whose individual output is high but who demoralize the rest of the team?"
    },
    {
      "id": "hr_staff_2",
      "question": "How do you champion Diversity, Equity, and Inclusion (DEI) in technical hiring, mentorship pipelines, and compensation / promotion governance across an engineering organization?",
      "topic": "Leadership & Mentorship",
      "questionType": "system_design",
      "level": "Staff / Architect",
      "idealKeywords": [
        "Diversity, Equity & Inclusion (DEI)",
        "unconscious bias mitigation",
        "structured interview rubrics",
        "diverse interview panels",
        "equitable promotion calibration",
        "mentorship and sponsorship programs",
        "inclusive culture"
      ],
      "rubric": {
        "correctness": "Moves beyond platitudes to concrete institutional safeguards: standardized rubric-based scoring to eliminate gut-feel bias, blind resume reviews, diverse hiring panels, and audited compensation bands.",
        "depth": "Establishes proactive mentorship pipelines for underrepresented engineers and ensures equitable access to high-visibility mission-critical projects.",
        "clarity": "Principled, courageous executive leadership.",
        "examples": "Overhauling a technical interview loop that systematically penalized candidates from non-traditional or self-taught backgrounds."
      },
      "followUp": "How do you address skepticism from team members who mistakenly claim that intentional diversity efforts compromise engineering excellence?"
    }
  ],
  "General Fresher Interview": [
    {
      "id": "fresher_entry_1",
      "question": "Please introduce yourself. Highlight your degree, key technical subjects you enjoyed in college, practical programming languages you know, and your career aspirations.",
      "topic": "Self-Introduction & Communication",
      "questionType": "behavioral",
      "level": "Fresher / Entry",
      "idealKeywords": [
        "Name, university, and degree (BCA, MCA, B.Tech, B.Sc)",
        "Key subjects (Data Structures, DBMS, OS, OOP)",
        "Programming languages (Java, Python, C++, JavaScript)",
        "Projects and internships",
        "Career enthusiasm"
      ],
      "rubric": {
        "correctness": "Crisp structured delivery covering academic credentials, practical programming skills, project highlights, and future goals.",
        "depth": "Demonstrates genuine enthusiasm for software engineering and problem-solving.",
        "clarity": "Calm, structured, audible delivery within 90-120 seconds.",
        "examples": "Mentions specific academic projects and passion for backend/full-stack development."
      },
      "followUp": "Which computer science subject did you find most challenging during your degree, and how did you overcome it?"
    },
    {
      "id": "fresher_entry_2",
      "question": "Walk me through your major final year academic project. What problem were you solving, what technologies did you choose, and what was your specific personal contribution?",
      "topic": "Academic Projects & Problem Solving",
      "questionType": "project",
      "level": "Fresher / Entry",
      "idealKeywords": [
        "Problem statement",
        "Tech stack selection (frontend, backend, database)",
        "Individual contribution vs team roles",
        "System architecture",
        "Challenges overcome",
        "Outcomes and learnings"
      ],
      "rubric": {
        "correctness": "Clearly explains business/user problem, architectural design, and implementation details.",
        "depth": "Distinguishes personal coding contribution from teammates' work; explains why specific databases and frameworks were chosen.",
        "clarity": "Structured project defense without wandering.",
        "examples": "Explains debugging a difficult authentication bug or database connection bottleneck in the project."
      },
      "followUp": "If you had two more months to work on that academic project, what major feature or architectural improvement would you implement?"
    },
    {
      "id": "fresher_entry_3",
      "question": "What is the difference between Procedural Programming and Object-Oriented Programming (OOP)? How does OOP make large software systems easier to maintain and extend?",
      "topic": "Foundations of Computer Science",
      "questionType": "conceptual",
      "level": "Fresher / Entry",
      "idealKeywords": [
        "Procedural (functions, top-down, shared state)",
        "Object-Oriented (objects, classes, encapsulation)",
        "data hiding",
        "code reusability",
        "modularity",
        "maintenance"
      ],
      "rubric": {
        "correctness": "Accurately contrasts function-driven state modification (C) with object-encapsulated data and methods (Java/Python).",
        "depth": "Explains how encapsulation and modularity prevent unintended global state corruption across large software codebases.",
        "clarity": "Strong CS fundamentals.",
        "examples": "Comparing a banking transaction written procedurally vs with BankAccount classes and private balances."
      },
      "followUp": "What is the difference between an Abstract Class and an Interface?"
    },
    {
      "id": "fresher_entry_4",
      "question": "Explain Time Complexity and Space Complexity using Big-O notation. Why is an O(n log n) sorting algorithm generally preferred over an O(n^2) sorting algorithm for large datasets?",
      "topic": "Basic Data Structures & Logic",
      "questionType": "conceptual",
      "level": "Fresher / Entry",
      "idealKeywords": [
        "Big-O notation",
        "Worst-case performance",
        "O(1) constant",
        "O(n) linear",
        "O(n log n) Merge Sort / Quick Sort",
        "O(n^2) Bubble Sort / Selection Sort",
        "input growth scalability"
      ],
      "rubric": {
        "correctness": "Accurately defines Big-O as upper bound asymptotic complexity as input size n approaches infinity.",
        "depth": "Demonstrates numerical scale: for n=1,000,000, n^2 is 10^12 operations (hours/days) while n log n is ~20,000,000 operations (fractions of a second).",
        "clarity": "Mathematical and practical performance clarity.",
        "examples": "Contrasts Bubble Sort with Merge Sort."
      },
      "followUp": "What is the difference between best-case, average-case, and worst-case time complexity?"
    },
    {
      "id": "fresher_mid_1",
      "question": "How does Git version control work? Explain the difference between `git pull` and `git fetch`, and describe how you resolve a merge conflict.",
      "topic": "Core Programming Aptitude",
      "questionType": "practical",
      "level": "Mid Level",
      "idealKeywords": [
        "Git version control",
        "git fetch (downloads commits without merging)",
        "git pull (fetch + merge)",
        "merge conflict markers (<<<<<<<, =======, >>>>>>>)",
        "staging area",
        "commit history",
        "branching"
      ],
      "rubric": {
        "correctness": "Accurately explains that `git pull` is effectively `git fetch` followed by `git merge`.",
        "depth": "Outlines manual conflict resolution in code editor, testing, staging, and committing the resolved merge.",
        "clarity": "Modern software developer workflow literacy.",
        "examples": "Two engineers editing the same line of code in the same file simultaneously."
      },
      "followUp": "What is the difference between `git merge` and `git rebase`?"
    },
    {
      "id": "fresher_mid_2",
      "question": "Explain the Relational Database concepts: Primary Key, Foreign Key, Unique Constraint, and Index. How does a Foreign Key enforce referential integrity?",
      "topic": "Foundations of Computer Science",
      "questionType": "conceptual",
      "level": "Mid Level",
      "idealKeywords": [
        "Primary Key (unique, not null)",
        "Foreign Key (references primary key of another table)",
        "referential integrity (ON DELETE CASCADE, RESTRICT)",
        "Unique constraint",
        "Index for fast lookup",
        "RDBMS"
      ],
      "rubric": {
        "correctness": "Accurately defines all constraints and explains referential integrity preventing orphan records.",
        "depth": "Explains what happens during parent row deletion when `CASCADE` vs `RESTRICT/NO ACTION` is configured.",
        "clarity": "Relational schema design foundation.",
        "examples": "Customers table (CustomerID PK) and Orders table (CustomerID FK)."
      },
      "followUp": "Can a table have multiple Foreign Keys? Can a table have multiple Primary Keys?"
    },
    {
      "id": "fresher_mid_3",
      "question": "How do you stay updated with rapidly evolving technology trends, frameworks, and programming languages outside of college courses?",
      "topic": "Learning Agility & Curiosity",
      "questionType": "behavioral",
      "level": "Mid Level",
      "idealKeywords": [
        "Continuous learning",
        "tech blogs and documentation",
        "GitHub open-source exploration",
        "coding platforms (LeetCode, HackerRank)",
        "podcasts / YouTube channels",
        "building weekend prototypes"
      ],
      "rubric": {
        "correctness": "Demonstrates genuine self-directed curiosity rather than passive reliance on college syllabus.",
        "depth": "Cites authentic sources (official documentation, engineering blogs, GitHub repos, technical communities).",
        "clarity": "Proactive growth-oriented mindset.",
        "examples": "Mentions recently experimenting with Docker, Next.js, or building an API with FastAPI."
      },
      "followUp": "Tell me about a technical topic you researched recently just out of pure curiosity."
    },
    {
      "id": "fresher_mid_4",
      "question": "Describe a situation during college where you worked in a group with someone who was not contributing their fair share. How did you handle the situation and achieve the project goal?",
      "topic": "Teamwork & College Extra-Curriculars",
      "questionType": "behavioral",
      "level": "Mid Level",
      "idealKeywords": [
        "Teamwork",
        "collaboration",
        "empathy and communication",
        "dividing tasks clearly",
        "understanding roadblocks",
        "accountability",
        "delivering on time"
      ],
      "rubric": {
        "correctness": "Shows constructive maturity: reaches out to understand the teammate's difficulties rather than immediately complaining to the professor.",
        "depth": "Restructures tasks based on individual strengths, sets smaller interim milestones, and ensures project delivery.",
        "clarity": "Collaborative, empathetic leadership.",
        "examples": "Discovering a teammate struggled with frontend CSS and helping pair-program with them on backend API logic instead."
      },
      "followUp": "What did that experience teach you about team dynamics in a professional workplace?"
    },
    {
      "id": "fresher_sr_1",
      "question": "Walk me through how the Internet and Client-Server Architecture work: From clicking a button on a web page to data retrieval from a database server and response display.",
      "topic": "Foundations of Computer Science",
      "questionType": "conceptual",
      "level": "Senior",
      "idealKeywords": [
        "Client-server model",
        "HTTP request/response cycle",
        "DNS resolution",
        "TCP connection",
        "backend web server (routes, controllers)",
        "SQL database query execution",
        "JSON payload",
        "DOM rendering"
      ],
      "rubric": {
        "correctness": "Presents comprehensive end-to-end understanding bridging browser networking, backend application logic, and database retrieval.",
        "depth": "Shows high-caliber clarity beyond basic fresher expectations, identifying status codes, serialization, and connection states.",
        "clarity": "Exceptional systems thinking for an early-career engineer.",
        "examples": "Traces a user submitting a login form with credentials."
      },
      "followUp": "What is the difference between HTTP and HTTPS, and how does encryption protect user data over public Wi-Fi?"
    },
    {
      "id": "fresher_sr_2",
      "question": "How do you approach debugging a program that compiles successfully but produces completely unexpected output or crashes with a runtime error? Walk through your troubleshooting methodology.",
      "topic": "Core Programming Aptitude",
      "questionType": "troubleshooting",
      "level": "Senior",
      "idealKeywords": [
        "Troubleshooting methodology",
        "reading stack traces",
        "print debugging vs IDE debugger",
        "breakpoints and variable inspection",
        "reproducing with minimal test case",
        "binary search isolation",
        "rubber duck debugging"
      ],
      "rubric": {
        "correctness": "Articulates systematic diagnostic methodology rather than random code guessing.",
        "depth": "Explains reading stack trace from bottom-up, setting breakpoints to inspect variable states, and isolating edge cases (null inputs, empty arrays, off-by-one loop bounds).",
        "clarity": "Methodical analytical mindset.",
        "examples": "Debugging an off-by-one error or an unexpected floating-point precision issue."
      },
      "followUp": "What is unit testing and why do engineers write automated unit tests before deploying code?"
    },
    {
      "id": "fresher_staff_1",
      "question": "As a top-tier campus hire, how do you envision taking ownership of your first 90 days at our company to ramp up quickly, integrate with the engineering team, and ship your first production feature?",
      "topic": "Career Aspirations & Motivation",
      "questionType": "system_design",
      "level": "Staff / Architect",
      "idealKeywords": [
        "30-60-90 day plan",
        "Day 1-30: Dev environment, reading codebase, understanding architecture, asking smart questions",
        "Day 31-60: Fixing small bugs, writing unit tests, first small PRs",
        "Day 61-90: Autonomous feature ownership, documenting lessons learned"
      ],
      "rubric": {
        "correctness": "Presents structured, proactive 30-60-90 day ramp-up strategy demonstrating initiative, humility, and engineering discipline.",
        "depth": "Balances asking questions after trying for 30 minutes with documenting missing onboarding steps for future hires.",
        "clarity": "High-velocity proactive engineering ownership.",
        "examples": "Setting up local Docker containers and shipping a low-risk bug fix in sprint 1."
      },
      "followUp": "How do you balance moving fast with ensuring your code adheres to team testing and style guidelines?"
    },
    {
      "id": "fresher_staff_2",
      "question": "What is your philosophy on writing maintainable, clean code versus rushing to produce quick hacky solutions? When, if ever, is a temporary workaround acceptable in software engineering?",
      "topic": "Foundations of Computer Science",
      "questionType": "coding",
      "level": "Staff / Architect",
      "idealKeywords": [
        "Clean code",
        "readability",
        "meaningful variable names",
        "modular functions",
        "technical debt",
        "temporary workarounds vs permanent hacks",
        "documentation and comments"
      ],
      "rubric": {
        "correctness": "Articulates that code is read 10 times more often than it is written; readability and testability trump cleverness.",
        "depth": "Acknowledges that temporary workarounds are sometimes necessary for critical live hotfixes, but must be accompanied by a tracked ticket and refactored immediately.",
        "clarity": "Engineering maturity well beyond fresher average.",
        "examples": "Refactoring a 200-line monolithic function into small, single-purpose reusable functions with unit tests."
      },
      "followUp": "What is code review etiquette and how should you respond when a senior engineer asks for significant changes to your pull request?"
    }
  ]
};

/**
 * Helper to generate or retrieve calibrated questions for any given role
 */
export function getDurationQuestionCount(durationMinutes = 15) {
  const mins = parseInt(durationMinutes, 10) || 15;
  if (mins <= 7) return 3;
  if (mins <= 20) return 5;
  if (mins <= 35) return 9;
  return 13;
}

/**
 * Helper to generate or retrieve calibrated questions for any given role
 */
export function getQuestionsForRole(roleIdOrTitle, customRoleName = '', level = 'Mid Level', durationMinutes = 15, userHistoryIds = []) {
  let pool = null;

  // Check direct category match in QUESTION_BANK
  if (QUESTION_BANK[roleIdOrTitle]) {
    pool = QUESTION_BANK[roleIdOrTitle];
  } else {
    // Check role definition match
    const matchedRole = INTERVIEW_ROLES.find(r => 
      r.id === roleIdOrTitle || 
      r.title.toLowerCase() === String(roleIdOrTitle).toLowerCase() ||
      r.categoryKey.toLowerCase() === String(roleIdOrTitle).toLowerCase()
    );

    if (matchedRole && QUESTION_BANK[matchedRole.categoryKey]) {
      pool = QUESTION_BANK[matchedRole.categoryKey];
    }
  }

  const targetCount = getDurationQuestionCount(durationMinutes);
  const historySet = new Set(Array.isArray(userHistoryIds) ? userHistoryIds : []);

  if (pool && pool.length > 0) {
    // Difficulty calibration: Prioritize questions matching the selected experience level
    const target = (level || 'Mid Level').toLowerCase();
    const unseenExact = [];
    const unseenOther = [];
    const seenExact = [];
    const seenOther = [];

    pool.forEach(q => {
      const qL = (q.level || 'Mid Level').toLowerCase();
      const isExactLevel = (
        ((target.includes('entry') || target.includes('fresher')) && (qL.includes('entry') || qL.includes('fresher'))) ||
        ((target.includes('senior') || target.includes('lead') || target.includes('staff')) && (qL.includes('senior') || qL.includes('lead') || qL.includes('staff'))) ||
        (target.includes('mid') && qL.includes('mid'))
      );
      const isSeen = historySet.has(q.id);

      if (!isSeen) {
        if (isExactLevel) unseenExact.push(q);
        else unseenOther.push(q);
      } else {
        if (isExactLevel) seenExact.push(q);
        else seenOther.push(q);
      }
    });

    const calibrated = [...unseenExact, ...unseenOther, ...seenExact, ...seenOther];
    return (calibrated.length > 0 ? calibrated : pool).slice(0, targetCount);
  }

  // If custom role specified
  const effectiveTitle = customRoleName.trim() || roleIdOrTitle || 'Software Professional';
  const customTemplates = [
    {
      id: `gen_custom_1`,
      question: `As a candidate for ${effectiveTitle}, walk me through your technical background, the architecture of your most demanding recent project, and how you solved its primary technical challenge.`,
      topic: 'Domain Architecture & Projects',
      category: effectiveTitle,
      level: level,
      idealKeywords: [effectiveTitle, 'architecture', 'scalability', 'problem-solving', 'design patterns', 'trade-offs'],
      rubric: {
        correctness: `Accurately presents core methodologies and competencies expected for ${effectiveTitle}.`,
        depth: 'Discusses system design trade-offs, bottlenecks, and real-world metrics.',
        clarity: 'Crisp, structured delivery without wandering.',
        examples: 'Concrete engineering or domain examples.'
      },
      followUp: `What metrics or monitoring alert would you put in place to verify the stability of that solution in production?`
    },
    {
      id: `gen_custom_2`,
      question: `When executing high-priority deliverables as a ${effectiveTitle}, how do you evaluate technical debt versus delivery speed, and how do you ensure reliability under pressure?`,
      topic: 'Quality & Technical Debt',
      category: effectiveTitle,
      level: level,
      idealKeywords: ['technical debt', 'code quality', 'prioritization', 'testing', 'refactoring', 'reliability'],
      rubric: {
        correctness: 'Pragmatic balance between business speed and long-term maintainability.',
        depth: 'Demonstrates engineering maturity and team leadership.',
        clarity: 'Structured explanation with clear trade-off rationale.',
        examples: 'Specific examples of addressing tech debt proactively.'
      },
      followUp: `If an unexpected production outage occurs while you are delivering that feature, how do you manage triage and stakeholder updates?`
    },
    {
      id: `gen_custom_3`,
      question: `Describe a complex troubleshooting or debugging scenario you resolved as a ${effectiveTitle}. Walk through your root-cause analysis methodology.`,
      topic: 'Troubleshooting & Problem Solving',
      category: effectiveTitle,
      level: level,
      idealKeywords: ['root cause analysis', 'debugging methodology', 'isolation', 'reproduction', 'logs', 'fix'],
      rubric: {
        correctness: 'Systematic problem-solving methodology (metrics -> reproduction -> root cause -> fix).',
        depth: 'Analyzes technical failure mechanisms rather than superficial symptom patching.',
        clarity: 'Calm, methodical delivery under pressure.',
        examples: 'Real incident diagnosis and preventative tests.'
      },
      followUp: `What automated regression safeguards did you put in place to prevent that issue from returning?`
    },
    {
      id: `gen_custom_4`,
      question: `How do you design for scalability, reliability, and security within the ${effectiveTitle} domain when system load scales by 10x?`,
      topic: 'Scalability & Performance',
      category: effectiveTitle,
      level: level,
      idealKeywords: ['scalability', 'caching', 'asynchronous processing', 'bottlenecks', 'horizontal scaling', 'latency'],
      rubric: {
        correctness: 'Applies recognized scalability and decoupling standards.',
        depth: 'Addresses p99 latency spikes and resource saturation limits.',
        clarity: 'High-level systems architecture delivery.',
        examples: 'Concrete scaling techniques tailored to the domain.'
      },
      followUp: `How do you test and validate your system's capacity before peak traffic events?`
    },
    {
      id: `gen_custom_5`,
      question: `How do you collaborate with cross-functional stakeholders as a ${effectiveTitle} to ensure engineering alignment with business outcomes?`,
      topic: 'Stakeholder Collaboration & Leadership',
      category: effectiveTitle,
      level: level,
      idealKeywords: ['cross-functional collaboration', 'stakeholder alignment', 'empathy', 'communication', 'business ROI'],
      rubric: {
        correctness: 'Demonstrates empathetic, business-aligned cross-functional collaboration.',
        depth: 'Explains resolving technical vs business priority tensions constructively.',
        clarity: 'Professional, articulate delivery.',
        examples: 'Real project alignment scenario across diverse teams.'
      },
      followUp: `How do you convey complex technical constraints to non-technical business partners?`
    }
  ];

  return customTemplates.slice(0, targetCount);
}

export const INTERVIEWERS = [
  {
    id: 'vikram',
    aliasId: 'hiring_mgr',
    name: 'Vikram Malhotra',
    gender: 'male',
    title: 'Executive Director & Systems Architect',
    tone: 'Strategic, authoritative, evaluates architecture scalability, distributed systems, and technical depth.',
    badge: 'Executive & Systems',
    genderBadge: '👨 Male Voice (Authoritative)',
    avatarImage: '/interviewers/vikram_malhotra.jpg',
    avatar: '👨‍💼',
    accentColor: '#3b82f6',
    voiceConfig: {
      gender: 'male',
      pitch: 0.90,
      rate: 0.98,
      sampleText: "Hello, I am Vikram Malhotra. We will examine system architecture, scalability, and engineering depth today."
    },
    assignedRoles: ['software_developer', 'java_developer', 'cybersecurity_analyst']
  },
  {
    id: 'priya',
    aliasId: 'collaborative',
    name: 'Priya Sharma',
    gender: 'female',
    title: 'Lead AI & Systems Architect',
    tone: 'Insightful, collaborative, probes into algorithms, modeling trade-offs, and practical execution.',
    badge: 'AI & Systems Specialist',
    genderBadge: '👩 Female Voice (Articulate)',
    avatarImage: '/interviewers/priya_sharma.jpg',
    avatar: '👩‍💻',
    accentColor: '#0ea5e9',
    voiceConfig: {
      gender: 'female',
      pitch: 1.12,
      rate: 1.02,
      sampleText: "Hi there! I am Priya Sharma. I'm excited to discuss your approach to clean algorithms, data modeling, and machine learning."
    },
    assignedRoles: ['aiml_engineer', 'data_scientist', 'data_analyst', 'python_developer', 'custom_role']
  },
  {
    id: 'rohan',
    aliasId: 'peer',
    name: 'Rohan Mehta',
    gender: 'male',
    title: 'Senior Staff Engineer (Full-Stack)',
    tone: 'Dynamic, hands-on, explores end-to-end web workflows, coding trade-offs, and modern tooling.',
    badge: 'Full-Stack Peer Lead',
    genderBadge: '👨 Male Voice (Dynamic)',
    avatarImage: '/interviewers/rohan_mehta.jpg',
    avatar: '👨‍💻',
    accentColor: '#10b981',
    voiceConfig: {
      gender: 'male',
      pitch: 1.02,
      rate: 1.04,
      sampleText: "Hey! I'm Rohan Mehta. We will walk through full-stack implementation details and how you build reliable web apps."
    },
    assignedRoles: ['full_stack_developer', 'general_fresher']
  },
  {
    id: 'ananya',
    aliasId: 'hr_partner',
    name: 'Ananya Iyer',
    gender: 'female',
    title: 'Director of People Operations & Culture',
    tone: 'Empathetic, structured, assesses communication clarity, team dynamics, and behavioral resilience.',
    badge: 'People & Behavioral Lead',
    genderBadge: '👩 Female Voice (Empathetic)',
    avatarImage: '/interviewers/ananya_iyer.jpg',
    avatar: '🤝',
    accentColor: '#ec4899',
    voiceConfig: {
      gender: 'female',
      pitch: 1.06,
      rate: 0.96,
      sampleText: "Welcome! I am Ananya Iyer. Today we'll talk through your career journey, team collaboration, and behavioral situations."
    },
    assignedRoles: ['hr_interview', 'uiux_designer']
  },
  {
    id: 'kavita',
    aliasId: 'strict',
    name: 'Dr. Kavita Sen',
    gender: 'female',
    title: 'Senior Bar Raiser & VP of Strategy',
    tone: 'Rigorous, demanding, analyzes business requirements, edge cases, and high-stakes problem solving.',
    badge: 'Critical Bar Raiser',
    genderBadge: '👩 Female Voice (Rigorous)',
    avatarImage: '/interviewers/kavita_sen.jpg',
    avatar: '🏛️',
    accentColor: '#ef4444',
    voiceConfig: {
      gender: 'female',
      pitch: 0.98,
      rate: 1.03,
      sampleText: "Good day. I am Dr. Kavita Sen. We will be conducting a rigorous evaluation of your analytical depth and problem solving."
    },
    assignedRoles: ['business_analyst']
  }
];

export function getInterviewer(idOrKey = 'vikram') {
  if (!idOrKey) return INTERVIEWERS[0];
  const normalized = String(idOrKey).toLowerCase().trim();
  const match = INTERVIEWERS.find(inv => 
    inv.id === normalized || 
    inv.aliasId === normalized || 
    inv.name.toLowerCase() === normalized ||
    inv.name.toLowerCase().includes(normalized)
  );
  if (match) return match;
  const byRole = INTERVIEWERS.find(inv => inv.assignedRoles.includes(normalized));
  if (byRole) return byRole;
  return INTERVIEWERS[0];
}

export function getInterviewerForRole(roleIdOrCategoryKey) {
  if (!roleIdOrCategoryKey) return INTERVIEWERS[0];
  const key = String(roleIdOrCategoryKey).toLowerCase().replace(/\s+/g, '_');
  for (const inv of INTERVIEWERS) {
    if (inv.assignedRoles.some(r => key.includes(r) || r.includes(key))) {
      return inv;
    }
  }
  if (key.includes('hr') || key.includes('culture') || key.includes('design') || key.includes('uiux')) return getInterviewer('ananya');
  if (key.includes('business') || key.includes('strategy')) return getInterviewer('kavita');
  if (key.includes('full_stack') || key.includes('fresher') || key.includes('web')) return getInterviewer('rohan');
  if (key.includes('ai') || key.includes('ml') || key.includes('data') || key.includes('python')) return getInterviewer('priya');
  return getInterviewer('vikram');
}

export const PERSONAS = INTERVIEWERS;

export const INTERVIEW_MODES = [
  {
    id: 'practice',
    name: 'Adaptive Practice',
    description: 'General category-based round with instant conversational follow-up questions tailored to your responses.',
    badge: 'Recommended'
  },
  {
    id: 'defense',
    name: 'Project Defense',
    description: 'Deep interrogation on the exact architectural choices, tech stack, and trade-offs of your own portfolio projects.',
    badge: 'High Rigor'
  },
  {
    id: 'drive',
    name: 'Interview Drive (Simulated Campus/Hiring Event)',
    description: 'Strict multi-stage timed evaluation across technical + behavioral rubrics under exam-like constraints.',
    badge: 'Competitive'
  }
];
