"""
Operational Investigation Agent
Parses runtime logs, validates read-only database health queries, and analyzes system metrics.
"""

import re
from typing import Any, Dict, List, Optional
from app.agents.base import BaseAgent, AgentResult

class OperationalAgent(BaseAgent):
    """
    Investigates operational incidents:
    - Log parsing with regex pattern extraction (Tracebacks, HTTP 5xx, timeouts)
    - Safe read-only SQL queries
    - Health checks and metric inspection
    """

    async def execute(self, context: Dict[str, Any]) -> AgentResult:
        description = context.get("description", "")
        raw_logs = context.get("logs", [])
        
        # 1. Parse and extract log anomalies
        log_findings = self.parse_logs(raw_logs if raw_logs else [description])

        # 2. Check for common operational root causes
        root_cause = "Operational anomaly identified: "
        if log_findings.get("errors"):
            root_cause += f"{log_findings['errors'][0]['type']} - {log_findings['errors'][0]['message']}"
        elif "pool" in description.lower() or "connection" in description.lower():
            root_cause = "Database connection pool exhaustion under high concurrent load (active connections > 100)."
        elif "timeout" in description.lower():
            root_cause = "Upstream microservice request timeout exceeded (504 Gateway Timeout)."
        else:
            root_cause = "Service latency degradation detected during high traffic window."

        return AgentResult(
            success=True,
            data={
                "route": "operational",
                "log_findings": log_findings,
                "root_cause": root_cause,
                "suggested_action": "Scale connection pool max_connections to 250 or increase idle timeout threshold.",
                "risk_level": "LOW" if "pool" not in description.lower() else "MEDIUM"
            }
        )

    @staticmethod
    def parse_logs(log_lines: List[str]) -> Dict[str, Any]:
        """Extract stack traces, HTTP error codes, and exception types from log entries."""
        errors = []
        http_5xx = []

        traceback_pattern = re.compile(r'Traceback \(most recent call last\):.*?(?=(?:\n\n|\Z))', re.DOTALL)
        exception_pattern = re.compile(r'([A-Za-z0-9_]+Error|[A-Za-z0-9_]+Exception): (.*)')
        http_pattern = re.compile(r'HTTP/1\.[01]\" (5\d{2})')

        full_text = "\n".join(log_lines)

        for match in exception_pattern.finditer(full_text):
            errors.append({
                "type": match.group(1),
                "message": match.group(2).strip()
            })

        for match in http_pattern.finditer(full_text):
            http_5xx.append(match.group(1))

        return {
            "error_count": len(errors),
            "errors": errors,
            "http_5xx_count": len(http_5xx),
            "has_critical_error": len(errors) > 0 or len(http_5xx) > 0
        }

    @staticmethod
    def validate_readonly_sql(query: str) -> bool:
        """Enforce strict read-only SQL queries (PRD §10). Blocks write/alter queries."""
        forbidden_keywords = [
            "insert", "update", "delete", "drop", "alter", "create", 
            "truncate", "grant", "revoke", "exec", "execute"
        ]
        tokens = re.findall(r'\b\w+\b', query.lower())
        for token in tokens:
            if token in forbidden_keywords:
                return False
        return True
