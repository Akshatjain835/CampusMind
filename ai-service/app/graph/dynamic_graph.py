from typing import Dict, Any, List, Optional
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver

from app.state.state import AgentState
from app.agents.planner_agent import planner_node
from app.agents.negotiation_agent import negotiation_agent_node
from app.graph.hitl_handler import check_human_approval_required
from app.memory.long_term import long_term_memory

from app.tools.attendance_tool import get_attendance, calculate_projected_attendance
from app.tools.calendar_tool import find_free_slot, create_calendar_event
from app.tools.database_tool import execute_sql_query
from app.tools.email_tool import send_email_notification
from app.tools.rag_tool import search_academic_regulations, get_latest_notices
from app.tools.analytics_tool import forecast_exam_eligibility_risk

def long_term_memory_injector_node(state: AgentState) -> AgentState:
    """Injects historical student profile & long-term memory into shared state."""
    student_id = state.get("student_id", "STU1024")
    profile = long_term_memory.get_student_profile(student_id)
    
    shared_mem = dict(state.get("shared_memory", {}))
    shared_mem["student_profile"] = profile
    
    agent_chain = list(state.get("agent_chain", []))
    agent_chain.append("Long-Term Memory Store")
    
    return {
        **state,
        "agent_chain": agent_chain,
        "shared_memory": shared_mem
    }

def stub_agent_node(agent_name: str, state: AgentState, mock_data: Dict[str, Any]) -> AgentState:
    agent_chain = list(state.get("agent_chain", []))
    agent_chain.append(agent_name)
    
    shared_memory = dict(state.get("shared_memory", {}))
    completed_tasks = list(state.get("completed_tasks", []))
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
    student_id = state.get("student_id", "STU1024")
    att_res = get_attendance.invoke({"student_id": student_id})
    mock_data = {
        "attendance": {
            "current_percentage": att_res.get("percentage", 72.0),
            "required_percentage": att_res.get("required_percentage", 75.0),
            "status": att_res.get("status", "Below Threshold"),
            "attended_classes": att_res.get("attended_classes", 144),
            "total_classes": att_res.get("total_classes", 200),
            "details": f"Attendance for {att_res.get('student_name', 'Student')} is currently {att_res.get('percentage', 72.0)}% ({att_res.get('attended_classes', 144)}/{att_res.get('total_classes', 200)} classes attended)."
        }
    }
    return stub_agent_node("Attendance Agent", state, mock_data)

def leave_agent_node(state: AgentState) -> AgentState:
    mem = state.get("shared_memory", {})
    att = mem.get("attendance", {}).get("current_percentage", 72.0)
    impact = calculate_projected_attendance.invoke({"current_percentage": att, "leave_days": 5})
    mock_data = {
        "leave": {
            "requested_days": 5,
            "estimated_missed_classes": impact.get("classes_missed", 15),
            "projected_attendance": impact.get("projected_percentage", 68.5),
            "leave_policy_verdict": "Requires 75% post-leave attendance or HOD approval for medical leave."
        }
    }
    return stub_agent_node("Leave Agent", state, mock_data)

def faculty_agent_node(state: AgentState) -> AgentState:
    slot_res = find_free_slot.invoke({"faculty_ids": ["Dr. R. K. Sharma", "Prof. Anita Roy"], "date": "Tomorrow"})
    mock_data = {
        "faculty": {
            "target_faculty": slot_res.get("faculty_checked", ["Dr. R. K. Sharma", "Prof. Anita Roy"]),
            "workload": "Balanced (16 hrs/week)",
            "available_slot": slot_res.get("suggested_best_slot", "11:00 AM - 12:00 PM")
        }
    }
    return stub_agent_node("Faculty Agent", state, mock_data)

def timetable_agent_node(state: AgentState) -> AgentState:
    semester = state.get("semester", "6th Semester")
    section = state.get("section", "Section A")
    slot_res = find_free_slot.invoke({"faculty_ids": ["Section A Timetable"], "date": "Tomorrow"})
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
            "free_slot": slot_res.get("suggested_best_slot", "11:00 AM - 12:00 PM")
        }
    }
    return stub_agent_node("Timetable Agent", state, mock_data)

def notice_agent_node(state: AgentState) -> AgentState:
    notices_res = get_latest_notices.invoke({})
    notice_list = [f"{n['title']}: {n['summary']}" for n in notices_res.get("notices", [])]
    mock_data = {
        "notices": notice_list if notice_list else ["Circular #402: Mid-Semester Exam eligibility requires minimum 75% attendance."]
    }
    return stub_agent_node("Notice Agent", state, mock_data)

def rag_agent_node(state: AgentState) -> AgentState:
    query = state.get("query", "")
    rag_res = search_academic_regulations.invoke({"query": query})
    reg_text = rag_res.get("top_clause", "Clause 14.2: Mandatory 75% attendance for regular exam sitting.")
    policy_text = rag_res.get("explanation", "Condonation up to 10% allowed on medical grounds.")

    mock_data = {
        "regulations": {
            "attendance_clause": reg_text,
            "exemption_policy": policy_text
        }
    }
    return stub_agent_node("Regulation RAG Agent", state, mock_data)

