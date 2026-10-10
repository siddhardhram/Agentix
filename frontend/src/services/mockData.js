/**
 * Agentix Enterprise Mock & Initial State Data
 * Comprehensive domain dataset representing the AI-agent issue resolution workflow.
 */

export const INITIAL_TICKETS = [
  {
    id: 'AX-1024',
    ticket_id: 'AX-1024',
    title: 'ZeroDivisionError crash in demo_repos/sample_calc/calc.py',
    description: 'calc.py divide() lacks zero check. Need to catch ZeroDivisionError or return safe None when denominator is 0.',
    repo_path: './demo_repos/sample_calc',
    branch: 'main',
    environment: 'staging',
    severity: 'P2',
    priority: 'High',
    risk_level: 'MEDIUM',
    status: 'INVESTIGATING',
    stage: 'INVESTIGATION',
    route: 'code',
    raised_by: 'Maya Patel',
    raised_by_role: 'user',
    raised_by_email: 'maya.patel@agentix.io',
    assignee: 'Alex Rivera',
    assignee_role: 'developer',
    created_at: '2026-10-04 09:15:00',
    updated_at: '2026-10-04 09:18:22',
    cost: '$0.04',
    tokens: '1,120',
    agent_status: {
      triage: 'completed',
      investigation: 'completed',
      repository_scan: 'running',
      fix_generation: 'waiting',
      verification: 'waiting',
      resolution: 'waiting'
    },
    investigation: {
      root_cause: 'ZeroDivisionError occurs when divisor evaluates to 0 without guard clause.',
      confidence: '96%',
      evidence: [
        'Stack trace points directly to calc.py:14 in divide(a, b)',
        'ZeroDivisionError reproduced in sandbox pytest test_calc.py',
        'AST node indicates unprotected binary operator Div(a, b)'
      ],
      target_file: 'demo_repos/sample_calc/calc.py',
      target_symbol: 'divide(a, b)',
      cyclomatic_complexity: 2
    },
    diff: {
      file: 'demo_repos/sample_calc/calc.py',
      summary: '+3 lines / -1 line',
      verifiedAgainst: 'test_calc.py (Pytest: 5/5 passed)',
      lines: [
        { type: 'header', content: '--- a/demo_repos/sample_calc/calc.py' },
        { type: 'header', content: '+++ b/demo_repos/sample_calc/calc.py' },
        { type: 'context', oldNum: 12, newNum: 12, content: ' def divide(a, b):' },
        { type: 'context', oldNum: 13, newNum: 13, content: '     """Divide a by b with safe zero handling."""' },
        { type: 'del', oldNum: 14, newNum: '', content: '-    return a / b' },
        { type: 'add', oldNum: '', newNum: 14, content: '+    if b == 0:' },
        { type: 'add', oldNum: '', newNum: 15, content: '+        raise ZeroDivisionError("Cannot divide by zero")' },
        { type: 'add', oldNum: '', newNum: 16, content: '+    return a / b' },
      ]
    },
    verification: {
      build: 'passed',
      tests: 'passed',
      lint: 'passed',
      security: 'passed',
      regression: 'passed',
      test_log: 'pytest test_calc.py -- 5 passed in 0.04s'
    },
    comments: [
      {
        id: 'c1',
        author: 'Agentix Triage Agent',
        role: 'system',
        timestamp: '09:15:05',
        text: 'Duplicate check completed: 0 duplicates. Ticket classified as Code Defect (P2) with localized blast radius.'
      },
      {
        id: 'c2',
        author: 'Maya Patel',
        role: 'user',
        timestamp: '09:16:10',
        text: 'Observed during unit testing of calculate invoice balance flow.'
      },
      {
        id: 'c3',
        author: 'Alex Rivera',
        role: 'developer',
        timestamp: '09:17:40',
        text: 'Reviewing the AST symbol graph. The proposed ZeroDivisionError raise matches strict typing requirements.'
      }
    ]
  },
  {
    id: 'AX-1025',
    ticket_id: 'AX-1025',
    title: 'PostgreSQL connection timeout in telemetry worker pool',
    description: 'DB pool connection count exceeded 100 on burst load during traffic surge. Telemetry workers dropped events.',
    repo_path: './backend',
    branch: 'release/v1.2',
    environment: 'production',
    severity: 'P0',
    priority: 'Critical',
    risk_level: 'HIGH',
    status: 'PENDING_APPROVAL',
    stage: 'APPROVAL',
    route: 'ops',
    raised_by: 'SRE System Alert',
    raised_by_role: 'user',
    raised_by_email: 'alerts@agentix.io',
    assignee: 'Alex Rivera',
    assignee_role: 'developer',
    created_at: '2026-10-04 08:40:00',
    updated_at: '2026-10-04 09:12:10',
    cost: '$0.12',
    tokens: '3,450',
    agent_status: {
      triage: 'completed',
      investigation: 'completed',
      repository_scan: 'completed',
      fix_generation: 'completed',
      verification: 'completed',
      resolution: 'waiting'
    },
    investigation: {
      root_cause: 'Connection pool default max_overflow was set to 20, exceeding limit on burst concurrency.',
      confidence: '98%',
      evidence: [
        'Worker error log: QueuePool limit of size 10 overflow 20 reached, connection timed out',
        'Database active sessions peaked at 124 during 08:35 traffic spike',
        'Normalized pool configuration restored capacity in sandbox stress harness'
      ],
      target_file: 'backend/app/core/database.py',
      target_symbol: 'create_async_engine()',
      cyclomatic_complexity: 4
    },
    diff: {
      file: 'backend/app/core/database.py',
      summary: '+3 lines / -1 line',
      verifiedAgainst: 'database_pool_health_check.py (Connections normalized to 20/100 pool capacity)',
      lines: [
        { type: 'header', content: '--- a/backend/app/core/database.py' },
        { type: 'header', content: '+++ b/backend/app/core/database.py' },
        { type: 'context', oldNum: 24, newNum: 24, content: ' engine = create_async_engine(' },
        { type: 'context', oldNum: 25, newNum: 25, content: '     settings.DATABASE_URL,' },
        { type: 'del', oldNum: 26, newNum: '', content: '-    pool_size=10, max_overflow=20' },
        { type: 'add', oldNum: '', newNum: 26, content: '+    pool_size=25, max_overflow=50,' },
        { type: 'add', oldNum: '', newNum: 27, content: '+    pool_timeout=30, pool_pre_ping=True,' },
        { type: 'add', oldNum: '', newNum: 28, content: '+    pool_recycle=1800' },
        { type: 'context', oldNum: 27, newNum: 29, content: ' )' },
      ]
    },
    verification: {
      build: 'passed',
      tests: 'passed',
      lint: 'passed',
      security: 'passed',
      regression: 'passed',
      test_log: 'Stress runner: 500 concurrent connection requests simulated with 0 dropped events.'
    },
    comments: [
      {
        id: 'c1',
        author: 'Agentix Policy Engine',
        role: 'system',
        timestamp: '08:42:00',
        text: 'Risk evaluation: HIGH RISK due to production DB configuration changes. Human sign-off required.'
      }
    ]
  },
  {
    id: 'AX-1021',
    ticket_id: 'AX-1021',
    title: 'Missing return type annotation in test_runner.py',
    description: 'Pyright strict typing alert: function returns Any without explicit annotation.',
    repo_path: './backend',
    branch: 'main',
    environment: 'development',
    severity: 'P3',
    priority: 'Low',
    risk_level: 'LOW',
    status: 'RESOLVED',
    stage: 'VERIFIED',
    route: 'code',
    raised_by: 'Sarah Chen',
    raised_by_role: 'admin',
    raised_by_email: 'sarah.chen@agentix.io',
    assignee: 'Liam Vance',
    assignee_role: 'developer',
    created_at: '2026-10-04 07:10:00',
    updated_at: '2026-10-04 07:12:45',
    cost: '$0.02',
    tokens: '540',
    agent_status: {
      triage: 'completed',
      investigation: 'completed',
      repository_scan: 'completed',
      fix_generation: 'completed',
      verification: 'completed',
      resolution: 'completed'
    },
    investigation: {
      root_cause: 'Function signature lacked explicit Dict[str, Any] return type annotation.',
      confidence: '100%',
      evidence: ['Pyright diagnostic code: reportUnknownMemberType'],
      target_file: 'backend/tests/test_runner.py',
      target_symbol: 'execute_isolated_suite()',
      cyclomatic_complexity: 1
    },
    diff: {
      file: 'backend/tests/test_runner.py',
      summary: '+2 lines / -1 line',
      verifiedAgainst: 'pyright test_runner.py (0 typing errors)',
      lines: [
        { type: 'header', content: '--- a/backend/tests/test_runner.py' },
        { type: 'header', content: '+++ b/backend/tests/test_runner.py' },
        { type: 'context', oldNum: 41, newNum: 41, content: ' from typing import Dict, Any, List, Optional' },
        { type: 'del', oldNum: 42, newNum: '', content: '-def execute_isolated_suite(suite_id, timeout=30):' },
        { type: 'add', oldNum: '', newNum: 42, content: '+def execute_isolated_suite(suite_id: str, timeout: int = 30) -> Dict[str, Any]:' },
        { type: 'context', oldNum: 43, newNum: 43, content: '     """Run test harness inside isolated container and collect telemetry."""' },
      ]
    },
    verification: {
      build: 'passed',
      tests: 'passed',
      lint: 'passed',
      security: 'passed',
      regression: 'passed',
      test_log: 'Pyright strict typing check: clean pass.'
    },
    comments: []
  },
  {
    id: 'AX-1028',
    ticket_id: 'AX-1028',
    title: 'Uncaught TypeError when session token expires mid-request',
    description: 'Null reference exception when user session cookie expires mid-request. Missing null-check in verify_token().',
    repo_path: './backend',
    branch: 'main',
    environment: 'staging',
    severity: 'P1',
    priority: 'High',
    risk_level: 'MEDIUM',
    status: 'IN_PROGRESS',
    stage: 'CODE_PATCH',
    route: 'code',
    raised_by: 'Maya Patel',
    raised_by_role: 'user',
    raised_by_email: 'maya.patel@agentix.io',
    assignee: 'Alex Rivera',
    assignee_role: 'developer',
    created_at: '2026-10-04 09:30:00',
    updated_at: '2026-10-04 09:34:10',
    cost: '$0.05',
    tokens: '1,450',
    agent_status: {
      triage: 'completed',
      investigation: 'completed',
      repository_scan: 'completed',
      fix_generation: 'running',
      verification: 'waiting',
      resolution: 'waiting'
    },
    investigation: {
      root_cause: 'verify_token() does not handle None authorization header gracefully.',
      confidence: '95%',
      evidence: ['FastAPI exception handler received NoneType object has no attribute split'],
      target_file: 'backend/app/core/security.py',
      target_symbol: 'verify_token()',
      cyclomatic_complexity: 2
    },
    diff: {
      file: 'backend/app/core/security.py',
      summary: '+2 lines / -1 line',
      verifiedAgainst: 'test_security.py',
      lines: [
        { type: 'header', content: '--- a/backend/app/core/security.py' },
        { type: 'header', content: '+++ b/backend/app/core/security.py' },
        { type: 'context', oldNum: 11, newNum: 11, content: ' def verify_token(token: Optional[str]) -> bool:' },
        { type: 'del', oldNum: 12, newNum: '', content: '-    return bool(token.startswith("Bearer "))' },
        { type: 'add', oldNum: '', newNum: 12, content: '+    if not token:' },
        { type: 'add', oldNum: '', newNum: 13, content: '+        return False' },
        { type: 'add', oldNum: '', newNum: 14, content: '+    return token.startswith("Bearer ")' }
      ]
    },
    verification: {
      build: 'passed',
      tests: 'running',
      lint: 'passed',
      security: 'passed',
      regression: 'waiting',
      test_log: 'Running security auth test suite...'
    },
    comments: []
  }
];

