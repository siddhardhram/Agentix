import os
import requests

SUPABASE_URL = "https://udgjjvdrgnamjrxdrvyg.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkZ2pqdmRyZ25hbWpyeGRydnlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEwOTc1NjYsImV4cCI6MjEwNjY3MzU2Nn0.NqamufaAM0dnm8nqC9Hh6OCyfPR1CN0GxZpWmwwRnWA"

headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json"
}

import uuid
random_uuid = str(uuid.uuid4())

payload = {
    "ticket_id": "TCK-TEST-999",
    "title": "Test Ticket",
    "description": "Test description",
    "affected_area": "General",
    "priority": "medium",
    "status": "open",
    "risk_level": "low",
    "repo_ref": "main",
    "raised_by": random_uuid
}

resp = requests.post(f"{SUPABASE_URL}/rest/v1/tickets", headers=headers, json=payload)
print("INSERT TICKET STATUS:", resp.status_code)
print("INSERT TICKET TEXT:", resp.text)
