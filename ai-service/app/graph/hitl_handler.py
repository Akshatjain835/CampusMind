from typing import Dict, Any, Optional
from app.state.state import AgentState

SENSITIVE_ACTIONS = [
    "leave_approval",
    "submit_leave_application",
    "modify_timetable",
    "create_announcement",
    "send_email_notification"
]

def check_human_approval_required(state: AgentState) -> AgentState:
    """
    Human-in-the-Loop Intercept Node.
    Inspects planned subtasks or tool calls. If sensitive action is detected and not yet approved,
    pauses graph execution by flagging needs_human_approval = True.
    """
    task_queue = state.get("task_queue", [])
    completed_tasks = state.get("completed_tasks", [])
    human_approved = state.get("human_approved")
    
    # If already approved by human, bypass intercept
    if human_approved is True:
        return {
            **state,
            "needs_human_approval": False
        }
        
    for task in task_queue:
        if task.get("id") in completed_tasks:
            continue
            
        agent = str(task.get("agent") or "")
        desc = str(task.get("description") or "").lower()
        tool_hint = str(task.get("tool_hint") or "").lower()
        
        is_sensitive = (
            agent in ["email_agent", "leave_agent"] and ("send" in desc or "submit" in desc or "approve" in desc)
            or any(act in desc for act in SENSITIVE_ACTIONS)
            or any(act in tool_hint for act in SENSITIVE_ACTIONS)
        )
        
        if is_sensitive and human_approved is None:
            print(f"[HITL Intercept] Sensitive action detected in task '{task.get('id')}': {task.get('description')}. Requesting Human Approval.")
            return {
                **state,
                "needs_human_approval": True,
                "human_approval_context": {
                    "task_id": task.get("id"),
                    "action_description": task.get("description"),
                    "agent": agent,
                    "reason": "High-impact administrative operation requiring HOD or User confirmation."
                }
            }

    return {
        **state,
        "needs_human_approval": False
    }