export const MOCK_USERS_LIST = [
  {
    id: 'usr_01',
    name: 'Maya Patel',
    email: 'maya.patel@agentix.io',
    role: 'user',
    status: 'Active',
    tickets_count: 6,
    created_at: '2026-08-14'
  },
  {
    id: 'usr_02',
    name: 'Alex Rivera',
    email: 'alex.rivera@agentix.io',
    role: 'developer',
    status: 'Active',
    tickets_count: 8,
    created_at: '2026-07-22'
  },
  {
    id: 'usr_03',
    name: 'Sarah Chen',
    email: 'sarah.chen@agentix.io',
    role: 'admin',
    status: 'Active',
    tickets_count: 14,
    created_at: '2026-06-01'
  },
  {
    id: 'usr_04',
    name: 'Liam Vance',
    email: 'liam.vance@agentix.io',
    role: 'developer',
    status: 'Active',
    tickets_count: 4,
    created_at: '2026-08-30'
  },
  {
    id: 'usr_05',
    name: 'Elena Rostova',
    email: 'elena.rostova@agentix.io',
    role: 'admin',
    status: 'Active',
    tickets_count: 11,
    created_at: '2026-06-15'
  }
];

export const MOCK_DEVELOPERS_LIST = [
  {
    id: 'dev_01',
    name: 'Alex Rivera',
    email: 'alex.rivera@agentix.io',
    title: 'Staff Software Engineer',
    active_issues: 3,
    completed_issues: 42,
    workload: '75%',
    success_rate: '98.4%',
    status: 'Available'
  },
  {
    id: 'dev_02',
    name: 'Liam Vance',
    email: 'liam.vance@agentix.io',
    title: 'Senior DevOps Engineer',
    active_issues: 1,
    completed_issues: 28,
    workload: '40%',
    success_rate: '96.2%',
    status: 'Available'
  },
  {
    id: 'dev_03',
    name: 'Kenji Takahashi',
    email: 'kenji.t@agentix.io',
    title: 'Backend Systems Engineer',
    active_issues: 2,
    completed_issues: 35,
    workload: '60%',
    success_rate: '97.8%',
    status: 'In Review'
  }
];

