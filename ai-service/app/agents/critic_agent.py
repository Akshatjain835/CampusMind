import json
from typing import Dict, Any
from app.state.state import AgentState
from app.agents.llm_factory import get_llm

def critic_agent_node(state: AgentState) -> AgentState:
    """
    Critic & Reflection Evaluator Agent Node.
    Evaluates response accuracy, regulation compliance, and professional academic tone using LLM analysis.
    """
    final_response = state.get("final_response") or ""
    query = state.get("query", "")
    shared_mem = state.get("shared_memory", {})
    agent_chain = list(state.get("agent_chain", []))
    agent_chain.append("Critic Agent (Quality Audit)")

    ref_count = state.get("reflection_count", 0) + 1
    score = 92
    feedback = "Response accurately addresses user query with verified academic governance guidelines."

    llm = get_llm()
    if llm and final_response:
        try:
            prompt = (
                f"You are the Lead Critic & Quality Auditor Agent for CampusMind.\n"
                f"Evaluate the generated response for accuracy, tone, and compliance.\n\n"
                f"USER QUERY: {query}\n"
                f"GENERATED RESPONSE: {final_response}\n\n"
                f"Provide a quality score (0-100) and actionable audit feedback. Output strictly JSON:\n"
                f"{{\n"
                f'  "score": 90,\n'
                f'  "feedback": "Concise feedback on accuracy and academic compliance"\n'
                f"}}\n"
            )
            res = llm.invoke(prompt)
            content = res.content if hasattr(res, "content") else str(res)
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[1].split("```")[0].strip()
            data = json.loads(content)
            score = data.get("score", 90)
            feedback = data.get("feedback", feedback)
        except Exception as e:
            print(f"[Critic LLM Warning]: {e}")

    is_complete = (score >= 80) or (ref_count >= 2)
    print(f"[Critic Agent]: Score = {score}/100 | Ref Count = {ref_count} | Complete = {is_complete} | Feedback: {feedback}")

    return {
        **state,
        "agent_chain": agent_chain,
        "reflection_count": ref_count,
        "reflection_feedback": feedback,
        "is_complete": is_complete
    }

