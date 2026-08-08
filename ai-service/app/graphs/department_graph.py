import json
import os
import re
from typing import Dict, Any, List, TypedDict, Optional
from langgraph.graph import StateGraph, END
from app.agents.llm_factory import get_llm
from app.rag.qdrant_retriever import search_qdrant_regulations

class DepartmentState(TypedDict):
    user_name: str
    user_role: str
    semester: Optional[str]
    section: Optional[str]
    query: str
    intent: Optional[str]
    context: Optional[str]
    agent_chain: List[str]
    final_response: Optional[str]

def router_node(state: DepartmentState) -> DepartmentState:
    raw_query = state.get("query", "")
    query_lower = raw_query.lower()
    chain = state.get("agent_chain", [])
    
    intent = None
    llm = get_llm(temperature=0.0)
    if llm:
        try:
            prompt = (
                "You are an Academic Intent Classification Agent for CampusMind.\n"
                "Analyze the user query (handling any typos, misspellings, or section references) "
                "and classify it into EXACTLY ONE of these categories:\n"
                "- 'timetable_query': Schedules, class routines, timetables, periods, free slots, class timings, section timetables.\n"
                "- 'attendance_query': Attendance percentages, total classes attended/missed, exam eligibility due to attendance.\n"
                "- 'leave_application': Medical leave, leave requests, leave balance, condonation requests.\n"
                "- 'rag_regulation': University regulations, NAAC/NBA policies, grading rules, exam rules.\n"
                "- 'general_academic_query': General questions or other inquiries.\n\n"
                f"User Query: \"{raw_query}\"\n\n"
                "Respond ONLY with a JSON object: {\"intent\": \"category_name\", \"reasoning\": \"explanation\"}"
            )
            res = llm.invoke(prompt)
            content = res.content if hasattr(res, "content") else str(res)
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[1].split("```")[0].strip()
            parsed = json.loads(content)
            intent = parsed.get("intent")
            print(f"[LLM Router Node]: Detected intent '{intent}' for query: '{raw_query}'")
            chain.append("LLM Router Agent")
        except Exception as err:
            print(f"[LLM Router Warning]: LLM intent detection failed ({err}). Falling back to rule-based router.")

    if not intent or intent not in ["timetable_query", "attendance_query", "leave_application", "rag_regulation", "general_academic_query"]:
        chain.append("Rule Router Agent (Fallback)")
        if any(k in query_lower for k in ["attendance", "eligible", "sitting", "present", "absent"]):
            intent = "attendance_query"
        elif any(k in query_lower for k in ["leave", "medical", "sanction", "condonation"]):
            intent = "leave_application"
        elif any(k in query_lower for k in ["timetable", "timettable", "time table", "time-table", "schedule", "slot", "period", "routine", "section", "class"]):
            intent = "timetable_query"
        elif any(k in query_lower for k in ["nba", "naac", "rule", "regulation", "policy", "clause"]):
            intent = "rag_regulation"
        else:
            intent = "general_academic_query"
        
    return {
        **state,
        "intent": intent,
        "agent_chain": chain
    }

def student_agent_node(state: DepartmentState) -> DepartmentState:
    chain = state.get("agent_chain", [])
    chain.append("Student Agent")
    user_name = state.get("user_name", "Student")
    context = (
        f"Hello {user_name}! According to the department database, your overall attendance stands at 84.5%. "
        f"You satisfy the mandatory 75% attendance threshold and are eligible for all End-Semester Examinations."
    )
    return {
        **state,
        "context": context,
        "agent_chain": chain
    }

def faculty_agent_node(state: DepartmentState) -> DepartmentState:
    chain = state.get("agent_chain", [])
    chain.append("Faculty Agent")
    user_name = state.get("user_name", "Faculty Member")
    context = (
        f"Hello {user_name}! Your current teaching workload is balanced at 18 Hours/Week across your assigned "
        f"courses (Compiler Design, Operating Systems, and Lab Practicals)."
    )
    return {
        **state,
        "context": context,
        "agent_chain": chain
    }

def rag_node(state: DepartmentState) -> DepartmentState:
    chain = state.get("agent_chain", [])
    chain.append("Qdrant Vector RAG Agent")
    query = state.get("query", "attendance rules")
    
    qdrant_res = search_qdrant_regulations(query, top_k=2)
    context = qdrant_res.get("formatted_context", "Department Academic Regulation: Students must maintain a minimum of 75% attendance in each registered course to be eligible for end-semester examinations.")
    
    return {
        **state,
        "context": context,
        "agent_chain": chain
    }

import re

def extract_target_section_and_semester_dept(query: str, default_section: str = "Section A", default_semester: str = "6th Semester") -> tuple:
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

