from app.tools.attendance_tool import get_attendance, calculate_projected_attendance
from app.tools.calendar_tool import find_free_slot, create_calendar_event
from app.tools.database_tool import execute_sql_query
from app.tools.email_tool import send_email_notification
from app.tools.rag_tool import search_academic_regulations, get_latest_notices
from app.tools.analytics_tool import forecast_exam_eligibility_risk

ALL_TOOLS = [
    get_attendance,
    calculate_projected_attendance,
    find_free_slot,
    create_calendar_event,
    execute_sql_query,
    send_email_notification,
    search_academic_regulations,
    get_latest_notices,
    forecast_exam_eligibility_risk
]

AGENT_TOOL_MAPPING = {
    "attendance_agent": [get_attendance, calculate_projected_attendance],
    "leave_agent": [calculate_projected_attendance, search_academic_regulations],
    "faculty_agent": [find_free_slot, create_calendar_event],
    "timetable_agent": [find_free_slot, create_calendar_event],
    "notice_agent": [get_latest_notices, search_academic_regulations],
    "rag_agent": [search_academic_regulations, get_latest_notices],
    "analytics_agent": [forecast_exam_eligibility_risk, calculate_projected_attendance],
    "database_agent": [execute_sql_query],
    "email_agent": [send_email_notification]
}

def get_tools_for_agent(agent_name: str):
    return AGENT_TOOL_MAPPING.get(agent_name, ALL_TOOLS)
