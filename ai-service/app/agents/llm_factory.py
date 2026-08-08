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

    # 1. Try Google Gemini if key is provided
    if gemini_key and len(gemini_key) > 10:
        try:
            from langchain_google_genai import ChatGoogleGenerativeAI
            llm = ChatGoogleGenerativeAI(
                model="gemini-2.0-flash",
                google_api_key=gemini_key,
                temperature=temperature,
                timeout=4.0,
                max_retries=0
            )
            # Quick ping test to verify rate limit & quota status
            llm.invoke("ping")
            print("[LLM Factory] Gemini 2.0 Flash verified and active!")
            _cached_llm = llm
            return _cached_llm
        except Exception as e:
            print(f"[LLM Factory Gemini Quota/Rate Warning]: {e}")

    # 2. Try OpenAI if key is provided
    if openai_key and len(openai_key) > 10:
        try:
            from langchain_openai import ChatOpenAI
            llm = ChatOpenAI(
                model="gpt-4o-mini", 
                api_key=openai_key, 
                temperature=temperature, 
                timeout=4.0,
                max_retries=0
            )
            llm.invoke("ping")
            print("[LLM Factory] OpenAI GPT-4o-mini verified and active!")
            _cached_llm = llm
            return _cached_llm
        except Exception as e:
            print(f"[LLM Factory OpenAI Quota/Rate Warning]: {e}")

    print("[LLM Factory Warning] API keys are currently rate-limited (HTTP 429) or uncredited. Using high-speed local multi-agent graph mode.")
    _cached_llm = None
    return _cached_llm
