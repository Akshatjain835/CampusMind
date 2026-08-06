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

class QueryRequest(BaseModel):
    user_name: str = "Rahul Sharma"
    user_role: str = "student"
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

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "DepartmentAI FastAPI LangGraph & Qdrant Engine",
        "version": "1.0.0"
    }

@app.get("/health")
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

@app.post("/api/ai/query")
def execute_agent_workflow(request: QueryRequest):
    """Executes the complete LangGraph Multi-Agent workflow using Qdrant RAG."""
    try:
        initial_state: DepartmentState = {
            "user_name": request.user_name,
            "user_role": request.user_role,
            "semester": request.semester or "6th Semester",
            "section": request.section or "Section A",
            "query": request.query,
            "intent": None,
            "context": None,
            "agent_chain": [],
            "final_response": None
        }
        
        dept_key = (request.department or "CSE").replace(" ", "_")
        session_thread_id = f"{dept_key}_{request.user_role}_{request.thread_id or 'default'}"
        result_state = department_graph.invoke(
            initial_state,
            config={"configurable": {"thread_id": session_thread_id}}
        )
        
        return {
            "query": request.query,
            "intent": result_state.get("intent"),
            "agent_chain": result_state.get("agent_chain", []),
            "final_response": result_state.get("final_response", "No response generated.")
        }
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
