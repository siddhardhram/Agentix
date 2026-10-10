"""
Tests for Orchestrator State Transitions & State Machine
Compatible with both pytest and python unittest test runners.
"""

import sys
import unittest
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

import asyncio
from app.orchestrator.state import TicketState, TicketStage
from app.orchestrator.graph import OrchestratorGraph
from app.orchestrator.budget_controller import BudgetController
from app.orchestrator.retry_policy import RetryPolicy

class TestOrchestrator(unittest.TestCase):
    def test_orchestrator_initial_state(self):
        state = TicketState(
            ticket_id="TCK-100",
            repo_path="./demo_repos/sample_calc",
            title="Test issue",
            description="Calculation error"
        )
        self.assertEqual(state.stage, TicketStage.INTAKE)
        self.assertEqual(state.tool_calls_count, 0)
        self.assertEqual(state.retry_count, 0)

    def test_orchestrator_graph_lifecycle(self):
        state = TicketState(
            ticket_id="TCK-101",
            repo_path="./demo_repos/sample_calc",
            title="Fix division",
            description="Zero division crash"
        )
        graph = OrchestratorGraph(state)
        stepped_state = asyncio.run(graph.step())
        self.assertEqual(stepped_state.ticket_id, "TCK-101")

    def test_budget_controller(self):
        controller = BudgetController(max_tool_calls=10, max_execution_time_seconds=60)
        self.assertTrue(controller.check_tool_budget(5))
        self.assertFalse(controller.check_tool_budget(10))

    def test_retry_policy(self):
        policy = RetryPolicy(max_retries=3)
        self.assertTrue(policy.can_retry(2))
        self.assertFalse(policy.can_retry(3))

if __name__ == "__main__":
    unittest.main()
