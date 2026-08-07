from typing import Dict, Any, List, Optional
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver

from app.state.state import AgentState
from app.agents.planner_agent import planner_node

def stub_agent_node(agent_name: str, state: AgentState, mock_data: Dict[str, Any]) -> AgentState:
    """Helper to update shared memory and mark current task completed."""
    agent_chain = state.get("agent_chain", [])
    agent_chain.append(agent_name)
    
    shared_memory = dict(state.get("shared_memory", {}))
    completed_tasks = list(state.get("completed_tasks", []))
    task_queue = list(state.get("task_queue", []))
    
    current_task_id = state.get("current_task_id")
    if current_task_id and current_task_id not in completed_tasks:
        completed_tasks.append(current_task_id)
        
    shared_memory.update(mock_data)
    
    return {
        **state,
        "agent_chain": agent_chain,
        "shared_memory": shared_memory,
        "completed_tasks": completed_tasks,
        "current_task_id": None
    }

def attendance_agent_node(state: AgentState) -> AgentState:
    student_name = state.get("user_name", "Student")
    mock_data = {
        "attendance": {
            "current_percentage": 72.0,
            "required_percentage": 75.0,
            "status": "Warning (Below Threshold)",
            "classes_attended": 144,
            "total_classes": 200,
            "details": f"Attendance for {student_name} is currently 72.0% (144/200 classes attended)."
        }
    }
    return stub_agent_node("Attendance Agent", state, mock_data)

def leave_agent_node(state: AgentState) -> AgentState:
    mock_data = {
        "leave": {
            "requested_days": 5,
            "estimated_missed_classes": 15,
            "leave_policy_verdict": "Requires 75% post-leave attendance or HOD approval for medical leave."
        }
    }
    return stub_agent_node("Leave Agent", state, mock_data)

def faculty_agent_node(state: AgentState) -> AgentState:
    mock_data = {
        "faculty": {
            "target_faculty": ["Dr. R. K. Sharma", "Prof. Anita Roy", "Dr. V. Patel"],
            "workload": "Balanced (16-18 hrs/week)"
        }
    }
    return stub_agent_node("Faculty Agent", state, mock_data)

def timetable_agent_node(state: AgentState) -> AgentState:
    semester = state.get("semester", "6th Semester")
    section = state.get("section", "Section A")
    schedule = (
        f"• 10:00 AM - 11:00 AM: CS601 Compiler Design (Lab 101)\n"
        f"• 11:00 AM - 12:00 PM: CS602 Computer Networks (Hall B)\n"
        f"• 02:00 PM - 04:00 PM: CS603 AI Lab (Net Lab 102)"
    )
    mock_data = {
        "timetable": {
            "semester": semester,
            "section": section,
            "schedule": schedule,
            "available_free_slots": ["Friday 03:00 PM - 04:00 PM", "Monday 11:00 AM - 12:00 PM"]
        }
    }
    return stub_agent_node("Timetable Agent", state, mock_data)

def notice_agent_node(state: AgentState) -> AgentState:
    mock_data = {
        "notices": [
            "Circular #402: Mid-Semester Exam eligibility requires minimum 75% attendance.",
            "Circular #405: Medical leaves subject to Dean approval for condonation up to 65%."
        ]
    }
    return stub_agent_node("Notice Agent", state, mock_data)

def rag_agent_node(state: AgentState) -> AgentState:
    mock_data = {
        "regulations": {
            "attendance_clause": "Clause 14.2: Mandatory 75% attendance for regular exam sitting. Condonation up to 10% allowed on genuine medical grounds with certified proof.",
            "exemption_policy": "Medical leaves approved by HOD reduce required total denominator."
        }
    }
    return stub_agent_node("Regulation RAG Agent", state, mock_data)

