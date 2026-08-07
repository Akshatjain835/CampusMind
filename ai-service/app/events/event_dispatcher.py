from typing import Dict, Any, List
from app.state.state import AgentState
from app.graph.dynamic_graph import dynamic_campus_graph

class EventDispatcher:
    """
    Event-Driven Agent Dispatcher (Phase 15).
    Triggers automated background multi-agent workflows when administrative events occur.
    """
    def __init__(self):
        self.subscribers = {}

    def publish_event(self, event_type: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Publishes an academic event (e.g. NoticeUploaded, AttendanceThresholdBreached)
        and executes corresponding autonomous multi-agent pipeline.
        """
        print(f"[EventDispatcher] Event Received: '{event_type}' with payload: {payload}")
        
        if event_type == "NoticeUploaded":
            query = f"New Notice Uploaded: '{payload.get('notice_title')}'. Determine affected students and dispatch notifications."
        elif event_type == "AttendanceThresholdBreached":
            query = f"Student '{payload.get('student_name')}' attendance dropped below {payload.get('threshold')}%. Calculate risk and send warning."
        else:
            query = f"Event '{event_type}' triggered for department {payload.get('department')}."

        initial_state: AgentState = {
            "user_name": payload.get("user_name", "System Administrator"),
            "user_role": "admin",
            "student_id": payload.get("student_id", "STU1024"),
            "department": payload.get("department", "Computer Science & Engineering"),
            "semester": payload.get("semester", "6th Semester"),
            "section": payload.get("section", "Section A"),
            "query": query,
            "multi_modal_inputs": None,
            "plan": None,
            "task_queue": [],
            "completed_tasks": [],
            "current_task_id": None,
            "agent_chain": [],
            "shared_memory": {"event_payload": payload},
            "tool_results": {},
            "retrieved_documents": [],
            "reflection_count": 0,
            "reflection_feedback": None,
            "needs_human_approval": False,
            "human_approval_context": None,
            "human_approved": True, # Background admin event auto-approved
            "is_complete": False,
            "final_response": None,
            "errors": []
        }

        config = {"configurable": {"thread_id": f"event_{event_type}_{payload.get('student_id', 'global')}"}}
        final_state = dynamic_campus_graph.invoke(initial_state, config=config)

        return {
            "event_type": event_type,
            "status": "Event Processed by Multi-Agent System",
            "agent_chain": final_state.get("agent_chain", []),
            "summary": final_state.get("final_response")
        }

event_dispatcher = EventDispatcher()