export const MOCK_AGENT_METRICS = [
  {
    id: 'triage',
    name: 'Triage & Duplicate Agent',
    description: 'Vector similarity search, issue classification, and initial severity scoring.',
    status: 'Operational',
    active_tasks: 2,
    completed: 1420,
    failed: 12,
    success_rate: '99.1%',
    avg_latency: '1.2s'
  },
  {
    id: 'investigation',
    name: 'Investigation Agent',
    description: 'Log regex parsing, read-only DB diagnostic queries, and root cause hypothesis.',
    status: 'Operational',
    active_tasks: 3,
    completed: 1284,
    failed: 37,
    success_rate: '97.2%',
    avg_latency: '4.5s'
  },
  {
    id: 'repo',
    name: 'Repository Comprehension Agent',
    description: 'AST symbol table indexing, call graph navigation, and semantic code search.',
    status: 'Operational',
    active_tasks: 2,
    completed: 1190,
    failed: 21,
    success_rate: '98.2%',
    avg_latency: '3.8s'
  },
  {
    id: 'coder',
    name: 'Coder Agent',
    description: 'LLM reasoning-driven unified patch synthesis and surgical code modification.',
    status: 'Operational',
    active_tasks: 1,
    completed: 980,
    failed: 52,
    success_rate: '94.9%',
    avg_latency: '8.2s'
  },
  {
    id: 'verifier',
    name: 'Verifier Agent & Canary Monitor',
    description: 'Isolated subprocess test execution, post-fix telemetry checks, and automatic rollbacks.',
    status: 'Operational',
    active_tasks: 1,
    completed: 910,
    failed: 18,
    success_rate: '98.0%',
    avg_latency: '12.4s'
  }
];

