from typing import Dict, Any
from langchain_core.tools import tool

@tool
def forecast_exam_eligibility_risk(
    current_percentage: float, 
    planned_leave_days: int,
    total_semester_classes: int = 200
) -> Dict[str, Any]:
    """
    Performs predictive decision analytics on student attendance, forecasting exam sitting eligibility, shortfall risks, and extra classes required.
    """
    classes_per_day = 3
    classes_missed = planned_leave_days * classes_per_day
    attended_classes = int((current_percentage / 100.0) * total_semester_classes)
    
    projected_total = total_semester_classes + classes_missed
    projected_pct = round((attended_classes / projected_total) * 100.0, 2)
    
    threshold = 75.0
    shortfall = threshold - projected_pct
    
    # Calculate extra classes needed to achieve 75%
    # (attended + x) / (projected_total + x) >= 0.75 => x >= 4 * projected_total * 0.75 - 4 * attended...
    # (attended + x) >= 0.75 * (projected_total + x) => 0.25 x >= 0.75 * projected_total - attended
    required_x = max(0, int((0.75 * projected_total - attended) / 0.25) + 1)
    
    risk_level = "LOW"
    if projected_pct < 65.0:
        risk_level = "CRITICAL (Ineligible for condonation)"
    elif projected_pct < 75.0:
        risk_level = "HIGH (Requires Condonation / Remedial Classes)"
    elif projected_pct < 80.0:
        risk_level = "MODERATE"
        
    return {
        "current_percentage": current_percentage,
        "planned_leave_days": planned_leave_days,
        "projected_percentage_post_leave": projected_pct,
        "risk_level": risk_level,
        "is_eligible_direct": projected_pct >= 75.0,
        "shortfall_percentage": max(0.0, round(shortfall, 2)),
        "extra_remedial_classes_required": required_x if projected_pct < 75.0 else 0,
        "actionable_recommendation": (
            f"Candidate projected at {projected_pct}%. Must attend {required_x} extra classes or submit medical certificate for HOD condonation."
            if projected_pct < 75.0 else "Candidate maintains safe attendance margin."
        )
    }
