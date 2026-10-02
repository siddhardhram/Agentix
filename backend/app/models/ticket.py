"""
Ticket Data Models & Enums
Pydantic schemas for ticket creation, status updates, classification, and resolution summary.
"""

from typing import Optional, List
from pydantic import BaseModel, Field
from datetime import datetime, timezone

class TicketCreate(BaseModel):
    title: str
    description: str
    repo_path: str = "./demo_repos/sample_calc"

class TicketResponse(BaseModel):
    id: str
    title: str
    description: str
    repo_path: str
    status: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
