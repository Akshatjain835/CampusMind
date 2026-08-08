from typing import Dict, Any, List, Optional
from langchain_core.tools import tool

from datetime import datetime, timedelta

@tool
def find_free_slot(faculty_ids: List[str], date: Optional[str] = None) -> Dict[str, Any]:
    """
    Checks timetable schedules across multiple faculty members and returns common free slots.
    """
    target_date = date
    if not target_date or target_date.lower() in ["tomorrow", "default"]:
        tomorrow = datetime.now() + timedelta(days=1)
        target_date = tomorrow.strftime("%Y-%m-%d")
        
    return {
        "faculty_checked": faculty_ids,
        "date": target_date,
        "common_free_slots": [
            "11:00 AM - 12:00 PM",
            "03:00 PM - 04:00 PM"
        ],
        "suggested_best_slot": "11:00 AM - 12:00 PM",
        "conflict_detected": False
    }

@tool
def create_calendar_event(
    title: str, 
    date: str, 
    time_slot: str, 
    participants: List[str]
) -> Dict[str, Any]:
    """
    Schedules a new meeting or academic event on department calendar and registers participants.
    """
    return {
        "event_id": f"EVT-{hash(title) % 10000}",
        "title": title,
        "date": date,
        "time_slot": time_slot,
        "participants": participants,
        "status": "Scheduled",
        "calendar_link": f"https://calendar.campusmind.edu/events/{date}/{hash(title)%10000}"
    }
