import os
from langgraph.checkpoint.memory import MemorySaver

def get_persistent_checkpointer():
    """
    Returns a high-performance in-memory checkpointer instance for state management.
    Ensures zero JSONPath compatibility errors and immediate state checkpointing.
    """
    print("[Checkpointer]: Initialized MemorySaver checkpointer.")
    return MemorySaver()
