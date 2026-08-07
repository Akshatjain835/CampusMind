import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PORT: int = int(os.getenv("PORT", "8000"))
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    MONGO_URI: str = os.getenv("MONGO_URI", "")
    QDRANT_STORAGE_PATH: str = os.getenv("QDRANT_STORAGE_PATH", "./qdrant_db")
    QDRANT_URL: str = os.getenv("QDRANT_URL", "")
    QDRANT_API_KEY: str = os.getenv("QDRANT_API_KEY", "")
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379")
    LANGCHAIN_TRACING_V2: str = os.getenv("LANGCHAIN_TRACING_V2", "false")
    LANGCHAIN_API_KEY: str = os.getenv("LANGCHAIN_API_KEY", "")

settings = Settings()
