"""
Audit Models & Evidence Package Schemas
Pydantic schemas for immutable log entries and escalation evidence packages.
"""

from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field
from datetime import datetime

class AuditEvent(BaseModel):
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    ticket_id: str
    event_type: str
    payload: Dict[str, Any]

class EvidencePackage(BaseModel):
    ticket_id: str
    risk_level: str
    reason: str
    diff: Optional[str] = None
    test_output: Optional[str] = None
    logs: List[str] = Field(default_factory=list)
