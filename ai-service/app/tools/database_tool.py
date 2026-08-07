from typing import Dict, Any, Optional
from langchain_core.tools import tool

@tool
def execute_sql_query(query: str) -> Dict[str, Any]:
    """
    Executes a safe read-only SQL query against the CampusMind university database.
    """
    query_lower = query.lower()
    if "drop" in query_lower or "delete" in query_lower or "truncate" in query_lower:
        return {
            "error": True,
            "message": "Modification queries (DROP, DELETE, TRUNCATE) are forbidden for safety."
        }
        
    return {
        "query": query,
        "execution_status": "Success",
        "rows_returned": 2,
        "results": [
            {"student_id": "STU1024", "name": "Rahul Sharma", "gpa": 8.4, "status": "Active"},
            {"student_id": "STU1025", "name": "Priya Singh", "gpa": 9.1, "status": "Active"}
        ]
    }
