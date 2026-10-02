"""
Agent Base Protocol
Defines standardized execution context, result structure, and tool-calling interfaces for all sub-agents.
"""

from abc import ABC, abstractmethod
from typing import Any, Dict
from pydantic import BaseModel

class AgentResult(BaseModel):
    success: bool
    data: Dict[str, Any]
    error: str = ""

class BaseAgent(ABC):
    @abstractmethod
    async def execute(self, context: Dict[str, Any]) -> AgentResult:
        """Execute agent-specific reasoning and tool actions."""
        pass
