"""
Tests for Orchestrator State Transitions & State Machine
"""

import pytest
from app.orchestrator.state import TicketState, TicketStage
from app.orchestrator.graph import OrchestratorGraph
from app.orchestrator.budget_controller import BudgetController
from app.orchestrator.retry_policy import RetryPolicy

def test_orchestrator_initial_state():
    state = TicketState(
        ticket_id="TCK-100",
        repo_path="./demo_repos/sample_calc",
        title="Test issue",
        description="Calculation error"
    )
    assert state.stage == TicketStage.INTAKE
    assert state.tool_calls_count == 0
    assert state.retry_count == 0

import asyncio

def test_orchestrator_graph_lifecycle():
    state = TicketState(
        ticket_id="TCK-101",
        repo_path="./demo_repos/sample_calc",
        title="Fix division",
        description="Zero division crash"
    )
    graph = OrchestratorGraph(state)
    stepped_state = asyncio.run(graph.step())
    assert stepped_state.ticket_id == "TCK-101"

def test_budget_controller():
    controller = BudgetController(max_tool_calls=10, max_execution_time_seconds=60)
    assert controller.check_tool_budget(5) is True
    assert controller.check_tool_budget(10) is False

def test_retry_policy():
    policy = RetryPolicy(max_retries=3)
    assert policy.can_retry(2) is True
    assert policy.can_retry(3) is False
