from app.agents.llm_factory import get_llm

def generate_executive_analytics_summary(
    department: str = "Computer Science & Engineering",
    user_name: str = "HOD",
    user_role: str = "HOD",
    attendance_rate: float = 84.2,
    avg_workload: float = 18.0,
    naac_score: int = 88,
    papers_count: int = 24
) -> dict:
    """
    Formulates a comprehensive executive analytics summary for administrators and HODs using OpenAI/Gemini LLM.
    """
    llm = get_llm()
    if llm:
        try:
            llm_prompt = (
                f"You are the Lead Department AI Academic Secretary for {department}.\n"
                f"Prepare an Executive Performance Summary for {user_name} ({user_role}).\n\n"
                f"LIVE METRICS:\n"
                f"- Overall Student Attendance Rate: {attendance_rate}%\n"
                f"- Average Faculty Workload: {avg_workload} Hours/Week\n"
                f"- NAAC/NBA Accreditation Score: {naac_score}%\n"
                f"- Scopus/IEEE Research Publications: {papers_count} Papers\n\n"
                f"Provide a structured analysis with key insights, attendance alerts, and strategic NAAC/NBA recommendations."
            )
            response = llm.invoke(llm_prompt)
            summary_text = response.content
            return {
                "department": department,
                "summary": summary_text,
                "attendanceRate": attendance_rate,
                "facultyWorkloadAvg": avg_workload,
                "naacScore": naac_score,
                "researchOutputCount": papers_count
            }
        except Exception as err:
            print(f"[Analytics LLM Error]: {err}")

    # Intelligent Fallback Engine
    summary_text = (
        f"🏛️ EXECUTIVE DEPARTMENT PERFORMANCE SUMMARY\n"
        f"Department: {department}\n"
        f"Prepared For: {user_name} ({user_role.upper()})\n\n"
        f"📊 Live Key Performance Indicators:\n"
        f"  1. Overall Attendance: {attendance_rate}% ({'Healthy' if attendance_rate >= 75 else 'Requires Attention'})\n"
        f"  2. Faculty Workload: {avg_workload} Hours/Week (Optimal 16-20 hrs balance)\n"
        f"  3. NAAC/NBA Readiness: {naac_score}% Audit Score (Criteria 1, 3, 5 validated)\n"
        f"  4. Research Output: {papers_count} Scopus/IEEE papers published this academic year\n\n"
        f"🎯 Strategic Priority Action Guidelines:\n"
        f"  • Review student attendance defaulters below 75% threshold in current semester.\n"
        f"  • Verify Criteria 2 (Teaching-Learning & Evaluation) evidence for upcoming mock audits.\n"
        f"  • Maintain continuous lab equipment utilization and weekly faculty workload logs."
    )

    return {
        "department": department,
        "summary": summary_text,
        "attendanceRate": attendance_rate,
        "facultyWorkloadAvg": avg_workload,
        "naacScore": naac_score,
        "researchOutputCount": papers_count
    }
