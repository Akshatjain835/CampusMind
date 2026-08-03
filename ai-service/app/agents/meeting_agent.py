from typing import TypedDict, List, Optional
from langgraph.graph import StateGraph, END
import random

class MeetingState(TypedDict):
    title: str
    date: str
    time_slot: str
    department: str
    priority: str
    organizer_name: str
    organizer_role: str
    participants: List[dict]
    conflict_detected: bool
    recommended_time_slot: str
    allocated_room: str
    agenda: str
    invitation_text: str

def check_availability_node(state: MeetingState) -> MeetingState:
    """Node 1: Checks participant calendars & detects scheduling conflicts."""
    # Simulated calendar availability check
    time_slot = state.get("time_slot", "11:00 AM - 12:00 PM")
    priority = state.get("priority", "Normal")
    
    # Random conflict detection logic for demonstration (High priority overrides)
    has_conflict = False if priority == "High" else (random.random() < 0.2)
    
    if has_conflict:
        recommended = "02:00 PM - 03:00 PM"
    else:
        recommended = time_slot

    state["conflict_detected"] = has_conflict
    state["recommended_time_slot"] = recommended
    return state

def room_allocation_node(state: MeetingState) -> MeetingState:
    """Node 2: Allocates optimal meeting room based on participant capacity."""
    participant_count = len(state.get("participants", []))
    
    if participant_count > 10:
        room = "Main Seminar Hall (Block A)"
    elif participant_count > 5:
        room = "Department Conference Room 1"
    else:
        room = "HOD Executive Meeting Cabin"

    state["allocated_room"] = room
    return state

def agenda_generation_node(state: MeetingState) -> MeetingState:
    """Node 3: Generates structured agenda using AI logic."""
    title = state.get("title", "Department Meeting")
    dept = state.get("department", "CSE")
    
    agenda = (
        f"1. Opening Remarks & Department Progress Review ({dept})\n"
        f"2. Core Discussion: {title}\n"
        f"3. Faculty Workload & Course Distribution Assessment\n"
        f"4. NBA / NAAC Accreditation Compliance Audit\n"
        f"5. Action Items & Q&A Session"
    )
    
    state["agenda"] = agenda
    return state

def invitation_formulator_node(state: MeetingState) -> MeetingState:
    """Node 4: Formats formal email invitation and notification payload."""
    title = state.get("title", "Meeting")
    date = state.get("date", "Today")
    slot = state.get("recommended_time_slot", "11:00 AM")
    room = state.get("allocated_room", "Conference Room 1")
    organizer = state.get("organizer_name", "HOD")
    dept = state.get("department", "CSE")

    invitation = (
        f"OFFICIAL MEETING INVITATION & CALENDAR REMINDER\n\n"
        f"Subject: {title}\n"
        f"Department: {dept}\n"
        f"Date: {date}\n"
        f"Time Slot: {slot}\n"
        f"Venue / Room: {room}\n"
        f"Organizer: {organizer}\n\n"
        f"Agenda Overview:\n{state.get('agenda')}\n\n"
        f"Please confirm your attendance via the DepartmentAI Portal RSVP link."
    )

    state["invitation_text"] = invitation
    return state

# --- Build LangGraph StateGraph Workflow ---
workflow = StateGraph(MeetingState)

workflow.add_node("check_availability", check_availability_node)
workflow.add_node("allocate_room", room_allocation_node)
workflow.add_node("generate_agenda", agenda_generation_node)
workflow.add_node("formulate_invitation", invitation_formulator_node)

workflow.set_entry_point("check_availability")
workflow.add_edge("check_availability", "allocate_room")
workflow.add_edge("allocate_room", "generate_agenda")
workflow.add_edge("generate_agenda", "formulate_invitation")
workflow.add_edge("formulate_invitation", END)

meeting_graph = workflow.compile()

def schedule_meeting_agent(
    title: str,
    date: str,
    time_slot: str = "11:00 AM - 12:00 PM",
    department: str = "Computer Science & Engineering",
    priority: str = "Normal",
    organizer_name: str = "HOD",
    organizer_role: str = "HOD",
    participants: list = None
) -> dict:
    """Executes the LangGraph Meeting Agent workflow."""
    if not participants:
        participants = [
            {"name": "Dr. R. K. Sharma", "email": "sharma@department.ai", "role": "Faculty"},
            {"name": "Prof. Anita Roy", "email": "roy@department.ai", "role": "Faculty"},
            {"name": "Dr. V. Patel", "email": "patel@department.ai", "role": "HOD"}
        ]

    initial_state: MeetingState = {
        "title": title,
        "date": date,
        "time_slot": time_slot,
        "department": department,
        "priority": priority,
        "organizer_name": organizer_name,
        "organizer_role": organizer_role,
        "participants": participants,
        "conflict_detected": False,
        "recommended_time_slot": time_slot,
        "allocated_room": "",
        "agenda": "",
        "invitation_text": ""
    }

    result = meeting_graph.invoke(initial_state)

    return {
        "title": result["title"],
        "meetingDate": result["date"],
        "originalTimeSlot": result["time_slot"],
        "recommendedTimeSlot": result["recommended_time_slot"],
        "conflictDetected": result["conflict_detected"],
        "room": result["allocated_room"],
        "department": result["department"],
        "organizerName": result["organizer_name"],
        "participants": result["participants"],
        "agenda": result["agenda"],
        "invitationText": result["invitation_text"],
        "status": "Scheduled"
    }
