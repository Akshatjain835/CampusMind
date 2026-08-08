import json
from typing import Dict, Any
from app.state.state import AgentState
from app.agents.llm_factory import get_llm

def evaluate_state_completeness(state: AgentState) -> AgentState:
    """
    Reflection Agent Node.
    Evaluates whether intermediate outputs in shared_memory adequately fulfill the Planner Goal using LLM reasoning.
    """
    agent_chain = list(state.get("agent_chain", []))
    agent_chain.append("Reflection Agent (Self-Quality Audit)")
    
    shared_mem = state.get("shared_memory", {})
    plan = state.get("plan", {})
    goal = plan.get("goal", "")
    query = state.get("query", "")
    reflection_count = state.get("reflection_count", 0) + 1
    
    is_complete = True
    feedback = "State completeness audit passed successfully."
    
    llm = get_llm()
    if llm and goal:
        try:
            prompt = (
                f"You are the Reflection & Completeness Agent for CampusMind.\n"
                f"AUDIT USER QUERY: {query}\n"
                f"GOAL: {goal}\n"
                f"SHARED MEMORY KEYS AVAILABLE: {list(shared_mem.keys())}\n\n"
                f"Determine if shared memory has sufficient information to generate a complete answer.\n"
                f"Respond strictly in JSON:\n"
                f"{{\n"
                f'  "is_complete": true,\n'
                f'  "feedback": "Audit summary explanation"\n'
                f"}}\n"
            )
            res = llm.invoke(prompt)
            content = res.content if hasattr(res, "content") else str(res)
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[1].split("```")[0].strip()
            data = json.loads(content)
            is_complete = data.get("is_complete", True)
            feedback = data.get("feedback", feedback)
        except Exception as err:
            print(f"[Reflection LLM Warning]: {err}")

    # Limit reflection loops to max 2 iterations
    if not is_complete and reflection_count >= 2:
        print(f"[Reflection Agent] Max reflection count reached ({reflection_count}). Forcing completion.")
        is_complete = True
        feedback = f"Partial state complete. Reflection iteration limit reached."
    elif not is_complete:
        print(f"[Reflection Agent Loop Triggered]: {feedback}")
        
    return {
        **state,
        "agent_chain": agent_chain,
        "reflection_count": reflection_count,
        "reflection_feedback": feedback,
        "is_complete": is_complete
    }

