"""
Orchestrator State Schema
Defines TicketState, TicketStage, ExecutionBudget, StateMachine transitions, and telemetry history.
"""

from enum import Enum
from typing import Any, Dict, List, Optional
from datetime import datetime, timezone
from pydantic import BaseModel, Field

class TicketStage(str, Enum):
    INTAKE = "INTAKE"
    DUPLICATE_CHECK = "DUPLICATE_CHECK"
    CLASSIFICATION = "CLASSIFICATION"
    CLARIFICATION = "CLARIFICATION"
    INVESTIGATION = "INVESTIGATION"
    LLM_REASONING = "LLM_REASONING"
    RISK_POLICY = "RISK_POLICY"
    HUMAN_APPROVAL = "HUMAN_APPROVAL"
    CODE_PATCH = "CODE_PATCH"
    LOCAL_SANDBOX = "LOCAL_SANDBOX"
    RETRY_LOOP = "RETRY_LOOP"
    VERIFICATION = "VERIFICATION"
    MONITORING = "MONITORING"
    RESOLVED = "RESOLVED"
    ESCALATED = "ESCALATED"
    FAILED = "FAILED"

class ExecutionBudget(BaseModel):
    max_cost_usd: float = 1.00
    current_cost_usd: float = 0.00
    max_tokens: int = 50000
    current_tokens: int = 0
    max_tool_calls: int = 25
    tool_calls_count: int = 0
    max_execution_time_sec: int = 180
    start_time: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TelemetryEvent(BaseModel):
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    stage: str
    message: str
    actor: str = "Orchestrator"
    details: Dict[str, Any] = Field(default_factory=dict)

class TicketState(BaseModel):
    ticket_id: str
    ticket_ref: Optional[str] = None
    repo_path: str = "./demo_repos/sample_calc"
    title: str
    description: str
    affected_area: Optional[str] = "General"
    stage: TicketStage = TicketStage.INTAKE
    route: Optional[str] = None  # "operational" | "code"
    severity: Optional[str] = "P2"  # "P0" | "P1" | "P2" | "P3"
    risk_level: Optional[str] = "LOW"  # "LOW" | "MEDIUM" | "HIGH"
    
    # Diagnosis & Resolution
    root_cause: Optional[str] = None
    resolution_summary: Optional[str] = None
    diff: Optional[str] = None
    files_modified: List[str] = Field(default_factory=list)
    ast_symbols: List[Dict[str, Any]] = Field(default_factory=list)
    logs_examined: List[str] = Field(default_factory=list)
    
    # Approval & Evidence
    approval_id: Optional[str] = None
    is_approved: Optional[bool] = None
    evidence_package: Optional[Dict[str, Any]] = None
    
    # Execution & Sandbox Metrics
    sandbox_passed: Optional[bool] = None
    test_output: Optional[str] = None
    tool_calls_count: int = 0
    retry_count: int = 0
    max_retries: int = 3
    is_duplicate: bool = False
    duplicate_of: Optional[str] = None
    
    # Telemetry stream
    budget: ExecutionBudget = Field(default_factory=ExecutionBudget)
    history: List[Dict[str, Any]] = Field(default_factory=list)
    telemetry: List[Dict[str, Any]] = Field(default_factory=list)

    def log_event(self, stage: str, message: str, actor: str = "Orchestrator", details: Optional[Dict[str, Any]] = None):
        """Append immutable telemetry event."""
        evt = {
            "timestamp": datetime.now(timezone.utc).strftime("%H:%M:%S"),
            "stage": stage,
            "message": message,
            "actor": actor,
            "details": details or {}
        }
        self.telemetry.append(evt)
        self.history.append({"stage": stage, "time": evt["timestamp"], "summary": message})
