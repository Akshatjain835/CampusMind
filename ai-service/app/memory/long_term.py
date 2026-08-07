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

    def get_student_profile(self, student_id: str = "STU1024") -> Dict[str, Any]:
        """Retrieves student profile and long-term memory history from MongoDB Atlas."""
        try:
            if self.collection is not None:
                profile = self.collection.find_one({"student_id": student_id}, {"_id": 0})
                if profile:
                    return profile
            
            # Fallback if student_id not found in DB
            return {
                "student_id": student_id,
                "name": "Rahul Sharma",
                "department": "Computer Science & Engineering",
                "semester": "6th Semester",
                "past_queries": [],
                "past_recommendations": []
            }
        except Exception as e:
            print(f"[LongTermMemory Get Error]: {e}")
            return {"student_id": student_id, "name": "Rahul Sharma", "semester": "6th Semester"}

    def save_query_and_recommendation(self, student_id: str, query: str, recommendation: str):
        """Updates long-term student memory in MongoDB Atlas with new query and recommendation."""
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
