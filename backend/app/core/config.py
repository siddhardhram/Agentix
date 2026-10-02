"""
Core Configuration
Loads environment variables, default budgets, and system thresholds.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173"
    
    LLM_PROVIDER: str = "mock"
    OPENAI_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    
    MAX_RETRIES_PER_TICKET: int = 3
    MAX_TOOL_CALLS_PER_TICKET: int = 15
    MAX_EXECUTION_TIME_SECONDS: int = 300
    HUMAN_APPROVAL_TIMEOUT_SECONDS: int = 180
    
    AUTO_APPROVE_LOW_RISK: bool = True
    HIGH_RISK_KEYWORDS: str = "auth,password,payment,secret,database_drop,privilege"
    
    LOCAL_REPOS_DIR: str = "./demo_repos"
    AUDIT_LOG_DIR: str = "./data/audit_logs"
    MEMORY_STORE_DIR: str = "./data/institutional_memory"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