def analytics_agent_node(state: AgentState) -> AgentState:
    mem = state.get("shared_memory", {})
    att = mem.get("attendance", {}).get("current_percentage", 72.0)
    
    projected = att - 3.5 if "leave" in mem else att
    extra_classes_needed = int((75.0 - att) * 4) if att < 75.0 else 0
    
    mock_data = {
        "analytics": {
            "current_attendance": att,
            "projected_attendance_after_leave": round(projected, 1),
            "extra_classes_needed_for_75": max(extra_classes_needed, 5),
            "exam_eligibility_risk": "HIGH RISK" if projected < 75.0 else "LOW RISK",
            "recommendation": f"Must attend at least {max(extra_classes_needed, 5)} remedial/extra classes to restore eligibility above 75%."
        }
    }
    return stub_agent_node("Analytics Agent", state, mock_data)

def database_agent_node(state: AgentState) -> AgentState:
    mock_data = {
        "database_records": {
            "student_record_found": True,
            "academic_status": "Good Standing"
        }
    }
    return stub_agent_node("Database Agent", state, mock_data)

def email_agent_node(state: AgentState) -> AgentState:
    mock_data = {
        "notifications": {
            "email_sent": True,
            "recipients": ["faculty@campusmind.edu"],
            "subject": "Faculty Meeting / Leave Notification Scheduled"
        }
    }
    return stub_agent_node("Email Agent", state, mock_data)

def reflection_agent_node(state: AgentState) -> AgentState:
    agent_chain = state.get("agent_chain", [])
    agent_chain.append("Reflection Agent")
    
    shared_mem = state.get("shared_memory", {})
    plan = state.get("plan", {})
    reflection_count = state.get("reflection_count", 0) + 1
    
    # Check completeness
    is_complete = True
    feedback = "All required task outputs successfully verified in shared memory."
    
    # Example check: if goal mentions exam eligibility but analytics hasn't run
    if "eligibility" in plan.get("goal", "").lower() and "analytics" not in shared_mem and reflection_count <= 2:
        is_complete = False
        feedback = "Missing analytical forecast for exam eligibility. Requesting Analytics Agent pass."
        
    return {
        **state,
        "agent_chain": agent_chain,
        "reflection_count": reflection_count,
        "reflection_feedback": feedback,
        "is_complete": is_complete
    }

def response_generator_node(state: AgentState) -> AgentState:
    agent_chain = state.get("agent_chain", [])
    agent_chain.append("Response Generator")
    
    query = state.get("query", "")
    user_name = state.get("user_name", "Student")
    user_role = state.get("user_role", "student")
    shared_mem = state.get("shared_memory", {})
    plan = state.get("plan", {})
    
    summary_parts = []
    summary_parts.append(f"Hello {user_name}!")
    summary_parts.append(f"**Goal:** {plan.get('goal', 'Academic Assistance')}\n")
    
    if "attendance" in shared_mem:
        att = shared_mem["attendance"]
        summary_parts.append(f"📊 **Attendance Overview:** {att.get('details')}")
        
    if "regulations" in shared_mem:
        reg = shared_mem["regulations"]
        summary_parts.append(f"📜 **University Regulations:** {reg.get('attendance_clause')}")
        
    if "leave" in shared_mem:
        lv = shared_mem["leave"]
        summary_parts.append(f"📝 **Leave Impact:** {lv.get('leave_policy_verdict')}")
        
    if "analytics" in shared_mem:
        an = shared_mem["analytics"]
        summary_parts.append(
            f"⚠️ **Exam Eligibility Risk:** {an.get('exam_eligibility_risk')}\n"
            f"• Projected Attendance Post-Leave: **{an.get('projected_attendance_after_leave')}%**\n"
            f"• Extra Classes Required to Reach 75%: **{an.get('extra_classes_needed_for_75')} classes**\n"
            f"💡 **Recommendation:** {an.get('recommendation')}"
        )
        
    if "timetable" in shared_mem:
        tt = shared_mem["timetable"]
        summary_parts.append(f"📅 **Timetable Schedule:**\n{tt.get('schedule')}")
        
    if "notifications" in shared_mem:
        notif = shared_mem["notifications"]
        summary_parts.append(f"📧 **Notification Action:** Email dispatched to {', '.join(notif.get('recipients', []))}.")

    final_response = "\n\n".join(summary_parts)
    
    return {
        **state,
        "agent_chain": agent_chain,
        "final_response": final_response,
        "is_complete": True
    }

