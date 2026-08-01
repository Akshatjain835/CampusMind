from app.rag.qdrant_retriever import search_qdrant_regulations

def evaluate_leave_request(user_name: str, user_role: str, leave_type: str, reason: str, current_attendance: float):
    print(f"[AI Leave Agent] Evaluating request for {user_name} (Role: {user_role}, Attendance: {current_attendance}%)")
    
    # 1. Query Qdrant for relevant regulation clauses
    query_str = f"{leave_type} leave attendance condonation rules minimum requirement"
    qdrant_res = search_qdrant_regulations(query_str, top_k=2)
    regulations_context = qdrant_res.get("formatted_context", "Clause 1.1: 75% minimum attendance required.")

    # 2. Decision Logic
    if current_attendance >= 75:
        recommended_status = "Approve"
        reasoning = (
            f"Student {user_name} maintains {current_attendance}% overall attendance, which satisfies Clause 1.1 "
            f"(75% threshold). Recommended for automatic approval."
        )
        impact = f"Healthy attendance status ({current_attendance}%)."
    elif current_attendance >= 65:
        recommended_status = "Needs Review"
        reasoning = (
            f"Student {user_name}'s attendance ({current_attendance}%) is in the condonable range (65%-74%). "
            f"Under Clause 1.2, approval is subject to HOD discretion and submission of a valid Medical/Duty Certificate."
        )
        impact = f"Requires HOD review & Medical Certificate upload."
    else:
        recommended_status = "Reject"
        reasoning = (
            f"Student {user_name}'s attendance ({current_attendance}%) is below 65%. Under Clause 1.2.4, "
            f"condonation is strictly prohibited below 65% and student is subject to course detainment."
        )
        impact = f"Critical attendance shortage ({current_attendance}%). Detainment risk."

    return {
        "user_name": user_name,
        "current_attendance": current_attendance,
        "recommendedStatus": recommended_status,
        "reasoning": reasoning,
        "attendanceImpact": impact,
        "regulations_cited": regulations_context
    }
