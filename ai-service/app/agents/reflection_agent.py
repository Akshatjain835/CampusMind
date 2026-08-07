from typing import Dict, Any
from app.state.state import AgentState
from app.agents.llm_factory import get_llm

def evaluate_state_completeness(state: AgentState) -> AgentState:
    """
    Reflection Agent Node (Phase 6).
    Evaluates whether intermediate outputs in shared_memory adequately fulfill the Planner Goal.
    If vital facts are missing and reflection_count < max_reflections, requests state re-execution.
    """
    agent_chain = list(state.get("agent_chain", []))
    agent_chain.append("Reflection Agent (Self-Quality Audit)")
    
    shared_mem = state.get("shared_memory", {})
    plan = state.get("plan", {})
    goal = plan.get("goal", "").lower()
    reflection_count = state.get("reflection_count", 0) + 1
    
    is_complete = True
    missing_aspects = []
    feedback = "State completeness audit passed successfully."
    
    # Audit rules
    if ("attendance" in goal or "eligible" in goal) and "attendance" not in shared_mem:
        is_complete = False
        missing_aspects.append("Attendance records missing")
        
    if ("leave" in goal or "medical" in goal) and "leave" not in shared_mem:
        is_complete = False
        missing_aspects.append("Leave policy evaluation missing")
        
    if ("regulation" in goal or "rule" in goal or "exam" in goal) and "regulations" not in shared_mem:
        is_complete = False
        missing_aspects.append("Academic regulations missing")
        
    if ("risk" in goal or "analytics" in goal) and "analytics" not in shared_mem:
        is_complete = False
        missing_aspects.append("Predictive risk analytics missing")

    # Limit reflection loops to max 2 iterations to prevent infinite loops
    if not is_complete and reflection_count >= 2:
        print(f"[Reflection Agent] Max reflection count reached ({reflection_count}). Forcing completion with partial state.")
        is_complete = True
        feedback = f"Partial state complete. Unresolved gaps: {', '.join(missing_aspects)}"
    elif not is_complete:
        feedback = f"Reflection Audit Failed: Missing required components ({', '.join(missing_aspects)}). Requesting re-execution."
        print(f"[Reflection Agent Loop Triggered]: {feedback}")
        
    return {
        **state,
        "agent_chain": agent_chain,
        "reflection_count": reflection_count,
        "reflection_feedback": feedback,
        "is_complete": is_complete
    }
