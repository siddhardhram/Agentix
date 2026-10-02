"""
WebSocket Telemetry Stream (v1)
Streams live agent orchestrator transitions, tool executions, and step-by-step telemetry to the frontend.
"""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter(prefix="/ws", tags=["Telemetry WebSocket"])

@router.websocket("/telemetry/{ticket_id}")
async def telemetry_websocket(websocket: WebSocket, ticket_id: str):
    """Broadcast live agent state machine transitions and logs."""
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            await websocket.send_text(f"Telemetry ping for {ticket_id}: {data}")
    except WebSocketDisconnect:
        pass
