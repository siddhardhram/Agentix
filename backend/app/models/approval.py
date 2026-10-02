"""
Approval Request & Decision Schemas
Pydantic schemas for human-in-the-loop review actions.
"""

from typing import Optional
from pydantic import BaseModel, Field
from datetime import datetime

class ApprovalRequest(BaseModel):
    id: str
    ticket_id: str
    action_type: str
    diff_preview: Optional[str] = None
    risk_level: str
    timeout_at: datetime

class ApprovalDecision(BaseModel):
    approval_id: str
    approved: bool
    reviewer: str
    comments: Optional[str] = None
