from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from app.graphs.department_graph import department_graph, DepartmentState
from app.rag.qdrant_ingester import ingest_to_qdrant
from app.rag.qdrant_retriever import search_qdrant_regulations
from app.agents.leave_agent import evaluate_leave_request

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
    query: str

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
            "query": request.query,
            "intent": None,
            "context": None,
            "agent_chain": [],
            "final_response": None
        }
        
        result_state = department_graph.invoke(initial_state)
        
        return {
            "query": request.query,
            "intent": result_state.get("intent"),
            "agent_chain": result_state.get("agent_chain", []),
            "final_response": result_state.get("final_response", "No response generated.")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
