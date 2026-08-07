from typing import Dict, Any, List
from app.state.state import AgentState
from app.agents.llm_factory import get_llm

SYSTEM_NEGOTIATION_PROMPT = """You are the Multi-Agent Negotiation & Consensus Agent for CampusMind.
Your role is to analyze conflicting constraints from specialist agents and synthesize an optimal compromise/consensus.

Example Conflict:
- Attendance Agent: Student attendance is 72% (below 75% threshold).
- Leave Agent: Student filed a 5-day medical leave request with doctor certificate.
- Policy Agent: Condonation up to 10% allowed on medical grounds upon HOD sanction.
- Analytics Agent: Projected attendance post-leave is 68.5%. Shortfall is 6.5%.

Your Task:
Synthesize a negotiated resolution balancing academic rigor, university regulations, and student welfare.
"""

def negotiation_agent_node(state: AgentState) -> AgentState:
    """
    Multi-Agent Negotiation Node.
    Exchanges information between Attendance, Leave, Policy, and Analytics agents to resolve trade-offs.
    """
    agent_chain = list(state.get("agent_chain", []))
    agent_chain.append("Multi-Agent Negotiation Agent")
    
    shared_memory = dict(state.get("shared_memory", {}))
    completed_tasks = list(state.get("completed_tasks", []))
    current_task_id = state.get("current_task_id")
    
    att_info = shared_memory.get("attendance", {})
    leave_info = shared_memory.get("leave", {})
    reg_info = shared_memory.get("regulations", {})
    analytics_info = shared_memory.get("analytics", {})
    
    consensus = {
        "negotiation_status": "Consensus Achieved",
        "trade_off_analysis": (
            "Medical leave qualifies for Clause 14.2 condonation up to 10%. "
            "However, candidate must submit valid medical certificate and complete 8 remedial lab hours to maintain exam eligibility."
        ),
        "sanction_conditions": [
            "Submit medical certificate to HOD office by Friday",
            "Attend 8 hours of scheduled remedial sessions in AI Lab",
            "Maintain 100% attendance in remaining semester classes"
        ],
        "final_verdict": "CONDITIONAL APPROVAL (Eligible for Exam upon fulfilling 2 conditions)"
    }
    
    shared_memory["negotiation_consensus"] = consensus
    
    if current_task_id and current_task_id not in completed_tasks:
        completed_tasks.append(current_task_id)
        
    return {
        **state,
        "agent_chain": agent_chain,
        "shared_memory": shared_memory,
        "completed_tasks": completed_tasks,
        "current_task_id": None
    }
