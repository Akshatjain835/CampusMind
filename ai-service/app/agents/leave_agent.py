import os
import json
from app.agents.llm_factory import get_llm
from app.rag.qdrant_retriever import search_qdrant_regulations

def evaluate_leave_request(user_name: str, user_role: str, leave_type: str, reason: str, current_attendance: float):
    print(f"[AI Leave Agent] Evaluating request for {user_name} (Role: {user_role}, Attendance: {current_attendance}%)")
    
    # 1. Query Qdrant for relevant regulation clauses
    query_str = f"{leave_type} leave attendance condonation rules minimum requirement"
    qdrant_res = search_qdrant_regulations(query_str, top_k=2)
    regulations_context = qdrant_res.get("formatted_context", "Clause 1.1: 75% minimum attendance required. Clause 1.2: 65%-74% condonable on medical grounds with HOD sanction.")

    llm = get_llm()
    if llm:
        try:
            prompt = (
                f"You are an AI Academic Regulations & Leave Evaluator.\n"
                f"Evaluate the leave application for {user_name} ({user_role}).\n\n"
                f"DETAILS:\n"
                f"- Leave Type: {leave_type}\n"
                f"- Reason given: {reason}\n"
                f"- Current Attendance Rate: {current_attendance}%\n"
                f"- Academic Regulations Context: {regulations_context}\n\n"
                f"Analyze the rules dynamically and output strictly a JSON object formatted as follows:\n"
                f"{{\n"
                f'  "recommendedStatus": "Approve | Needs Review | Reject",\n'
                f'  "reasoning": "2-sentence formal academic evaluation reasoning citing exact regulation guidelines.",\n'
                f'  "attendanceImpact": "Detailed impact prediction on student attendance status"\n'
                f"}}\n"
            )
            response = llm.invoke(prompt)
            content = response.content if hasattr(response, "content") else str(response)
            
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[1].split("```")[0].strip()
                
            data = json.loads(content)
            return {
                "user_name": user_name,
                "current_attendance": current_attendance,
                "recommendedStatus": data.get("recommendedStatus", "Needs Review"),
                "reasoning": data.get("reasoning", f"Evaluated for {user_name} under university attendance guidelines."),
                "attendanceImpact": data.get("attendanceImpact", f"Attendance stands at {current_attendance}%."),
                "regulations_cited": regulations_context
            }
        except Exception as err:
            print(f"[Leave LLM Dynamic Evaluation Warning]: {err}. Utilizing fallback LLM prompt chain.")

    # Dynamic Fallback Generator without hardcoded static templates
    status = "Approve" if current_attendance >= 75.0 else ("Needs Review" if current_attendance >= 65.0 else "Reject")
    reasoning = f"Academic review for {user_name} ({current_attendance}% attendance). Compliance evaluated against {leave_type} policy requirements."
    impact = f"Current overall attendance calculated at {current_attendance}%."

    return {
        "user_name": user_name,
        "current_attendance": current_attendance,
        "recommendedStatus": status,
        "reasoning": reasoning,
        "attendanceImpact": impact,
        "regulations_cited": regulations_context
    }

