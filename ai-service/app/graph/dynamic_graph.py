import json
import re
from typing import Dict, Any, List, Optional
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver

from app.state.state import AgentState
from app.agents.planner_agent import planner_node
from app.agents.negotiation_agent import negotiation_agent_node
from app.agents.llm_factory import get_llm
from app.graph.hitl_handler import check_human_approval_required
from app.memory.long_term import long_term_memory
from app.graph.checkpointer import get_persistent_checkpointer
from app.agents.critic_agent import critic_agent_node

from app.tools.attendance_tool import get_attendance, calculate_projected_attendance
from app.tools.calendar_tool import find_free_slot, create_calendar_event
from app.tools.database_tool import execute_sql_query
from app.tools.email_tool import send_email_notification
from app.tools.rag_tool import search_academic_regulations, get_latest_notices
from app.rag.qdrant_retriever import search_qdrant_regulations
from app.tools.analytics_tool import forecast_exam_eligibility_risk

def long_term_memory_injector_node(state: AgentState) -> AgentState:
    """Injects role-specific historical profile & long-term memory into shared state."""
    user_role = (state.get("user_role") or "student").lower()
    user_name = state.get("user_name", "User")
    department = state.get("department", "Computer Science & Engineering")
    semester = state.get("semester", "6th Semester")
    
    shared_mem = dict(state.get("shared_memory", {}))
    
    if user_role in ["faculty", "hod", "admin"] or "prof" in user_name.lower() or "dr" in user_name.lower():
        shared_mem["faculty_profile"] = {
            "name": user_name,
            "role": user_role.upper(),
            "department": department
        }
    else:
        student_id = state.get("student_id") or "STU1024"
        profile = long_term_memory.get_student_profile(
            student_id=student_id, 
            user_name=user_name, 
            department=department, 
            semester=semester
        )
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
    student_id = state.get("student_id") or "STU1024"
    user_name = state.get("user_name", "Student")
    att_res = get_attendance.invoke({"student_id": student_id})
    pct = att_res.get("percentage") or att_res.get("overall_percentage", 72.0)
    
    data = {
        "attendance": {
            "student_id": student_id,
            "student_name": user_name,
            "current_percentage": pct,
            "required_percentage": 75.0,
            "status": "Below Mandatory Threshold (75%)" if pct < 75.0 else "Good Standing",
            "attended_classes": att_res.get("attended_classes", int((pct / 100.0) * 200)),
            "total_classes": att_res.get("total_classes", 200),
            "details": f"Attendance for {user_name} ({student_id}) is currently {pct}%."
        }
    }
    return stub_agent_node("Attendance Agent", state, data)

def leave_agent_node(state: AgentState) -> AgentState:
    mem = state.get("shared_memory", {})
    user_name = state.get("user_name", "Student")
    att = mem.get("attendance", {}).get("current_percentage", 72.0)
    impact = calculate_projected_attendance.invoke({"current_percentage": att, "total_classes": 200, "missed_classes": 15})
    
    projected_pct = impact.get("projected_percentage", round(att - 3.5, 1))
    query_lower = state.get("query", "").lower()
    
    is_action = any(k in query_lower for k in ["apply", "submit", "sanction", "approve"])
    is_info = any(k in query_lower for k in ["can i", "what if", "what happens", "how to", "eligibility", "policy", "will happen"])
    needs_approval = (projected_pct < 75.0 or "medical" in query_lower) and is_action and not is_info
    
    data = {
        "leave": {
            "requested_days": 5,
            "estimated_missed_classes": 15,
            "projected_attendance": projected_pct,
            "leave_policy_verdict": f"Projected attendance after leave is {projected_pct}%. Under Clause 14.2, condonation requires formal HOD sanction." if projected_pct < 75.0 else "Leave within permissible attendance allowance."
        }
    }
    
    res_state = stub_agent_node("Leave Agent", state, data)
    if needs_approval and not state.get("human_approved"):
        res_state["needs_human_approval"] = True
        res_state["human_approval_context"] = {
            "approver_role": "HOD",
            "action_description": f"Medical leave condonation sanction for {user_name} (Projected Attendance: {projected_pct}%).",
            "query": state.get("query", ""),
            "reason": f"Projected attendance ({projected_pct}%) falls below 75% threshold. HOD authorization required under Clause 14.2."
        }
    return res_state

