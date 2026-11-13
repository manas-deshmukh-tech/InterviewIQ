# Roles Part 2: Data Scientist, AI/ML Engineer, Cybersecurity Analyst

PART2_DATA = {
    "Data Scientist": [
        {
            "id": "ds_entry_1",
            "question": "Explain the Bias-Variance Trade-off in machine learning. How do high bias versus high variance manifest in model training and validation error curves?",
            "topic": "Overfitting, Regularization & Bias-Variance",
            "questionType": "conceptual",
            "level": "Fresher / Entry",
            "idealKeywords": ["Bias underfitting", "Variance overfitting", "training loss vs validation loss", "model complexity", "generalization error", "irreducible error"],
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
            "idealKeywords": ["Precision (TP / TP + FP)", "Recall / Sensitivity (TP / TP + FN)", "F1-Score harmonic mean", "False Negatives costly", "False Positives costly", "medical diagnosis", "fraud detection"],
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
            "idealKeywords": ["L1 absolute value penalty", "L2 squared penalty", "sparsity", "feature selection", "diamond vs circle contour constraint", "multicollinearity"],
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
            "idealKeywords": ["Random Forest Bagging (bootstrap aggregation)", "parallel trees", "feature subsampling", "Gradient Boosting sequential", "pseudo-residuals", "learning rate (shrinkage)", "XGBoost second-order Taylor expansion"],
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
            "idealKeywords": ["class imbalance", "SMOTE (Synthetic Minority Over-sampling Technique)", "undersampling", "class weights (scale_pos_weight)", "data leakage", "StratifiedKFold", "PR-AUC instead of ROC-AUC"],
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
            "idealKeywords": ["Multicollinearity", "Variance Inflation Factor (VIF)", "correlation matrix", "R-squared of regressed feature", "inflated standard errors", "unstable p-values", "PCA"],
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
            "idealKeywords": ["Silhouette Coefficient", "intra-cluster distance (a)", "nearest-cluster distance (b)", "Elbow method (inertia / WCSS)", "DBSCAN density-based", "core points vs noise"],
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
            "idealKeywords": ["SHAP values", "Shapley values (game theory)", "efficiency and additivity", "TreeSHAP", "LIME local surrogate linear model", "global vs local feature importance", "black-box models"],
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
            "idealKeywords": ["Covariate Shift (P(X) changes)", "Concept Drift (P(Y|X) changes)", "Population Stability Index (PSI)", "Kolmogorov-Smirnov (KS) test", "Wasserstein distance", "model performance degradation", "automated retraining"],
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
            "idealKeywords": ["Time-Series split", "lookahead bias / data leakage", "autocorrelation", "rolling window validation", "expanding window validation", "purged / embargoed CV"],
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
            "idealKeywords": ["Feature Store (online low latency vs offline batch)", "Feast", "MLflow model registry", "Kubeflow / Airflow orchestration", "model lineage", "CI/CD/CT pipelines", "data version control (DVC)"],
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
            "idealKeywords": ["expected value framework", "cost-benefit matrix", "utility function", "decision threshold optimization", "P&L impact", "executive storytelling", "risk tolerance"],
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
            "idealKeywords": ["Vanishing gradient", "Exploding gradient", "chain rule backpropagation", "Sigmoid derivative (<0.25)", "ReLU activation", "Residual skip connections", "Batch Normalization", "gradient clipping"],
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
            "idealKeywords": ["dense vector", "high-dimensional space", "semantic similarity", "cosine similarity (dot product / magnitudes)", "Word2Vec / BERT embeddings", "normalized vectors"],
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
            "idealKeywords": ["Loss function (CrossEntropyLoss, MSE)", "SGD", "Adam (Adaptive Moment Estimation)", "first moment (mean)", "second moment (uncentered variance)", "learning rate", "weight decay"],
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
            "idealKeywords": ["Query, Key, Value (Q, K, V)", "Attention formula: softmax(QK^T / sqrt(d_k)) * V", "Multi-Head Attention", "Positional Encoding (sinusoidal / learned)", "parallel training vs RNN sequential", "feed-forward network"],
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
            "idealKeywords": ["RAG", "chunking with overlap", "Vector DB (Pinecone, Milvus, Qdrant)", "HNSW (Hierarchical Navigable Small World)", "Hybrid Search (BM25 + Dense)", "Cross-Encoder Reranker", "context window injection"],
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
            "idealKeywords": ["Quantization", "FP16 vs FP32", "INT8 / INT4", "scale factor and zero point", "outlier features", "AWQ (Activation-aware Weight Quantization)", "GPTQ", "VRAM reduction", "perplexity"],
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
            "idealKeywords": ["LoRA", "QLoRA", "low-rank decomposition (B * A)", "frozen base weights", "rank r (e.g. 8, 16)", "alpha scaling parameter", "NF4 (NormalFloat4) data type", "VRAM efficiency"],
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
            "idealKeywords": ["DistributedDataParallel (DDP)", "Tensor Parallelism", "Pipeline Parallelism", "ZeRO (Zero Redundancy Optimizer)", "FSDP (Fully Sharded Data Parallel)", "NCCL all-reduce", "NVLink bandwidth", "optimizer state sharding"],
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
            "idealKeywords": ["PagedAttention", "KV cache fragmentation", "Continuous / In-flight batching", "speculative decoding", "time-to-first-token (TTFT)", "inter-token latency (ITL)", "vLLM"],
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
            "idealKeywords": ["RLHF", "Reward Model", "PPO (Proximal Policy Optimization)", "KL-divergence penalty", "DPO (Direct Preference Optimization)", "implicit reward", "pair-wise chosen vs rejected", "alignment tax"],
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
            "idealKeywords": ["AI Gateway", "semantic cache (vector similarity)", "model routing (small vs large models)", "prompt injection defense", "Llama Guard / NeMo Guardrails", "rate limiting & token quotas", "fallback cascading"],
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
            "idealKeywords": ["Agentic AI", "LangGraph state machine", "ReAct loop (Reason + Act)", "tool calling", "code execution sandbox (Docker/gVisor)", "infinite loop guard", "human-in-the-loop (HITL)", "idempotent actions"],
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
            "idealKeywords": ["Confidentiality", "Integrity", "Availability", "CIA triad", "data breach / sniffing", "man-in-the-middle / tampering", "DDoS attack", "encryption", "hashing"],
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
            "idealKeywords": ["Symmetric (AES, shared key, fast)", "Asymmetric (RSA, ECC, public/private key pair)", "TLS handshake", "Certificate Authority (CA)", "digital certificate", "session key", "hybrid encryption"],
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
            "idealKeywords": ["Phishing", "Social engineering", "Spear phishing", "SPF (Sender Policy Framework)", "DKIM (DomainKeys Identified Mail)", "DMARC", "Hardware security keys (FIDO2/WebAuthn)", "security awareness training"],
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
            "idealKeywords": ["SQL Injection", "Parameterized queries / Prepared statements", "Stored vs Reflected XSS", "Content Security Policy (CSP)", "Contextual output encoding", "IDOR / BOLA", "authorization ownership check"],
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
            "idealKeywords": ["Wireshark", "pcap analysis", "TCP SYN without ACK (half-open port scan)", "SYN Flood DDoS", "DNS Tunneling (high entropy, large TXT records, abnormal query frequency)", "TCP flags", "BPF filters"],
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
            "idealKeywords": ["NIST SP 800-61", "Containment (isolate infected hosts)", "network segmentation", "volatile memory capture (RAM dump)", "Eradication", "clean backup restoration", "Lessons Learned / Post-Mortem", "chain of custody"],
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
            "idealKeywords": ["SIEM", "Splunk SPL / KQL", "MITRE ATT&CK (Initial Access -> Execution -> Persistence -> Lateral Movement)", "alert correlation", "false positive reduction", "threshold rules", "UEBA"],
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
            "idealKeywords": ["MITRE ATT&CK T1003", "LSASS memory dumping", "Sysmon Event ID 10 (ProcessAccess)", "Mimikatz", "Procdump", "rundll32", "GrantedAccess masks (0x1010, 0x1F3FFF)", "Credential Guard"],
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
            "idealKeywords": ["Zero Trust (Never Trust, Always Verify)", "NIST SP 800-207", "Policy Decision Point (PDP) / Policy Enforcement Point (PEP)", "Identity-Aware Proxy (IAP)", "microsegmentation", "device health posture", "least privilege"],
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
            "idealKeywords": ["AWS IAM", "least privilege", "privilege escalation (iam:PassRole, iam:AttachUserPolicy)", "CloudTrail with log file validation", "S3 Object Lock (WORM)", "GuardDuty machine learning", "KMS envelope encryption"],
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
            "idealKeywords": ["SOAR", "automated playbooks", "mean time to detect (MTTD)", "mean time to respond (MTTR)", "analyst burnout", "API integrations (EDR, Firewall, IAM)", "human-in-the-loop approvals"],
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
            "idealKeywords": ["Red Team vs Blue Team", "Purple Team collaboration", "Rules of Engagement (RoE)", "deconfliction protocol", "threat intelligence led (TIBER-EU)", "crown jewels scoping", "remediation roadmap"],
            "rubric": {
                "correctness": "Establishes clear Rules of Engagement, white-cell oversight, trusted agent emergency stop protocols, and formal deconfliction logging.",
                "depth": "Advocates for Purple Teaming where Red Team demonstrates exact attack telemetry to Blue Team engineers in real-time to immediately harden detection rules.",
                "clarity": "Elite executive governance and mature security culture.",
                "examples": "Simulating a sophisticated nation-state APT group targeting source code repositories and payment rails."
            },
            "followUp": "How do you report the outcomes of a devastatingly successful Red Team operation to the Board of Directors without causing panic or scapegoating?"
        }
    ]
}

print("Part 2 defined with roles:", list(PART2_DATA.keys()))
