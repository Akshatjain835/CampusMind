from typing import Dict, Any, Optional
from app.state.state import AgentState

HITL_CLASSIFICATIONS = {
    "HOD": ["leave_approval", "condonation", "medical_leave", "remedial_waiver"],
    "FACULTY": ["faculty_meeting", "schedule_appointment", "project_review"],
    "REGISTRAR": ["hall_ticket", "exam_clearance", "detention_override"]
}

def classify_hitl_action(query: str, task_desc: str) -> str:
    """Classifies sensitive action into HOD, FACULTY, or REGISTRAR HITL categories."""
    combined = f"{query} {task_desc}".lower()
    
    if any(k in combined for k in ["meeting", "appointment", "schedule", "advisor"]):
        return "FACULTY"
    elif any(k in combined for k in ["hall ticket", "clearance", "detention", "roll"]):
        return "REGISTRAR"
    else:
        return "HOD"

def check_human_approval_required(state: AgentState) -> AgentState:
    """
    Multi-Role Human-in-the-Loop Intercept Node.
    Classifies sensitive operations and assigns appropriate approval authority (HOD, FACULTY, REGISTRAR).
    """
    human_approved = state.get("human_approved")
    query = state.get("query", "")
    
    # If already approved, bypass intercept
    if human_approved is True:
        return {
            **state,
            "needs_human_approval": False
        }
        
    query_lower = query.lower()
    
    # Explicit action verbs indicating a direct submission/action request
    is_action_command = any(k in query_lower for k in [
        "apply", "submit", "sanction", "approve", "book", "override", "clearance", "condonation", "schedule", "request"
    ])
    
    # Informational question phrases indicating a inquiry rather than an immediate submission
    is_informational_query = any(k in query_lower for k in [
        "can i", "what if", "what happens", "how to", "is it possible", "tell me", "check",
        "eligibility", "policy", "rules", "guidelines", "will happen"
    ])
    
    # HITL trigger ONLY for explicit action commands that are NOT purely informational inquiries
    is_sensitive = is_action_command and not is_informational_query
    
    if is_sensitive and human_approved is None:
        role_type = classify_hitl_action(query, "")
        print(f"[HITL Intercept] Action command detected. Assigned Authority: {role_type}")
        return {
            **state,
            "needs_human_approval": True,
            "human_approval_context": {
                "approver_role": role_type,
                "action_description": f"Request requiring formal sanction from {role_type}.",
                "query": query,
                "reason": f"High-impact administrative operation requiring {role_type} authorization."
            }
        }

    return {
        **state,
        "needs_human_approval": False
    }