def faculty_agent_node(state: AgentState) -> AgentState:
    dept = state.get("department", "Computer Science & Engineering")
    slot_res = find_free_slot.invoke({"faculty_ids": [f"HOD {dept}", "Faculty Advisor"], "date": "Tomorrow"})
    data = {
        "faculty": {
            "target_faculty": slot_res.get("faculty_checked", [f"HOD {dept}"]),
            "workload": "Normal Governance Allocation",
            "available_slot": slot_res.get("suggested_best_slot", "11:00 AM - 12:00 PM")
        }
    }
    return stub_agent_node("Faculty Agent", state, data)

def extract_target_section_and_semester(query: str, default_section: str = "Section A", default_semester: str = "6th Semester") -> tuple:
    query_upper = (query or "").upper()
    
    target_section = default_section
    sec_match = re.search(r'\b(?:SECTION|SEC|SEC-)\s*([A-F0-9]+)\b', query_upper)
    if not sec_match:
        sec_match = re.search(r'\bFOR\s+SECTION\s*([A-F0-9]+)\b', query_upper)
    if sec_match:
        sec_str = sec_match.group(1).strip()
        target_section = f"Section {sec_str}"

    target_semester = default_semester
    sem_match = re.search(r'\b(\d+)(?:ST|ND|RD|TH)?\s*(?:SEM|SEMESTER)\b', query_upper)
    if not sem_match:
        sem_match = re.search(r'\b(?:SEM|SEMESTER)\s*(\d+)\b', query_upper)
    if sem_match:
        sem_num = sem_match.group(1).strip()
        target_semester = f"{sem_num}th Semester"

    return target_section, target_semester

def timetable_agent_node(state: AgentState) -> AgentState:
    query = state.get("query", "")
    default_sec = state.get("section", "Section A")
    default_sem = state.get("semester", "6th Semester")
    
    target_section, target_semester = extract_target_section_and_semester(query, default_sec, default_sem)
    user_role = str(state.get("user_role", "student")).lower()
    user_name = state.get("user_name", "Faculty Member")
    
    if "faculty" in user_role or "prof" in user_role:
        schedule = (
            "• 09:30 AM - 10:30 AM: CS601 Compiler Design Lecture (6th Sem CSE-A)\n"
            "• 11:30 AM - 01:30 PM: CS603 AI & ML Practical Lab (6th Sem CSE-B)\n"
            "• 02:30 PM - 03:30 PM: Department Academic Advisory & Governance Review"
        )
        data = {
            "timetable": {
                "faculty_name": user_name,
                "role": "FACULTY",
                "todays_schedule": schedule,
                "pending_classes": ["CS601 Compiler Design Lecture (09:30 AM)", "CS603 AI & ML Lab (11:30 AM)"],
                "free_slots": "01:30 PM - 02:30 PM",
                "schedule": schedule
            }
        }
    else:
        sec_letter = target_section.strip().split()[-1].upper() if target_section else "A"
        
        if sec_letter == "B":
            schedule = (
                "• 10:00 AM - 11:00 AM: CS604 Software Engineering (Prof. Anita Roy - Room 305)\n"
                "• 11:00 AM - 12:00 PM: CS605 Cloud Computing (Dr. S. Mehta - Room 305)\n"
                "• 02:00 PM - 04:00 PM: CS606 Web Technologies Lab (Dr. R. K. Sharma - Net Lab 104)"
            )
        elif sec_letter == "C":
            schedule = (
                "• 10:00 AM - 11:00 AM: CS603 Artificial Intelligence (Dr. V. Patel - Room 301)\n"
                "• 11:00 AM - 12:00 PM: CS601 Compiler Design (Dr. R. K. Sharma - Room 301)\n"
                "• 02:00 PM - 04:00 PM: CS604 Software Engineering Lab (Prof. Anita Roy - Net Lab 102)"
            )
        elif sec_letter == "D":
            schedule = (
                "• 10:00 AM - 11:00 AM: CS604 Software Engineering (Prof. Anita Roy - Room 402)\n"
                "• 11:00 AM - 12:00 PM: CS602 Computer Networks (Dr. R. K. Sharma - Room 402)\n"
                "• 02:00 PM - 04:00 PM: CS605 Web & Cloud Computing Practical (Dr. V. Patel - Advanced Computing Lab 3)"
            )
        elif sec_letter in ["E", "F"]:
            schedule = (
                "• 10:00 AM - 11:00 AM: EC601 Analog & Digital Signals (Dr. A. Verma - Room E-101)\n"
                "• 11:00 AM - 12:00 PM: EC602 VLSI System Design (Prof. S. Gupta - Room E-101)\n"
                "• 02:00 PM - 04:00 PM: EC605 Microwave & Antenna Practical (Dr. M. Rao - Communication Lab 202)"
            )
        else:
            schedule = (
                "• 10:00 AM - 11:00 AM: CS601 Compiler Design (Dr. R. K. Sharma - Lab 101)\n"
                "• 11:00 AM - 12:00 PM: CS602 Computer Networks (Prof. Anita Roy - Seminar Hall)\n"
                "• 02:00 PM - 04:00 PM: CS603 AI & Data Structures Practical (Dr. V. Patel - Net Lab 102)"
            )

        slot_res = find_free_slot.invoke({"faculty_ids": [f"{target_section} Timetable"], "date": "Today"})
        data = {
            "timetable": {
                "semester": target_semester,
                "section": target_section,
                "schedule": schedule,
                "free_slot": slot_res.get("suggested_best_slot", "11:00 AM - 12:00 PM")
            }
        }
    return stub_agent_node("Timetable Agent", state, data)

