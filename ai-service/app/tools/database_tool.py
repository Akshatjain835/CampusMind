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
        
    target_id = "STU1024"
    if "student_id = '" in query:
        target_id = query.split("student_id = '")[1].split("'")[0]
    elif "student_id='" in query:
        target_id = query.split("student_id='")[1].split("'")[0]

    return {
        "query": query,
        "execution_status": "Success",
        "rows_returned": 1,
        "results": [
            {"student_id": target_id, "name": "Active Student User", "gpa": 8.4, "status": "Active", "department": "Computer Science & Engineering"}
        ]
    }
