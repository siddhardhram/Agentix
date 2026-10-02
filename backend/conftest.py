"""
Pytest configuration and environment setup for Agentix backend test suite.
"""

import sys
from pathlib import Path

# Automatically ensure 'backend' directory is on sys.path
backend_dir = Path(__file__).resolve().parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))
