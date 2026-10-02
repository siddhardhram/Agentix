"""
Orchestrator State Schema
Defines TicketState, ExecutionBudget, StateMachine transitions, and history.
"""

from enum import Enum
from typing import Any, Dict, List, Optional
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

class TicketState(BaseModel):
    ticket_id: str
    repo_path: str
    title: str
    description: str
    stage: TicketStage = TicketStage.INTAKE
    route: Optional[str] = None  # "operational" | "code"
    risk_level: Optional[str] = None  # "LOW" | "MEDIUM" | "HIGH"
    tool_calls_count: int = 0
    retry_count: int = 0
    history: List[Dict[str, Any]] = Field(default_factory=list)
