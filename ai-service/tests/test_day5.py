import sys
import unittest
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

from app.state.state import AgentState
from app.agents.reflection_agent import evaluate_state_completeness
from app.agents.vision_agent import parse_multimodal_input
from app.utils.error_recovery import with_retry_and_fallback
from app.events.event_dispatcher import event_dispatcher

class TestDay5(unittest.TestCase):

    def test_reflection_agent_completeness_audit(self):
        state: AgentState = {
            "user_name": "Rahul",
            "user_role": "student",
            "student_id": "STU1024",
            "department": "CSE",
            "semester": "6th",
            "section": "A",
            "query": "Check my exam eligibility and risk",
            "multi_modal_inputs": None,
            "plan": {"goal": "Check exam eligibility and risk"},
            "task_queue": [],
            "completed_tasks": [],
            "current_task_id": None,
            "agent_chain": [],
            "shared_memory": {}, # Empty shared memory missing required attendance & analytics
            "tool_results": {},
            "retrieved_documents": [],
            "reflection_count": 0,
            "reflection_feedback": None,
            "needs_human_approval": False,
            "human_approval_context": None,
            "human_approved": None,
            "is_complete": False,
            "final_response": None,
            "errors": []
        }
        
        audit_res = evaluate_state_completeness(state)
        self.assertFalse(audit_res["is_complete"])
        self.assertIn("Reflection Audit Failed", audit_res["reflection_feedback"])

    def test_multimodal_vision_parser(self):
        extracted = parse_multimodal_input(file_type="timetable_image")
        self.assertIn("detected_courses", extracted)
        self.assertEqual(len(extracted["detected_courses"]), 3)

    def test_error_recovery_decorator(self):
        @with_retry_and_fallback(max_retries=2, backoff_seconds=0.1)
        def failing_api():
            raise ConnectionError("External API Timeout")

        result = failing_api()
        self.assertTrue(result.get("error"))
        self.assertEqual(result.get("recovery_tier"), "Fallback Database")

    def test_event_driven_agent_trigger(self):
        event_res = event_dispatcher.publish_event("NoticeUploaded", {
            "notice_title": "Mid-Semester Exam Schedule Announced",
            "department": "CSE",
            "student_id": "STU1024"
        })
        self.assertEqual(event_res["status"], "Event Processed by Multi-Agent System")
        self.assertIn("Planner Agent", event_res["agent_chain"])

if __name__ == "__main__":
    unittest.main()