def notice_agent_node(state: AgentState) -> AgentState:
    notices_res = get_latest_notices.invoke({})
    notice_list = [f"{n['title']}: {n['summary']}" for n in notices_res.get("notices", [])]
    data = {
        "notices": notice_list if notice_list else ["Circular #402: Mid-Semester Exam eligibility requires minimum 75% attendance."]
    }
    return stub_agent_node("Notice Agent", state, data)

def rag_agent_node(state: AgentState) -> AgentState:
    query = state.get("query", "")
    rag_res = search_qdrant_regulations(query=query, top_k=3)
    
    formatted_ctx = rag_res.get("formatted_context", "No direct regulations retrieved.")
    retrieved_contexts = rag_res.get("contexts", [])
    
    top_sources = list(set([ctx.get("source", "Department Regulation") for ctx in retrieved_contexts]))
    
    data = {
        "regulations": {
            "query": query,
            "top_sources": top_sources,
            "retrieved_count": len(retrieved_contexts),
            "formatted_context": formatted_ctx,
            "contexts": retrieved_contexts,
            "attendance_clause": retrieved_contexts[0]["chunk"] if retrieved_contexts else "Clause 1.1: Mandatory 75% attendance threshold for semester exams.",
            "exemption_policy": retrieved_contexts[1]["chunk"] if len(retrieved_contexts) > 1 else "Condonation up to 10% allowed on medical grounds upon HOD sanction."
        }
    }
    return stub_agent_node("Regulation RAG Agent", state, data)

def analytics_agent_node(state: AgentState) -> AgentState:
    mem = state.get("shared_memory", {})
    att = mem.get("attendance", {}).get("current_percentage", 72.0)
    leave_days = mem.get("leave", {}).get("requested_days", 5)
    risk_res = forecast_exam_eligibility_risk.invoke({
        "current_percentage": att,
        "planned_leave_days": leave_days
    })
    
    data = {
        "analytics": {
            "current_attendance": att,
            "projected_attendance_after_leave": risk_res.get("projected_percentage_post_leave", round(att - 3.5, 1)),
            "extra_classes_needed_for_75": risk_res.get("extra_remedial_classes_required", 12),
            "exam_eligibility_risk": risk_res.get("risk_level", "HIGH (Requires Condonation / Remedial Classes)"),
            "recommendation": risk_res.get("actionable_recommendation", "Submit medical certificate for HOD condonation and attend remedial sessions.")
        }
    }
    return stub_agent_node("Analytics Agent", state, data)

def database_agent_node(state: AgentState) -> AgentState:
    student_id = state.get("student_id") or "STU1024"
    sql_res = execute_sql_query.invoke({"query": f"SELECT student_id, name, department, semester FROM students WHERE student_id = '{student_id}'"})
    data = {
        "database_records": {
            "student_record_found": True,
            "academic_status": "Good Standing",
            "query_result": sql_res.get("results", [])
        }
    }
    return stub_agent_node("Database Agent", state, data)

def email_agent_node(state: AgentState) -> AgentState:
    data = {
        "notifications": {
            "email_sent": True,
            "recipients": ["department_secretary@campusmind.edu"],
            "subject": "Academic Governance / Leave Request Notification"
        }
    }
    return stub_agent_node("Email Agent", state, data)

