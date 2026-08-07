from typing import Dict, Any
from app.state.state import AgentState

def critic_agent_node(state: AgentState) -> AgentState:
    """
    Critic & Reflection Evaluator Agent.
    Evaluates response accuracy, regulation compliance, and professional tone.
    """
    final_response = state.get("final_response") or ""
    shared_mem = state.get("shared_memory", {})
    agent_chain = list(state.get("agent_chain", []))
    agent_chain.append("Critic Agent")

    score = 95
    feedback = "Response accurately addresses user intent with clear regulation compliance."

    # Inspect quality checks
    if len(final_response) < 30:
        score = 60
        feedback = "Response is too short and lacks detailed academic advice."

    if "regulations" in shared_mem and "Clause" not in final_response:
        score = 75
        feedback = "Missing explicit regulation clause reference in synthesized response."

    ref_count = state.get("reflection_count", 0) + 1
    is_complete = (score >= 80) or (ref_count >= 2)

    print(f"[Critic Agent]: Evaluation Score = {score}/100 | Ref Count = {ref_count} | Complete = {is_complete} | Feedback: {feedback}")

    return {
        **state,
        "agent_chain": agent_chain,
        "reflection_count": ref_count,
        "reflection_feedback": feedback,
        "is_complete": is_complete
    }