export const MOCK_SYSTEM_HEALTH = [
  { service: 'FastAPI Backend Core', status: 'Operational', latency: '4ms', uptime: '99.98%' },
  { service: 'Google Gemini 1.5 Flash Provider', status: 'Operational', latency: '120ms', uptime: '99.95%' },
  { service: 'Local Subprocess Test Sandbox', status: 'Operational', latency: '18ms', uptime: '100.0%' },
  { service: 'Tamper-Evident Audit Ledger (JSONL)', status: 'Operational', latency: '2ms', uptime: '100.0%' },
  { service: 'AST Symbol Indexer Engine', status: 'Operational', latency: '8ms', uptime: '99.99%' },
  { service: 'Institutional Memory Store', status: 'Operational', latency: '14ms', uptime: '99.92%' }
];

export const MOCK_NOTIFICATIONS = [
  {
    id: 'n1',
    title: 'Patch Generated for AX-1024',
    message: 'Coder Agent synthesized ZeroDivisionError fix in calc.py. Ready for sandbox tests.',
    type: 'agent',
    unread: true,
    time: '5 mins ago',
    link: '/developer/issues/AX-1024'
  },
  {
    id: 'n2',
    title: 'Human Approval Required: AX-1025',
    message: 'High-risk database connection pool patch awaiting developer or admin sign-off.',
    type: 'warning',
    unread: true,
    time: '24 mins ago',
    link: '/developer/issues/AX-1025'
  },
  {
    id: 'n3',
    title: 'Ticket AX-1021 Resolved',
    message: 'Verifier Agent confirmed pyright strict typing pass with 0 regressions.',
    type: 'success',
    unread: false,
    time: '2 hours ago',
    link: '/user/tickets/AX-1021'
  }
];

export const MOCK_AUDIT_LOGS = [
  {
    timestamp: '2026-10-04 09:34:10',
    user: 'Alex Rivera (developer)',
    role: 'developer',
    action: 'PATCH_REVIEW_STARTED',
    resource: 'AX-1028 :: backend/app/core/security.py',
    status: 'SUCCESS',
    hash: 'a71b8e4f'
  },
  {
    timestamp: '2026-10-04 09:18:22',
    user: 'Maya Patel (user)',
    role: 'user',
    action: 'CLARIFICATION_ANSWERED',
    resource: 'AX-1024 :: Safe Zero Handling Question',
    status: 'SUCCESS',
    hash: '9fa12b8c'
  },
  {
    timestamp: '2026-10-04 08:42:00',
    user: 'PolicyEngine (system)',
    role: 'system',
    action: 'RISK_TIER_EVALUATED_HIGH',
    resource: 'AX-1025 :: Production DB Pool',
    status: 'SUCCESS',
    hash: '5aa8291d'
  },
  {
    timestamp: '2026-10-04 07:12:45',
    user: 'VerifierAgent (system)',
    role: 'system',
    action: 'SANDBOX_VERIFICATION_PASS',
    resource: 'AX-1021 :: test_runner.py',
    status: 'SUCCESS',
    hash: '1d849fae'
  }
];
