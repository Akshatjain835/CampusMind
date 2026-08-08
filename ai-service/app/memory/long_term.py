import os
import pymongo
from typing import Dict, Any, List, Optional

MONGO_URI = os.getenv("MONGO_URI", "mongodb+srv://jainakshataj07_db_user:NKjOpBkUoF6G3tsI@cluster0.xbtya65.mongodb.net/CampusMind?retryWrites=true&w=majority")

class LongTermStudentMemory:
    """
    Manages persistent student profiles, query history, leave history, and AI recommendations
    directly via MongoDB Atlas Database (`student_profiles` collection).
    """
    def __init__(self):
        self.client = None
        self.db = None
        self.collection = None
        self._in_mem_store = {}
        self._init_mongo()

    def _init_mongo(self):
        try:
            self.client = pymongo.MongoClient(MONGO_URI, serverSelectionTimeoutMS=3000)
            self.db = self.client["CampusMind"]
            self.collection = self.db["student_profiles"]
            self._ensure_seed_profile()
        except Exception as e:
            print(f"[LongTermMemory Mongo Connection Warning]: {e}")

    def _ensure_seed_profile(self):
        """Ensures STU1024 seed profile exists in MongoDB Atlas."""
        try:
            if self.collection is not None:
                existing = self.collection.find_one({"student_id": "STU1024"})
                if not existing:
                    seed_data = {
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
                    self.collection.insert_one(seed_data)
        except Exception as e:
            print(f"[LongTermMemory Seed Warning]: {e}")

    def get_student_profile(
        self, 
        student_id: str = "STU1024", 
        user_name: Optional[str] = None, 
        department: Optional[str] = None, 
        semester: Optional[str] = None
    ) -> Dict[str, Any]:
        """Retrieves student profile and long-term memory history from MongoDB Atlas."""
        try:
            if self.collection is not None:
                profile = self.collection.find_one({"student_id": student_id}, {"_id": 0})
                if profile:
                    return profile
                    
                # Create dynamic profile if student_id is new
                default_name = "Rahul Sharma" if student_id == "STU1024" else "Student"
                dynamic_name = user_name or default_name
                dynamic_dept = department or "Computer Science & Engineering"
                dynamic_sem = semester or "6th Semester"
                
                new_profile = {
                    "student_id": student_id,
                    "name": dynamic_name,
                    "department": dynamic_dept,
                    "semester": dynamic_sem,
                    "section": "Section A",
                    "historical_attendance": [
                        {"semester": "4th Semester", "percentage": 82.0},
                        {"semester": "5th Semester", "percentage": 78.5},
                        {"semester": f"{dynamic_sem} (Current)", "percentage": 72.0}
                    ],
                    "past_queries": [],
                    "past_recommendations": [],
                    "active_leave_applications": []
                }
                try:
                    self.collection.insert_one(new_profile)
                    new_profile.pop("_id", None)
                except Exception as insert_err:
                    print(f"[LongTermMemory Auto-Insert Warning]: {insert_err}")
                if student_id not in self._in_mem_store:
                    self._in_mem_store[student_id] = new_profile
                return self._in_mem_store.get(student_id, new_profile)
            
            if student_id in self._in_mem_store:
                return self._in_mem_store[student_id]
                
            default_name = "Rahul Sharma" if student_id == "STU1024" else "Student"
            prof = {
                "student_id": student_id,
                "name": user_name or default_name,
                "department": department or "Computer Science & Engineering",
                "semester": semester or "6th Semester",
                "historical_attendance": [
                    {"semester": "4th Semester", "percentage": 82.0},
                    {"semester": "5th Semester", "percentage": 78.5},
                    {"semester": "6th Semester (Current)", "percentage": 72.0}
                ],
                "past_queries": [],
                "past_recommendations": []
            }
            self._in_mem_store[student_id] = prof
            return prof
        except Exception as e:
            print(f"[LongTermMemory Get Error]: {e}")
            if student_id in self._in_mem_store:
                return self._in_mem_store[student_id]
            default_name = "Rahul Sharma" if student_id == "STU1024" else "Student"
            prof = {
                "student_id": student_id, 
                "name": user_name or default_name, 
                "department": department or "Computer Science & Engineering",
                "semester": semester or "6th Semester",
                "historical_attendance": [
                    {"semester": "4th Semester", "percentage": 82.0},
                    {"semester": "5th Semester", "percentage": 78.5},
                    {"semester": "6th Semester (Current)", "percentage": 72.0}
                ],
                "past_queries": [],
                "past_recommendations": []
            }
            self._in_mem_store[student_id] = prof
            return prof

    def save_query_and_recommendation(self, student_id: str, query: str, recommendation: str):
        """Updates long-term student memory in MongoDB Atlas with new query and recommendation."""
        # Update in-memory fallback store
        if student_id not in self._in_mem_store:
            self.get_student_profile(student_id)
        prof = self._in_mem_store.get(student_id, {})
        if "past_queries" not in prof:
            prof["past_queries"] = []
        if "past_recommendations" not in prof:
            prof["past_recommendations"] = []
        prof["past_queries"].append(query)
        prof["past_recommendations"].append(recommendation)

        try:
            if self.collection is not None:
                self.collection.update_one(
                    {"student_id": student_id},
                    {
                        "$push": {
                            "past_queries": query,
                            "past_recommendations": recommendation
                        }
                    },
                    upsert=True
                )
        except Exception as e:
            print(f"[LongTermMemory Save Error]: {e}")

long_term_memory = LongTermStudentMemory()
