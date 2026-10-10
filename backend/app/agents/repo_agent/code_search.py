"""
Code Keyword & Fuzzy Searcher
Finds relevant code snippets, definitions, and references matching incident descriptions and symbol names.
"""

import re
from pathlib import Path
from typing import Dict, Any, List

class CodeSearcher:
    """Fast keyword, symbol, and pattern searcher across repository source files."""

    @staticmethod
    def search_keywords(repo_path: str, query: str, max_results: int = 10) -> List[Dict[str, Any]]:
        root = Path(repo_path).resolve()
        if not root.exists():
            return []

        results: List[Dict[str, Any]] = []
        keywords = [k.lower() for k in re.findall(r'\b\w{3,}\b', query)]
        if not keywords:
            return []

        for file_path in root.rglob("*"):
            if file_path.is_dir() or any(p in file_path.parts for p in [".git", "venv", "__pycache__", "node_modules"]):
                continue

            if file_path.suffix not in [".py", ".js", ".jsx", ".ts", ".tsx", ".sql", ".html", ".css", ".json"]:
                continue

            try:
                with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                    lines = f.readlines()
            except Exception:
                continue

            for idx, line in enumerate(lines, 1):
                line_lower = line.lower()
                matches = sum(1 for kw in keywords if kw in line_lower)
                if matches > 0:
                    results.append({
                        "file": file_path.relative_to(root).as_posix(),
                        "line_number": idx,
                        "line_content": line.strip(),
                        "relevance_score": matches
                    })
                    if len(results) >= max_results:
                        break

            if len(results) >= max_results:
                break

        results.sort(key=lambda r: r["relevance_score"], reverse=True)
        return results
