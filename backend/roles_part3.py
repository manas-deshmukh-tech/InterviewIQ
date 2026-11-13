# Roles Part 3: UI/UX Designer, Business Analyst, HR Interview, General Fresher Interview, Custom Role

PART3_DATA = {
    "UI/UX Designer": [
        {
            "id": "uiux_entry_1",
            "question": "What is the difference between UI (User Interface) and UX (User Experience)? How do qualitative user interviews differ from quantitative analytics in user research?",
            "topic": "User Research & Persona Building",
            "questionType": "conceptual",
            "level": "Fresher / Entry",
            "idealKeywords": ["UI visual touchpoints", "UX overall journey and feel", "qualitative insights (why users struggle)", "quantitative metrics (what users do)", "empathy", "usability", "wireframes vs visual design"],
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
            "idealKeywords": ["Nielsen heuristics", "Visibility of system status (spinners, progress bars)", "Error prevention (destructive confirm dialogs)", "User control and freedom (undo action)", "Consistency and standards", "Recognition over recall"],
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
            "idealKeywords": ["Visual hierarchy", "typographic scale (H1 to caption)", "negative / white space", "F-pattern and Z-pattern reading", "contrast ratio (WCAG 4.5:1)", "primary vs secondary CTA", "focal point"],
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
            "idealKeywords": ["WCAG 2.1 AA", "contrast ratio 4.5:1 for normal text (3:1 for large)", "ARIA attributes (aria-label, aria-live)", "focus visible indicators", "keyboard navigability (tabindex)", "screen reader semantics", "alt text"],
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
            "idealKeywords": ["Design System", "Design Tokens", "Atomic design (atoms, molecules, organisms)", "Figma Auto-layout", "component variants and properties", "semantic naming conventions", "developer handoff"],
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
            "idealKeywords": ["Usability testing protocol", "screener questions", "think-aloud protocol", "unbiased task prompts", "Affinity diagram / clustering", "usability metrics (SUS, completion rate, time-on-task)", "actionable redesign recommendations"],
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
            "idealKeywords": ["Information Architecture (IA)", "site map", "user flow", "Open vs Closed Card Sorting", "Tree Testing (findability test)", "cognitive load reduction", "progressive disclosure"],
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
            "idealKeywords": ["Design handoff", "design tokens sync", "Figma Dev Mode", "edge case documentation (empty states, error states, truncated text)", "motion specs (easing curves, duration)", "Design QA / visual review", "shared component governance"],
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
            "idealKeywords": ["A/B testing", "CRO (Conversion Rate Optimization)", "funnel drop-off analysis", "hypothesis formulation", "micro-conversions vs primary KPI", "heatmaps and session recordings", "iterative design"],
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
            "idealKeywords": ["Legacy modernization", "muscle memory", "power users", "opt-in beta toggle", "in-app onboarding guided tours", "keyboard shortcut parity", "feedback loops", "telemetry tracking"],
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
            "idealKeywords": ["UX ROI", "customer lifetime value (LTV)", "churn reduction", "NPS / CSAT correlation with revenue", "support ticket deflection", "executive storytelling", "design maturity model"],
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
            "idealKeywords": ["Cross-platform design", "Apple HIG (Human Interface Guidelines)", "Google Material Design 3", "platform-native paradigms (bottom tab bar vs top navigation)", "unified brand voice", "responsive design", "design governance"],
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
            "idealKeywords": ["Functional requirements (what system does)", "Non-Functional requirements (how well system performs)", "user authentication", "fund transfer", "latency / response time (<200ms)", "availability (99.99%)", "security (encryption, PCI-DSS)"],
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
            "idealKeywords": ["User Story formula (As a [user], I want [action], so that [benefit])", "INVEST criteria", "Independent", "Negotiable", "Valuable", "Estimable", "Small", "Testable", "acceptance criteria"],
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
            "idealKeywords": ["SWOT Analysis (Internal vs External)", "Strengths", "Weaknesses", "Opportunities", "Threats", "Gap Analysis (Current State As-Is vs Future State To-Be)", "feasibility study", "business case"],
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
            "idealKeywords": ["BPMN 2.0", "Pools and Swimlanes (department boundaries)", "Exclusive Gateway (XOR - one path)", "Parallel Gateway (AND - all paths concurrently)", "Inclusive Gateway (OR)", "Events (start, intermediate, end)", "process optimization / bottleneck removal"],
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
            "idealKeywords": ["Given (precondition)", "When (user action)", "Then (expected outcome)", "And / But", "Gherkin syntax", "BDD (Behavior-Driven Development)", "Cucumber / SpecFlow", "edge cases (expired coupon, minimum order threshold)"],
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
            "idealKeywords": ["Scope Creep", "Change Request (CR)", "Impact Analysis (cost, schedule, resources, risk)", "Change Control Board (CCB)", "trade-off negotiation", "backlog reprioritization (MoSCoW)", "baseline requirements"],
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
            "idealKeywords": ["Requirements elicitation", "Joint Application Development (JAD) workshops", "unaligned stakeholders", "conflict resolution", "active listening", "prototyping for alignment", "RACI matrix"],
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
            "idealKeywords": ["Requirements Traceability Matrix (RTM)", "Forward traceability (Goal -> Feature -> Code -> Test)", "Backward traceability (Defect -> Requirement -> Business Need)", "compliance / audit readiness", "impact analysis", "orphan requirements"],
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
            "idealKeywords": ["Cost-Benefit Analysis (CBA)", "ROI (Return on Investment)", "Net Present Value (NPV)", "Internal Rate of Return (IRR)", "Payback Period", "CapEx vs OpEx", "tangible vs intangible benefits", "total cost of ownership (TCO)"],
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
            "idealKeywords": ["User Acceptance Testing (UAT)", "validation vs verification", "root cause of misalignment", "gap between specs and business intent", "collaborative resolution", "triage framework", "lessons learned"],
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
            "idealKeywords": ["Business Architecture", "Business Capability Modeling", "Strategic Alignment", "Target Operating Model (TOM)", "enterprise value stream mapping", "portfolio rationalization", "C-suite advisory"],
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
            "idealKeywords": ["Change Management", "Prosci ADKAR model (Awareness, Desire, Knowledge, Ability, Reinforcement)", "Kotter's 8-Step Change model", "change champion network", "user adoption metrics", "resistance management", "training strategy"],
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
            "idealKeywords": ["Pillar 1: Name and degree (BCA, MCA, B.Tech, etc.)", "Pillar 2: Technical stack and programming languages", "Pillar 3: Projects built and problem solving", "Pillar 4: Passion and career aspirations", "concise delivery (90-120 seconds)"],
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
            "idealKeywords": ["Company research (products, culture, engineering blog)", "alignment with mission", "3-5 year growth trajectory", "continuous learning", "mentorship and ownership", "value contribution"],
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
            "idealKeywords": ["STAR framework (Situation, Task, Action, Result)", "time management", "prioritization", "overcoming obstacles", "team communication", "successful outcome"],
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
            "idealKeywords": ["Conflict resolution", "active listening", "focus on objective data / metrics", "empathy", "de-escalation", "collaborative compromise", "respectful communication"],
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
            "idealKeywords": ["Extreme ownership", "accountability", "containment", "blameless post-mortem", "root cause identification", "corrective actions implemented", "preventing regression"],
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
            "idealKeywords": ["Adaptability", "navigating ambiguity", "clarifying questions", "lean MVP approach", "agile mindset", "focus on business value", "calm temperament"],
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
            "idealKeywords": ["Growth mindset", "receptiveness to feedback", "non-defensive reaction", "self-reflection", "actionable improvement plan", "measurable progress"],
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
            "idealKeywords": ["Mentorship", "coaching vs directive management", "empathy", "pairing sessions", "delegating stretch assignments", "psychological safety", "career growth celebration"],
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
            "idealKeywords": ["Sustainable engineering cadence", "burnout prevention", "work-life balance", "pushing back on unrealistic deadlines", "prioritizing high-leverage tasks", "protecting team focus"],
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
            "idealKeywords": ["Influence without authority", "stakeholder consensus", "data-backed proposal (RFC / POC)", "building coalitions", "empathizing with business constraints", "clear technical communication"],
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
            "idealKeywords": ["Psychological safety (Amy Edmondson)", "blameless culture", "high accountability", "calculated risk-taking", "transparent communication", "rewarding thoughtful failures", "diversity of thought"],
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
            "idealKeywords": ["Diversity, Equity & Inclusion (DEI)", "unconscious bias mitigation", "structured interview rubrics", "diverse interview panels", "equitable promotion calibration", "mentorship and sponsorship programs", "inclusive culture"],
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
            "idealKeywords": ["Name, university, and degree (BCA, MCA, B.Tech, B.Sc)", "Key subjects (Data Structures, DBMS, OS, OOP)", "Programming languages (Java, Python, C++, JavaScript)", "Projects and internships", "Career enthusiasm"],
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
            "idealKeywords": ["Problem statement", "Tech stack selection (frontend, backend, database)", "Individual contribution vs team roles", "System architecture", "Challenges overcome", "Outcomes and learnings"],
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
            "idealKeywords": ["Procedural (functions, top-down, shared state)", "Object-Oriented (objects, classes, encapsulation)", "data hiding", "code reusability", "modularity", "maintenance"],
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
            "idealKeywords": ["Big-O notation", "Worst-case performance", "O(1) constant", "O(n) linear", "O(n log n) Merge Sort / Quick Sort", "O(n^2) Bubble Sort / Selection Sort", "input growth scalability"],
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
            "idealKeywords": ["Git version control", "git fetch (downloads commits without merging)", "git pull (fetch + merge)", "merge conflict markers (<<<<<<<, =======, >>>>>>>)", "staging area", "commit history", "branching"],
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
            "idealKeywords": ["Primary Key (unique, not null)", "Foreign Key (references primary key of another table)", "referential integrity (ON DELETE CASCADE, RESTRICT)", "Unique constraint", "Index for fast lookup", "RDBMS"],
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
            "idealKeywords": ["Continuous learning", "tech blogs and documentation", "GitHub open-source exploration", "coding platforms (LeetCode, HackerRank)", "podcasts / YouTube channels", "building weekend prototypes"],
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
            "idealKeywords": ["Teamwork", "collaboration", "empathy and communication", "dividing tasks clearly", "understanding roadblocks", "accountability", "delivering on time"],
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
            "idealKeywords": ["Client-server model", "HTTP request/response cycle", "DNS resolution", "TCP connection", "backend web server (routes, controllers)", "SQL database query execution", "JSON payload", "DOM rendering"],
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
            "idealKeywords": ["Troubleshooting methodology", "reading stack traces", "print debugging vs IDE debugger", "breakpoints and variable inspection", "reproducing with minimal test case", "binary search isolation", "rubber duck debugging"],
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
            "idealKeywords": ["30-60-90 day plan", "Day 1-30: Dev environment, reading codebase, understanding architecture, asking smart questions", "Day 31-60: Fixing small bugs, writing unit tests, first small PRs", "Day 61-90: Autonomous feature ownership, documenting lessons learned"],
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
            "idealKeywords": ["Clean code", "readability", "meaningful variable names", "modular functions", "technical debt", "temporary workarounds vs permanent hacks", "documentation and comments"],
            "rubric": {
                "correctness": "Articulates that code is read 10 times more often than it is written; readability and testability trump cleverness.",
                "depth": "Acknowledges that temporary workarounds are sometimes necessary for critical live hotfixes, but must be accompanied by a tracked ticket and refactored immediately.",
                "clarity": "Engineering maturity well beyond fresher average.",
                "examples": "Refactoring a 200-line monolithic function into small, single-purpose reusable functions with unit tests."
            },
            "followUp": "What is code review etiquette and how should you respond when a senior engineer asks for significant changes to your pull request?"
        }
    ]
}

print("Part 3 defined with roles:", list(PART3_DATA.keys()))
