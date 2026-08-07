from typing import Dict, Any, Optional
from langgraph.checkpoint.memory import MemorySaver

class ShortTermSessionMemory:
    """
    Manages active graph execution state checkpointer across thread sessions.
    Supports in-memory state preservation and checkpoint queries.
    """
    def __init__(self):
        self.checkpointer = MemorySaver()

    def get_checkpointer(self):
        return self.checkpointer

short_term_memory = ShortTermSessionMemory()
