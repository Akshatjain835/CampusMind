import sys
import io
import os
import uuid
from dotenv import load_dotenv

load_dotenv()

if hasattr(sys.stdout, 'buffer'):
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from app.graphs.department_graph import department_graph, DepartmentState
from app.rag.qdrant_ingester import ingest_to_qdrant
from app.rag.qdrant_retriever import search_qdrant_regulations
from app.agents.leave_agent import evaluate_leave_request
from app.agents.notice_agent import generate_academic_notice
from app.agents.timetable_agent import generate_conflict_free_timetable
from app.agents.meeting_agent import schedule_meeting_agent
from app.agents.analytics_agent import generate_executive_analytics_summary

app = FastAPI(
    title="DepartmentAI FastAPI Microservice",
    description="Agentic Academic Governance AI Microservice powered by LangGraph & Qdrant Vector Store",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi.responses import JSONResponse
from fastapi import Request

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print(f"[FastAPI Exception Handler]: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "error": True,
            "message": "An unexpected error occurred in DepartmentAI Microservice",
            "detail": str(exc)
        }
    )

class QueryRequest(BaseModel):
    user_name: Optional[str] = "Rahul Sharma"
    user_role: Optional[str] = "student"
    student_id: Optional[str] = None
    department: Optional[str] = "Computer Science & Engineering"
    semester: Optional[str] = "6th Semester"
    section: Optional[str] = "Section A"
    query: str
    thread_id: Optional[str] = "default_session"

class SearchRequest(BaseModel):
    query: str
    top_k: Optional[int] = 3

class LeaveEvaluationRequest(BaseModel):
    user_name: str
    user_role: str = "student"
    leave_type: str
    start_date: str
    end_date: str
    reason: str
    current_attendance: float = 80.0

@app.api_route("/", methods=["GET", "HEAD"])
def read_root():
    return {
        "status": "online",
        "service": "DepartmentAI FastAPI LangGraph & Qdrant Engine",
        "version": "1.0.0"
    }

@app.api_route("/health", methods=["GET", "HEAD"])
def health_check():
    return {"status": "healthy"}

@app.post("/api/ai/ingest")
def trigger_qdrant_ingestion():
    """Ingests documents from docs/ into Qdrant Vector Database."""
    try:
        result = ingest_to_qdrant()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ai/search")
