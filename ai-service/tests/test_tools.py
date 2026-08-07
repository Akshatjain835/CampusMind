import sys
import unittest
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

from app.tools.attendance_tool import get_attendance, calculate_projected_attendance
from app.tools.calendar_tool import find_free_slot, create_calendar_event
from app.tools.analytics_tool import forecast_exam_eligibility_risk
from app.tools.database_tool import execute_sql_query
from app.tools.tool_registry import ALL_TOOLS, get_tools_for_agent

class TestTools(unittest.TestCase):

    def test_attendance_tools(self):
        res = get_attendance.invoke({"student_id": "STU1024"})
        self.assertEqual(res["student_id"], "STU1024")
        self.assertEqual(res["overall_percentage"], 72.0)
        
        proj = calculate_projected_attendance.invoke({
            "current_percentage": 72.0,
            "total_classes": 200,
            "missed_classes": 15,
            "extra_attended": 0
        })
        self.assertLess(proj["projected_percentage"], 72.0)

    def test_calendar_tools(self):
        slots = find_free_slot.invoke({"faculty_ids": ["FAC01", "FAC02"]})
        self.assertIn("11:00 AM - 12:00 PM", slots["common_free_slots"])

    def test_analytics_forecasting_tool(self):
        analytics = forecast_exam_eligibility_risk.invoke({
            "current_percentage": 72.0,
            "planned_leave_days": 5
        })
        self.assertEqual(analytics["risk_level"], "HIGH (Requires Condonation / Remedial Classes)")
        self.assertGreater(analytics["extra_remedial_classes_required"], 0)

    def test_sql_guardrails(self):
        drop_attempt = execute_sql_query.invoke({"query": "DROP TABLE students;"})
        self.assertTrue(drop_attempt.get("error"))

    def test_tool_registry(self):
        self.assertGreater(len(ALL_TOOLS), 5)
        att_tools = get_tools_for_agent("attendance_agent")
        self.assertTrue(len(att_tools) >= 2)

if __name__ == "__main__":
    unittest.main()
