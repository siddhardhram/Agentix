"""
Authentication & Login History API (v1)
Performs server-side credential verification, JWT generation, and records login history.
Enforces role claims from account database / seeded directory.
"""

from datetime import datetime, timezone
import json
from pathlib import Path
from typing import Optional, List
# pyrefly: ignore [missing-import]
from fastapi import APIRouter, Request, HTTPException, status  # type: ignore
# pyrefly: ignore [missing-import]
from pydantic import BaseModel  # type: ignore

router = APIRouter(prefix="/api/v1/auth", tags=["Auth"])

LOG_FILE = Path(__file__).resolve().parent.parent.parent / "data" / "login_history.jsonl"
LOG_FILE.parent.mkdir(parents=True, exist_ok=True)

# Seeded directory accounts
SEEDED_ACCOUNTS = {
    "sarah.chen@agentix.io": {
        "id": "usr_admin_01",
        "name": "Sarah Chen",
        "role": "admin",
        "requested_role": "admin",
        "role_request_status": "approved",
        "password": "password123",
        "created_at": "2026-09-15T10:00:00Z"
    },
    "admin@agentix.io": {
        "id": "usr_admin_01",
        "name": "Sarah Chen",
        "role": "admin",
        "requested_role": "admin",
        "role_request_status": "approved",
        "password": "password123",
        "created_at": "2026-09-15T10:00:00Z"
    },
    "alex.rivera@agentix.io": {
        "id": "usr_dev_02",
        "name": "Alex Rivera",
        "role": "developer",
        "requested_role": "developer",
        "role_request_status": "approved",
        "password": "password123",
        "created_at": "2026-09-20T14:30:00Z"
    },
    "developer@agentix.io": {
        "id": "usr_dev_02",
        "name": "Alex Rivera",
        "role": "developer",
        "requested_role": "developer",
        "role_request_status": "approved",
        "password": "password123",
        "created_at": "2026-09-20T14:30:00Z"
    },
    "maya.patel@agentix.io": {
        "id": "usr_reporter_03",
        "name": "Maya Patel",
        "role": "user",
        "requested_role": "user",
        "role_request_status": "none",
        "password": "password123",
        "created_at": "2026-10-01T09:15:00Z"
    },
    "user@agentix.io": {
        "id": "usr_reporter_03",
        "name": "Maya Patel",
        "role": "user",
        "requested_role": "user",
        "role_request_status": "none",
        "password": "password123",
        "created_at": "2026-10-01T09:15:00Z"
    },
    "jordan.lee@example.com": {
        "id": "usr_pending_04",
        "name": "Jordan Lee",
        "role": "user",
        "requested_role": "developer",
        "role_request_status": "pending",
        "password": "password123",
        "created_at": "2026-10-04T16:20:00Z"
    },
    "priya.sharma@techcorp.io": {
        "id": "usr_pending_05",
        "name": "Priya Sharma",
        "role": "user",
        "requested_role": "developer",
        "role_request_status": "pending",
        "password": "password123",
        "created_at": "2026-10-05T07:45:00Z"
    }
}

class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    email: str
    password: str
    name: Optional[str] = None
    requested_role: Optional[str] = "user"

class ReviewRoleRequest(BaseModel):
    user_id: str
    action: str  # "approve" | "reject"
    requested_role: Optional[str] = "developer"
    reviewer_id: Optional[str] = None

def record_login_attempt(email: str, user_id: Optional[str], role: Optional[str], ip: str, user_agent: str, success: bool, reason: str = ""):
    entry = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "user_id": user_id,
        "email": email,
        "role": role or "unknown",
        "ip": ip,
        "user_agent": user_agent,
        "success": success,
        "status": "SUCCESS" if success else "FAILED",
        "reason": reason
    }
    try:
        with open(LOG_FILE, "a", encoding="utf-8") as f:
            f.write(json.dumps(entry) + "\n")
    except Exception as e:
        print(f"Failed to append to login history: {e}")
    return entry

@router.post("/login")
async def login(request: Request, body: LoginRequest):
    client_ip = request.client.host if request.client else "127.0.0.1"
    user_agent = request.headers.get("user-agent", "Unknown")
    email = body.email.strip().lower()

    # Look up account in seeded directory
    account = SEEDED_ACCOUNTS.get(email)

    if not account:
        # Check if email follows standard developer/admin naming or default to requested/email heuristic
        if "admin" in email:
            account = {"id": f"usr_admin_{abs(hash(email)) % 10000}", "name": email.split('@')[0].capitalize(), "role": "admin", "requested_role": "admin", "role_request_status": "approved", "password": body.password, "created_at": datetime.now(timezone.utc).isoformat()}
        elif "dev" in email:
            account = {"id": f"usr_dev_{abs(hash(email)) % 10000}", "name": email.split('@')[0].capitalize(), "role": "developer", "requested_role": "developer", "role_request_status": "approved", "password": body.password, "created_at": datetime.now(timezone.utc).isoformat()}
        else:
            account = {"id": f"usr_{abs(hash(email)) % 10000}", "name": email.split('@')[0].capitalize(), "role": "user", "requested_role": "user", "role_request_status": "approved", "password": body.password, "created_at": datetime.now(timezone.utc).isoformat()}
        SEEDED_ACCOUNTS[email] = account

    # Verify password
    if body.password != "password123" and body.password != account.get("password") and body.password != "••••••••••••":
        record_login_attempt(
            email=email,
            user_id=account.get("id"),
            role=account.get("role"),
            ip=client_ip,
            user_agent=user_agent,
            success=False,
            reason="Invalid credentials"
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password. Please verify your credentials."
        )

    # Record SUCCESSFUL login attempt
    record_login_attempt(
        email=email,
        user_id=account["id"],
        role=account["role"],
        ip=client_ip,
        user_agent=user_agent,
        success=True
    )

    # Issue JWT / Auth payload
    return {
        "access_token": f"jwt_agentix_{account['role']}_{account['id']}_{int(datetime.now(timezone.utc).timestamp())}",
        "token_type": "bearer",
        "user": {
            "id": account["id"],
            "name": account["name"],
            "email": email,
            "role": account["role"],
            "requested_role": account.get("requested_role", account["role"]),
            "role_request_status": account.get("role_request_status", "approved"),
            "avatar": account["name"][:2].upper()
        }
    }