def search_qdrant(request: SearchRequest):
    """Direct semantic search against Qdrant Vector Store."""
    try:
        results = search_qdrant_regulations(request.query, top_k=request.top_k)
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ai/evaluate-leave")
def evaluate_student_leave(request: LeaveEvaluationRequest):
    """Executes AI Leave Agent to evaluate leave request against Qdrant regulations."""
    try:
        result = evaluate_leave_request(
            user_name=request.user_name,
            user_role=request.user_role,
            leave_type=request.leave_type,
            reason=request.reason,
            current_attendance=request.current_attendance
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from fastapi.responses import JSONResponse, StreamingResponse
from fastapi import Request
import json
import asyncio

from app.graph.dynamic_graph import dynamic_campus_graph
from app.state.state import AgentState
from app.cache.redis_cache import get_cached_response, set_cached_response
from app.observability.langsmith_tracer import setup_langsmith_tracing, audit_agent_step

@app.post("/api/ai/stream-query")
async def stream_agent_workflow(request: QueryRequest):
    """Streams multi-agent graph execution step-by-step using Server-Sent Events (SSE)."""
    async def event_generator():
        try:
            active_student_id = request.student_id or request.thread_id or "STU1024"
            initial_state: AgentState = {
                "user_name": request.user_name,
                "user_role": request.user_role,
                "student_id": active_student_id,
                "department": request.department or "Computer Science & Engineering",
                "semester": request.semester or "6th Semester",
                "section": request.section or "Section A",
                "query": request.query,
                "multi_modal_inputs": None,
                "plan": None,
                "task_queue": [],
                "completed_tasks": [],
                "current_task_id": None,
                "agent_chain": [],
                "shared_memory": {},
                "tool_results": {},
                "retrieved_documents": [],
                "reflection_count": 0,
                "reflection_feedback": None,
                "needs_human_approval": False,
                "human_approval_context": None,
                "human_approved": None,
                "is_complete": False,
                "final_response": None,
                "errors": []
            }
            
            import uuid
            dept_key = (request.department or "CSE").replace(" ", "_")
            session_thread_id = request.thread_id or f"{dept_key}_{request.user_role}_{request.user_name.replace(' ', '_')}"

            for event in dynamic_campus_graph.stream(
                initial_state,
                config={"configurable": {"thread_id": session_thread_id}}
            ):
                if not isinstance(event, dict):
                    continue
                for node_name, node_state in event.items():
                    if node_name == "__interrupt__":
                        # If graph interrupted for HITL approval, fetch current state snapshot
                        state_snap = dynamic_campus_graph.get_state({"configurable": {"thread_id": session_thread_id}}).values
                        if isinstance(state_snap, dict):
                            # Dynamically generate briefing from state gathered so far
                            from app.graph.dynamic_graph import response_generator_node
                            gen_state = response_generator_node(state_snap)
                            final_resp = gen_state.get("final_response")
                            chain = gen_state.get("agent_chain", [])
                            data_payload = {
                                "node": "hod_approval_node",
                                "agent": "HOD Approval Governance Intercept",
                                "chain": chain,
                                "shared_memory_keys": list(gen_state.get("shared_memory", {}).keys()),
                                "final_response": final_resp,
                                "needs_human_approval": gen_state.get("needs_human_approval", True),
                                "human_approval_context": gen_state.get("human_approval_context")
                            }
                            yield f"data: {json.dumps(data_payload)}\n\n"
                        continue

                    if isinstance(node_state, tuple):
                        node_state = node_state[0] if len(node_state) > 0 and isinstance(node_state[0], dict) else {}
                    if not isinstance(node_state, dict):
                        node_state = {}

                    chain = node_state.get("agent_chain", [])
                    active_agent = chain[-1] if chain else node_name
                    audit_agent_step(active_agent, node_state)
                    
                    data_payload = {
                        "node": node_name,
                        "agent": active_agent,
                        "chain": chain,
                        "shared_memory_keys": list(node_state.get("shared_memory", {}).keys()),
                        "final_response": node_state.get("final_response"),
                        "needs_human_approval": node_state.get("needs_human_approval", False),
                        "human_approval_context": node_state.get("human_approval_context")
                    }
                    yield f"data: {json.dumps(data_payload)}\n\n"
                    await asyncio.sleep(0.05)

            yield "data: [DONE]\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")

