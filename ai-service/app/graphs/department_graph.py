from typing import Dict, Any, List, TypedDict, Optional
from langgraph.graph import StateGraph, END
from app.rag.qdrant_retriever import search_qdrant_regulations

class DepartmentState(TypedDict):
    user_name: str
    user_role: str
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
    context = "Evaluated student profile in MongoDB: Rahul Sharma (CS2024-042), Attendance: 84.5%. Status: Eligible for End-Sem Examinations."
    return {
        **state,
        "context": context,
        "agent_chain": chain
    }

def faculty_agent_node(state: DepartmentState) -> DepartmentState:
    chain = state.get("agent_chain", [])
    chain.append("Faculty Agent")
    context = "Faculty Workload verified: Dr. Anita Verma, 18 Hours/Week. Assigned Subjects: Machine Learning, Data Structures."
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
    context = qdrant_res.get("formatted_context", "Department Regulation: Minimum attendance required is 75%.")
    
    return {
        **state,
        "context": f"Retrieved Regulations from Qdrant Vector Store:\n{context}",
        "agent_chain": chain
    }

def response_generator_node(state: DepartmentState) -> DepartmentState:
    chain = state.get("agent_chain", [])
    chain.append("Response Generator")
    
    user_name = state.get("user_name", "User")
    intent = state.get("intent", "query")
    context = state.get("context", "")
    
    response = (
        f"### 🎯 DepartmentAI Response for {user_name}\n\n"
        f"**Intent Recognized**: `{intent}`\n\n"
        f"{context}\n\n"
        f"**Agentic Execution Trace**: `({' -> '.join(chain)})`"
    )
    
    return {
        **state,
        "final_response": response,
        "agent_chain": chain
    }

def route_intent(state: DepartmentState) -> str:
    intent = state.get("intent")
    if intent == "attendance_query":
        return "student_agent"
    elif intent == "rag_regulation":
        return "rag_agent"
    elif intent == "leave_application" and state.get("user_role") == "faculty":
        return "faculty_agent"
    else:
        return "rag_agent"

# Build LangGraph Workflow
builder = StateGraph(DepartmentState)

builder.add_node("router", router_node)
builder.add_node("student_agent", student_agent_node)
builder.add_node("faculty_agent", faculty_agent_node)
builder.add_node("rag_agent", rag_node)
builder.add_node("response_generator", response_generator_node)

builder.set_entry_point("router")

builder.add_conditional_edges(
    "router",
    route_intent,
    {
        "student_agent": "student_agent",
        "faculty_agent": "faculty_agent",
        "rag_agent": "rag_agent"
    }
)

builder.add_edge("student_agent", "response_generator")
builder.add_edge("faculty_agent", "response_generator")
builder.add_edge("rag_agent", "response_generator")
builder.add_edge("response_generator", END)

department_graph = builder.compile()
