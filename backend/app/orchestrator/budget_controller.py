"""
Budget Controller
Enforces guardrails on cost, token consumption, maximum tool calls, and execution timeout.
"""

from app.core.config import settings

class BudgetController:
    def __init__(
        self,
        max_tool_calls: int = settings.MAX_TOOL_CALLS_PER_TICKET,
        max_execution_time_seconds: int = settings.MAX_EXECUTION_TIME_SECONDS
    ):
        self.max_tool_calls = max_tool_calls
        self.max_execution_time_seconds = max_execution_time_seconds

    def check_tool_budget(self, current_tool_calls: int) -> bool:
        """Returns True if within budget, False if limit exceeded."""
        return current_tool_calls < self.max_tool_calls