def timetable_agent_node(state: DepartmentState) -> DepartmentState:
    chain = state.get("agent_chain", [])
    chain.append("Timetable Agent")
    user_name = state.get("user_name", "Student")
    query = state.get("query", "")
    default_sec = state.get("section", "Section A")
    default_sem = state.get("semester", "6th Semester")
    
    section, semester = extract_target_section_and_semester_dept(query, default_sec, default_sem)

    # Dynamic Department & Section Specific Timetable Schedules
    sec_letter = section.strip().split()[-1].upper() if section else "A"
    
    if sec_letter == "D":
        schedule_text = (
            f"• **10:00 AM - 11:00 AM**: CS604 Software Engineering (Prof. Anita Roy - Room 402)\n"
            f"• **11:00 AM - 12:00 PM**: CS602 Computer Networks (Dr. R. K. Sharma - Room 402)\n"
            f"• **12:00 PM - 01:00 PM**: Lunch Break\n"
            f"• **02:00 PM - 04:00 PM**: CS605 Web & Cloud Computing Practical (Dr. V. Patel - Advanced Computing Lab 3)"
        )
    elif sec_letter == "C":
        schedule_text = (
            f"• **10:00 AM - 11:00 AM**: CS603 Artificial Intelligence (Dr. V. Patel - Room 301)\n"
            f"• **11:00 AM - 12:00 PM**: CS601 Compiler Design (Dr. R. K. Sharma - Room 301)\n"
            f"• **12:00 PM - 01:00 PM**: Lunch Break\n"
            f"• **02:00 PM - 04:00 PM**: CS604 Software Engineering Lab (Prof. Anita Roy - Net Lab 102)"
        )
    elif sec_letter == "B":
        schedule_text = (
            f"• **10:00 AM - 11:00 AM**: CS604 Software Engineering (Prof. Anita Roy - Room 305)\n"
            f"• **11:00 AM - 12:00 PM**: CS605 Cloud Computing & DevOps (Dr. S. Mehta - Room 305)\n"
            f"• **12:00 PM - 01:00 PM**: Lunch Break\n"
            f"• **02:00 PM - 04:00 PM**: CS606 Web Technologies Lab (Dr. R. K. Sharma - Net Lab 104)"
        )
    elif "E" in section or "F" in section or "ece" in str(state.get("department", "")).lower():
        schedule_text = (
            f"• **10:00 AM - 11:00 AM**: EC601 Analog & Digital Signals (Dr. A. Verma - Room E-101)\n"
            f"• **11:00 AM - 12:00 PM**: EC602 VLSI System Design (Prof. S. Gupta - Room E-101)\n"
            f"• **12:00 PM - 01:00 PM**: Lunch Break\n"
            f"• **02:00 PM - 04:00 PM**: EC605 Microwave & Antenna Practical (Dr. M. Rao - Communication Lab 202)"
        )
    else:
        schedule_text = (
            f"• **10:00 AM - 11:00 AM**: CS601 Compiler Design (Dr. R. K. Sharma - Lab 101)\n"
            f"• **11:00 AM - 12:00 PM**: CS602 Computer Networks (Prof. Anita Roy - Seminar Hall)\n"
            f"• **12:00 PM - 01:00 PM**: Lunch Break & Academic Discussion\n"
            f"• **02:00 PM - 04:00 PM**: CS603 AI & Data Structures Practical (Dr. V. Patel - Net Lab 102)"
        )

    context = (
        f"Hello {user_name}! Here is your personalized timetable schedule for **{semester} ({section})**:\n\n"
        f"{schedule_text}"
    )
    return {
        **state,
        "context": context,
        "agent_chain": chain
    }

def response_generator_node(state: DepartmentState) -> DepartmentState:
    chain = state.get("agent_chain", [])
    chain.append("Response Generator")
    
    query = state.get("query", "")
    context = state.get("context", "How can I assist you with your academic inquiries today?")
    user_name = state.get("user_name", "Student")
    user_role = state.get("user_role", "student")

    llm = get_llm()
    if llm:
        try:
            prompt = (
                f"You are the Department AI Secretary Agent for CampusMind AI.\n"
                f"User: {user_name} (Role: {user_role})\n"
                f"User Question: '{query}'\n"
                f"Retrieved Facts / Context:\n{context}\n\n"
                f"Draft a helpful, polite, professional response answering the user directly based on the context.\n"
                f"STRICT FORMATTING RULE: Never output raw JSON or Python dictionary strings like {{\"key\": \"val\"}}. Convert all profile data, regulations, and facts into clean, human-readable Markdown with bullet points or formatted paragraphs."
            )
            response = llm.invoke(prompt)
            return {
                **state,
                "final_response": response.content,
                "agent_chain": chain
            }
        except Exception as err:
            print(f"[Dept Graph LLM Error]: {err}")
    
    return {
        **state,
        "final_response": context,
        "agent_chain": chain
    }

def route_intent(state: DepartmentState) -> str:
    intent = state.get("intent")
    if intent == "attendance_query":
        return "student_agent"
    elif intent == "timetable_query":
        return "timetable_agent"
    elif intent == "leave_application" and state.get("user_role") == "faculty":
        return "faculty_agent"
    else:
        return "rag_agent"

# Build LangGraph Workflow
builder = StateGraph(DepartmentState)

builder.add_node("router", router_node)
builder.add_node("student_agent", student_agent_node)
builder.add_node("faculty_agent", faculty_agent_node)
builder.add_node("timetable_agent", timetable_agent_node)
builder.add_node("rag_agent", rag_node)
builder.add_node("response_generator", response_generator_node)

builder.set_entry_point("router")

builder.add_conditional_edges(
    "router",
    route_intent,
    {
        "student_agent": "student_agent",
        "faculty_agent": "faculty_agent",
        "timetable_agent": "timetable_agent",
        "rag_agent": "rag_agent"
    }
)

builder.add_edge("student_agent", "response_generator")
builder.add_edge("faculty_agent", "response_generator")
builder.add_edge("timetable_agent", "response_generator")
builder.add_edge("rag_agent", "response_generator")
builder.add_edge("response_generator", END)

from langgraph.checkpoint.memory import MemorySaver

memory_saver = MemorySaver()
department_graph = builder.compile(checkpointer=memory_saver)
