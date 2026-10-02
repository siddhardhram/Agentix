"""
LLM Provider Abstraction
Unified interface supporting OpenAI, Gemini, Ollama, and an offline Mock LLM provider.
"""

from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional

class BaseLLMProvider(ABC):
    @abstractmethod
    async def generate_response(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        """Generate text completion from LLM."""
        pass

    @abstractmethod
    async def call_tools(self, prompt: str, tools: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Execute structured tool-calling inference."""
        pass

class MockLLMProvider(BaseLLMProvider):
    """Deterministic offline mock provider for testing and offline local running."""
    async def generate_response(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        return "Mock response: Analysis completed successfully."

    async def call_tools(self, prompt: str, tools: List[Dict[str, Any]]) -> Dict[str, Any]:
        return {"tool": "mock_tool", "arguments": {}}
