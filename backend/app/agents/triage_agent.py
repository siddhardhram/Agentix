"""
Triage Agent
Responsible for duplicate ticket detection, issue classification (Ops vs Code), and severity assessment (P0-P3).
"""

import re
from typing import Any, Dict, List, Optional
from app.agents.base import BaseAgent, AgentResult

# In-memory historical ticket index for duplicate matching
HISTORICAL_TICKETS = [
    {
        "ticket_id": "TCK-001",
        "title": "Postgres connection pool exhausted",
        "description": "DB connection timeout after reaching 100 max active pool connections under load."
    },
    {
        "ticket_id": "TCK-002",
        "title": "ZeroDivisionError in calc.py divide",
        "description": "calc.py divide(a, b) raises unhandled ZeroDivisionError when denominator is zero."
    },
    {
        "ticket_id": "TCK-003",
        "title": "Uncaught TypeError in session cookie handler",
        "description": "Null reference exception when session cookie expires mid-request in verify_token."
    }
]

class TriageAgent(BaseAgent):
    """
    Intelligent Triage Agent evaluating:
    1. Duplicate score against known incident repository
    2. Route classification (operational incident vs code bug fix)
    3. Severity assessment (P0 Critical, P1 High, P2 Standard, P3 Low)
    4. Missing information / clarification requirements
    """

    def __init__(self, historical_store: Optional[List[Dict[str, Any]]] = None):
        self.store = historical_store or HISTORICAL_TICKETS

    async def execute(self, context: Dict[str, Any]) -> AgentResult:
        title = context.get("title", "")
        description = context.get("description", "")
        combined_text = f"{title} {description}".lower()

        # 1. Missing Info Detection
        if len(description.strip()) < 10 and len(title.strip()) < 10:
            return AgentResult(
                success=True,
                data={
                    "needs_clarification": True,
                    "clarification_prompt": "Could you provide more details, error messages, or steps to reproduce the issue?",
                    "route": "code",
                    "severity": "P3",
                    "is_duplicate": False
                }
            )

        # 2. Duplicate Detection
        dup_match, dup_score = self._check_duplicate(combined_text)

        # 3. Route Classification: Operational vs Code Bug
        route = self._classify_route(combined_text)

        # 4. Severity Assessment (P0 to P3)
        severity = self._assess_severity(combined_text)

        return AgentResult(
            success=True,
            data={
                "route": route,
                "severity": severity,
                "is_duplicate": dup_score >= 0.85,
                "duplicate_score": round(dup_score, 2),
                "duplicate_of": dup_match.get("ticket_id") if dup_score >= 0.85 else None,
                "needs_clarification": False
            }
        )

    def _check_duplicate(self, text: str) -> tuple[Dict[str, Any], float]:
        """Compute keyword Jaccard similarity score against historical ticket base."""
        words_query = set(re.findall(r'\b\w{3,}\b', text.lower()))
        if not words_query:
            return {}, 0.0

        best_match = {}
        best_score = 0.0

        for candidate in self.store:
            cand_text = f"{candidate.get('title', '')} {candidate.get('description', '')}".lower()
            words_cand = set(re.findall(r'\b\w{3,}\b', cand_text))
            
            if not words_cand:
                continue

            intersection = words_query.intersection(words_cand)
            union = words_query.union(words_cand)
            score = len(intersection) / len(union) if union else 0.0

            if score > best_score:
                best_score = score
                best_match = candidate

        return best_match, best_score

    def _classify_route(self, text: str) -> str:
        """Classify between 'operational' issue (logs, db, infra) and 'code' patch."""
        ops_keywords = [
            "latency", "timeout", "pool", "exhaustion", "cpu", "memory leak", 
            "disk", "502", "504", "500", "cluster", "replica", "database connection",
            "nginx", "gateway", "unresponsive", "oom", "health check"
        ]
        
        for kw in ops_keywords:
            if kw in text:
                return "operational"
        return "code"

    def _assess_severity(self, text: str) -> str:
        """Determine P0, P1, P2, or P3 based on system impact keywords."""
        if any(w in text for w in ["p0", "critical", "outage", "data loss", "security breach", "payment down"]):
            return "P0"
        if any(w in text for w in ["p1", "high", "crash", "null pointer", "unhandled exception", "blocking"]):
            return "P1"
        if any(w in text for w in ["p3", "low", "typo", "minor", "ui glitch", "cosmetic", "readme"]):
            return "P3"
        return "P2"
