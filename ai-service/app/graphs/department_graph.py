import os
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
    query = state["query"].lower()
    chain = state.get("agent_chain", [])
    chain.append("Router Agent")
    
    if "attendance" in query or "eligible" in query or "sitting" in query:
        intent = "attendance_query"
    elif "leave" in query or "medical" in query:
        intent = "leave_application"
    elif "timetable" in query or "schedule" in query or "slot" in query:
        intent = "timetable_query"
    elif "nba" in query or "naac" in query or "rule" in query or "regulation" in query:
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

def timetable_agent_node(state: DepartmentState) -> DepartmentState:
    chain = state.get("agent_chain", [])
    chain.append("Timetable Agent")
    user_name = state.get("user_name", "Student")
    semester = state.get("semester", "6th Semester")
    section = state.get("section", "Section A")

    # Dynamic Department & Section Specific Timetable Schedules
    if "E" in section or "F" in section or "ece" in str(state.get("department", "")).lower():
        schedule_text = (
            f"• **10:00 AM - 11:00 AM**: EC601 Analog & Digital Signals (Dr. A. Verma - Room E-101)\n"
            f"• **11:00 AM - 12:00 PM**: EC602 VLSI System Design (Prof. S. Gupta - Room E-101)\n"
            f"• **12:00 PM - 01:00 PM**: Lunch Break\n"
            f"• **02:00 PM - 04:00 PM**: EC605 Microwave & Antenna Practical (Dr. M. Rao - Communication Lab 202)"
        )
    elif "M" in section or "N" in section or "civil" in str(state.get("department", "")).lower():
        schedule_text = (
            f"• **10:00 AM - 11:00 AM**: CE501 Structural Analysis II (Dr. P. Sharma - Hall C-1)\n"
            f"• **11:00 AM - 12:00 PM**: CE502 Geotechnical Engineering (Prof. V. Kumar - Hall C-1)\n"
            f"• **12:00 PM - 01:00 PM**: Lunch Break\n"
            f"• **02:00 PM - 04:00 PM**: CE505 Surveying & Fluid Mechanics Lab (Dr. K. Joshi - Survey Field)"
        )
    elif "G" in section or "H" in section or "electrical" in str(state.get("department", "")).lower():
        schedule_text = (
            f"• **10:00 AM - 11:00 AM**: EE401 Power Systems Analysis (Dr. H. Roy - Room EE-201)\n"
            f"• **11:00 AM - 12:00 PM**: EE402 Control Systems Engineering (Prof. D. Shah - Room EE-201)\n"
            f"• **12:00 PM - 01:00 PM**: Lunch Break\n"
            f"• **02:00 PM - 04:00 PM**: EE405 Electrical Machines Practical (Dr. N. Bose - High Voltage Lab)"
        )
    elif "K" in section or "L" in section or "mechanical" in str(state.get("department", "")).lower():
        schedule_text = (
            f"• **10:00 AM - 11:00 AM**: ME601 Thermodynamics & Heat Transfer (Dr. T. Reddy - Workshop A)\n"
            f"• **11:00 AM - 12:00 PM**: ME602 Machine Design & Kinematics (Prof. A. Gill - Workshop A)\n"
            f"• **12:00 PM - 01:00 PM**: Lunch Break\n"
            f"• **02:00 PM - 04:00 PM**: ME605 CAD/CAM & Fluid Power Lab (Dr. B. Das - CAD Lab 3)"
        )
    elif "IT" in section or "information" in str(state.get("department", "")).lower():
        schedule_text = (
            f"• **10:00 AM - 11:00 AM**: IT601 Cloud Security & Distributed Systems (Dr. N. Sinha - Lab IT-1)\n"
            f"• **11:00 AM - 12:00 PM**: IT602 Full-Stack Web Architecture (Prof. S. Paul - Lab IT-1)\n"
            f"• **12:00 PM - 01:00 PM**: Lunch Break\n"
            f"• **02:00 PM - 04:00 PM**: IT605 Data Mining & Analytics Practical (Dr. R. Kapoor - IT Lab 2)"
        )
    elif "4th" in semester and "B" in section:
        schedule_text = (
            f"• **10:00 AM - 11:00 AM**: CS401 Operating Systems (Dr. S. Mehta - Room 204)\n"
            f"• **11:00 AM - 12:00 PM**: CS402 Discrete Mathematics (Prof. R. Singh - Room 204)\n"
            f"• **12:00 PM - 01:00 PM**: Lunch Break\n"
            f"• **02:00 PM - 04:00 PM**: CS405 Digital Electronics Practical (Dr. V. Patel - Lab 102)"
        )
    elif "6th" in semester and "B" in section:
        schedule_text = (
            f"• **10:00 AM - 11:00 AM**: CS604 Software Engineering (Prof. Anita Roy - Room 305)\n"
            f"• **11:00 AM - 12:00 PM**: CS605 Cloud Computing & DevOps (Dr. S. Mehta - Room 305)\n"
            f"• **12:00 PM - 01:00 PM**: Lunch Break\n"
            f"• **02:00 PM - 04:00 PM**: CS606 Web Technologies Lab (Dr. R. K. Sharma - Net Lab 104)"
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
                f"Draft a helpful, polite, professional response answering the user directly based on the context. Do not repeat debug traces."
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
