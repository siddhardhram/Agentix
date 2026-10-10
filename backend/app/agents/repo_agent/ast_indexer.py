"""
AST Symbol Indexer
Parses Python Abstract Syntax Trees (AST) to index classes, functions, methods, parameters, and line spans.
"""

import ast
from pathlib import Path
from typing import Dict, Any, List

class ASTIndexer:
    """Extracts symbol tables, method signatures, and docstrings from Python source files."""

    @staticmethod
    def index_python_file(file_path: str) -> List[Dict[str, Any]]:
        path = Path(file_path).resolve()
        if not path.exists() or path.suffix != ".py":
            return []

        try:
            with open(path, "r", encoding="utf-8") as f:
                source = f.read()
            tree = ast.parse(source, filename=str(path))
        except Exception as e:
            return [{"error": f"Failed to parse AST: {str(e)}", "file": str(path)}]

        symbols: List[Dict[str, Any]] = []

        for node in ast.walk(tree):
            if isinstance(node, ast.FunctionDef) or isinstance(node, ast.AsyncFunctionDef):
                args = [arg.arg for arg in node.args.args]
                docstring = ast.get_docstring(node) or ""
                symbols.append({
                    "type": "function",
                    "name": node.name,
                    "args": args,
                    "docstring": docstring.strip(),
                    "start_line": node.lineno,
                    "end_line": getattr(node, "end_lineno", node.lineno),
                    "file": path.name
                })
            elif isinstance(node, ast.ClassDef):
                methods = [n.name for n in node.body if isinstance(n, (ast.FunctionDef, ast.AsyncFunctionDef))]
                docstring = ast.get_docstring(node) or ""
                symbols.append({
                    "type": "class",
                    "name": node.name,
                    "methods": methods,
                    "docstring": docstring.strip(),
                    "start_line": node.lineno,
                    "end_line": getattr(node, "end_lineno", node.lineno),
                    "file": path.name
                })

        return symbols

    @staticmethod
    def index_repository(repo_path: str) -> List[Dict[str, Any]]:
        """Index all Python files in the given repository path."""
        root = Path(repo_path).resolve()
        all_symbols: List[Dict[str, Any]] = []

        if not root.exists():
            return all_symbols

        for py_file in root.rglob("*.py"):
            if any(part in py_file.parts for part in [".git", "venv", "__pycache__"]):
                continue
            file_symbols = ASTIndexer.index_python_file(str(py_file))
            all_symbols.extend(file_symbols)

        return all_symbols