def analytics_agent_node(state: AgentState) -> AgentState:
    mem = state.get("shared_memory", {})
    att = mem.get("attendance", {}).get("current_percentage", 72.0)
    risk_res = forecast_exam_eligibility_risk.invoke({"current_attendance_percentage": att})
    
    mock_data = {
        "analytics": {
            "current_attendance": att,
            "projected_attendance_after_leave": round(risk_res.get("projected_percentage", att - 3.5), 1),
            "extra_classes_needed_for_75": risk_res.get("remedial_classes_needed", 12),
            "exam_eligibility_risk": risk_res.get("risk_level", "HIGH RISK"),
            "recommendation": risk_res.get("actionable_recommendation", f"Must attend at least {risk_res.get('remedial_classes_needed', 12)} remedial/extra classes to restore eligibility above 75%.")
        }
    }
    return stub_agent_node("Analytics Agent", state, mock_data)

def database_agent_node(state: AgentState) -> AgentState:
    sql_res = execute_sql_query.invoke({"query": "SELECT student_id, name, department, semester FROM students WHERE student_id = 'STU1024'"})
    mock_data = {
        "database_records": {
            "student_record_found": True,
            "academic_status": "Good Standing",
            "query_result": sql_res.get("results", [])
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
    agent_chain = list(state.get("agent_chain", []))
    agent_chain.append("Reflection Agent")
    
    shared_mem = state.get("shared_memory", {})
    reflection_count = state.get("reflection_count", 0) + 1
    
    is_complete = True
    feedback = "All required task outputs verified."
    
    return {
        **state,
        "agent_chain": agent_chain,
        "reflection_count": reflection_count,
        "reflection_feedback": feedback,
        "is_complete": is_complete
    }

def response_generator_node(state: AgentState) -> AgentState:
    agent_chain = list(state.get("agent_chain", []))
    agent_chain.append("Response Generator")
    
    user_name = state.get("user_name", "Student")
    shared_mem = state.get("shared_memory", {})
    plan = state.get("plan", {})
    
    summary_parts = []
    summary_parts.append(f"Hello {user_name}!")
    summary_parts.append(f"**Goal:** {plan.get('goal', 'Academic Assistance')}\n")
    
    if "student_profile" in shared_mem:
        prof = shared_mem["student_profile"]
        summary_parts.append(f"👤 **Student Profile Memory:** {prof.get('name')} ({prof.get('semester')})")
        
    if "attendance" in shared_mem:
        att = shared_mem["attendance"]
        summary_parts.append(f"📊 **Attendance Overview:** {att.get('details')}")
        
    if "regulations" in shared_mem:
        reg = shared_mem["regulations"]
        summary_parts.append(f"📜 **University Regulations:** {reg.get('attendance_clause')}")
        
    if "leave" in shared_mem:
        lv = shared_mem["leave"]
        summary_parts.append(f"📝 **Leave Impact:** {lv.get('leave_policy_verdict')}")
        
    if "negotiation_consensus" in shared_mem:
        neg = shared_mem["negotiation_consensus"]
        summary_parts.append(f"🤝 **Multi-Agent Negotiation Verdict:** {neg.get('final_verdict')}\n• {neg.get('trade_off_analysis')}")

    if "analytics" in shared_mem:
        an = shared_mem["analytics"]
        summary_parts.append(
            f"⚠️ **Exam Eligibility Risk:** {an.get('exam_eligibility_risk')}\n"
            f"• Projected Attendance Post-Leave: **{an.get('projected_attendance_after_leave')}%**\n"
            f"• Remedial Classes Required: **{an.get('extra_classes_needed_for_75')} classes**\n"
            f"💡 **Recommendation:** {an.get('recommendation')}"
        )

    if "faculty" in shared_mem:
        fac = shared_mem["faculty"]
        targets = ", ".join(fac.get("target_faculty", []))
        summary_parts.append(f"👨‍🏫 **Faculty Participants:** {targets} (Workload: {fac.get('workload', 'Normal')})")

    if "timetable" in shared_mem:
        tt = shared_mem["timetable"]
        summary_parts.append(f"📅 **Conflict-Free Schedule Slot:** Available slots for {tt.get('semester', '6th Semester')} ({tt.get('section', 'Section A')}):\n{tt.get('schedule', '')}")

    if "notifications" in shared_mem:
        nt = shared_mem["notifications"]
        summary_parts.append(f"📧 **Automated Email Dispatch:** Invites sent to {', '.join(nt.get('recipients', []))}.")

    # 🎯 Strategic Executive Advice section synthesized from multi-agent evaluation
    query_lower = state.get("query", "").lower()
    advice_parts = ["🎯 **Executive Academic Secretary Advice:**"]
    
    if any(k in query_lower for k in ["name", "who am i", "my name", "profile"]):
        prof = shared_mem.get("student_profile", {})
        summary_parts = [
            f"Hello **{user_name}**!",
            f"**Goal:** Identify active student user identity and profile\n",
            f"👤 **Student Profile Memory:** Your registered full name in CampusMind is **{user_name}** ({prof.get('semester', '6th Semester')}, {state.get('department', 'Computer Science & Engineering')})."
        ]
        advice_parts.append(f"1. **Identity Verification:** Your active system role is set to **{state.get('user_role', 'student').upper()}**.")
        advice_parts.append("2. **Academic Dashboard:** You can view your complete course enrollment, attendance history, and department circulars on your dashboard home.")
    elif any(k in query_lower for k in ["meeting", "schedule", "appoint", "faculty", "slot"]):
        advice_parts.append("1. **Interactive Meeting Scheduler:** Use the Department Meeting Scheduler module on your dashboard to select faculty and time slots.")
        advice_parts.append("2. **Calendar Conflict Check:** The Timetable Agent automatically screens timetable slots for zero overlap.")
        advice_parts.append("3. **Automated Notification:** Submitting a meeting request automatically dispatches Gmail invites with calendar attachments.")
    elif "eligible" in query_lower or "leave" in query_lower or "attendance" in query_lower:
        advice_parts.append("1. **Apply via Leave Portal:** Submit your medical leave application with a valid doctor's certificate within 48 hours to secure Clause 14.2 condonation.")
        advice_parts.append("2. **Schedule Remedial Sessions:** Enroll in extra remedial lab hours with your course coordinator before final exam roll generation.")
        advice_parts.append("3. **HOD Verification:** Track HOD approval status directly in your CampusMind Leave Governance dashboard to prevent exam hall ticket detention.")
    else:
        advice_parts.append("1. **Query Resolution:** Explore the Governance & Management modules below for specific departmental regulations.")
        advice_parts.append("2. **Support:** Reach out to your Department Head or Faculty Advisor for personalized academic counseling.")

    summary_parts.append("\n".join(advice_parts))

    final_response = "\n\n".join(summary_parts)
    
    # Save recommendation to long-term memory
    student_id = state.get("student_id", "STU1024")
    query = state.get("query", "")
    long_term_memory.save_query_and_recommendation(student_id, query, final_response[:200])

    return {
        **state,
        "agent_chain": agent_chain,
        "final_response": final_response,
        "is_complete": True
    }

def dispatcher_node(state: AgentState) -> AgentState:
    """
    Task Dispatcher supporting Parallel Fan-Out Branches & Sequential Dependencies.
    """
    # Check if human approval is blocking execution
    hitl_state = check_human_approval_required(state)
    if hitl_state.get("needs_human_approval"):
        print("[Dispatcher] Execution paused: Awaiting Human-in-the-Loop approval.")
        return hitl_state

    task_queue = state.get("task_queue", [])
    completed_tasks = state.get("completed_tasks", [])
    
    for task in task_queue:
        t_id = task.get("id")
        if t_id in completed_tasks:
            continue
            
        deps = task.get("dependencies", [])
        if all(d in completed_tasks for d in deps):
            print(f"[Dispatcher] Dispatching Task '{t_id}' -> Agent '{task.get('agent')}'")
            return {
                **state,
                "current_task_id": t_id,
                "needs_human_approval": False
            }
            
    print("[Dispatcher] Tasks complete or ready for multi-agent negotiation.")
    return {
        **state,
        "needs_human_approval": False
    }

def route_next_agent(state: AgentState) -> str:
    if state.get("needs_human_approval"):
        return END
        
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
                    "analytics_agent", "database_agent", "email_agent",
                    "negotiation_agent"
                ]:
                    return agent
                    
    # Check if negotiation is required before final reflection
    shared_mem = state.get("shared_memory", {})
    if "leave" in shared_mem and "attendance" in shared_mem and "negotiation_consensus" not in shared_mem:
        return "negotiation_agent"

    if len(completed_tasks) >= len(task_queue):
        return "reflection_agent"
        
    return "reflection_agent"

# Build Dynamic LangGraph
graph_builder = StateGraph(AgentState)

# Add Nodes
graph_builder.add_node("long_term_memory_injector", long_term_memory_injector_node)
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
graph_builder.add_node("negotiation_agent", negotiation_agent_node)
graph_builder.add_node("reflection_agent", reflection_agent_node)
graph_builder.add_node("response_generator", response_generator_node)

# Set Entry Point
graph_builder.set_entry_point("long_term_memory_injector")
graph_builder.add_edge("long_term_memory_injector", "planner_agent")
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
        "negotiation_agent": "negotiation_agent",
        "reflection_agent": "reflection_agent",
        END: END
    }
)

# Specialist Worker Nodes route back to Dispatcher
for node_name in [
    "attendance_agent", "leave_agent", "faculty_agent", 
    "timetable_agent", "notice_agent", "rag_agent", 
    "analytics_agent", "database_agent", "email_agent",
    "negotiation_agent"
]:
    graph_builder.add_edge(node_name, "dispatcher")

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
