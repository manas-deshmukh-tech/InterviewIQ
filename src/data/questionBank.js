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
  // 1. Software Developer
  'Software Developer': [
    {
      id: 'sd_1',
      question: "How would you choose between a Hash Table and a Balanced Binary Search Tree (such as a Red-Black Tree) for search-heavy operations? Explain their time complexities and collision handling.",
      category: 'Software Developer',
      level: 'Mid Level',
      idealKeywords: ['O(1)', 'O(log n)', 'collision resolution', 'chaining', 'open addressing', 'in-order traversal', 'worst case O(n)', 'sorted order'],
      rubric: {
        correctness: "Accurately articulates average O(1) for hash table vs guaranteed O(log n) for BST, and ordered traversal advantages of BST.",
        depth: "Explains collision resolution strategies, cache locality, and worst-case hash degradation.",
        clarity: "Logically structured with clear comparative terminology.",
        examples: "Uses practical example like range queries vs exact key lookups."
      },
      followUp: "How does the performance change when dealing with millions of concurrent read and write operations?"
    },
    {
      id: 'sd_2',
      question: "Explain the four necessary conditions for a Deadlock in an Operating System. How can an engineering system prevent or recover from deadlock situations?",
      category: 'Software Developer',
      level: 'Mid Level',
      idealKeywords: ['Mutual Exclusion', 'Hold and Wait', 'No Preemption', 'Circular Wait', 'Banker\'s algorithm', 'resource allocation graph', 'lock ordering'],
      rubric: {
        correctness: "Accurately lists Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait.",
        depth: "Explains preventive techniques like strict lock ordering hierarchy and timeouts.",
        clarity: "Methodical explanation with OS terminology.",
        examples: "Describes a classic dining philosophers or database multi-table lock scenario."
      },
      followUp: "What is the difference between deadlock, livelock, and starvation in multithreaded systems?"
    },
    {
      id: 'sd_3',
      question: "What are the SOLID principles in Object-Oriented Programming? Choose one principle and explain how violating it leads to brittle, tightly coupled code.",
      category: 'Software Developer',
      level: 'Fresher / Entry',
      idealKeywords: ['Single Responsibility', 'Open-Closed', 'Liskov Substitution', 'Interface Segregation', 'Dependency Inversion', 'coupling', 'cohesion'],
      rubric: {
        correctness: "Correctly outlines all 5 principles and chooses one to analyze in detail.",
        depth: "Explains trade-offs between decoupling and over-engineering.",
        clarity: "Clear, structured communication.",
        examples: "Gives a concrete code refactoring example."
      },
      followUp: "How does Dependency Inversion differ from Dependency Injection?"
    }
  ],

  // 2. Full Stack Developer
  'Full Stack Developer': [
    {
      id: 'fs_1',
      question: "Walk me through the end-to-end lifecycle of an HTTP/HTTPS request from the moment a user clicks submit in a React or Vue frontend until data is persisted in a database and response is rendered.",
      category: 'Full Stack Developer',
      level: 'Mid Level',
      idealKeywords: ['DNS resolution', 'TLS handshake', 'TCP 3-way handshake', 'Reverse Proxy', 'Nginx', 'CORS', 'API Gateway', 'ORM', 'Database indexing', 'Virtual DOM'],
      rubric: {
        correctness: "Covers browser networking, transport layer security, API routing, backend controllers, and database persistence.",
        depth: "Mentions connection pooling, state updates, and browser re-rendering pipeline.",
        clarity: "Chronological, coherent flow.",
        examples: "References modern stacks like Node/Express/PostgreSQL or React/FastAPI."
      },
      followUp: "How would you optimize this flow if the database write takes over 800ms due to downstream notifications?"
    },
    {
      id: 'fs_2',
      question: "When designing high-throughput web applications, how do you handle state management across client sessions, Redis caching layers, and database consistency?",
      category: 'Full Stack Developer',
      level: 'Senior',
      idealKeywords: ['Cache-aside', 'Write-through', 'Cache invalidation', 'Redis TTL', 'Race conditions', 'Distributed locks', 'JWT stateless tokens'],
      rubric: {
        correctness: "Explains cache invalidation challenges, stale reads, and cache stampede protection.",
        depth: "Distinguishes between session stores, distributed caches, and persistent relational storage.",
        clarity: "High-level architectural delivery.",
        examples: "Cites e-commerce inventory or live social feed caching."
      },
      followUp: "What strategies prevent the thundering herd problem when a key cache entry expires simultaneously for thousands of users?"
    },
    {
      id: 'fs_3',
      question: "Compare Server-Side Rendering (SSR), Client-Side Rendering (CSR), and Static Site Generation (SSG). Which would you recommend for an SEO-critical e-commerce storefront?",
      category: 'Full Stack Developer',
      level: 'Mid Level',
      idealKeywords: ['SSR', 'CSR', 'SSG', 'SEO', 'Time to First Byte (TTFB)', 'First Contentful Paint (FCP)', 'Hydration', 'Next.js', 'CDN'],
      rubric: {
        correctness: "Correctly identifies SSR/Incremental Static Regeneration for e-commerce with SEO needs.",
        depth: "Evaluates TTFB, server load, caching headers, and hydration overhead.",
        clarity: "Structured and decisive.",
        examples: "Points to product listing pages vs logged-in user checkout dashboards."
      },
      followUp: "How does client-side hydration work internally and what causes hydration mismatch errors?"
    }
  ],

  // 3. Python Developer
  'Python Developer': [
    {
      id: 'py_1',
      question: "Explain Python's Global Interpreter Lock (GIL). How does it impact multithreaded CPU-bound tasks versus I/O-bound tasks, and how can you achieve true parallelism in Python?",
      category: 'Python Developer',
      level: 'Mid Level',
      idealKeywords: ['GIL', 'bytecode', 'thread-safe', 'multiprocessing', 'concurrent.futures', 'I/O-bound', 'CPU-bound', 'C extensions', 'PyPy'],
      rubric: {
        correctness: "Accurately identifies GIL as mutex preventing simultaneous bytecode execution in CPython.",
        depth: "Contrasts threading for I/O vs multiprocessing for CPU bounds.",
        clarity: "Logically structured without repetitive circumlocution.",
        examples: "Provides code or architectural pattern (e.g. multiprocessing.Pool or Celery worker)."
      },
      followUp: "If you have an asynchronous FastAPI service calling a blocking Python library, how would you prevent the event loop from being blocked by that GIL execution?"
    },
    {
      id: 'py_2',
      question: "What is the difference between shallow copy, deep copy, and simple assignment for mutable data structures in Python? Give an example involving nested dictionaries.",
      category: 'Python Developer',
      level: 'Fresher / Entry',
      idealKeywords: ['copy.copy', 'copy.deepcopy', 'reference', 'pointer', 'memory address', 'mutable', 'nested'],
      rubric: {
        correctness: "Clear definition of reference vs shallow pointer copy vs recursive object clone.",
        depth: "Addresses memory references and id() identity.",
        clarity: "Plain, concise language without hesitation.",
        examples: "Demonstrates mutating an inner dict or list and showing outer effects."
      },
      followUp: "How does Python optimize memory for small integers and strings through interning?"
    },
    {
      id: 'py_3',
      question: "How do Python generators, the 'yield' keyword, and itertools help in processing massive multi-gigabyte log datasets without exhausting RAM?",
      category: 'Python Developer',
      level: 'Senior',
      idealKeywords: ['generator', 'lazy evaluation', 'iterator protocol', '__next__', 'streaming', 'memory footprint'],
      rubric: {
        correctness: "Defines iterator protocol and yielding state suspension.",
        depth: "Explains lazy memory evaluation versus list materialization.",
        clarity: "High-level architectural delivery.",
        examples: "Illustrates reading line by line in chunked batches."
      },
      followUp: "What happens when you combine generators with Python's asyncio async generators?"
    }
  ],

  // 4. Java Developer
  'Java Developer': [
    {
      id: 'jv_1',
      question: "Explain the internal working of Java's HashMap. How did Java 8 improve its performance when multiple keys produce identical hash codes?",
      category: 'Java Developer',
      level: 'Mid Level',
      idealKeywords: ['bucket', 'hashcode', 'equals', 'collision', 'LinkedList', 'Red-Black Tree', 'TREEIFY_THRESHOLD', 'O(1) to O(log n)'],
      rubric: {
        correctness: "Explains hashing, bucket indexing, and Java 8 treeification threshold of 8 elements.",
        depth: "Mentions contract between hashCode() and equals() methods.",
        clarity: "Deep technical precision.",
        examples: "Shows what happens when a mutable key changes its hashCode after insertion."
      },
      followUp: "Why is ConcurrentHashMap preferred over Collections.synchronizedMap in high-concurrency environments?"
    },
    {
      id: 'jv_2',
      question: "Explain the Java Virtual Machine (JVM) memory architecture. What are the differences between Heap, Stack, and Metaspace, and how does Garbage Collection identify unreachable objects?",
      category: 'Java Developer',
      level: 'Senior',
      idealKeywords: ['Heap', 'Stack', 'Metaspace', 'Young Generation', 'Old Generation', 'Eden', 'Survivor space', 'GC Roots', 'Mark and Sweep', 'G1GC'],
      rubric: {
        correctness: "Accurately divides stack frame per thread vs shared heap, and explains GC root reachability.",
        depth: "Mentions generational hypothesis, stop-the-world pauses, and out-of-memory error causes.",
        clarity: "Architectural and authoritative.",
        examples: "Explains memory leak caused by unclosed connections or static collections."
      },
      followUp: "What JVM flags and profiling tools (like JProfiler, VisualVM) would you use to diagnose high GC pause times?"
    },
    {
      id: 'jv_3',
      question: "How does Spring Boot's Dependency Injection and Inversion of Control (IoC) container manage the bean lifecycle? How do @Component, @Service, and @Repository differ?",
      category: 'Java Developer',
      level: 'Fresher / Entry',
      idealKeywords: ['IoC Container', 'ApplicationContext', 'Bean lifecycle', 'Singleton scope', '@Autowired', '@Component', '@Service', '@Repository', 'Exception Translation'],
      rubric: {
        correctness: "Explains IoC, automatic wiring, and semantic roles of stereotypes.",
        depth: "Highlights automated persistence exception translation in @Repository.",
        clarity: "Clear explanations suited for enterprise environments.",
        examples: "Draws contrast between constructor injection vs field injection."
      },
      followUp: "Why is Constructor Injection strongly recommended over Field Injection with @Autowired?"
    }
  ],

  // 5. Data Analyst
  'Data Analyst': [
    {
      id: 'da_1',
      question: "What is the difference between ROW_NUMBER(), RANK(), and DENSE_RANK() in SQL window functions? Provide a concrete business scenario where DENSE_RANK is required.",
      category: 'Data Analyst',
      level: 'Mid Level',
      idealKeywords: ['Window function', 'OVER (PARTITION BY ... ORDER BY ...)', 'ties', 'gap in ranking', 'DENSE_RANK', 'ROW_NUMBER', 'sales leaderboard'],
      rubric: {
        correctness: "Correctly demonstrates handling of identical values: ROW_NUMBER increments sequentially, RANK leaves gaps, DENSE_RANK has no gaps.",
        depth: "Provides SQL snippet and schema logic.",
        clarity: "Direct and analytical.",
        examples: "Finding top 3 highest-spending customer tiers or sales commission rankings."
      },
      followUp: "How do you calculate a 7-day rolling average using window frames with ROWS BETWEEN?"
    },
    {
      id: 'da_2',
      question: "When receiving a messy transactional dataset with missing values, duplicate entries, and inconsistent dates, walk me through your data cleaning process in Python (Pandas) or SQL.",
      category: 'Data Analyst',
      level: 'Fresher / Entry',
      idealKeywords: ['Pandas', 'isnull()', 'fillna()', 'dropna()', 'drop_duplicates()', 'outlier detection', 'IQR', 'data types', 'to_datetime', 'imputation'],
      rubric: {
        correctness: "Systematic data hygiene: inspection, type casting, duplicate removal, handling missingness (drop vs impute with mean/median).",
        depth: "Explains domain rationale before blindly dropping null rows.",
        clarity: "Step-by-step practical delivery.",
        examples: "Mentions handling currency strings with '$' or localized date formats."
      },
      followUp: "When would you prefer median imputation over mean imputation for skewed financial figures?"
    },
    {
      id: 'da_3',
      question: "How do you structure an interactive Power BI dashboard or executive report so that non-technical stakeholders can derive actionable insights without getting overwhelmed?",
      category: 'Data Analyst',
      level: 'Mid Level',
      idealKeywords: ['KPI cards', 'drill-through', 'slicers', 'visual hierarchy', 'DAX measures', 'data storytelling', 'color theory'],
      rubric: {
        correctness: "Focuses on high-level KPIs first, trend breakdowns second, and granular drill-downs on demand.",
        depth: "Discusses user feedback loops, performance optimizations, and avoiding chart clutter.",
        clarity: "Business-oriented, polished presentation.",
        examples: "Revenue versus target variance with drill-down into regional sales reps."
      },
      followUp: "How do calculated columns differ from DAX measures in terms of Power BI memory and query performance?"
    }
  ],

  // 6. Data Scientist
  'Data Scientist': [
    {
      id: 'ds_1',
      question: "Explain the Bias-Variance tradeoff in Machine Learning. How do regularization techniques like L1 (Lasso) and L2 (Ridge) prevent overfitting mathematically and practically?",
      category: 'Data Scientist',
      level: 'Mid Level',
      idealKeywords: ['Bias', 'Variance', 'Overfitting', 'Underfitting', 'L1 Lasso', 'L2 Ridge', 'penalty term', 'sparsity', 'feature selection', 'lambda / alpha'],
      rubric: {
        correctness: "Explains high bias (underfitting) vs high variance (overfitting) and mathematical loss penalty.",
        depth: "Points out L1 drives coefficients exactly to zero for feature selection while L2 shrinks them proportionally.",
        clarity: "Mathematically rigorous yet accessible.",
        examples: "Predictive model with hundreds of collinear features."
      },
      followUp: "What is ElasticNet and when is it preferred over pure Lasso or Ridge?"
    },
    {
      id: 'ds_2',
      question: "How do you evaluate a fraud detection model where only 0.1% of transactions are fraudulent? Why is raw accuracy a misleading metric, and what metrics should you rely on?",
      category: 'Data Scientist',
      level: 'Mid Level',
      idealKeywords: ['Class imbalance', 'Accuracy paradox', 'Precision', 'Recall', 'F1-Score', 'PR-AUC', 'ROC-AUC', 'Confusion Matrix', 'SMOTE'],
      rubric: {
        correctness: "Correctly identifies 99.9% baseline dummy classifier problem.",
        depth: "Advocates Precision-Recall AUC over ROC-AUC for extreme skew; discusses cost-sensitive learning.",
        clarity: "Crisp and analytical.",
        examples: "Cost of False Negatives (uncaught fraud) vs False Positives (blocking legitimate user card)."
      },
      followUp: "How would you select the optimal probability classification threshold for the production inference model?"
    },
    {
      id: 'ds_3',
      question: "Walk me through how you design an A/B test for a major product change. How do you calculate sample size, minimum detectable effect (MDE), and guard against p-hacking?",
      category: 'Data Scientist',
      level: 'Senior',
      idealKeywords: ['Hypothesis testing', 'Null hypothesis', 'Statistical power (1 - beta)', 'Significance level (alpha)', 'MDE', 'Sample size calculation', 'p-hacking', 'Bonferroni correction'],
      rubric: {
        correctness: "Outlines pre-experiment power analysis, randomized splitting, metric selection, and post-experiment validation.",
        depth: "Addresses variance reduction, network effects, and stopping rules.",
        clarity: "Executive scientific rigor.",
        examples: "Testing a new AI checkout recommendation engine."
      },
      followUp: "What would you do if your A/B test shows statistically significant lift in engagement but a drop in 30-day retention?"
    }
  ],

  // 7. AI/ML Engineer
  'AI/ML Engineer': [
    {
      id: 'ai_1',
      question: "Explain the self-attention mechanism in the Transformer architecture. How does multi-head attention allow models to capture contextual token dependencies better than traditional RNNs or LSTMs?",
      category: 'AI/ML Engineer',
      level: 'Senior',
      idealKeywords: ['Query', 'Key', 'Value', 'Softmax(QK^T / sqrt(d_k))V', 'Multi-head attention', 'Parallelization', 'O(n^2) complexity', 'Vanishing gradient', 'Long-range dependencies'],
      rubric: {
        correctness: "Correct mathematical formulation of Scaled Dot-Product Attention.",
        depth: "Explains how multiple heads attend to different subspaces and highlights parallel training over sequential unrolling.",
        clarity: "Deep technical fluency.",
        examples: "Contrasts processing a 2000-token prompt in parallel vs LSTM sequential bottleneck."
      },
      followUp: "How do modern architectures like FlashAttention or Linear Attention mitigate the quadratic O(n^2) sequence length memory constraint?"
    },
    {
      id: 'ai_2',
      question: "When deploying a 7B+ parameter Large Language Model (LLM) or deep vision model to production, what techniques do you use to optimize inference latency and GPU VRAM footprint?",
      category: 'AI/ML Engineer',
      level: 'Senior',
      idealKeywords: ['Quantization (INT8, INT4, AWQ, GPTQ)', 'KV Caching', 'TensorRT-LLM', 'vLLM', 'PagedAttention', 'Batching (Continuous batching)', 'Model pruning'],
      rubric: {
        correctness: "Discusses weight quantization, KV cache memory allocation, and serving engines like vLLM or Triton.",
        depth: "Evaluates trade-offs between perplexity/accuracy degradation vs throughput gains.",
        clarity: "Production-grade systems thinking.",
        examples: "Deploying an internal coding assistant with sub-50ms Time-to-First-Token."
      },
      followUp: "What is the difference between LoRA and full fine-tuning in terms of parameter updates and checkpoint storage?"
    },
    {
      id: 'ai_3',
      question: "How do you build a production Retrieval-Augmented Generation (RAG) system? Address chunking strategies, embedding selection, vector index indexing (HNSW), and hallucination evaluation.",
      category: 'AI/ML Engineer',
      level: 'Mid Level',
      idealKeywords: ['RAG', 'Chunking', 'Vector embeddings', 'HNSW', 'Cosine similarity', 'Re-ranking', 'Ragas / TruLens', 'Hallucination mitigation'],
      rubric: {
        correctness: "Covers document ingestion, semantic chunking with overlap, vector retrieval, cross-encoder re-ranking, and grounded generation.",
        depth: "Addresses out-of-context retrieval and evaluating answer faithfulness.",
        clarity: "Systematic architectural pipeline.",
        examples: "Enterprise legal or clinical knowledge base querying."
      },
      followUp: "How would you handle hybrid search combining BM25 keyword matching with dense vector embeddings?"
    }
  ],

  // 8. Cybersecurity Analyst
  'Cybersecurity Analyst': [
    {
      id: 'sec_1',
      question: "Walk me through the OWASP Top 10 vulnerability: SQL Injection (SQLi). Explain the difference between in-band, blind, and out-of-band SQLi, and how modern developers should properly remediate it.",
      category: 'Cybersecurity Analyst',
      level: 'Mid Level',
      idealKeywords: ['SQL Injection', 'Parameterized queries', 'Prepared statements', 'OR 1=1', 'Blind SQLi (Boolean, Time-based)', 'Out-of-band', 'Least privilege', 'Input validation', 'WAF'],
      rubric: {
        correctness: "Accurately defines the vulnerability and differentiates blind (timing/boolean) vs classic error-based extraction.",
        depth: "Insists on parameterized statements as fundamental fix, not just regex filtering or sanitization.",
        clarity: "Security-first, crisp explanation.",
        examples: "Provides raw vulnerable query vs parameterized prepared statement."
      },
      followUp: "Can an ORM (like Prisma or Hibernate) still be vulnerable to SQL injection? If so, under what circumstances?"
    },
    {
      id: 'sec_2',
      question: "If a critical endpoint alert triggers indicating potential Ransomware or Cobalt Strike beacon activity on an internal workstation, describe your immediate Incident Response (IR) steps following the NIST framework.",
      category: 'Cybersecurity Analyst',
      level: 'Senior',
      idealKeywords: ['NIST IR framework', 'Preparation', 'Detection & Analysis', 'Containment', 'Eradication', 'Recovery', 'Post-Incident Lessons', 'Network isolation', 'Memory dump', 'Chain of custody'],
      rubric: {
        correctness: "Follows NIST steps: triage alert, isolate endpoint from network without powering down (preserving RAM), collect memory forensics, identify patient zero.",
        depth: "Highlights chain of custody and legal reporting constraints.",
        clarity: "Decisive crisis leadership delivery.",
        examples: "Preserving volatility memory dump before pulling network cable."
      },
      followUp: "Why is shutting down or restarting the infected computer immediately considered a critical forensic mistake?"
    },
    {
      id: 'sec_3',
      question: "Explain the CIA Triad (Confidentiality, Integrity, Availability). Give a real-world scenario where strengthening Confidentiality might inadvertently compromise Availability.",
      category: 'Cybersecurity Analyst',
      level: 'Fresher / Entry',
      idealKeywords: ['Confidentiality', 'Integrity', 'Availability', 'Encryption', 'MFA', 'DDoS', 'Account lockout policy', 'Authentication'],
      rubric: {
        correctness: "Clear definition of all three pillars.",
        depth: "Shows how aggressive security controls (like strict 3-attempt account lockouts or heavy encryption overhead) can cause denial of service.",
        clarity: "Structured and thoughtful.",
        examples: "An attacker using brute-force scripts against usernames to mass-lock legitimate employees out of banking software."
      },
      followUp: "How does the Zero Trust security model change traditional perimeter-based corporate defense?"
    }
  ],

  // 9. UI/UX Designer
  'UI/UX Designer': [
    {
      id: 'ux_1',
      question: "Walk me through your design process from initial user discovery to final developer handoff. How do you balance user feedback with strict business goals and technical constraints?",
      category: 'UI/UX Designer',
      level: 'Mid Level',
      idealKeywords: ['Double Diamond', 'User research', 'User personas', 'Information Architecture', 'Wireframing', 'Figma prototypes', 'Usability testing', 'Design system', 'Developer handoff'],
      rubric: {
        correctness: "Follows a structured design thinking framework (Discover, Define, Develop, Deliver).",
        depth: "Demonstrates cross-functional collaboration with engineering and product management.",
        clarity: "Empathetic, clear, and design-literate.",
        examples: "Mentions running 5-user usability testing sprints to identify high-friction funnel drop-offs."
      },
      followUp: "How do you handle a scenario where engineering tells you a key interaction pattern you designed is too costly to implement in the sprint?"
    },
    {
      id: 'ux_2',
      question: "What are the core Web Content Accessibility Guidelines (WCAG 2.1 AA) requirements? How do you ensure your color contrast, focus states, and typography are accessible to all users?",
      category: 'UI/UX Designer',
      level: 'Mid Level',
      idealKeywords: ['WCAG AA', 'Color contrast ratio (4.5:1, 3:1)', 'Screen readers', 'ARIA attributes', 'Focus states', 'Keyboard navigation', 'Touch target size (48x48px)', 'Color blindness'],
      rubric: {
        correctness: "Cites minimum 4.5:1 contrast ratio for normal text, accessible touch targets, and visual focus rings.",
        depth: "Understands that accessibility is a foundational design requirement, not an afterthought.",
        clarity: "User-centric and methodical.",
        examples: "Designing error messages that do not rely solely on color red to indicate failure."
      },
      followUp: "How do you design a data-dense financial dashboard so that screen readers can navigate complex multi-column tables effectively?"
    },
    {
      id: 'ux_3',
      question: "What is a Design System, and how does atomic design methodology (atoms, molecules, organisms, templates) help scaling product teams maintain visual and behavioral consistency?",
      category: 'UI/UX Designer',
      level: 'Senior',
      idealKeywords: ['Design tokens', 'Atomic design', 'Atoms', 'Molecules', 'Organisms', 'Figma components', 'Auto layout', 'Component variants', 'Single source of truth'],
      rubric: {
        correctness: "Accurately defines Brad Frost's atomic hierarchy and the purpose of design tokens.",
        depth: "Explains component governance, versioning, and syncing with code repositories.",
        clarity: "High-level design leadership.",
        examples: "Creating a universal button token that cascades across iOS, Android, and Web applications."
      },
      followUp: "How do you measure the return on investment (ROI) and team velocity impact of implementing a unified design system?"
    }
  ],

  // 10. Business Analyst
  'Business Analyst': [
    {
      id: 'ba_1',
      question: "How do you distinguish between a Business Requirements Document (BRD) and a Functional Requirements Document (FRD)? Walk me through the essential sections of each.",
      category: 'Business Analyst',
      level: 'Mid Level',
      idealKeywords: ['BRD', 'FRD', 'Business objectives', 'Stakeholder needs', 'Functional specifications', 'Use cases', 'System behavior', 'Acceptance criteria', 'Traceability matrix'],
      rubric: {
        correctness: "Distinguishes 'what and why' (business problem & ROI) in BRD from 'how the system should behave' (inputs, outputs, business logic) in FRD.",
        depth: "Mentions Requirements Traceability Matrix (RTM) to link business needs to test cases.",
        clarity: "Crisp and structured business vocabulary.",
        examples: "Automating an insurance claim workflow from manual paperwork to mobile upload."
      },
      followUp: "What techniques do you use when different department heads have conflicting priorities for the new feature release?"
    },
    {
      id: 'ba_2',
      question: "Explain how you model an existing workflow using BPMN (Business Process Model and Notation). How do you identify bottlenecks and formulate the 'To-Be' future state?",
      category: 'Business Analyst',
      level: 'Mid Level',
      idealKeywords: ['BPMN', 'Swimlanes', 'Gateways (Exclusive, Parallel)', 'As-Is vs To-Be', 'Bottleneck analysis', 'Cycle time', 'Handoff delays', 'Automation opportunities'],
      rubric: {
        correctness: "Accurately defines swimlanes, events, tasks, and decision gateways.",
        depth: "Analyzes handoff latency between teams and eliminates redundant verification steps.",
        clarity: "Methodical and analytical.",
        examples: "Mapping customer onboarding from form submission to account activation."
      },
      followUp: "How do you write effective Agile User Stories and define unambiguous 'Definition of Done' and Acceptance Criteria using Gherkin (Given-When-Then)?"
    },
    {
      id: 'ba_3',
      question: "Tell me about a time when a project began experiencing severe scope creep near the deadline. How did you assess the impact and communicate with stakeholders?",
      category: 'Business Analyst',
      level: 'Senior',
      idealKeywords: ['Scope creep', 'Change request process', 'Impact analysis', 'Triple constraint (Time, Cost, Quality)', 'MoSCoW prioritization', 'Stakeholder negotiation'],
      rubric: {
        correctness: "Follows structured change management: document request, evaluate budget/timeline impact, present trade-offs to steering committee.",
        depth: "Demonstrates diplomacy without being a pushover.",
        clarity: "Poised stakeholder management tone.",
        examples: "Using MoSCoW (Must have, Should have, Could have, Won't have) to postpone non-critical enhancements to Phase 2."
      },
      followUp: "How do you quantify and present the financial ROI or cost-benefit analysis of a software transformation project?"
    }
  ],

  // 11. HR Interview
  'HR Interview': [
    {
      id: 'hr_1',
      question: "Tell me about yourself, your professional journey, and what specific qualities make you an exceptional fit for our organization and culture.",
      category: 'HR Interview',
      level: 'Fresher / Entry',
      idealKeywords: ['Elevator pitch', 'Present role', 'Past milestones', 'Core strengths', 'Company values', 'Career trajectory', 'Passion'],
      rubric: {
        correctness: "Delivers a cohesive 90-120 second narrative connecting past achievements, present capabilities, and future vision.",
        depth: "Avoids reciting resume verbatim; emphasizes value creation and genuine company alignment.",
        clarity: "Confident, well-paced, articulate delivery.",
        examples: "Highlights one key project that defines work ethic and collaborative mindset."
      },
      followUp: "What is one professional mistake or failure you experienced, and how did it permanently shape how you approach your work?"
    },
    {
      id: 'hr_2',
      question: "What do you consider your greatest professional strength, and what is an area of growth or weakness you are actively working to improve?",
      category: 'HR Interview',
      level: 'Mid Level',
      idealKeywords: ['Self-awareness', 'Continuous improvement', 'Vulnerability', 'Action plan', 'Constructive feedback', 'Real weakness'],
      rubric: {
        correctness: "Provides an authentic, non-cliché weakness coupled with a proactive, measurable remediation plan.",
        depth: "Demonstrates emotional maturity, humility, and accountability.",
        clarity: "Direct and sincere.",
        examples: "Examples like learning to delegate effectively or improving public speaking through structured practice."
      },
      followUp: "How do you handle receiving critical or uncomfortable feedback from a manager or team member?"
    },
    {
      id: 'hr_3',
      question: "Describe a high-pressure situation where you faced a significant conflict or disagreement with a coworker on project execution. How did you handle it and what was the outcome?",
      category: 'HR Interview',
      level: 'Mid Level',
      idealKeywords: ['STAR method', 'Situation', 'Task', 'Action', 'Result', 'Active listening', 'Empathy', 'De-escalation', 'Win-win solution'],
      rubric: {
        correctness: "Follows STAR method strictly: clear context, personal responsibility, empathetic actions, positive measurable resolution.",
        depth: "Focuses on shared team success rather than proving the other person wrong.",
        clarity: "Poised and diplomatic.",
        examples: "Resolving a technical disagreement through objective benchmarking and data."
      },
      followUp: "Where do you envision yourself contributing in our team over the next 2 to 3 years?"
    }
  ],

  // 12. General Fresher Interview
  'General Fresher Interview': [
    {
      id: 'gf_1',
      question: "Introduce yourself, highlight your academic background, and tell me about the most impactful college project you built. What was your specific contribution?",
      category: 'General Fresher Interview',
      level: 'Fresher / Entry',
      idealKeywords: ['Self-introduction', 'Degree / Major', 'Core subjects', 'Capstone project', 'Tech stack', 'Problem statement', 'Personal contribution', 'Learnings'],
      rubric: {
        correctness: "Well-structured introduction covering education, technical interests, and hands-on project experience.",
        depth: "Clearly explains the real-world problem their project addressed and their specific role in the team.",
        clarity: "Enthusiastic, clear, and confident articulation.",
        examples: "Mentions specific tools used (e.g., Python, React, MySQL) and challenges overcome during implementation."
      },
      followUp: "If you had two more months to work on that college project, what feature or architectural improvement would you implement?"
    },
    {
      id: 'gf_2',
      question: "As an engineering graduate, how do you approach learning a completely new programming language, library, or framework within a short deadline?",
      category: 'General Fresher Interview',
      level: 'Fresher / Entry',
      idealKeywords: ['Official documentation', 'Hands-on practice', 'Small prototype / Proof of Concept', 'Debugging', 'Stack Overflow / Community', 'Fast learner', 'Curiosity'],
      rubric: {
        correctness: "Articulates a structured self-directed learning approach: read fundamentals, build a small project, debug errors, understand best practices.",
        depth: "Demonstrates intellectual curiosity and self-sufficiency.",
        clarity: "Structured and positive.",
        examples: "Gives a real example of learning a framework for a hackathon or coursework in a few days."
      },
      followUp: "Can you explain the difference between Procedural Programming and Object-Oriented Programming with a simple analogy?"
    },
    {
      id: 'gf_3',
      question: "Why should we hire you over other qualified candidates applying for this graduate trainee role, and what are your expectations from your first corporate employer?",
      category: 'General Fresher Interview',
      level: 'Fresher / Entry',
      idealKeywords: ['Adaptability', 'Strong fundamentals', 'Work ethic', 'Eagerness to learn', 'Mentorship', 'Contribution to team', 'Long-term commitment'],
      rubric: {
        correctness: "Balances confidence with modesty: emphasizes dedication to learning quickly, strong foundational basics, and positive team spirit.",
        depth: "Shows realistic, professional workplace expectations.",
        clarity: "Inspiring and genuine.",
        examples: "References commitment to staying late to unblock issues and welcoming mentor guidance."
      },
      followUp: "Are you comfortable relocating or working across different technology domains as project requirements evolve?"
    }
  ],

  // 13. Other / Custom Role (Default Template)
  'Other / Custom Role': [
    {
      id: 'custom_1',
      question: "Please introduce yourself and explain your foundational background, core technical proficiencies, and what drew you toward this specialized role.",
      category: 'Other / Custom Role',
      level: 'Mid Level',
      idealKeywords: ['Domain expertise', 'Problem solving', 'Core workflows', 'Industry best practices', 'Impact', 'Adaptability'],
      rubric: {
        correctness: "Demonstrates clear domain fluency and logical progression of career skills.",
        depth: "Connects specialized tools with business value.",
        clarity: "Articulate and confident delivery.",
        examples: "Provides concrete career projects and quantitative results."
      },
      followUp: "What are the most challenging technical bottlenecks or operational trade-offs commonly faced in this role?"
    },
    {
      id: 'custom_2',
      question: "Walk me through an advanced problem or complex project you tackled in this field. What was your strategy, how did you handle edge cases, and what was the outcome?",
      category: 'Other / Custom Role',
      level: 'Mid Level',
      idealKeywords: ['Root cause analysis', 'Architecture', 'Methodology', 'Trade-offs', 'Execution', 'Metrics'],
      rubric: {
        correctness: "Systematic problem-solving methodology with verifiable results.",
        depth: "Explains technical choices and alternatives considered.",
        clarity: "Structured narrative without ambiguity.",
        examples: "Cites specific performance metrics, cost savings, or latency improvements."
      },
      followUp: "If a critical requirement changed midway through that project, how would you pivot your execution strategy?"
    },
    {
      id: 'custom_3',
      question: "How do you stay up-to-date with emerging tools, industry standards, and innovations relevant to this specialization?",
      category: 'Other / Custom Role',
      level: 'Senior',
      idealKeywords: ['Continuous learning', 'Open source', 'Technical papers', 'Community engagement', 'Benchmarking', 'Prototyping'],
      rubric: {
        correctness: "Shows deliberate ongoing learning hygiene and curiosity.",
        depth: "Understands industry shifts and emerging trends.",
        clarity: "Forward-looking and visionary.",
        examples: "Mentions specific technical blogs, conferences, or open-source repositories followed."
      },
      followUp: "How do you evaluate whether an exciting new industry trend or tool is worth adopting in production versus keeping existing proven tech?"
    }
  ],

  // Backward compatibility categories
  Python: [
    {
      id: 'py_legacy_1',
      question: "Explain Python's Global Interpreter Lock (GIL). How does it impact multithreaded CPU-bound tasks versus I/O-bound tasks, and how can you achieve true parallelism?",
      category: 'Python',
      level: 'Mid Level',
      idealKeywords: ['GIL', 'bytecode', 'thread-safe', 'multiprocessing', 'concurrent.futures', 'I/O-bound', 'CPU-bound', 'C extensions', 'PyPy'],
      rubric: {
        correctness: "Accurately identifies GIL as mutex preventing simultaneous bytecode execution in CPython.",
        depth: "Contrasts threading for I/O vs multiprocessing for CPU bounds.",
        clarity: "Logically structured without repetitive circumlocution.",
        examples: "Provides code or architectural pattern."
      },
      followUp: "If you have an asynchronous FastAPI service calling a blocking Python library, how would you prevent the event loop from being blocked by that GIL execution?"
    }
  ],
  SQL: [
    {
      id: 'sql_legacy_1',
      question: "Explain the internal difference between a B-Tree index and a Hash index in relational databases like PostgreSQL. When would a B-Tree be preferred over Hash, and vice versa?",
      category: 'SQL',
      level: 'Mid Level',
      idealKeywords: ['B-Tree', 'Hash index', 'equality lookup', 'range query', 'O(log n)', 'O(1)', 'sorting'],
      rubric: {
        correctness: "Correctly notes B-Tree supports range and sorting (<, >, BETWEEN) while Hash only does direct equality (=).",
        depth: "Mentions tree height, node splitting, and logarithmic scan efficiency.",
        clarity: "Direct and methodical.",
        examples: "Applies to high-volume user lookup vs timestamp log range queries."
      },
      followUp: "What are the write amplification costs of indexing every query-filtered column on a high-throughput OLTP table?"
    }
  ],
  Aptitude: [
    {
      id: 'apt_legacy_1',
      question: "A pipe can fill a reservoir in 6 hours, and a drainage valve can empty it in 8 hours. If both are opened simultaneously when the reservoir is half full, how many hours will it take to fill completely?",
      category: 'Aptitude',
      level: 'Fresher / Entry',
      idealKeywords: ['rate', '1/6', '1/8', 'net rate', '1/24', '12 hours', 'fractions'],
      rubric: {
        correctness: "Correct step-by-step math leading to 12 remaining hours.",
        depth: "Shows analytical breakdown: Net rate = (1/6 - 1/8) = 1/24 tank per hr. Remaining 1/2 tank / (1/24) = 12 hrs.",
        clarity: "Crisp verbal articulation of mathematical reasoning.",
        examples: "Step-by-step deduction."
      },
      followUp: "What if the drainage valve is doubled in capacity halfway through?"
    }
  ],
  HR: [
    {
      id: 'hr_legacy_1',
      question: "Tell me about a time you encountered a significant conflict with a team member or stakeholder regarding a technical approach or project deadline. How did you resolve it?",
      category: 'HR',
      level: 'Mid Level',
      idealKeywords: ['STAR method', 'Situation', 'Task', 'Action', 'Result', 'empathy', 'compromise', 'data-driven'],
      rubric: {
        correctness: "Adheres cleanly to the STAR framework.",
        depth: "Reflects emotional intelligence, objective compromise, and team alignment over personal ego.",
        clarity: "Structured narrative with measurable outcome.",
        examples: "Provides realistic situational context."
      },
      followUp: "If you had to do that project again today, what process or communication guardrail would you put in place upfront?"
    }
  ],
  Behavioral: [
    {
      id: 'beh_legacy_1',
      question: "Describe a production incident or severe bug that you were responsible for or had to resolve under high stakes. Walk me through your triage, post-mortem, and preventive measures.",
      category: 'Behavioral',
      level: 'Senior',
      idealKeywords: ['incident response', 'blameless post-mortem', 'observability', 'rollback', 'root cause analysis'],
      rubric: {
        correctness: "Sound engineering hygiene (containment first, root-cause second, blameless post-mortem third).",
        depth: "Shows psychological safety and proactive systemic improvements.",
        clarity: "Calm, accountable, structured delivery.",
        examples: "Cites alerts, metrics, SLA impact, or deployment pipeline fix."
      },
      followUp: "How did you convey the status update and timeline to non-technical business stakeholders while debugging?"
    }
  ]
};

