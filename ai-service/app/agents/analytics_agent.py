def generate_executive_analytics_summary(
    department: str = "Computer Science & Engineering",
    user_name: str = "HOD",
    user_role: str = "HOD",
    attendance_rate: float = 81.4,
    avg_workload: float = 18.5,
    naac_score: int = 88,
    papers_count: int = 24
) -> dict:
    """
    Formulates a comprehensive executive analytics summary for administrators and HODs.
    """
    summary_text = (
        f"EXECUTIVE DEPARTMENT PERFORMANCE SUMMARY\n"
        f"Department: {department}\n"
        f"Prepared For: {user_name} ({user_role.upper()})\n\n"
        f"📊 Key Performance Indicators:\n"
        f"  1. Overall Attendance: {attendance_rate}% (Healthy; 2.3% above last semester average)\n"
        f"  2. Faculty Workload: {avg_workload} Hours/Week (Balanced within 16-20 hrs optimal range)\n"
        f"  3. NAAC/NBA Readiness: {naac_score}% Audit Score (Criteria 1, 3, 5 fully validated)\n"
        f"  4. Research Publications: {papers_count} Scopus/IEEE papers published this academic year\n\n"
        f"🎯 High Priority Action Guidelines:\n"
        f"  • Monitor 4th Semester attendance defaulters (currently 5 students below 75% threshold).\n"
        f"  • Complete Criteria 2 (Teaching-Learning & Evaluation) documentation before the next mock audit.\n"
        f"  • Maintain current lab equipment utilization rate across Lab 101 and Net Lab 102."
    )

    return {
        "department": department,
        "summary": summary_text,
        "attendanceRate": attendance_rate,
        "facultyWorkloadAvg": avg_workload,
        "naacScore": naac_score,
        "researchOutputCount": papers_count
    }
