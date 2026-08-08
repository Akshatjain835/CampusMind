import json
from typing import Dict, Any, List
from langchain_core.prompts import ChatPromptTemplate
from app.agents.llm_factory import get_llm
from app.state.state import AgentState
from app.observability.langsmith_tracer import audit_agent_step

ROUTER_PROMPT = """You are the Academic Intent Router Agent for CampusMind.
Analyze the user query and output a JSON object specifying the optimal primary specialist agent and execution strategy.

Available Specialist Agents:
- "attendance_agent": Attendance records, attendance percentage, class hours.
- "leave_agent": Medical leave, leave application, leave balance, condonation.
- "faculty_agent": Faculty search, faculty availability, advisor details.
- "timetable_agent": Class schedules, free slot detection, room bookings.
- "notice_agent": Academic circulars, exam dates, official notices.
- "rag_agent": University regulations, NAAC/NBA policies, grading rules, fee rules.
- "analytics_agent": Attendance risk forecasting, CGPA prediction, extra classes required.
- "database_agent": Direct database queries for student records, enrollment status.

User Query: "{query}"

Respond strictly with a valid JSON object matching this schema:
{{
  "primary_agent": "agent_name",
  "intent_category": "academic_regulation | leave_management | scheduling | database_lookup | analytics",
  "recommended_chain": ["agent_1", "agent_2"],
  "reasoning": "Explanation for agent selection"
}}
"""

def route_query_with_llm(query: str) -> Dict[str, Any]:
    """
    LLM-powered Router Agent that dynamically classifies user intent
    and selects the optimal multi-agent execution chain.
    """
    llm = get_llm(temperature=0.0)
    
    if llm is None:
        print("[LLM Router Fallback]: Using deterministic router classification.")
        query_lower = query.lower()
        if "leave" in query_lower:
            primary = "leave_agent"
            cat = "leave_management"
        elif any(k in query_lower for k in ["class", "classes", "schedule", "timetable", "routine"]):
            primary = "timetable_agent"
            cat = "scheduling"
        elif any(k in query_lower for k in ["faculty", "meeting"]):
            primary = "faculty_agent"
            cat = "scheduling"
        else:
            primary = "rag_agent"
            cat = "academic_regulation"
            
        return {
            "primary_agent": primary,
            "intent_category": cat,
            "recommended_chain": [primary],
            "reasoning": "Deterministic router classification fallback"
        }

    try:
        prompt = ChatPromptTemplate.from_template(ROUTER_PROMPT)
        chain = prompt | llm
        res = chain.invoke({"query": query})
        content = res.content if hasattr(res, "content") else str(res)
        
        # Clean JSON markdown fences
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()
            
        data = json.loads(content)
        audit_agent_step("LLM Router Agent", data)
        print(f"[LLM Router Agent]: Classifications -> Primary Agent = {data.get('primary_agent')} | Intent = {data.get('intent_category')}")
        return data
    except Exception as e:
        print(f"[LLM Router Fallback]: Error in routing ({e}). Falling back to standard dispatch.")
        return {
            "primary_agent": "rag_agent",
            "intent_category": "academic_regulation",
            "recommended_chain": ["rag_agent"],
            "reasoning": "Fallback default router"
        }
