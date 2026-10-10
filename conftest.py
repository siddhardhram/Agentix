"""
Root Pytest Configuration
Ensures backend and demo repository modules are properly discoverable across all test runners.
"""

import sys
from pathlib import Path

root_dir = Path(__file__).resolve().parent
backend_dir = root_dir / "backend"
sample_calc_dir = root_dir / "demo_repos" / "sample_calc"

for path in [backend_dir, sample_calc_dir, root_dir]:
    path_str = str(path)
    if path_str not in sys.path:
        sys.path.insert(0, path_str)