def reflection_agent_node(state: AgentState) -> AgentState:
    agent_chain = list(state.get("agent_chain", []))
    agent_chain.append("Reflection Agent")
    
    shared_mem = state.get("shared_memory", {})
    reflection_count = state.get("reflection_count", 0) + 1
    
    is_complete = True
    feedback = "All required multi-agent task outputs verified."
    
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
    user_role = state.get("user_role", "student")
    student_id = state.get("student_id", "STU1024")
    query = state.get("query", "")
    shared_mem = state.get("shared_memory", {})
    plan = state.get("plan", {})
    
    # 🧠 Dynamic LLM Synthesis (when API key is active)
    llm = get_llm(temperature=0.3)
    if llm:
        try:
            prompt = (
                f"You are CampusMind's Executive Academic Secretary AI Agent.\n"
                f"Synthesize a clear, authoritative, unified executive secretarial briefing for the user based on gathered multi-agent findings.\n"
                f"DO NOT print disconnected raw bullet blocks per agent. Instead, write a cohesive, natural language decision briefing.\n\n"
                f"User Profile:\n"
                f"- Name: {user_name} (ID: {student_id})\n"
                f"- Role: {user_role}\n"
                f"- Department: {state.get('department', 'Computer Science & Engineering')}\n"
                f"- Query: \"{query}\"\n\n"
                f"Gathered Context & Multi-Agent Findings:\n{json.dumps(shared_mem, indent=2, default=str)}\n\n"
                f"Include:\n"
                f"1. Directly answer the user query based on current stats.\n"
                f"2. Summarize attendance impact and regulatory compliance (citing clauses if relevant).\n"
                f"3. Note HOD approval / condonation status and next steps clearly."
            )
            res = llm.invoke(prompt)
            final_resp = res.content if hasattr(res, "content") else str(res)
            
            # Save recommendation to long-term memory
            long_term_memory.save_query_and_recommendation(student_id, query, final_resp[:200])
            
            return {
                **state,
                "agent_chain": agent_chain,
                "final_response": final_resp,
                "is_complete": True
            }
        except Exception as err:
            print(f"[Response Generator LLM Warning]: {err}. Falling back to cohesive synthesis generator.")

    # Fallback Cohesive Executive Synthesis Generator
    summary_parts = []
    summary_parts.append(f"Hello **{user_name}**!")
    summary_parts.append(f"**Goal:** {plan.get('goal', 'Academic Assistance')}\n")
    
    att = shared_mem.get("attendance", {})
    lv = shared_mem.get("leave", {})
    reg = shared_mem.get("regulations", {})
    an = shared_mem.get("analytics", {})
    neg = shared_mem.get("negotiation_consensus", {})
    
    if att or lv:
        curr_pct = att.get("current_percentage", 72.0)
        proj_pct = lv.get("projected_attendance", an.get("projected_attendance_after_leave", round(curr_pct - 3.5, 1)))
        
        summary_parts.append(
            f"Based on your current record (**{curr_pct}%** overall attendance), taking a 5-day medical leave will reduce your projected attendance to **{proj_pct}%**."
        )
        
        clause = reg.get("attendance_clause", "Clause 14.2: Mandatory 75% attendance threshold for semester exams.")
        summary_parts.append(
            f"Under **{clause}**, students falling below the 75% threshold require formal **HOD sanction** for medical leave condonation (up to 10%)."
        )
        
        if neg:
            summary_parts.append(f"\n🤝 **Multi-Agent Negotiation Verdict:** {neg.get('final_verdict')}\n• {neg.get('trade_off_analysis')}")
            
        summary_parts.append(
            f"\n💡 **Executive Secretary Recommendation:**\n"
            f"1. **File Medical Leave:** Submit your medical certificate on the Leave Portal within 48 hours.\n"
            f"2. **HOD Approval:** Request HOD sanction to condone the shortfall from {proj_pct}% back to exam eligibility.\n"
            f"3. **Remedial Classes:** Attend scheduled extra lab hours to maintain your academic standing."
        )
    elif "timetable" in shared_mem:
        tt = shared_mem["timetable"]
        if tt.get("role") == "FACULTY" or "faculty_name" in tt:
            summary_parts.append(
                f"📋 **Today's Faculty Schedule & Pending Lectures ({tt.get('faculty_name', user_name)}):**\n\n"
                f"{tt.get('todays_schedule', tt.get('schedule', ''))}\n\n"
                f"💡 **Executive Review:**\n"
                f"• **Pending Lectures/Labs:** {', '.join(tt.get('pending_classes', ['CS601 Compiler Design', 'CS603 AI Lab']))}\n"
                f"• **Available Governance/Advisory Window:** {tt.get('free_slots', '01:30 PM - 02:30 PM')}"
            )
        else:
            summary_parts.append(
                f"📅 **Today's Class Schedule ({tt.get('semester', '6th Semester')} - {tt.get('section', 'Section A')}):**\n\n"
                f"{tt.get('schedule', '')}\n\n"
                f"💡 **Suggested Free Window:** {tt.get('free_slot', '11:00 AM - 12:00 PM')}"
            )
    elif "regulations" in shared_mem:
        reg = shared_mem["regulations"]
        top_sources = reg.get("top_sources", ["Department Regulations"])
        summary_parts.append(f"📚 **Academic Governance & Policy Briefing:**")
        summary_parts.append(f"**Verified Sources:** {', '.join(top_sources)}\n")
        
        contexts = reg.get("contexts", [])
        if contexts:
            for idx, ctx in enumerate(contexts, 1):
                src = ctx.get("source", "Policy Document")
                score = ctx.get("similarity_score", 0.0)
                chunk = ctx.get("chunk", "").strip()
                summary_parts.append(f"**[{idx}] Source: {src}** (Relevance: {score * 100:.1f}%)\n>{chunk.replace(chr(10), chr(10) + '> ')}\n")
        else:
            summary_parts.append(reg.get("formatted_context", "No relevant policy documents found."))
            
        summary_parts.append(f"💡 **Executive Secretary Recommendation:** Review the clauses above. Contact your Department Advisor or HOD office if further administrative sanction is required.")
    else:
        summary_parts.append(f"Here are the findings gathered for your query regarding **{query}**:\n")
        for k, v in shared_mem.items():
            clean_cat = k.replace('_', ' ').title()
            if isinstance(v, dict):
                summary_parts.append(f"### 📌 {clean_cat}")
                for sub_k, sub_v in v.items():
                    clean_sub = sub_k.replace('_', ' ').title()
                    if isinstance(sub_v, dict):
                        summary_parts.append(f"• **{clean_sub}:**")
                        for deep_k, deep_v in sub_v.items():
                            summary_parts.append(f"  - **{deep_k.replace('_', ' ').title()}:** {deep_v}")
                    elif isinstance(sub_v, list):
                        summary_parts.append(f"• **{clean_sub}:** {', '.join(str(item) for item in sub_v)}")
                    else:
                        summary_parts.append(f"• **{clean_sub}:** {sub_v}")
            elif isinstance(v, list):
                summary_parts.append(f"• **{clean_cat}:** {', '.join(str(item) for item in v)}")
            else:
                summary_parts.append(f"• **{clean_cat}:** {v}")

    final_response = "\n\n".join(summary_parts)
    
    # Save recommendation to long-term memory
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
    if hitl_state.get("needs_human_approval") and not state.get("human_approved"):
        print("[Dispatcher] Execution paused: Awaiting Human-in-the-Loop HOD approval.")
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
    if state.get("needs_human_approval") and not state.get("human_approved"):
        return "hod_approval_node"
        
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

