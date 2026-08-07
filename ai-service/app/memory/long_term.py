import json
import os
from typing import Dict, Any, List, Optional

LONG_TERM_DB_FILE = os.path.join(os.path.dirname(__file__), "student_profiles_db.json")

class LongTermStudentMemory:
    """
    Manages persistent student profiles, query history, leave history, and AI recommendations across sessions.
    """
    def __init__(self):
        self._ensure_db()

    def _ensure_db(self):
        if not os.path.exists(LONG_TERM_DB_FILE):
            initial_data = {
                "STU1024": {
                    "student_id": "STU1024",
                    "name": "Rahul Sharma",
                    "department": "Computer Science & Engineering",
                    "semester": "6th Semester",
                    "section": "Section A",
                    "historical_attendance": [
                        {"semester": "4th Semester", "percentage": 84.5},
                        {"semester": "5th Semester", "percentage": 81.0},
                        {"semester": "6th Semester (Current)", "percentage": 72.0}
                    ],
                    "past_queries": [
                        "Yesterday: Need leave next Monday",
                        "Last Month: Query regarding Mid-Sem exam timetable"
                    ],
                    "past_recommendations": [
                        "Recommended attending 5 extra classes in Compiler Design lab"
                    ],
                    "active_leave_applications": [
                        {"id": "LV-904", "type": "Medical", "days": 5, "status": "Pending HOD Sanction"}
                    ]
                }
            }
            with open(LONG_TERM_DB_FILE, "w", encoding="utf-8") as f:
                json.dump(initial_data, f, indent=2)

    def get_student_profile(self, student_id: str = "STU1024") -> Dict[str, Any]:
        """Retrieves student profile and long-term memory history."""
        try:
            with open(LONG_TERM_DB_FILE, "r", encoding="utf-8") as f:
                db = json.load(f)
                return db.get(student_id, {
                    "student_id": student_id,
                    "name": "Student",
                    "past_queries": [],
                    "past_recommendations": []
                })
        except Exception as e:
            print(f"[LongTermMemory Error]: {e}")
            return {"student_id": student_id}

    def save_query_and_recommendation(self, student_id: str, query: str, recommendation: str):
        """Updates long-term student memory with new query and recommendation."""
        try:
            with open(LONG_TERM_DB_FILE, "r", encoding="utf-8") as f:
                db = json.load(f)
            
            profile = db.get(student_id, {
                "student_id": student_id,
                "past_queries": [],
                "past_recommendations": []
            })
            
            profile.setdefault("past_queries", []).append(query)
            profile.setdefault("past_recommendations", []).append(recommendation)
            db[student_id] = profile
            
            with open(LONG_TERM_DB_FILE, "w", encoding="utf-8") as f:
                json.dump(db, f, indent=2)
        except Exception as e:
            print(f"[LongTermMemory Save Error]: {e}")

long_term_memory = LongTermStudentMemory()
