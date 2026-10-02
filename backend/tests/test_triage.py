"""
Tests for Triage Agent & Classification
"""

import asyncio
import pytest
from app.agents.triage_agent import TriageAgent

def test_triage_execution():
    agent = TriageAgent()
    result = asyncio.run(agent.execute({"title": "Fix crash", "description": "Crash on zero"}))
    assert result.success is True
    assert "route" in result.data
    assert "severity" in result.data
