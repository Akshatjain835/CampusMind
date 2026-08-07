import json
import uuid
from typing import Dict, Any, List
from langchain_core.prompts import ChatPromptTemplate
from app.agents.llm_factory import get_llm
from app.state.state import AgentState, ExecutionPlan, SubTask

SYSTEM_PLANNER_PROMPT = """You are the Lead Planner Agent for CampusMind, a production-grade academic multi-agent system.
Your job is to analyze the user query and user context, and output a structured Execution Plan (JSON DAG) that decomposes the request into discrete subtasks assigned to specialist agents.

Available Specialist Agents:
1. "attendance_agent": Fetches current attendance percentages, course breakdown, and attendance thresholds.
2. "leave_agent": Processes leave requests, medical exemptions, and leave balance checks.
3. "faculty_agent": Manages faculty workload, faculty availability, and faculty details.
4. "timetable_agent": Fetches class schedules, room allocations, and detects conflict-free free slots.
5. "notice_agent": Searches circulars, academic notices, and department announcements.
6. "rag_agent": Queries university academic regulations, attendance rules, NAAC/NBA policies, and exam eligibility criteria.
7. "analytics_agent": Forecasts attendance trends, calculates required extra classes, predicts exam eligibility risks, and estimates CGPA impact.
8. "database_agent": Queries SQL/MongoDB databases for direct student records or course info.
9. "email_agent": Prepares and dispatches emails or notifications to faculty or students.

Rules for Decomposing Tasks:
- Do NOT just assign a single agent if the query requires multi-step reasoning.
- Break multi-part requests into step-by-step DAG subtasks.
- Specify clear dependencies (e.g., task_2 depends on task_1 if task_2 needs data produced by task_1).
- Set `requires_parallel_execution` to true if independent tasks (like checking attendance AND checking regulation) can run concurrently.

Example User Query: "I have 72% attendance. I need leave for next week. Can I still sit in the semester exam?"
Example Output JSON:
{
  "goal": "Evaluate exam eligibility given current attendance and upcoming leave request",
  "reasoning": "We first need current attendance metrics, regulations regarding minimum attendance thresholds, and leave policy impact before analyzing future exam eligibility.",
  "requires_parallel_execution": true,
  "tasks": [
    {
      "id": "task_1",
      "agent": "attendance_agent",
      "description": "Fetch current attendance percentage and course breakdown",
      "dependencies": [],
      "tool_hint": "get_attendance"
    },
    {
      "id": "task_2",
      "agent": "rag_agent",
      "description": "Retrieve academic regulations on minimum attendance requirements for semester exams",
      "dependencies": [],
      "tool_hint": "search_regulations"
    },
    {
      "id": "task_3",
      "agent": "leave_agent",
      "description": "Assess proposed leave days and calculate impact on total course hours",
      "dependencies": ["task_1"],
      "tool_hint": "evaluate_leave"
    },
    {
      "id": "task_4",
      "agent": "analytics_agent",
      "description": "Calculate projected final attendance percentage after leave and forecast exam eligibility",
      "dependencies": ["task_1", "task_2", "task_3"],
      "tool_hint": "forecast_eligibility"
    }
  ]
}

Ensure your response is valid JSON strictly adhering to the schema.
"""

