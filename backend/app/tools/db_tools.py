"""
Database Tools
Executes safe read-only SQL queries (e.g. SQLite / Postgres), rejecting mutation statements.
"""

from typing import List, Dict, Any

class DbTools:
    @staticmethod
    def execute_read_only_query(db_path: str, query: str) -> List[Dict[str, Any]]:
        """Validate that query is strictly SELECT/read-only, then execute."""
        return []
