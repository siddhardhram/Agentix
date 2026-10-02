"""
Agentix Backend Entrypoint
FastAPI server initializing routes, middleware, and WebSocket telemetry stream.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Agentix API",
    description="Autonomous Agentic Issue Resolution Platform API",
    version="1.0.0"
)

# CORS configuration placeholder
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "Agentix Backend"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