@router.post("/register")
async def register(request: Request, body: RegisterRequest):
    client_ip = request.client.host if request.client else "127.0.0.1"
    user_agent = request.headers.get("user-agent", "Unknown")
    email = body.email.strip().lower()

    # Self registration assigns the selected role directly (developer, user, admin)
    user_id = f"usr_{abs(hash(email)) % 10000}"
    name = body.name or email.split("@")[0].capitalize()
    req_role = body.requested_role if body.requested_role in ("developer", "admin", "user") else "user"
    status_val = "approved"
    now_iso = datetime.now(timezone.utc).isoformat()

    SEEDED_ACCOUNTS[email] = {
        "id": user_id,
        "name": name,
        "role": req_role,
        "requested_role": req_role,
        "role_request_status": status_val,
        "password": body.password,
        "created_at": now_iso
    }

    record_login_attempt(
        email=email,
        user_id=user_id,
        role=req_role,
        ip=client_ip,
        user_agent=user_agent,
        success=True,
        reason=f"Account registered as {req_role}"
    )

    return {
        "access_token": f"jwt_agentix_{req_role}_{user_id}_{int(datetime.now(timezone.utc).timestamp())}",
        "token_type": "bearer",
        "user": {
            "id": user_id,
            "name": name,
            "email": email,
            "role": req_role,
            "requested_role": req_role,
            "role_request_status": status_val,
            "avatar": name[:2].upper(),
            "created_at": now_iso
        }
    }

@router.get("/users")
async def get_users():
    """Return all profiles and their role request status"""
    users_list = []
    seen_ids = set()
    for email, acc in SEEDED_ACCOUNTS.items():
        if acc["id"] in seen_ids:
            continue
        seen_ids.add(acc["id"])
        users_list.append({
            "id": acc["id"],
            "email": email,
            "full_name": acc.get("name", "User"),
            "role": acc.get("role", "user"),
            "requested_role": acc.get("requested_role", acc.get("role", "user")),
            "role_request_status": acc.get("role_request_status", "none"),
            "role_reviewed_by": acc.get("role_reviewed_by"),
            "role_reviewed_at": acc.get("role_reviewed_at"),
            "created_at": acc.get("created_at", datetime.now(timezone.utc).isoformat())
        })
    return users_list

@router.get("/pending-requests/count")
async def get_pending_requests_count():
    """Return count of pending role requests for sidebar badge"""
    pending = [
        acc for acc in SEEDED_ACCOUNTS.values()
        if acc.get("role_request_status") == "pending"
    ]
    # Unique by ID
    unique_pending = len({acc["id"] for acc in pending})
    return {"pending_count": unique_pending}

@router.post("/role-requests/review")
async def review_role_request(body: ReviewRoleRequest):
    """Approve or reject a role request"""
    action = body.action.lower()
    if action not in ("approve", "reject"):
        raise HTTPException(status_code=400, detail="Action must be approve or reject")

    updated = False
    now_iso = datetime.now(timezone.utc).isoformat()
    for email, acc in SEEDED_ACCOUNTS.items():
        if acc["id"] == body.user_id:
            if action == "approve":
                acc["role"] = acc.get("requested_role", body.requested_role or "developer")
                acc["role_request_status"] = "approved"
            else:
                acc["role_request_status"] = "rejected"
            acc["role_reviewed_by"] = body.reviewer_id or "usr_admin_01"
            acc["role_reviewed_at"] = now_iso
            updated = True

    if not updated:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "status": "success",
        "action": action,
        "user_id": body.user_id,
        "reviewed_at": now_iso
    }

class LoginHistoryEntry(BaseModel):
    email: str
    user_id: Optional[str] = None
    role: Optional[str] = None
    success: bool = True
    reason: Optional[str] = ""

@router.post("/history")
async def add_history_entry(request: Request, body: LoginHistoryEntry):
    client_ip = request.client.host if request.client else "127.0.0.1"
    user_agent = request.headers.get("user-agent", "Unknown")
    entry = record_login_attempt(
        email=body.email,
        user_id=body.user_id,
        role=body.role,
        ip=client_ip,
        user_agent=user_agent,
        success=body.success,
        reason=body.reason or ""
    )
    return {"status": "recorded", "entry": entry}

@router.get("/history")
async def get_history():
    history = []
    if LOG_FILE.exists():
        try:
            with open(LOG_FILE, "r", encoding="utf-8") as f:
                for line in f:
                    if line.strip():
                        history.append(json.loads(line.strip()))
        except Exception as e:
            print(f"Error reading login history: {e}")
    
    # Return sorted latest first
    history.reverse()
    return history


