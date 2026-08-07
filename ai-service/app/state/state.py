from typing import TypedDict, List, Dict, Any, Optional
from pydantic import BaseModel, Field

class SubTask(BaseModel):
    id: str = Field(description="Unique identifier for the subtask e.g. task_1")
    agent: str = Field(description="Target agent name (e.g. attendance_agent, leave_agent, regulation_agent, timetable_agent, analytics_agent, faculty_agent, database_agent, email_agent)")
    description: str = Field(description="Action description of what this subtask accomplishes")
    dependencies: List[str] = Field(default_factory=list, description="IDs of tasks that must complete before this task can start")
    tool_hint: Optional[str] = Field(default=None, description="Suggested tool to call for this task")
    status: str = Field(default="pending", description="Status: pending, running, completed, failed")
    result: Optional[Any] = Field(default=None, description="Outcome or output of this subtask")

class ExecutionPlan(BaseModel):
    goal: str = Field(description="High level objective extracted from the user query")
    reasoning: str = Field(description="Rationale behind selecting these specific steps and agents")
    tasks: List[SubTask] = Field(description="Ordered/DAG list of subtasks to resolve the query")
    requires_parallel_execution: bool = Field(default=False, description="True if independent steps can execute simultaneously")

class AgentState(TypedDict):
    # Session & User Profile Metadata
    user_name: str
    user_role: str
    student_id: Optional[str]
    department: Optional[str]
    semester: Optional[str]
    section: Optional[str]
    
    # Query & Inputs
    query: str
    multi_modal_inputs: Optional[Dict[str, Any]]
    
    # Planning & Task Decomposition State
    plan: Optional[Dict[str, Any]] # Serialized ExecutionPlan
    task_queue: List[Dict[str, Any]]
    completed_tasks: List[str]
    current_task_id: Optional[str]
    
    # Shared Memory & Intermediate Context
    agent_chain: List[str]
    shared_memory: Dict[str, Any]
    tool_results: Dict[str, Any]
    retrieved_documents: List[Dict[str, Any]]
    
    # Reflection & Quality Assurance
    reflection_count: int
    reflection_feedback: Optional[str]
    
    # Human in the Loop (HITL)
    needs_human_approval: bool
    human_approval_context: Optional[Dict[str, Any]]
    human_approved: Optional[bool]
    
    # Output & Flow Control
    is_complete: bool
    final_response: Optional[str]
    errors: List[str]
