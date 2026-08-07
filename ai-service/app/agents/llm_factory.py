import os
from dotenv import load_dotenv

load_dotenv(override=True)

_cached_llm = "UNINITIALIZED"

def get_llm(temperature: float = 0.3):
    """
    Returns an active LangChain ChatModel instance.
    Validates API key formats (AIzaSy... for Gemini, sk-... for OpenAI).
    Caches model status for sub-millisecond response times.
    """
    global _cached_llm
    if _cached_llm != "UNINITIALIZED":
        return _cached_llm

    gemini_key = os.getenv("GEMINI_API_KEY", "")
    openai_key = os.getenv("OPENAI_API_KEY", "")

    # 1. Try Google Gemini if key starts with AIzaSy
    if gemini_key and gemini_key.startswith("AIzaSy"):
        from langchain_google_genai import ChatGoogleGenerativeAI
        for model_name in ["gemini-1.5-flash", "gemini-2.0-flash"]:
            try:
                print(f"[LLM Factory] Testing Gemini model '{model_name}'...")
                llm = ChatGoogleGenerativeAI(
                    model=model_name,
                    google_api_key=gemini_key,
                    temperature=temperature,
                    timeout=5.0
                )
                llm.invoke("Ping")
                print(f"[LLM Factory] Gemini '{model_name}' active and verified!")
                _cached_llm = llm
                return _cached_llm
            except Exception as e:
                print(f"[LLM Factory Gemini {model_name} Warning]: {e}")

    # 2. Try OpenAI if key starts with sk-
    if openai_key and openai_key.startswith("sk-"):
        try:
            from langchain_openai import ChatOpenAI
            print("[LLM Factory] Testing OpenAI GPT-4o-mini...")
            llm = ChatOpenAI(model="gpt-4o-mini", api_key=openai_key, temperature=temperature, timeout=5.0)
            llm.invoke("Ping")
            print("[LLM Factory] OpenAI GPT-4o-mini active and verified!")
            _cached_llm = llm
            return _cached_llm
        except Exception as e:
            print(f"[LLM Factory OpenAI Warning]: {e}")

    print("[LLM Factory Warning] No active/valid OpenAI or Gemini API keys found. Using deterministic multi-agent fallbacks.")
    _cached_llm = None
    return _cached_llm