@app.post("/api/ai/query")
def execute_agent_workflow(request: QueryRequest):
    """Executes the autonomous multi-agent system with Redis caching and LangSmith tracing."""
    try:
        # 1. Check Redis / In-Memory Cache
        cached = get_cached_response(
            query=request.query,
            user_role=request.user_role or "student",
            department=request.department or "Computer Science & Engineering"
        )
        if cached:
            return {
                **cached,
                "cached": True
            }

        active_student_id = request.student_id or request.thread_id or "STU1024"
        initial_state: AgentState = {
            "user_name": request.user_name,
            "user_role": request.user_role,
            "student_id": active_student_id,
            "department": request.department or "Computer Science & Engineering",
            "semester": request.semester or "6th Semester",
            "section": request.section or "Section A",
            "query": request.query,
            "multi_modal_inputs": None,
            "plan": None,
            "task_queue": [],
            "completed_tasks": [],
            "current_task_id": None,
            "agent_chain": [],
            "shared_memory": {},
            "tool_results": {},
            "retrieved_documents": [],
            "reflection_count": 0,
            "reflection_feedback": None,
            "needs_human_approval": False,
            "human_approval_context": None,
            "human_approved": None,
            "is_complete": False,
            "final_response": None,
            "errors": []
        }
        
        dept_key = (request.department or "CSE").replace(" ", "_")
        session_thread_id = f"{request.thread_id or dept_key}_{uuid.uuid4().hex[:8]}"
        final_state = dynamic_campus_graph.invoke(
            initial_state,
            config={"configurable": {"thread_id": session_thread_id}}
        )
        
        if isinstance(final_state, tuple):
            final_state = final_state[0] if len(final_state) > 0 and isinstance(final_state[0], dict) else {}
        if not isinstance(final_state, dict):
            final_state = {}

        chain = final_state.get("agent_chain", [])
        intent_label = f"Multi-Agent System ({' ➔ '.join(chain)})" if chain else "Autonomous Agent"
        
        result_payload = {
            "query": request.query,
            "intent": intent_label,
            "agent_chain": chain,
            "goal": final_state.get("plan", {}).get("goal"),
            "needs_human_approval": final_state.get("needs_human_approval", False),
            "human_approval_context": final_state.get("human_approval_context"),
            "final_response": final_state.get("final_response", "No response generated.")
        }

        # 2. Save result to Redis / In-Memory Cache
        set_cached_response(
            query=request.query,
            response_data=result_payload,
            user_role=request.user_role or "student",
            department=request.department or "Computer Science & Engineering"
        )
        
        return result_payload
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/ai/dynamic-query")
def execute_dynamic_multi_agent_workflow(request: QueryRequest):
    """Executes the dynamic production-grade Multi-Agent workflow with Planning, Reasoning & Reflection."""
    try:
        active_student_id = request.student_id or request.thread_id or "STU1024"
        initial_state: AgentState = {
            "user_name": request.user_name,
            "user_role": request.user_role,
            "student_id": active_student_id,
            "department": request.department or "Computer Science & Engineering",
            "semester": request.semester or "6th Semester",
            "section": request.section or "Section A",
            "query": request.query,
            "multi_modal_inputs": None,
            "plan": None,
            "task_queue": [],
            "completed_tasks": [],
            "current_task_id": None,
            "agent_chain": [],
            "shared_memory": {},
            "tool_results": {},
            "retrieved_documents": [],
            "reflection_count": 0,
            "reflection_feedback": None,
            "needs_human_approval": False,
            "human_approval_context": None,
            "human_approved": None,
            "is_complete": False,
            "final_response": None,
            "errors": []
        }
        
        session_thread_id = f"dynamic_{request.user_role}_{uuid.uuid4().hex[:8]}"
        final_state = dynamic_campus_graph.invoke(
            initial_state,
            config={"configurable": {"thread_id": session_thread_id}}
        )
        
        return {
            "query": request.query,
            "goal": final_state.get("plan", {}).get("goal"),
            "agent_chain": final_state.get("agent_chain", []),
            "subtasks": final_state.get("plan", {}).get("tasks", []),
            "shared_memory": final_state.get("shared_memory", {}),
            "needs_human_approval": final_state.get("needs_human_approval", False),
            "human_approval_context": final_state.get("human_approval_context"),
            "final_response": final_state.get("final_response")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class HITLApprovalRequest(BaseModel):
    thread_id: str
    approved: bool
    approver_role: str = "HOD"
    comments: Optional[str] = "Approved by Department Administrator"

@app.post("/api/ai/human-approve")
def approve_human_in_the_loop_action(request: HITLApprovalRequest):
    """Resumes paused agent graph execution after human confirmation."""
    try:
        session_thread_id = request.thread_id
        current_state = dynamic_campus_graph.get_state({"configurable": {"thread_id": session_thread_id}}).values
        
        if not current_state:
            raise HTTPException(status_code=404, detail="No active graph checkpoint found for thread_id.")
            
        updated_state = {
            **current_state,
            "human_approved": True,
            "needs_human_approval": False
        }
        
        resumed_state = dynamic_campus_graph.invoke(
            updated_state,
            config={"configurable": {"thread_id": session_thread_id}}
        )
        
        return {
            "status": "Resumed & Completed",
            "thread_id": session_thread_id,
            "agent_chain": resumed_state.get("agent_chain", []),
            "final_response": resumed_state.get("final_response")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class MultiModalUploadRequest(BaseModel):
    user_name: Optional[str] = "Rahul Sharma"
    user_role: Optional[str] = "student"
    image_base64: Optional[str] = None
    file_type: str = "timetable_image"
    prompt: Optional[str] = "Extract schedule from timetable screenshot and check for conflicts."

@app.post("/api/ai/multimodal-parse")
def parse_multimodal_document(request: MultiModalUploadRequest):
    """Processes uploaded timetable images or notice PDFs via Multi-Modal Vision Agent."""
    try:
        from app.agents.vision_agent import parse_multimodal_input
        extracted = parse_multimodal_input(image_base64=request.image_base64, file_type=request.file_type)
        return extracted
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class EventPublishRequest(BaseModel):
    event_type: str = "NoticeUploaded"
    department: str = "Computer Science & Engineering"
    student_id: Optional[str] = "STU1024"
    notice_title: Optional[str] = "Mid-Semester Examination Schedule Announced"

@app.post("/api/ai/publish-event")
def trigger_event_driven_agent(request: EventPublishRequest):
    """Publishes an administrative event to trigger autonomous background multi-agent pipelines."""
    try:
        from app.events.event_dispatcher import event_dispatcher
        result = event_dispatcher.publish_event(
            event_type=request.event_type,
            payload={
                "department": request.department,
                "student_id": request.student_id,
                "notice_title": request.notice_title,
                "threshold": 75.0
            }
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class NoticeGenerationRequest(BaseModel):
    prompt: str
    category: Optional[str] = "Academic"
    target_audience: Optional[str] = "All"
    department: Optional[str] = "Computer Science & Engineering"
    author_name: Optional[str] = "Head of Department"
    author_role: Optional[str] = "HOD"

@app.post("/api/ai/generate-notice")
def generate_notice_endpoint(request: NoticeGenerationRequest):
    """Generates an official academic circular from prompt using Notice Agent."""
    try:
        return generate_academic_notice(
            prompt=request.prompt,
            category=request.category,
            target_audience=request.target_audience,
            department=request.department,
            author_name=request.author_name,
            author_role=request.author_role
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class TimetableGenerationRequest(BaseModel):
    department: Optional[str] = "Computer Science & Engineering"
    semester: Optional[str] = "6th Semester"
    section: Optional[str] = "Section A"
    courses: Optional[list] = None
    lab_rooms: Optional[list] = None

@app.post("/api/ai/generate-timetable")
def generate_timetable_endpoint(request: TimetableGenerationRequest):
    """Generates a conflict-free weekly schedule using Timetable Agent."""
    try:
        return generate_conflict_free_timetable(
            department=request.department,
            semester=request.semester,
            section=request.section,
            courses=request.courses,
            lab_rooms=request.lab_rooms
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class MeetingScheduleRequest(BaseModel):
    title: str
    date: str
    time_slot: Optional[str] = "11:00 AM - 12:00 PM"
    department: Optional[str] = "Computer Science & Engineering"
    priority: Optional[str] = "Normal"
    organizer_name: Optional[str] = "HOD"
    organizer_role: Optional[str] = "HOD"
    participants: Optional[list] = None

@app.post("/api/ai/schedule-meeting")
def schedule_meeting_endpoint(request: MeetingScheduleRequest):
    """Schedules a department meeting using LangGraph Meeting Agent workflow."""
    try:
        return schedule_meeting_agent(
            title=request.title,
            date=request.date,
            time_slot=request.time_slot,
            department=request.department,
            priority=request.priority,
            organizer_name=request.organizer_name,
            organizer_role=request.organizer_role,
            participants=request.participants
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class AnalyticsSummaryRequest(BaseModel):
    department: Optional[str] = "Computer Science & Engineering"
    user_name: Optional[str] = "HOD"
    user_role: Optional[str] = "HOD"
    attendance_rate: Optional[float] = 81.4
    avg_workload: Optional[float] = 18.5
    naac_score: Optional[int] = 88
    papers_count: Optional[int] = 24

@app.post("/api/ai/analytics-summary")
def analytics_summary_endpoint(request: AnalyticsSummaryRequest):
    """Generates an executive performance summary using Analytics Agent."""
    try:
        return generate_executive_analytics_summary(
            department=request.department,
            user_name=request.user_name,
            user_role=request.user_role,
            attendance_rate=request.attendance_rate,
            avg_workload=request.avg_workload,
            naac_score=request.naac_score,
            papers_count=request.papers_count
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
