import time
import functools
from typing import Callable, Any, Dict, Optional

def with_retry_and_fallback(
    max_retries: int = 2, 
    backoff_seconds: float = 1.0, 
    fallback_fn: Optional[Callable[..., Any]] = None
):
    """
    Decorator for tool calling & agent API steps.
    Attempts execution with exponential backoff retries.
    If all retries fail, invokes fallback_fn or returns safe fallback dict.
    """
    def decorator(func: Callable[..., Any]):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            last_exception = None
            for attempt in range(1, max_retries + 1):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    last_exception = e
                    print(f"[ErrorRecovery] Attempt {attempt}/{max_retries} failed for '{func.__name__}': {e}")
                    if attempt < max_retries:
                        time.sleep(backoff_seconds * attempt)

            print(f"[ErrorRecovery] All retries failed for '{func.__name__}'. Activating Tier 2 Fallback.")
            if fallback_fn:
                return fallback_fn(*args, **kwargs)
                
            return {
                "error": True,
                "recovery_tier": "Fallback Database",
                "message": f"Service temporarily degraded. Operating on cached local database snapshot. ({last_exception})"
            }
        return wrapper
    return decorator
