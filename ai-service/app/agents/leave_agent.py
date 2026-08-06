import os
from app.agents.llm_factory import get_llm
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
        default_reasoning = f"Student {user_name} maintains {current_attendance}% overall attendance (>=75%). Recommended for automatic approval."
        impact = f"Healthy attendance status ({current_attendance}%)."
    elif current_attendance >= 65:
        recommended_status = "Needs Review"
        default_reasoning = f"Student {user_name}'s attendance ({current_attendance}%) is in the condonable range (65%-74%). Subject to HOD discretion and valid certificate."
        impact = f"Requires HOD review & Medical Certificate upload."
    else:
        recommended_status = "Reject"
        default_reasoning = f"Student {user_name}'s attendance ({current_attendance}%) is below 65%. Condonation is strictly prohibited below 65% as per Clause 1.2.4."
        impact = f"Critical attendance shortage ({current_attendance}%). Detainment risk."

    llm = get_llm()
    reasoning = default_reasoning
    if llm:
        try:
            prompt = (
                f"You are an AI Academic Regulations & Leave Evaluator.\n"
                f"Evaluate leave request for {user_name} ({user_role}).\n"
                f"Leave Type: {leave_type}\nReason: {reason}\nCurrent Attendance: {current_attendance}%\n"
                f"Regulations Context: {regulations_context}\n"
                f"Recommended Status: {recommended_status}\n"
                f"Provide a concise, 2-sentence formal academic evaluation reasoning."
            )
            response = llm.invoke(prompt)
            reasoning = response.content
        except Exception as err:
            print(f"[Leave LLM Error]: {err}")

    return {
        "user_name": user_name,
        "current_attendance": current_attendance,
        "recommendedStatus": recommended_status,
        "reasoning": reasoning,
        "attendanceImpact": impact,
        "regulations_cited": regulations_context
    }
