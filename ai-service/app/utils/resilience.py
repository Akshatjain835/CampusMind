import time
import functools
from typing import Callable, Any, Dict

def with_resilience_retry(max_retries: int = 3, backoff_factor: float = 1.5, fallback_fn: Callable = None):
    """
    Resilience decorator that retries tool operations upon failure
    with exponential backoff and optional secondary fallback execution.
    """
    def decorator(func: Callable):
        @functools.wraps(func)
        def wrapper(*args, **kwargs) -> Any:
            last_exception = None
            for attempt in range(1, max_retries + 1):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    last_exception = e
                    sleep_time = backoff_factor ** attempt
                    print(f"[Resilience Retry] Attempt {attempt}/{max_retries} failed for '{func.__name__}': {e}. Retrying in {sleep_time:.1f}s...")
                    time.sleep(sleep_time)

            print(f"[Resilience Failure] All {max_retries} attempts failed for '{func.__name__}'. Executing fallback routing...")
            if fallback_fn:
                return fallback_fn(*args, **kwargs)
            return {
                "error": True,
                "message": f"Operation '{func.__name__}' failed after {max_retries} retries: {str(last_exception)}",
                "fallback_mode": True
            }
        return wrapper
    return decorator
