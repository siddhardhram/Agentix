"""
Retry Policy Engine
Manages backoff intervals, retry caps, and escalation triggers upon failure loop exhaustion.
"""

from app.core.config import settings

class RetryPolicy:
    def __init__(self, max_retries: int = settings.MAX_RETRIES_PER_TICKET):
        self.max_retries = max_retries

    def can_retry(self, current_retries: int) -> bool:
        """Determines if another test/patch iteration is permitted."""
        return current_retries < self.max_retries
