"""
Tests for Risk Policy Engine & Approval Manager
"""

import pytest
from app.policy.risk_engine import RiskEngine
from app.policy.approval_manager import ApprovalManager

def test_risk_evaluation():
    risk = RiskEngine.evaluate_risk(
        files_modified=["calc.py"],
        diff_text="def divide(a, b): return a / b",
        context={}
    )
    assert risk in ["LOW", "MEDIUM", "HIGH"]

def test_approval_manager():
    manager = ApprovalManager(timeout_seconds=120)
    approval_id = manager.request_approval("TCK-100", {"action": "patch"})
    assert approval_id != ""
    assert manager.record_decision(approval_id, approved=True, reviewer="alice") is True
