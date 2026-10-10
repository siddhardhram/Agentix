"""
Ticket API Endpoints (v1)
Handles ticket submission, listing, status query, telemetry streaming, and autonomous graph execution.
"""

import asyncio
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
# pyrefly: ignore [missing-import]
from fastapi import APIRouter, BackgroundTasks, HTTPException  # type: ignore
# pyrefly: ignore [missing-import]
from pydantic import BaseModel, Field  # type: ignore
from app.orchestrator.state import TicketState, TicketStage
from app.orchestrator.graph import OrchestratorGraph

router = APIRouter(prefix="/tickets", tags=["Tickets"])

class TicketCreateRequest(BaseModel):
    title: Optional[str] = "Incident"
    description: str
    affected_area: Optional[str] = "General"
    repo_path: Optional[str] = "./demo_repos/sample_calc"
    severity: Optional[str] = "P2"
    route: Optional[str] = "code"
    raised_by: Optional[str] = "Developer"

# Active ticket states memory store
ACTIVE_GRAPHS: Dict[str, OrchestratorGraph] = {}
TICKETS_STORE: List[Dict[str, Any]] = []

async def execute_orchestrator(graph: OrchestratorGraph, ticket_dict: Dict[str, Any]):
    """Execute orchestrator pipeline and update state store asynchronously."""
    try:
        final_state = await graph.run_until_complete()
        ticket_dict["status"] = "RESOLVED" if final_state.stage == TicketStage.RESOLVED else str(final_state.stage)
        ticket_dict["stage"] = str(final_state.stage)
        ticket_dict["root_cause"] = final_state.root_cause
        ticket_dict["resolution_summary"] = final_state.resolution_summary
        ticket_dict["diff"] = final_state.diff
        ticket_dict["risk_level"] = final_state.risk_level
        ticket_dict["telemetry"] = final_state.telemetry
    except Exception as e:
        ticket_dict["status"] = "FAILED"
        ticket_dict["resolution_summary"] = f"Orchestrator error: {str(e)}"

@router.get("/")
async def list_tickets():
    """List all tickets."""
    return TICKETS_STORE

@router.post("/")
async def create_ticket(req: TicketCreateRequest, bg: BackgroundTasks):
    """Submit a new ticket and launch autonomous agent resolution."""
    new_id = f"TCK-{len(TICKETS_STORE) + 201}"
    title = req.title if req.title and req.title != "Incident" else req.description[:40]

    state = TicketState(
        ticket_id=new_id,
        ticket_ref=new_id,
        title=title,
        description=req.description,
        affected_area=req.affected_area or "General",
        repo_path=req.repo_path or "./demo_repos/sample_calc",
        severity=req.severity or "P2",
        route=req.route or "code"
    )

    graph = OrchestratorGraph(state)
    ACTIVE_GRAPHS[new_id] = graph

    ticket_record = {
        "id": new_id,
        "ticket_id": new_id,
        "ticket_ref": new_id,
        "title": title,
        "description": req.description,
        "affected_area": req.affected_area or "General",
        "repo_path": req.repo_path or "./demo_repos/sample_calc",
        "severity": req.severity or "P2",
        "route": req.route or "code",
        "status": "INVESTIGATING",
        "stage": "INVESTIGATION",
        "risk_level": "LOW",
        "raised_by": req.raised_by or "Developer",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "telemetry": state.telemetry
    }

    TICKETS_STORE.insert(0, ticket_record)

    # Trigger async execution
    bg.add_task(execute_orchestrator, graph, ticket_record)

    return ticket_record

@router.get("/{ticket_id}")
async def get_ticket(ticket_id: str):
    """Retrieve detailed state and history for a specific ticket."""
    for t in TICKETS_STORE:
        if t.get("ticket_id") == ticket_id or t.get("ticket_ref") == ticket_id or t.get("id") == ticket_id:
            return t
    raise HTTPException(status_code=404, detail="Ticket not found")

@router.get("/{ticket_id}/telemetry")
async def get_ticket_telemetry(ticket_id: str):
    """Retrieve live telemetry event stream for a ticket."""
    graph = ACTIVE_GRAPHS.get(ticket_id)
    if graph:
        return {"ticket_id": ticket_id, "telemetry": graph.state.telemetry, "stage": graph.state.stage}
    
    for t in TICKETS_STORE:
        if t.get("ticket_id") == ticket_id:
            return {"ticket_id": ticket_id, "telemetry": t.get("telemetry", []), "stage": t.get("stage")}

    return {"ticket_id": ticket_id, "telemetry": [], "stage": "UNKNOWN"}

@router.patch("/{ticket_id}")
async def update_ticket(ticket_id: str, updates: Dict[str, Any]):
    """Update a ticket's status, assignee, or other properties."""
    for t in TICKETS_STORE:
        if t.get("ticket_id") == ticket_id or t.get("ticket_ref") == ticket_id or t.get("id") == ticket_id:
            t.update(updates)
            t["updated_at"] = datetime.now(timezone.utc).isoformat()
            return t
    raise HTTPException(status_code=404, detail="Ticket not found")

