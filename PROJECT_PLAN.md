# 🤖 Agentix — Master Project Plan & System Architecture (v2.0)

**Document Version**: 2.0  
**Status**: Approved & Updated with Authentication & RBAC Governance  
**Target Platform**: FastAPI (Backend Orchestrator) + React/Vite (Interactive Cockpit)

---

## 📋 Table of Contents
1. [Executive Summary & Problem Statement](#1-executive-summary--problem-statement)
2. [High-Level Objectives & Key Results (OKRs)](#2-high-level-objectives--key-results-okrs)
3. [User Personas & Role Matrix](#3-user-personas--role-matrix)
4. [System Flow & State Machine](#4-system-flow--state-machine)
5. [Core Agents & Responsibilities](#5-core-agents--responsibilities)
6. [System Architecture & Human-in-the-Loop Governance](#6-system-architecture--human-in-the-loop-governance)
7. [Data Models & Ticket Intake Schema](#7-data-models--ticket-intake-schema)
8. [Risk Engine & Policy Guardrails](#8-risk-engine--policy-guardrails)
9. [Functional Requirements](#9-functional-requirements)
10. [Non-Functional & Reliability Requirements](#10-non-functional--reliability-requirements)
11. [Repository Comprehension & Code Sandbox](#11-repository-comprehension--code-sandbox)
12. [Final Edge Cases & Failure Recovery](#12-final-edge-cases--failure-recovery)
13. [Authentication & Role-Based Access Control (RBAC)](#13-authentication--role-based-access-control-rbac)
14. [Implementation Roadmap & Build Order](#14-implementation-roadmap--build-order)

---

## 1. Executive Summary & Problem Statement
Modern software engineering teams spend disproportionate hours triaging duplicate tickets, diagnosing repetitive operational failures, parsing stack traces, and implementing routine patches. **Agentix** is an autonomous agentic platform that triages, investigates, patches, verifies, and audits issues end-to-end. By pairing repository comprehension with rigorous risk policies and role-gated human oversight, Agentix automates routine workflows while guaranteeing safety and compliance.

---

## 2. High-Level Objectives & Key Results (OKRs)
- **Objective 1: Autonomous Resolution** — Auto-resolve >60% of low-risk operational/code bugs with 0 human intervention.
- **Objective 2: Human-in-the-Loop Safety** — 100% of medium-risk diffs gated by authenticated developer approvals; 100% of high-risk actions packaged as immutable evidence bundles.
- **Objective 3: Zero Regressions** — Sandbox verification and post-action monitoring with automated rollback on failure.
- **Objective 4: Enterprise Auditability** — Tamper-evident JSONL audit ledger tracking every LLM prompt, tool call, risk score, and role-authorized decision.

---

## 3. User Personas & Role Matrix

| Role | Target User | Capabilities & Permissions |
| :--- | :--- | :--- |
| `user` | QA / Support / Reporter | Submit tickets, view tickets raised by self, answer clarification prompts. |
| `developer` | Software Engineer / DevOps | All `user` permissions + review & approve/reject code diffs in Approval Drawer, run test sandbox, view live telemetry & AST symbols. |
| `admin` | Lead Architect / SecOps | All `developer` permissions + access full Audit Ledger, configure execution budgets, force manual rollbacks and override policies. |

---

## 4. System Flow & State Machine

```
[Authenticated User] ──(Submits Ticket)──▶ [Ticket Intake API]
                                                   │
                                                   ▼
                                         [Duplicate Vector Check]
                                                   │
                                                   ▼
                                        [Classification & Triage]
                                                   │
                          ┌────────────────────────┴────────────────────────┐
                 (Info Missing)                                       (Sufficient Info)
                          │                                                 │
                          ▼                                                 ▼
               [Clarification Loop]                             [Orchestrator Graph]
               (Routes to ticket raiser)                                    │
                                                   ┌────────────────────────┴────────────────────────┐
                                                   ▼                                                 ▼
                                        [Operational Pipeline]                              [Code-Fix Pipeline]
                                        • Log analysis regex                                • Repo structure scan
                                        • Read-only DB health checks                        • AST symbol indexing
                                        • Endpoint status probing                           • Semantic / keyword search
                                                   │                                                 │
                                                   └────────────────────────┬────────────────────────┘
                                                                            │
                                                                            ▼
                                                                   [LLM Reasoning Core]
                                                                            │
                                                                            ▼
                                                                [Risk & Policy Engine]
                                                                            │
                                       ┌────────────────────────────────────┼────────────────────────────────────┐
                                       ▼                                    ▼                                    ▼
                                  [LOW RISK]                           [MEDIUM RISK]                        [HIGH RISK]
                                       │                                    │                                    │
                                 (Auto-Execute)                     [Approval Drawer]                  [Evidence Package]
                                       │                        (Developer/Admin Gated)             (SecOps/Admin Escalation)
                                       │                                    │                                    │
                                       └────────────────────────┬───────────┴────────────────────────────────────┘
                                                                ▼
                                                    [Local Sandbox Runner]
                                                    • Test harness execution
                                                    • Lint & syntax verification
                                                                │
                                                   ┌────────────┴────────────┐
                                                   ▼                         ▼
                                                [PASS]                    [FAIL]
                                                   │                         │
                                                   │                 [Retry / Escalation]
                                                   ▼
                                       [Verification & Canary Check]
                                                   │
                                                   ▼
                                     [Immutable JSONL Audit Ledger]
                                                   │
                                                   ▼
                                     [Institutional Vector Memory]
                                                   │
                                                   ▼
                                    [Notify Authenticated Raiser]
```

---

## 5. Core Agents & Responsibilities
1. **Triage Agent**: Checks duplicate embeddings against historical issues, classifies issue type (Code vs. Ops), assesses initial priority (P0–P3), and triggers clarification Q&A if specifications are incomplete.
2. **Operational Agent**: Executes read-only system diagnosis via bounded shell commands, health check probes, log grep/regex analyzers, and non-destructive DB inspection.
3. **Repository Comprehension Agent**: Navigates codebase structure, creates AST symbol tables (functions, classes, dependencies), and performs targeted context retrieval.
4. **Coder Agent**: Synthesizes minimal surgical git diffs using unified diff formats, preserving repository coding styles and conventions.
5. **Verifier Agent**: Runs automated test suites in an isolated sandbox, monitors post-fix telemetry, and triggers automated rollbacks if regressions emerge.

---

## 6. System Architecture & Human-in-the-Loop Governance

### Architectural Components
- **API Gateway & RBAC Layer**: FastAPI gateway verifying user tokens and enforcing `require_role(["developer", "admin"])` for human decision points.
- **Orchestrator Engine**: Async directed acyclic graph (DAG) state machine with execution budgets, token caps, and timeout guards.
- **Human-in-the-Loop Approval Queue**:
  - **Medium-Risk Gate**: Pauses orchestrator execution; emits real-time WebSocket notifications. Only users with role `developer` or `admin` can sign off or reject.
  - **High-Risk Escalation**: Generates a self-contained Evidence Package (diff, risk justification, failed tests, execution trace) routed specifically to `admin` / lead developers.
  - **Timeout Protection**: Automatically transitions to `ESCALATED` state if no authenticated review is received within configured timeout (e.g., 300s).

---

## 7. Data Models & Ticket Intake Schema

### Updated Ticket Schema (`models/ticket.py`)
```python
class TicketCreate(BaseModel):
    title: str
    description: str
    repo_path: Optional[str] = None
    priority: PriorityEnum = PriorityEnum.P2
    # Authenticated User Identity (bound to session)
    raised_by: str = Field(..., description="Authenticated user ID / username")
    raised_by_role: str = Field(default="user", description="Caller role: user | developer | admin")

class Ticket(TicketCreate):
    id: str = Field(default_factory=lambda: f"tkt_{uuid.uuid4().hex[:8]}")
    status: TicketStatus
    issue_type: Optional[IssueType] = None
    risk_tier: Optional[RiskTier] = None
    created_at: datetime
    updated_at: datetime
    audit_trail: List[str] = []
```

---

## 8. Risk Engine & Policy Guardrails

| Risk Tier | Trigger Conditions | Action / Policy | Authorization Required |
| :--- | :--- | :--- | :--- |
| **LOW** | Read-only operational probes, documentation typos, formatting, localized non-critical bugs. | Auto-executes fix & sandbox tests; logs execution to audit trail. | Autonomous (`system`) |
| **MEDIUM** | Code logic changes, function refactors, non-breaking bug fixes. | Generates diff, pauses execution, opens Approval Drawer. | `developer` or `admin` |
| **HIGH** | Database migrations, authentication/crypto code, financial/payment flows, destructive operations. | Halts auto-remediation; compiles full Evidence Package for manual handoff. | `admin` |

---

## 9. Functional Requirements

- **FR-01: Authenticated Ticket Intake** — All ticket creations must bind to a verified `raised_by` user profile.
- **FR-02: Duplicate Detection** — Vector similarity scoring across existing unresolved issues to prevent fragmented fixes.
- **FR-03: Interactive Clarification** — Prompt raisers with targeted clarification questions when ticket ambiguity exceeds threshold.
- **FR-04: Multi-Tier Risk Evaluation** — Deterministic policy matching + LLM reasoning to tag issues as LOW, MEDIUM, or HIGH risk.
- **FR-05: Server-Side Role Gating (RBAC)** — Approval, rejection, rollback override, and audit inspection endpoints must be strictly enforced via `require_role()` dependencies returning HTTP 403 Forbidden on violation.
- **FR-06: Sandbox Test & Lint Execution** — Execute unit tests in an isolated local runner before accepting any diff.
- **FR-07: Automated Rollback** — Immediate `git revert` / reset if post-patch verification fails or canary checks detect new errors.
- **FR-08: Immutable Audit Logging** — Append-only JSONL recording every step, tool invocation, token count, and human actor ID.
- **FR-09: Institutional Memory** — Vector-indexed storage of successful fixes for fast retrieval on recurring incidents.

---

## 10. Non-Functional & Reliability Requirements
- **Execution Budgets**: Hard limits on token usage, execution time (max 180s per agent stage), and max retry loops (default 3 retries).
- **Security & Sandboxing**: Read-only DB queries, path traversal prevention, and sanitized CLI execution.
- **Latency & Streaming**: Live stage telemetry over WebSockets to React cockpit (<100ms latency).

---

## 11. Repository Comprehension & Code Sandbox
- **AST Symbol Indexing**: Tree-sitter / `ast` parsing for Python & JavaScript to map dependencies, call graphs, and class definitions.
- **Isolated Subprocess Sandbox**: Runs `pytest` or `npm test` without polluting the developer's main branch.
- **Unified Diff Formats**: Standard patch application with fallback syntax checkers.

---

## 12. Final Edge Cases & Failure Recovery

| Edge Case | Failure Mode | System Response |
| :--- | :--- | :--- |
| **Unanswered Clarification** | User abandons ticket | 24h grace window, then transitions to `PENDING_INPUT_TIMEOUT` with notification to raiser. |
| **Approval Timeout** | Developer does not review diff | Automatic transition from `AWAITING_APPROVAL` to `ESCALATED_TIMEOUT` with full Evidence Package. |
| **Sandbox Test Failure** | Coder patch introduces regression | Retry loop (max 3) with failure logs fed back to Coder Agent; escalates if retries exhausted. |
| **Role Violation Attempt** | Unauthorized user clicks Approve | Server rejects with HTTP 403; UI displays permission warning banner. |
| **Git Merge Conflict** | Upstream branch moved | Re-syncs working tree, generates rebased patch, or marks for manual developer resolution. |

---

## 13. Authentication & Role-Based Access Control (RBAC)

### Architecture
- **Unified Auth Gateway**: Single login and registration interface (`Login.jsx`, `Register.jsx`, `auth.js`).
- **Session & Token Management**: JWT / secure bearer header passing user ID and role (`X-User-Role`, `X-User-Id`).
- **Server-Side Enforcement**: 
  ```python
  # backend/app/core/security.py
  @router.post("/tickets/{ticket_id}/approve", dependencies=[Depends(require_role(["developer", "admin"]))])
  async def approve_ticket(ticket_id: str, decision: ApprovalDecision):
      ...
  ```
- **Client-Side Adaptation**: Dynamic UI rendering based on active role (e.g. read-only drawer for standard users, actionable buttons for developers/admins).

---

## 14. Implementation Roadmap & Build Order

```
[Phase 1: Foundation & Security]
  ├── Step 1.1: Core Data Models & Schemas (models/ticket.py, approval.py, audit.py)
  ├── Step 1.2: Server-Side RBAC & Auth Core (security.py, require_role dependency)
  └── Step 1.3: Frontend Auth Flow (Login.jsx, Register.jsx, auth.js, AuthContext)

[Phase 2: Agent Orchestration & Core Pipeline]
  ├── Step 2.1: Orchestrator State Machine & Execution Budget (graph.py, state.py, budget_controller.py)
  ├── Step 2.2: Triage & Clarification Agent (triage_agent.py, clarification.py)
  ├── Step 2.3: Repository Comprehension & AST Scanner (scanner.py, ast_indexer.py, code_search.py)
  ├── Step 2.4: Operational & Coder Agents (operational_agent.py, coder_agent.py)
  └── Step 2.5: Risk Policy Engine (risk_engine.py)

[Phase 3: Human Governance & Sandbox Execution]
  ├── Step 3.1: Sandbox Runner & Test Harness (local_runner.py, test_runner.py, rollback_manager.py)
  ├── Step 3.2: Role-Gated Approval API & Drawer (approvals.py, ApprovalDrawer.jsx)
  └── Step 3.3: Escalation & Evidence Package (EvidencePackageModal.jsx)

[Phase 4: Audit, Memory & Polish]
  ├── Step 4.1: Immutable JSONL Audit Ledger & Explorer (audit_logger.py, AuditLedger.jsx)
  ├── Step 4.2: Institutional Memory Store (institutional_memory.py, vector_store.py)
  └── Step 4.3: End-to-End Verification & Real-Time Telemetry (ws.py, LiveOrchestratorView.jsx)
```
