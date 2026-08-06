import os
from dotenv import load_dotenv

load_dotenv()

def get_llm(temperature: float = 0.3):
    """
    Returns an active LangChain ChatModel instance.
    Supports OpenAI (OPENAI_API_KEY) and Google Gemini (GEMINI_API_KEY).
    Falls back gracefully to None if no valid keys are provided.
    """
    openai_key = os.getenv("OPENAI_API_KEY")
    gemini_key = os.getenv("GEMINI_API_KEY")

    # 1. Try OpenAI if key is present
    if openai_key and "your_openai_api_key" not in openai_key:
        try:
            from langchain_openai import ChatOpenAI
            print("[LLM Factory] Initializing OpenAI GPT-4o-mini...")
            return ChatOpenAI(model="gpt-4o-mini", api_key=openai_key, temperature=temperature)
        except Exception as e:
            print(f"[LLM Factory OpenAI Error]: {e}")

    # 2. Try Google Gemini if key is present
    if gemini_key and "your_gemini_api_key" not in gemini_key:
        try:
            from langchain_google_genai import ChatGoogleGenerativeAI
            print("[LLM Factory] Initializing Google Gemini 1.5 Flash...")
            return ChatGoogleGenerativeAI(model="gemini-1.5-flash", google_api_key=gemini_key, temperature=temperature)
        except Exception as e:
            print(f"[LLM Factory Gemini Error]: {e}")

    print("[LLM Factory Warning] No active OpenAI or Gemini API keys found. Using deterministic agent fallbacks.")
    return None
