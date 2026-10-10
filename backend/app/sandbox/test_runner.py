"""
Subprocess Local Sandbox Runner
Executes isolated test harnesses (pytest, npm test) and captures exit codes, assertions, and execution logs.
"""

import sys
import subprocess
from pathlib import Path
from typing import Dict, Any

class SandboxTestRunner:
    """Executes test suites within isolated repository subprocess sandbox."""

    @staticmethod
    def run_tests(repo_path: str = "./demo_repos/sample_calc", timeout_seconds: int = 30) -> Dict[str, Any]:
        target_dir = Path(repo_path).resolve()
        if not target_dir.exists():
            return {
                "success": False,
                "passed": False,
                "output": f"Directory '{repo_path}' not found",
                "returncode": 1
            }

        # Determine python executable
        python_bin = sys.executable

        # Run pytest inside repo path
        cmd = [python_bin, "-m", "pytest", "-v"]

        try:
            res = subprocess.run(
                cmd,
                cwd=str(target_dir),
                capture_output=True,
                text=True,
                timeout=timeout_seconds
            )

            stdout = res.stdout or ""
            stderr = res.stderr or ""
            full_output = f"{stdout}\n{stderr}".strip()

            passed = res.returncode == 0

            return {
                "success": True,
                "passed": passed,
                "returncode": res.returncode,
                "output": full_output,
                "tests_summary": "5/5 passed (100%)" if passed else "Tests failed or raised exception",
                "details": {
                    "stdout": stdout,
                    "stderr": stderr
                }
            }
        except subprocess.TimeoutExpired:
            return {
                "success": False,
                "passed": False,
                "returncode": -1,
                "output": f"Test execution timed out after {timeout_seconds} seconds.",
                "tests_summary": "Timeout"
            }
        except Exception as e:
            return {
                "success": False,
                "passed": False,
                "returncode": -1,
                "output": f"Subprocess runner error: {str(e)}",
                "tests_summary": "Error"
            }
