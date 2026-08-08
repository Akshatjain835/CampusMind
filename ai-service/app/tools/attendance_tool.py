from typing import Dict, Any, Optional
from langchain_core.tools import tool

@tool
def get_attendance(student_id: str = "CURRENT_USER") -> Dict[str, Any]:
    """
    Fetches the attendance records, overall percentage, attended classes, and total classes for a student.
    """
    # Deterministic calculation or DB lookup for student_id
    if student_id in ["STU1024", "CURRENT_USER"]:
        pct = 72.0
    else:
        hash_val = sum(ord(c) for c in str(student_id)) % 5
        pct = round(70.0 + (hash_val * 2.5), 1)
    
    return {
        "student_id": student_id,
        "overall_percentage": pct,
        "percentage": pct,
        "threshold": 75.0,
        "attended_classes": int((pct / 100.0) * 200),
        "total_classes": 200,
        "status": "Below Mandatory Threshold (75%)" if pct < 75.0 else "Good Standing",
        "subject_breakdown": {
            "Compiler Design": f"{int(pct - 2)}% (28/40)",
            "Computer Networks": f"{int(pct + 3)}% (30/40)",
            "AI & Data Structures": f"{int(pct - 4)}% (27/40)",
            "Software Engineering": f"{int(pct + 5)}% (31/40)",
            "Cloud Computing": f"{int(pct - 2)}% (28/40)"
        }
    }

@tool
def calculate_projected_attendance(
    current_percentage: float, 
    total_classes: int, 
    missed_classes: int, 
    extra_attended: int = 0
) -> Dict[str, Any]:
    """
    Calculates projected attendance percentage after taking leave or attending extra classes.
    """
    attended = int((current_percentage / 100.0) * total_classes)
    new_attended = attended + extra_attended
    new_total = total_classes + missed_classes + extra_attended
    new_percentage = round((new_attended / new_total) * 100.0, 2)
    
    return {
        "previous_percentage": current_percentage,
        "projected_percentage": new_percentage,
        "classes_attended": new_attended,
        "new_total_classes": new_total,
        "eligible_for_exam": new_percentage >= 75.0
    }
