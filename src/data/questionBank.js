// Question banks with rubrics and human-validated benchmarks
export const QUESTION_BANK = {
  Python: [
    {
      id: 'py_1',
      question: "Explain Python's Global Interpreter Lock (GIL). How does it impact multithreaded CPU-bound tasks versus I/O-bound tasks, and how can you achieve true parallelism?",
      category: 'Python',
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
      category: 'Python',
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
      question: "How do Python generators and the 'yield' keyword help in processing huge multi-gigabyte log files without exhausting RAM?",
      category: 'Python',
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

  SQL: [
    {
      id: 'sql_1',
      question: "Explain the internal difference between a B-Tree index and a Hash index in relational databases like PostgreSQL. When would a B-Tree be preferred over Hash, and vice versa?",
      category: 'SQL',
      level: 'Mid Level',
      idealKeywords: ['B-Tree', 'Hash index', 'equality lookup', 'range query', 'O(log n)', 'O(1)', 'sorting', 'ORDER BY', 'cardinality'],
      rubric: {
        correctness: "Correctly notes B-Tree supports range and sorting (<, >, BETWEEN) while Hash only does direct equality (=).",
        depth: "Mentions tree height, node splitting, and logarithmic scan efficiency.",
        clarity: "Direct and methodical.",
        examples: "Applies to high-volume user lookup vs timestamp log range queries."
      },
      followUp: "What are the write amplification costs of indexing every query-filtered column on a high-throughput OLTP table?"
    },
    {
      id: 'sql_2',
      question: "What are the ACID properties in database transaction management? Explain what 'Phantom Read' anomaly is and which isolation level prevents it.",
      category: 'SQL',
      level: 'Senior',
      idealKeywords: ['Atomicity', 'Consistency', 'Isolation', 'Durability', 'Phantom Read', 'Repeatable Read', 'Serializable', 'MVCC', 'locks'],
      rubric: {
        correctness: "Defines each ACID letter and accurate phantom read definition (new rows appearing in range query).",
        depth: "Identifies Serializable or predicate locking / MVCC snapshots.",
        clarity: "Precise database terminology.",
        examples: "Gives a concrete bank transaction or seat booking scenario."
      },
      followUp: "How does Multi-Version Concurrency Control (MVCC) reduce reader-writer locking contention?"
    }
  ],

  Aptitude: [
    {
      id: 'apt_1',
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
      id: 'hr_1',
      question: "Tell me about a time you encountered a significant conflict with a team member or stakeholder regarding a technical approach or project deadline. How did you resolve it?",
      category: 'HR',
      level: 'Mid Level',
      idealKeywords: ['STAR method', 'Situation', 'Task', 'Action', 'Result', 'empathy', 'compromise', 'data-driven', 'communication'],
      rubric: {
        correctness: "Adheres cleanly to the STAR framework.",
        depth: "Reflects emotional intelligence, objective compromise, and team alignment over personal ego.",
        clarity: "Structured narrative with measurable outcome.",
        examples: "Provides realistic situational context."
      },
      followUp: "If you had to do that project again today, what process or communication guardrail would you put in place upfront?"
    },
    {
      id: 'hr_2',
      question: "Why do you want to join this engineering organization, and where do you envision your technical leadership evolving over the next 2-3 years?",
      category: 'HR',
      level: 'Fresher / Entry',
      idealKeywords: ['culture', 'impact', 'growth', 'mentorship', 'system design', 'ownership', 'alignment'],
      rubric: {
        correctness: "Direct alignment with engineering principles and career ambition.",
        depth: "Specific personal goals, self-awareness, and continuous learning ethos.",
        clarity: "Passionate yet poised voice delivery.",
        examples: "References modern engineering practices you want to champion."
      },
      followUp: "How do you maintain continuous learning when day-to-day sprint delivery is high-pressure?"
    }
  ],

  Behavioral: [
    {
      id: 'beh_1',
      question: "Describe a production incident or severe bug that you were responsible for or had to resolve under high stakes. Walk me through your triage, post-mortem, and preventive measures.",
      category: 'Behavioral',
      level: 'Senior',
      idealKeywords: ['incident response', 'blameless post-mortem', 'observability', 'rollback', 'root cause analysis', 'mitigation', 'runbook'],
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

export const PERSONAS = [
  {
    id: 'strict',
    name: 'Strict Tech Lead',
    tone: 'Demanding, precise, probes deeply into edge cases and runtime bottlenecks.',
    badge: 'Critical & Rigorous',
    avatar: '👨‍💼',
    accentColor: '#ef4444'
  },
  {
    id: 'collaborative',
    name: 'Collaborative Senior Peer',
    tone: 'Encouraging, conversational, focuses on problem-solving reasoning and design trade-offs.',
    badge: 'Supportive & Constructive',
    avatar: '👩‍💻',
    accentColor: '#3b82f6'
  },
  {
    id: 'hiring_mgr',
    name: 'VP of Engineering / Hiring Manager',
    tone: 'Evaluates strategic impact, scalability, team leadership, and pragmatic business ROI.',
    badge: 'High-Level & Impact-Oriented',
    avatar: '🏛️',
    accentColor: '#8b5cf6'
  },
  {
    id: 'hr_partner',
    name: 'People Operations / Talent Partner',
    tone: 'Empathetic, structured, looks for cultural contribution, grit, and communication clarity.',
    badge: 'Behavioral & Alignment',
    avatar: '🤝',
    accentColor: '#10b981'
  }
];

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
