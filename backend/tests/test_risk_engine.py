"""
Tests for Risk Policy Engine & Approval Manager
Compatible with both pytest and python unittest test runners.
"""

import sys
import unittest
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.policy.risk_engine import RiskEngine
from app.policy.approval_manager import ApprovalManager

class TestRiskEngine(unittest.TestCase):
    def test_risk_evaluation(self):
        risk = RiskEngine.evaluate_risk(
            files_modified=["calc.py"],
            diff_text="def divide(a, b): return a / b",
            context={}
        )
        self.assertIn(risk, ["LOW", "MEDIUM", "HIGH"])

    def test_approval_manager(self):
        manager = ApprovalManager(timeout_seconds=120)
        approval_id = manager.request_approval("TCK-100", {"action": "patch"})
        self.assertNotEqual(approval_id, "")
        self.assertTrue(manager.record_decision(approval_id, approved=True, reviewer="alice"))

if __name__ == "__main__":
    unittest.main()
