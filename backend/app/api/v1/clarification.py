"""
Clarification API Endpoints (v1)
Handles agent interactive Q&A loop with users when ticket context is incomplete.
"""

from fastapi import APIRouter

router = APIRouter(prefix="/clarification", tags=["Clarification"])

@router.get("/{ticket_id}/questions")
async def get_questions(ticket_id: str):
    """Get active clarification questions for a ticket."""
    return []

@router.post("/{ticket_id}/answers")
async def submit_answer(ticket_id: str):
    """Submit user answers to unblock the agent investigation."""
    return {"ticket_id": ticket_id, "status": "answers_received"}
