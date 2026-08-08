import sys
import unittest
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

from app.state.state import AgentState
from app.agents.planner_agent import planner_node, create_fallback_plan
from app.graph.dynamic_graph import dynamic_campus_graph

class TestPlannerAndGraph(unittest.TestCase):

    def test_fallback_planner_exam_eligibility(self):
        query = "I have 72% attendance. I need leave for next week. Can I still sit in the semester exam?"
        plan = create_fallback_plan(query)
        
        self.assertIsNotNone(plan.goal)
        self.assertEqual(len(plan.tasks), 4)
        agent_names = [t.agent for t in plan.tasks]
        self.assertIn("attendance_agent", agent_names)
        self.assertIn("rag_agent", agent_names)
        self.assertIn("leave_agent", agent_names)
        self.assertIn("analytics_agent", agent_names)

    def test_planner_node_execution(self):
        initial_state: AgentState = {
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
        
        res = planner_node(initial_state)
        self.assertIsNotNone(res["plan"])
        self.assertGreater(len(res["task_queue"]), 0)
        self.assertIn("Planner Agent", res["agent_chain"])

    def test_dynamic_graph_end_to_end(self):
        initial_state: AgentState = {
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
        
        config = {"configurable": {"thread_id": "test_session_1"}}
        final_state = dynamic_campus_graph.invoke(initial_state, config=config)
        
        self.assertTrue(final_state["is_complete"])
        self.assertIsNotNone(final_state["final_response"])
        self.assertIn("Attendance Agent", final_state["agent_chain"])
        self.assertIn("Leave Agent", final_state["agent_chain"])
        self.assertIn("Analytics Agent", final_state["agent_chain"])
        self.assertIn("Reflection Agent", final_state["agent_chain"])
        print("\n--- TEST DYNAMIC GRAPH EXECUTION TRACE ---")
        print("Agent Chain:", final_state["agent_chain"])
        print("Final Synthesized Response:\n", final_state["final_response"])

    def test_router_node_typo_timetable(self):
        from app.graphs.department_graph import router_node, DepartmentState
        state: DepartmentState = {
            "user_name": "Rahul Sharma",
            "user_role": "student",
            "semester": "6th Semester",
            "section": "Section A",
            "query": "What is the timettable for section A",
            "intent": None,
            "context": None,
            "agent_chain": [],
            "final_response": None
        }
        res = router_node(state)
        self.assertEqual(res["intent"], "timetable_query")

if __name__ == "__main__":
    unittest.main()
