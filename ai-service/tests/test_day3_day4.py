import sys
import unittest
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

from app.state.state import AgentState
from app.graph.dynamic_graph import dynamic_campus_graph
from app.memory.long_term import long_term_memory
from app.graph.hitl_handler import check_human_approval_required

class TestDay3AndDay4(unittest.TestCase):

    def test_long_term_memory(self):
        profile = long_term_memory.get_student_profile("STU1024")
        self.assertEqual(profile["name"], "Rahul Sharma")
        self.assertIn("historical_attendance", profile)
        
        long_term_memory.save_query_and_recommendation("STU1024", "Test Query", "Test Rec")
        updated = long_term_memory.get_student_profile("STU1024")
        self.assertIn("Test Query", updated["past_queries"])

    def test_hitl_intercept(self):
        state: AgentState = {
            "user_name": "Rahul",
            "user_role": "student",
            "student_id": "STU1024",
            "department": "CSE",
            "semester": "6th",
            "section": "A",
            "query": "Submit my leave application",
            "multi_modal_inputs": None,
            "plan": {
                "goal": "Submit leave application",
                "reasoning": "Sensitive leave submission",
                "requires_parallel_execution": False,
                "tasks": [
                    {
                        "id": "task_1",
                        "agent": "leave_agent",
                        "description": "Submit leave application to HOD",
                        "dependencies": [],
                        "tool_hint": "submit_leave_application"
                    }
                ]
            },
            "task_queue": [
                {
                    "id": "task_1",
                    "agent": "leave_agent",
                    "description": "Submit leave application to HOD",
                    "dependencies": [],
                    "tool_hint": "submit_leave_application"
                }
            ],
            "completed_tasks": [],
            "current_task_id": None,
            "agent_chain": [],
            "shared_memory": {},
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
        
        res = check_human_approval_required(state)
        self.assertTrue(res["needs_human_approval"])
        self.assertIsNotNone(res["human_approval_context"])

    def test_day3_day4_graph_execution_with_negotiation(self):
        state: AgentState = {
            "user_name": "Rahul Sharma",
            "user_role": "student",
            "student_id": "STU1024",
            "department": "Computer Science & Engineering",
            "semester": "6th Semester",
            "section": "Section A",
            "query": "I have 72% attendance. I need leave for next week. Can I still sit in the semester exam?",
            "multi_modal_inputs": None,
            "plan": None,
            "task_queue": [],
            "completed_tasks": [],
            "current_task_id": None,
            "agent_chain": [],
            "shared_memory": {},
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
        
        config = {"configurable": {"thread_id": "test_day3_day4"}}
        final_state = dynamic_campus_graph.invoke(state, config=config)
        
        self.assertTrue(final_state["is_complete"])
        self.assertIn("Long-Term Memory Store", final_state["agent_chain"])
        self.assertIn("Multi-Agent Negotiation Agent", final_state["agent_chain"])
        self.assertIn("negotiation_consensus", final_state["shared_memory"])
        print("\n--- DAY 3 & DAY 4 GRAPH TRACE ---")
        print("Agent Chain:", final_state["agent_chain"])
        print("Final Answer:\n", final_state["final_response"])

if __name__ == "__main__":
    unittest.main()
