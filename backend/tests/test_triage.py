"""
Tests for Triage Agent & Classification
Compatible with both pytest and python unittest test runners.
"""

import sys
import unittest
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

import asyncio
from app.agents.triage_agent import TriageAgent

class TestTriage(unittest.TestCase):
    def test_triage_execution(self):
        agent = TriageAgent()
        result = asyncio.run(agent.execute({"title": "Fix crash", "description": "Crash on zero"}))
        self.assertTrue(result.success)
        self.assertIn("route", result.data)
        self.assertIn("severity", result.data)

if __name__ == "__main__":
    unittest.main()
