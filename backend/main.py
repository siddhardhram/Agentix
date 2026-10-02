"""
Agentix Backend Entrypoint
FastAPI server initializing routes, middleware, and WebSocket telemetry stream.
"""

import sys
from pathlib import Path

# Ensure backend root is in sys.path
backend_root = str(Path(__file__).resolve().parent)
if backend_root not in sys.path:
    sys.path.insert(0, backend_root)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.tickets import router as tickets_router
from app.api.v1.approvals import router as approvals_router
from app.api.v1.clarification import router as clarification_router
from app.api.v1.audit import router as audit_router
from app.api.v1.ws import router as ws_router

app = FastAPI(
    title="Agentix API",
    description="Autonomous Agentic Issue Resolution Platform API",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API v1 routers
app.include_router(tickets_router)
app.include_router(approvals_router)
app.include_router(clarification_router)
app.include_router(audit_router)
app.include_router(ws_router)

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "Agentix Backend"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
