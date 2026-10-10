"""
Repository Structure Scanner
Crawls target repository tree, generates directory hierarchy, and detects source languages.
"""

import os
from pathlib import Path
from typing import Dict, Any, List

IGNORED_DIRS = {".git", "__pycache__", "venv", "node_modules", ".pytest_cache", "dist", "build"}

class RepoScanner:
    """Recursively scans directory tree and indexes source file metadata."""

    @staticmethod
    def scan_directory(base_path: str) -> Dict[str, Any]:
        root = Path(base_path).resolve()
        if not root.exists() or not root.is_dir():
            return {
                "exists": False,
                "error": f"Path '{base_path}' is not a valid directory",
                "files": []
            }

        files_list: List[Dict[str, Any]] = []
        languages: Dict[str, int] = {}

        for dirpath, dirnames, filenames in os.walk(root):
            # Prune ignored directories
            dirnames[:] = [d for d in dirnames if d not in IGNORED_DIRS]

            for filename in filenames:
                file_path = Path(dirpath) / filename
                rel_path = file_path.relative_to(root).as_posix()
                ext = file_path.suffix.lower()

                lang = "Unknown"
                if ext == ".py":
                    lang = "Python"
                elif ext in [".js", ".jsx"]:
                    lang = "JavaScript"
                elif ext in [".ts", ".tsx"]:
                    lang = "TypeScript"
                elif ext in [".html", ".css"]:
                    lang = "Web"
                elif ext in [".json", ".yaml", ".yml", ".sql"]:
                    lang = "Config/Data"

                languages[lang] = languages.get(lang, 0) + 1

                try:
                    size = file_path.stat().st_size
                except Exception:
                    size = 0

                files_list.append({
                    "path": rel_path,
                    "filename": filename,
                    "language": lang,
                    "size_bytes": size
                })

        return {
            "exists": True,
            "root_path": str(root),
            "total_files": len(files_list),
            "languages": languages,
            "files": files_list
        }
