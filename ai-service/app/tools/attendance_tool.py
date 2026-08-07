from typing import Dict, Any, Optional
from langchain_core.tools import tool

@tool
def get_attendance(student_id: str = "STU1024") -> Dict[str, Any]:
    """
    Fetches the attendance records, overall percentage, attended classes, and total classes for a student.
    """
    return {
        "student_id": student_id,
        "overall_percentage": 72.0,
        "threshold": 75.0,
        "attended_classes": 144,
        "total_classes": 200,
        "status": "Below Mandatory Threshold (75%)",
        "subject_breakdown": {
            "Compiler Design": "70% (28/40)",
            "Computer Networks": "75% (30/40)",
            "AI & Data Structures": "68% (27/40)",
            "Software Engineering": "77% (31/40)",
            "Cloud Computing": "70% (28/40)"
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
