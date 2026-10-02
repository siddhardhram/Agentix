# 🤖 Agentix — Autonomous Agentic Issue Resolution Platform

> An end-to-end autonomous agent system designed to triage, investigate, patch, test, and audit software tickets and operational issues with human-in-the-loop governance.

---

## 📐 Architecture & Flow

```
                         ┌─────────────────────────┐
                         │        USER / DEV        │
                         │   Repository + Ticket   │
                         └────────────┬─────────────┘
                                      ▼
                         ┌─────────────────────────┐
                         │     TICKET INTAKE       │
                         │       (React UI)        │
                         └────────────┬─────────────┘
                                      ▼
                         ┌─────────────────────────┐
                         │     DUPLICATE CHECK     │  (Vector similarity match
                         │  (merge if match found) │   across recent tickets)
                         └────────────┬─────────────┘
                                      ▼
                         ┌─────────────────────────┐
                         │     CLASSIFICATION      │
                         │  • Issue type           │
                         │  • Severity (P0 - P3)   │
                         │  • Route: Ops / Code    │
                         └────────────┬─────────────┘
                              enough info? ──NO──▶ Ask Clarifying Question
                                      │YES               (back to user)
                                      ▼
                    ┌──────────────────────────────────┐
                    │       AGENT ORCHESTRATOR         │
                    │            (FastAPI)             │
                    │  • State • Routing • Retries     │
                    │  • Failure handling              │
                    │  • Cost/time budget per ticket   │
                    └───────────────┬──────────────────┘
                  ┌──────────────────┴──────────────────┐
                  ▼                                      ▼
       ┌──────────────────────┐             ┌──────────────────────┐
       │   OPERATIONAL ISSUE  │             │       CODE BUG       │
       └──────────┬────────────┘             └──────────┬────────────┘
                  ▼                                      ▼
       ┌──────────────────────┐             ┌──────────────────────┐
       │  Investigation Agent │             │ Repository Agent     │
       │  • Logs              │             │ • Repo structure scan│
       │  • DB (read-only)    │             │ • AST / Symbol index │
       │  • API status checks │             │ • Code keyword search│
       └──────────┬────────────┘             │ • Docs / Semantic RAG│
                  │                         └──────────┬───────────┘
                  └──────────────────────┬─────────────────┘
                                         ▼
                         ┌─────────────────────────┐
                         │      LLM REASONING      │
                         │  • Tool calling         │
                         │  • Root cause analysis  │
                         │  • Structured output    │
                         └────────────┬─────────────┘
                                      ▼
                         ┌─────────────────────────┐
                         │   RISK / POLICY ENGINE  │
                         │  LOW → Auto             │
                         │  MEDIUM → Approval      │
                         │  HIGH → Escalation      │
                         └────────────┬─────────────┘
                     ┌────────────────┼────────────────┐
                     ▼                ▼                 ▼
                   LOW             MEDIUM              HIGH
                     ▼                ▼                 ▼
                 Execute       Human Approval       Escalate with
                 Action        (auto-escalate on      Evidence Package
                     │          timeout if unanswered)      │
                     └────────────────┬────────────────┘
                                      ▼
                          CODE-FIX PATH ONLY
                                      ▼
                         ┌─────────────────────────┐
                         │     CODE PATCH / DIFF   │
                         └────────────┬─────────────┘
                                      ▼
                         ┌─────────────────────────┐
                         │     LOCAL SANDBOX       │
                         │  • Tests • Build • Lint │
                         │  • Basic security check │
                         └────────────┬─────────────┘
                              ┌───────┴────────┐
                              ▼                ▼
                            PASS              FAIL
                              ▼                ▼
                       Final Patch       Failure Analysis
                              │                ▼
                              │             Retry Loop
                              │        ┌───────┴───────┐
                              │        ▼               ▼
                              │      Pass          Retry limit hit
                              │        │               ▼
                              └────────┘          Escalate w/ diff
                                                    history + logs
                                      │
                                      ▼
                         ┌─────────────────────────┐
                         │   VERIFICATION + AUDIT  │
                         │  • Final state re-check │
                         │  • Evidence & tool logs │
                         │  • Immutable audit log  │
                         └────────────┬─────────────┘
                                      ▼
                         ┌─────────────────────────┐
                         │   POST-ACTION MONITOR   │  (Observation window
                         │   (auto-fixes only)     │   for new regressions)
                         └────────────┬─────────────┘
                          OK ──┤              ├── NEW ISSUE
                               ▼              ▼
                            RESOLVED       AUTO-ROLLBACK + Escalate
                               ▼
                    ┌─────────────────────────┐
                    │   INSTITUTIONAL MEMORY  │  (Store issue → cause →
                    │ (Vector store for reuse)│   fix → outcome)
                    └────────────┬─────────────┘
                                 ▼
                    ┌─────────────────────────┐
                    │   NOTIFY USER + CLOSE   │
                    └─────────────────────────┘
```

---

## 🗂️ Local Folder Structure