def dispatcher_node(state: AgentState) -> AgentState:
    """
    Task Dispatcher: Inspects task_queue and completed_tasks to pick the next ready task.
    """
    task_queue = state.get("task_queue", [])
    completed_tasks = state.get("completed_tasks", [])
    
    for task in task_queue:
        t_id = task.get("id")
        if t_id in completed_tasks:
            continue
            
        deps = task.get("dependencies", [])
        # Check if all dependencies are completed
        if all(d in completed_tasks for d in deps):
            print(f"[Dispatcher] Dispatching Task '{t_id}' -> Agent '{task.get('agent')}'")
            return {
                **state,
                "current_task_id": t_id
            }
            
    print("[Dispatcher] All tasks in task queue completed or waiting for reflection.")
    return state

def route_next_agent(state: AgentState) -> str:
    current_task_id = state.get("current_task_id")
    task_queue = state.get("task_queue", [])
    completed_tasks = state.get("completed_tasks", [])
    
    if current_task_id:
        for task in task_queue:
            if task.get("id") == current_task_id:
                agent = task.get("agent", "")
                if agent in [
                    "attendance_agent", "leave_agent", "faculty_agent", 
                    "timetable_agent", "notice_agent", "rag_agent", 
                    "analytics_agent", "database_agent", "email_agent"
                ]:
                    return agent
                    
    # If no pending task ready, check if all tasks completed
    if len(completed_tasks) >= len(task_queue):
        return "reflection_agent"
        
    return "reflection_agent"

# Build Dynamic LangGraph
graph_builder = StateGraph(AgentState)

# Add Nodes
graph_builder.add_node("planner_agent", planner_node)
graph_builder.add_node("dispatcher", dispatcher_node)
graph_builder.add_node("attendance_agent", attendance_agent_node)
graph_builder.add_node("leave_agent", leave_agent_node)
graph_builder.add_node("faculty_agent", faculty_agent_node)
graph_builder.add_node("timetable_agent", timetable_agent_node)
graph_builder.add_node("notice_agent", notice_agent_node)
graph_builder.add_node("rag_agent", rag_agent_node)
graph_builder.add_node("analytics_agent", analytics_agent_node)
graph_builder.add_node("database_agent", database_agent_node)
graph_builder.add_node("email_agent", email_agent_node)
graph_builder.add_node("reflection_agent", reflection_agent_node)
graph_builder.add_node("response_generator", response_generator_node)

# Set Entry Point
graph_builder.set_entry_point("planner_agent")
graph_builder.add_edge("planner_agent", "dispatcher")

# Conditional Dispatch Routing
graph_builder.add_conditional_edges(
    "dispatcher",
    route_next_agent,
    {
        "attendance_agent": "attendance_agent",
        "leave_agent": "leave_agent",
        "faculty_agent": "faculty_agent",
        "timetable_agent": "timetable_agent",
        "notice_agent": "notice_agent",
        "rag_agent": "rag_agent",
        "analytics_agent": "analytics_agent",
        "database_agent": "database_agent",
        "email_agent": "email_agent",
        "reflection_agent": "reflection_agent"
    }
)

# Specialist Worker Nodes route back to Dispatcher
for node_name in [
    "attendance_agent", "leave_agent", "faculty_agent", 
    "timetable_agent", "notice_agent", "rag_agent", 
    "analytics_agent", "database_agent", "email_agent"
]:
    graph_builder.add_edge(node_name, "dispatcher")

# Reflection routes to response_generator or back to dispatcher
def route_after_reflection(state: AgentState) -> str:
    if state.get("is_complete", True):
        return "response_generator"
    return "dispatcher"

graph_builder.add_conditional_edges(
    "reflection_agent",
    route_after_reflection,
    {
        "response_generator": "response_generator",
        "dispatcher": "dispatcher"
    }
)

graph_builder.add_edge("response_generator", END)

memory_saver = MemorySaver()
dynamic_campus_graph = graph_builder.compile(checkpointer=memory_saver)