/**
 * Helper to generate or retrieve calibrated questions for any given role
 */
export function getQuestionsForRole(roleIdOrTitle, customRoleName = '', level = 'Mid Level') {
  let pool = null;

  // Check direct category match in QUESTION_BANK
  if (QUESTION_BANK[roleIdOrTitle]) {
    pool = QUESTION_BANK[roleIdOrTitle];
  } else {
    // Check role definition match
    const matchedRole = INTERVIEW_ROLES.find(r => 
      r.id === roleIdOrTitle || 
      r.title.toLowerCase() === roleIdOrTitle.toLowerCase() ||
      r.categoryKey.toLowerCase() === roleIdOrTitle.toLowerCase()
    );

    if (matchedRole && QUESTION_BANK[matchedRole.categoryKey]) {
      pool = QUESTION_BANK[matchedRole.categoryKey];
    }
  }

  if (pool && pool.length > 0) {
    // Difficulty calibration: Prioritize questions matching the selected experience level
    const target = (level || 'Mid Level').toLowerCase();
    const exactMatches = [];
    const otherMatches = [];

    pool.forEach(q => {
      const qL = (q.level || 'Mid Level').toLowerCase();
      if (
        (target.includes('entry') || target.includes('fresher')) &&
        (qL.includes('entry') || qL.includes('fresher'))
      ) {
        exactMatches.push(q);
      } else if (
        (target.includes('senior') || target.includes('lead') || target.includes('staff')) &&
        (qL.includes('senior') || qL.includes('lead'))
      ) {
        exactMatches.push(q);
      } else if (target.includes('mid') && qL.includes('mid')) {
        exactMatches.push(q);
      } else {
        otherMatches.push(q);
      }
    });

    const calibrated = [...exactMatches, ...otherMatches];
    return calibrated.length > 0 ? calibrated : pool;
  }

  // If custom role specified
  const effectiveTitle = customRoleName.trim() || roleIdOrTitle || 'Software Professional';
  return [
    {
      id: `gen_custom_1`,
      question: `As a candidate for ${effectiveTitle}, walk me through your technical background, the architecture of your most demanding recent project, and how you solved its primary technical challenge.`,
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
      question: `What are the most exciting emerging technologies or architectural shifts currently happening in the ${effectiveTitle} domain, and how are you preparing for them?`,
      category: effectiveTitle,
      level: level,
      idealKeywords: ['innovation', 'emerging trends', 'automation', 'continuous learning', 'best practices'],
      rubric: {
        correctness: 'Demonstrates deep engagement with contemporary tools and forward-looking trends.',
        depth: 'Critical evaluation of new tech versus established patterns.',
        clarity: 'Enthusiastic yet grounded perspective.',
        examples: 'Cites specific new libraries, methodologies, or cloud paradigms.'
      },
      followUp: `How would you champion the adoption of one of those innovations to a conservative engineering or leadership team?`
    }
  ];
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