```text
Agentix/
├── README.md                            # Comprehensive project guide & architecture
├── .env.example                         # Environment variables template
├── .gitignore                           # Git ignore rules
│
├── backend/                             # Python / FastAPI Orchestrator
│   ├── requirements.txt                 # Backend dependencies
│   ├── main.py                          # FastAPI server entrypoint
│   └── app/
│       ├── api/
│       │   └── v1/
│       │       ├── tickets.py           # Ticket submission, list, details
│       │       ├── approvals.py         # Human-in-the-loop decisions
│       │       ├── clarification.py     # Q&A conversation loop
│       │       ├── audit.py             # Audit trail & evidence package
│       │       └── ws.py                # Live WebSocket telemetry stream
│       │
│       ├── core/
│       │   ├── config.py                # Environment settings & budgets
│       │   ├── llm_provider.py          # LLM client abstraction (OpenAI, Gemini, Ollama, Mock)
│       │   └── security.py              # Auth & token validation
│       │
│       ├── orchestrator/
│       │   ├── state.py                 # TicketState, ExecutionBudget, History
│       │   ├── graph.py                 # Core state machine engine
│       │   ├── budget_controller.py     # Cost, token, tool call & time guardrails
│       │   └── retry_policy.py          # Backoff & maximum retry logic
│       │
│       ├── agents/
│       │   ├── base.py                  # Agent base class & protocol
│       │   ├── triage_agent.py          # Duplicate detector & issue classifier
│       │   ├── operational_agent.py     # Log analyzer, DB reader & health monitor
│       │   ├── repo_agent/              # Code Comprehension Agent
│       │   │   ├── scanner.py           # Directory & file structure scanner
│       │   │   ├── ast_indexer.py       # Python/JS AST symbols, classes, functions
│       │   │   └── code_search.py       # Keyword & fuzzy code searcher
│       │   ├── coder_agent.py           # Diff generator & patch creator
│       │   └── verifier_agent.py        # Post-action & canary monitor
│       │
│       ├── tools/
│       │   ├── git_tools.py             # Local git checkout, diff, branch, revert
│       │   ├── log_tools.py             # Local log parsing & error regex
│       │   ├── db_tools.py              # Read-only SQL query validator
│       │   └── http_tools.py            # Local HTTP endpoint health checks
│       │
│       ├── policy/
│       │   ├── risk_engine.py           # Risk assessment: LOW / MEDIUM / HIGH
│       │   └── approval_manager.py      # Timeout tracking & escalation package
│       │
│       ├── sandbox/
│       │   ├── local_runner.py          # Isolated local subprocess test & lint executor
│       │   ├── test_runner.py           # Pytest / npm test harness runner
│       │   └── rollback_manager.py      # Automated git reset & revert
│       │
│       ├── memory/
│       │   ├── vector_store.py          # Local vector store (ChromaDB / TF-IDF fallback)
│       │   ├── institutional_memory.py  # Issue → Cause → Fix knowledge store
│       │   └── audit_logger.py          # Append-only immutable JSONL audit ledger
│       │
│       └── models/
│           ├── ticket.py                # Ticket schemas & enums
│           ├── audit.py                 # Audit trail & evidence schemas
│           └── approval.py              # Approval request & decision schemas
│
├── frontend/                            # React + Vite Interactive Cockpit
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── components/
│       │   ├── TicketIntakeForm.jsx     # Ticket & repo intake with instant feedback
│       │   ├── ClarificationPrompt.jsx  # Interactive Q&A for missing info
│       │   ├── LiveOrchestratorView.jsx # Dynamic stage-by-stage execution graph
│       │   ├── ApprovalDrawer.jsx       # Diff viewer with 1-click Approve/Reject
│       │   ├── EvidencePackageModal.jsx # Escalation bundle for high-risk issues
│       │   └── AuditLedger.jsx          # Historical decision & tool-call explorer
│       ├── pages/
│       │   ├── Dashboard.jsx            # Ticket overview & triage status
│       │   └── TicketDetail.jsx         # Live telemetry & control cockpit
│       ├── services/
│       │   └── api.js                   # REST & WebSocket client
│       └── styles/
│           └── index.css                # Premium dark glassmorphism design system
│
└── demo_repos/                          # Local sample repositories for testing
    └── sample_calc/                     # Sample repo with deliberate bugs for end-to-end tests
        ├── calc.py
        └── test_calc.py
```

---

## 🚀 Getting Started (Local Setup)

### Prerequisites
- **Python**: 3.10+ (tested on Python 3.13)
- **Node.js**: v18+ (tested on v22)
- **Git** installed and available in PATH

### 1. Backend Setup
```bash
cd backend
python -m venv venv

# Windows PowerShell:
.\venv\Scripts\Activate.ps1

# Linux / macOS:
source venv/bin/activate

pip install -r requirements.txt
cp ../.env.example .env
python main.py
```
*Backend runs locally at: `http://localhost:8000` (API Docs at `/docs`)*

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs locally at: `http://localhost:5173`*

---

## 🛡️ Risk & Policy Tiering

| Tier | Criteria | Action |
|---|---|---|
| **LOW** | Minor docs, typos, read-only operational checks | Auto-executes, records audit log |
| **MEDIUM** | Standard bug fixes, non-breaking refactors | Pauses for human approval via UI (auto-escalates on timeout) |
| **HIGH** | DB schema, auth/security code, payment flows | Auto-escalates with a packaged Evidence Bundle |

---

## 🔮 Future Roadmap (Containerization & Cloud)
1. **Dockerized Ephemeral Sandbox**: Move the local subprocess sandbox to isolated ephemeral Docker containers (`sandbox_templates/`).
2. **Cloud Deployment**: Helm chart / Docker Compose for AWS/GCP, multi-tenant Postgres + Redis Celery queues.
3. **Enterprise SCM Integrations**: Direct GitHub App & GitLab webhooks for automated PR creation.
