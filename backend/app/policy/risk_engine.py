"""
Risk Assessment Engine
Calculates risk tier (LOW / MEDIUM / HIGH) based on file types, keyword sensitivity, blast radius, and test coverage (PRD §8).
"""

from typing import List, Dict, Any

HIGH_RISK_KEYWORDS = [
    "auth", "password", "jwt", "token", "secret", "permission", "rbac",
    "migration", "schema", "drop table", "alter table", "payment", "billing",
    "credit_card", "stripe", "crypto", "encryption"
]

MEDIUM_RISK_KEYWORDS = [
    "calc", "logic", "handler", "service", "api", "controller", "query",
    "transform", "filter", "order", "state"
]

class RiskEngine:
    """
    Tiered Risk Policy:
    - LOW: Minor docs, typos, read-only operational checks -> Auto-executes, records audit log
    - MEDIUM: Standard bug fixes, non-breaking refactors -> Pauses for human approval via UI
    - HIGH: DB schema, auth/security code, payment flows -> Auto-escalates with Evidence Bundle
    """

    @staticmethod
    def evaluate_risk(files_modified: List[str], diff_text: str, context: Dict[str, Any] = None) -> str:
        context = context or {}
        diff_lower = diff_text.lower()
        files_str = " ".join(files_modified).lower()
        combined = f"{files_str} {diff_lower} {context.get('description', '')}".lower()

        # 1. High Risk Rules
        for kw in HIGH_RISK_KEYWORDS:
            if kw in combined:
                return "HIGH"

        if any(f.endswith((".sql", ".env", "security.py", "auth.py")) for f in files_modified):
            return "HIGH"

        # 2. Medium Risk Rules
        if any(kw in combined for kw in MEDIUM_RISK_KEYWORDS):
            return "MEDIUM"

        if len(files_modified) > 1 or len(diff_text.splitlines()) > 20:
            return "MEDIUM"

        # 3. Default to LOW
        return "LOW"
