import os
import json
import hashlib
import time
from typing import Dict, Any, Optional

try:
    import redis
    REDIS_URL = os.getenv("REDIS_URL", "")
    REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
    REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))
    REDIS_PASSWORD = os.getenv("REDIS_PASSWORD", None)

    if REDIS_URL:
        redis_client = redis.Redis.from_url(REDIS_URL, decode_responses=True)
    else:
        redis_client = redis.Redis(
            host=REDIS_HOST, 
            port=REDIS_PORT, 
            password=REDIS_PASSWORD, 
            decode_responses=True
        )

    redis_client.ping()
    REDIS_AVAILABLE = True
    print("[Redis Cache] Connected to Online/Local Redis Server!")
except Exception as e:
    REDIS_AVAILABLE = False
    print(f"[Redis Cache Warning]: Redis server connection bypass ({e}). Using high-speed In-Memory Cache buffer.")

# High-speed In-Memory Fallback Cache Buffer
_in_memory_cache: Dict[str, Dict[str, Any]] = {}

def _hash_query(query: str, user_role: str = "student", department: str = "CSE") -> str:
    """Generates a unique MD5 cache key for normalized user query."""
    normalized = f"{query.strip().lower()}:{user_role}:{department}"
    return f"campusmind:cache:{hashlib.md5(normalized.encode('utf-8')).hexdigest()}"

def get_cached_response(query: str, user_role: str = "student", department: str = "CSE") -> Optional[Dict[str, Any]]:
    """Retrieves cached response from Redis or In-Memory fallback buffer."""
    cache_key = _hash_query(query, user_role, department)
    
    if REDIS_AVAILABLE:
        try:
            cached_str = redis_client.get(cache_key)
            if cached_str:
                print(f"[Redis Cache HIT]: {cache_key}")
                return json.loads(cached_str)
        except Exception as e:
            print(f"[Redis Cache Read Error]: {e}")
            
    # Check In-Memory fallback
    if cache_key in _in_memory_cache:
        item = _in_memory_cache[cache_key]
        if time.time() < item["expires_at"]:
            print(f"[In-Memory Cache HIT]: {cache_key}")
            return item["data"]
        else:
            del _in_memory_cache[cache_key]

    return None

def set_cached_response(
    query: str, 
    response_data: Dict[str, Any], 
    user_role: str = "student", 
    department: str = "CSE",
    ttl_seconds: int = 3600
):
    """Stores query response in Redis or In-Memory fallback buffer with TTL."""
    if not response_data or not response_data.get("final_response"):
        return

    cache_key = _hash_query(query, user_role, department)
    
    if REDIS_AVAILABLE:
        try:
            redis_client.setex(cache_key, ttl_seconds, json.dumps(response_data))
            print(f"[Redis Cache SET]: {cache_key} (TTL: {ttl_seconds}s)")
            return
        except Exception as e:
            print(f"[Redis Cache Write Error]: {e}")

    # Fallback to In-Memory store
    _in_memory_cache[cache_key] = {
        "data": response_data,
        "expires_at": time.time() + ttl_seconds
    }
    print(f"[In-Memory Cache SET]: {cache_key} (TTL: {ttl_seconds}s)")
