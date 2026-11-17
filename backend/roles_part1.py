# Roles Part 1: Python Developer, Java Developer, Data Analyst

PART1_DATA = {
    "Python Developer": [
        {
            "id": "py_entry_1",
            "question": "What is the difference between mutable and immutable data types in Python? Give three examples of each and explain how passing them into a function behaves.",
            "topic": "Python Memory Management & GC",
            "questionType": "conceptual",
            "level": "Fresher / Entry",
            "idealKeywords": ["mutable", "immutable", "list", "dict", "set", "int", "str", "tuple", "pass-by-assignment", "object reference", "id()"],
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
            "idealKeywords": ["list comprehension", "for loop", "map()", "lambda", "bytecode", "C speed", "readability", "memory footprint"],
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
            "idealKeywords": ["*args", "**kwargs", "positional arguments", "keyword arguments", "tuple unpacking", "dict unpacking", "variadic functions"],
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
            "idealKeywords": ["GIL", "CPython", "bytecode", "thread-safe", "multiprocessing", "concurrent.futures", "I/O-bound", "CPU-bound", "C extensions"],
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
            "idealKeywords": ["first-class functions", "closures", "functools.wraps", "nested functions", "higher-order functions", "decorator with arguments"],
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
            "idealKeywords": ["with statement", "__enter__", "__exit__", "resource management", "exception suppression", "contextlib", "generator yield"],
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
            "idealKeywords": ["Event Loop", "coroutines", "async/await", "asyncio.create_task", "Futures", "non-blocking I/O", "cooperative multitasking"],
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
            "idealKeywords": ["reference counting", "ob_refcnt", "cyclic reference", "gc module", "generational garbage collector", "thresholds", "weakref", "PyObject"],
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
            "idealKeywords": ["FastAPI", "Starlette", "Pydantic v2", "Uvicorn", "Gunicorn process manager", "async def vs def threadpool", "dependency injection", "connection pooling"],
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
            "idealKeywords": ["metaclass", "type", "__new__", "__init__", "class instantiation", "descriptors (__get__, __set__)", "__init_subclass__", "declarative ORM"],
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
            "idealKeywords": ["Celery", "Kafka / RabbitMQ", "distributed locks", "idempotency keys", "dead letter queues (DLQ)", "worker prefetch limits", "exponential backoff", "ack_late"],
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
            "idealKeywords": ["tracemalloc", "objgraph", "memory leak", "growing references", "unclosed generators", "module level cache", "gc.get_objects()", "C extension leaks"],
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
            "idealKeywords": ["String immutability", "String constant pool", "StringBuilder mutable non-thread-safe", "StringBuffer synchronized thread-safe", "heap allocation"],
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
            "idealKeywords": ["Checked exceptions", "Unchecked exceptions", "RuntimeException", "IOException", "NullPointerException", "try-catch-finally", "throws keyword"],
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
            "idealKeywords": ["ArrayList dynamic array", "LinkedList doubly linked list", "O(1) random access", "O(n) search", "O(1) insert at ends", "CPU cache locality", "memory overhead"],
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
            "idealKeywords": ["hashCode()", "equals() contract", "bucket index", "bitwise AND", "TREEIFY_THRESHOLD (8)", "Red-Black Tree", "UNTREEIFY_THRESHOLD (6)", "O(1) to O(log n)"],
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
            "idealKeywords": ["IoC container", "ApplicationContext", "Dependency Injection", "Bean lifecycle", "@PostConstruct", "@PreDestroy", "Singleton scope", "Prototype scope"],
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
            "idealKeywords": ["ThreadPoolExecutor", "corePoolSize", "maximumPoolSize", "LinkedBlockingQueue", "OutOfMemoryError", "CompletableFuture", "supplyAsync", "rejection policy"],
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
            "idealKeywords": ["N+1 problem", "Lazy loading", "JOIN FETCH", "@EntityGraph", "hibernate.default_batch_fetch_size", "Cartesian product", "SQL query count"],
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
            "idealKeywords": ["G1GC", "ZGC", "colored pointers", "load barriers", "stop-the-world pauses", "sub-millisecond latency", "regions", "MaxGCPauseMillis", "Metaspace"],
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
            "idealKeywords": ["Java Memory Model", "happens-before", "volatile", "memory barriers", "CPU cache coherency (MESI)", "instruction reordering", "atomic operations"],
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
            "idealKeywords": ["Resilience4j", "Circuit Breaker", "CLOSED to OPEN", "HALF_OPEN", "Bulkhead", "RateLimiter", "sliding window metrics", "fallback method"],
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
            "idealKeywords": ["Saga pattern", "compensating transactions", "Choreography vs Orchestration", "Transactional Outbox", "Debezium CDC", "Kafka", "idempotency"],
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
            "idealKeywords": ["OpenTelemetry (OTel)", "Trace ID / Span ID", "Micrometer / Prometheus", "MDC (Mapped Diagnostic Context)", "context propagation", "tail-based sampling"],
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
            "idealKeywords": ["WHERE filters rows before aggregation", "HAVING filters aggregated groups", "GROUP BY", "aggregate functions (SUM, COUNT, AVG)", "execution order"],
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
            "idealKeywords": ["INNER JOIN matching rows", "LEFT JOIN all left rows", "NULL values", "FULL OUTER JOIN union of both", "join keys", "cartesian product"],
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
            "idealKeywords": ["dropna()", "fillna()", "imputation (mean/median/mode)", "drop_duplicates()", "subset deduplication", "data integrity", "MCAR / MAR"],
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
            "idealKeywords": ["OVER (PARTITION BY ... ORDER BY ...)", "ROW_NUMBER unique sequential", "RANK skips ranks on tie (1, 2, 2, 4)", "DENSE_RANK consecutive ranks (1, 2, 2, 3)", "ties"],
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
            "idealKeywords": ["visual hierarchy", "data-ink ratio", "KPI cards", "drill-down", "color theory (semantic color)", "chart selection", "actionable insights", "executive summary"],
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
            "idealKeywords": ["outliers", "IQR (Interquartile Range)", "Z-score", "box plot", "data entry error", "fraud detection", "robust statistics (median)", "winsorization"],
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
            "idealKeywords": ["cohort analysis", "retention rate", "first purchase month", "cohort index", "self join / window functions", "churn rate", "heat map matrix"],
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
            "idealKeywords": ["Star Schema", "Snowflake Schema", "Fact table", "Dimension table", "denormalization", "join complexity", "columnar storage", "OLAP vs OLTP"],
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
            "idealKeywords": ["A/B testing", "Null Hypothesis (H0)", "p-value", "statistical significance (alpha = 0.05)", "statistical power (1 - beta = 0.80)", "MDE (Minimum Detectable Effect)", "sample size calculation"],
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
            "idealKeywords": ["root cause analysis", "data pipeline validation", "segmentation (device, geography, traffic source)", "funnel analysis", "external factors", "release correlation"],
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
            "idealKeywords": ["Metric Layer / Semantic Store", "Single Source of Truth", "dbt", "standardized metric definitions", "governance", "version control", "headless BI"],
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
            "idealKeywords": ["Data Governance", "dbt-expectations / Great Expectations", "data lineage", "anomaly detection", "Monte Carlo / Soda", "data contracts", "SLAs / SLIs"],
            "rubric": {
                "correctness": "Proposes automated freshness and schema anomaly checks at ingestion, transformation, and presentation layers.",
                "depth": "Details upstream producer data contracts to prevent software engineers breaking downstream analytical tables.",
                "clarity": "Executive data platform leadership.",
                "examples": "Implements automated Slack/PagerDuty alerts when daily ETL pipeline fails or row counts drop unexpectedly."
            },
            "followUp": "How do you calculate and demonstrate the business ROI of investing in data quality and governance tools?"
        }
    ]
}

print("Part 1 defined with roles:", list(PART1_DATA.keys()))