def create_fallback_plan(query: str) -> ExecutionPlan:
    """Deterministic fallback planner when LLM is unavailable."""
    query_lower = query.lower()
    tasks: List[SubTask] = []
    
    if any(k in query_lower for k in ["name", "who am i", "my name", "profile", "identity"]):
        tasks = [
            SubTask(id="task_1", agent="database_agent", description="Fetch user profile details", dependencies=[])
        ]
        return ExecutionPlan(
            goal="Identify active student user identity and profile",
            reasoning="Direct memory/profile lookup query",
            requires_parallel_execution=False,
            tasks=tasks
        )
    elif "eligible" in query_lower or ("attendance" in query_lower and "leave" in query_lower):
        tasks = [
            SubTask(id="task_1", agent="attendance_agent", description="Fetch current attendance stats", dependencies=[]),
            SubTask(id="task_2", agent="rag_agent", description="Query attendance regulations", dependencies=[]),
            SubTask(id="task_3", agent="leave_agent", description="Evaluate leave impact", dependencies=["task_1"]),
            SubTask(id="task_4", agent="analytics_agent", description="Calculate final projected attendance risk", dependencies=["task_1", "task_2", "task_3"])
        ]
        return ExecutionPlan(
            goal="Analyze exam eligibility and leave impact",
            reasoning="Fallback multi-step plan combining attendance, regulation, leave, and predictive analytics",
            requires_parallel_execution=True,
            tasks=tasks
        )
    elif "meeting" in query_lower or "schedule" in query_lower and "notify" in query_lower:
        tasks = [
            SubTask(id="task_1", agent="faculty_agent", description="Identify target faculty participants", dependencies=[]),
            SubTask(id="task_2", agent="timetable_agent", description="Find conflict-free free slots across calendars", dependencies=["task_1"]),
            SubTask(id="task_3", agent="email_agent", description="Notify participants of scheduled meeting", dependencies=["task_2"])
        ]
        return ExecutionPlan(
            goal="Schedule faculty meeting and notify participants",
            reasoning="Sequential workflow for participant identification, slot finding, and notification",
            requires_parallel_execution=False,
            tasks=tasks
        )
    elif "timetable" in query_lower or "class" in query_lower:
        tasks = [
            SubTask(id="task_1", agent="timetable_agent", description="Fetch schedule for section and semester", dependencies=[])
        ]
        return ExecutionPlan(
            goal="Retrieve timetable schedule",
            reasoning="Direct timetable query",
            requires_parallel_execution=False,
            tasks=tasks
        )
    elif "leave" in query_lower:
        tasks = [
            SubTask(id="task_1", agent="attendance_agent", description="Fetch current attendance", dependencies=[]),
            SubTask(id="task_2", agent="leave_agent", description="Evaluate leave policy compliance", dependencies=["task_1"])
        ]
        return ExecutionPlan(
            goal="Evaluate leave request",
            reasoning="Attendance verification followed by leave policy check",
            requires_parallel_execution=False,
            tasks=tasks
        )
    else:
        tasks = [
            SubTask(id="task_1", agent="rag_agent", description="Query knowledge base for academic information", dependencies=[])
        ]
        return ExecutionPlan(
            goal="Answer general academic query",
            reasoning="Standard academic RAG fallback",
            requires_parallel_execution=False,
            tasks=tasks
        )

def planner_node(state: AgentState) -> AgentState:
    """
    Planner Node in LangGraph.
    Inspects user state and query, generates structured ExecutionPlan, and attaches it to AgentState.
    """
    query = state.get("query", "")
    user_name = state.get("user_name", "Student")
    user_role = state.get("user_role", "student")
    department = state.get("department", "CSE")
    semester = state.get("semester", "6th Semester")
    
    agent_chain = state.get("agent_chain", [])
    agent_chain.append("Planner Agent")
    
    llm = get_llm(temperature=0.1)
    plan_obj: ExecutionPlan
    
    if llm:
        try:
            prompt = ChatPromptTemplate.from_messages([
                ("system", SYSTEM_PLANNER_PROMPT),
                ("user", "User Name: {user_name}\nRole: {user_role}\nDepartment: {department}\nSemester: {semester}\nQuery: {query}\n\nProduce Execution Plan JSON:")
            ])
            formatted_prompt = prompt.format(
                user_name=user_name,
                user_role=user_role,
                department=department,
                semester=semester,
                query=query
            )
            
            # Try structured output or JSON parsing
            structured_llm = llm.with_structured_output(ExecutionPlan)
            plan_obj = structured_llm.invoke(formatted_prompt)
        except Exception as err:
            print(f"[Planner Agent LLM Warning]: {err}. Falling back to deterministic plan.")
            plan_obj = create_fallback_plan(query)
    else:
        plan_obj = create_fallback_plan(query)

    plan_dict = plan_obj.model_dump()
    task_queue = [t for t in plan_dict["tasks"]]
    
    print(f"[Planner Agent] Generated Goal: {plan_dict['goal']} with {len(task_queue)} subtasks.")

    return {
        **state,
        "plan": plan_dict,
        "task_queue": task_queue,
        "agent_chain": agent_chain,
        "is_complete": False
    }
