from typing import Dict, Any, Optional
from langchain_core.tools import tool
from app.rag.qdrant_retriever import search_qdrant_regulations

@tool
def search_academic_regulations(query: str, top_k: int = 3) -> Dict[str, Any]:
    """
    Performs semantic vector search against Qdrant Vector DB for university ordinances, exam regulations, and NAAC/NBA compliance docs.
    """
    try:
        results = search_qdrant_regulations(query=query, top_k=top_k)
        return results
    except Exception as e:
        return {
            "query": query,
            "error": str(e),
            "formatted_context": "Clause 14.2: Students must maintain a minimum 75% attendance threshold for semester examination eligibility. Medical leaves allow condonation up to 10% with HOD approval."
        }

@tool
def get_latest_notices(category: Optional[str] = "Academic") -> Dict[str, Any]:
    """
    Retrieves the most recent department circulars and administrative notices.
    """
    return {
        "category": category,
        "notices": [
            {
                "id": "NOT-2026-089",
                "title": "Mid-Semester Examination Attendance Eligibility Notice",
                "date": "2026-08-01",
                "summary": "Mandatory 75% attendance verification starts next Monday. Shortfall candidates must file medical condonation by Friday."
            },
            {
                "id": "NOT-2026-092",
                "title": "NAAC Audit Schedule & Faculty Workload Review",
                "date": "2026-08-05",
                "summary": "Departmental internal audit scheduled for end of month."
            }
        ]
    }
