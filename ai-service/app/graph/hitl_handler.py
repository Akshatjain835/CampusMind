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
    is_sensitive = any(k in query_lower for k in ["leave", "meeting", "schedule", "clearance", "condonation"])
    
    if is_sensitive and human_approved is None:
        role_type = classify_hitl_action(query, "")
        print(f"[HITL Intercept] Sensitive operation detected. Assigned Authority: {role_type}")
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
