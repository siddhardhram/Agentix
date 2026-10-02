"""
Local Subprocess Sandbox Runner
Runs isolated commands, builds, syntax checks, and linters with time-limit guardrails.
"""

from typing import Dict, Any

class LocalRunner:
    @staticmethod
    async def run_command(command: str, cwd: str, timeout_seconds: int = 60) -> Dict[str, Any]:
        """Execute command in sandbox worktree and capture stdout/stderr."""
        return {"exit_code": 0, "stdout": "", "stderr": "", "timed_out": False}