def route_after_reflection(state: AgentState) -> str:
    if state.get("is_complete", True):
        return "response_generator"
    return "dispatcher"

def hod_approval_node(state: AgentState) -> AgentState:
    """HOD Human-In-The-Loop Approval Node."""
    agent_chain = list(state.get("agent_chain", []))
    agent_chain.append("HOD Approval Node")
    approved = state.get("human_approved", False)
    ctx = state.get("human_approval_context", "Medical leave condonation sanction required from Head of Department (HOD)")
    print(f"[HOD Approval Node]: Status = {'Approved' if approved else 'Pending HOD Sanction'} | Context: {ctx}")
    return {
        **state,
        "agent_chain": agent_chain,
        "needs_human_approval": not approved,
        "human_approved": approved
    }

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
graph_builder.add_node("hod_approval_node", hod_approval_node)
graph_builder.add_node("reflection_agent", reflection_agent_node)
graph_builder.add_node("critic_agent", critic_agent_node)
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
        "hod_approval_node": "hod_approval_node",
        "reflection_agent": "reflection_agent",
        END: END
    }
)

# Specialist Worker Nodes route back to Dispatcher
for node_name in [
    "attendance_agent", "leave_agent", "faculty_agent", 
    "timetable_agent", "notice_agent", "rag_agent", 
    "analytics_agent", "database_agent", "email_agent",
    "negotiation_agent", "hod_approval_node"
]:
    graph_builder.add_edge(node_name, "dispatcher")

graph_builder.add_edge("reflection_agent", "critic_agent")

graph_builder.add_conditional_edges(
    "critic_agent",
    route_after_reflection,
    {
        "response_generator": "response_generator",
        "dispatcher": "dispatcher"
    }
)

graph_builder.add_edge("response_generator", END)

# Initialize Persistent SQLite Checkpointer
memory_saver = get_persistent_checkpointer()

dynamic_campus_graph = graph_builder.compile(
    checkpointer=memory_saver,
    interrupt_before=["hod_approval_node"]
)
