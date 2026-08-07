import json
from typing import Dict, Any, List, Callable
from langchain_core.prompts import ChatPromptTemplate
from app.agents.llm_factory import get_llm

REACT_SYSTEM_PROMPT = """You are an Autonomous ReAct Agent for CampusMind.
Your task is to iteratively reason and select tools to answer the user query accurately.

Available Tools:
{tool_descriptions}

Process Instructions:
1. Thought: Reason about what action to take next based on the query and current observation.
2. Action: Specify the tool to invoke and input parameters as JSON: `{{"tool": "tool_name", "input": {{...}}}}`.
3. Observation: Evaluate the tool response.
4. Final Answer: When sufficient data is retrieved, output your final detailed response.

Current User Query: {query}
Shared Memory Context: {context}

Begin ReAct Reasoning:
"""

class ReActAgentLoop:
    """
    Autonomous ReAct (Reasoning + Acting) Agent Execution Loop.
    Executes iterative LLM tool selection, tool invocation, observation, and final synthesis.
    """
    def __init__(self, agent_name: str, tools: Dict[str, Any]):
        self.agent_name = agent_name
        self.tools = tools
        self.llm = get_llm(temperature=0.1)

    def run(self, query: str, context: Dict[str, Any], max_steps: int = 3) -> Dict[str, Any]:
        tool_desc = "\n".join([f"- {name}: {getattr(tool, 'description', str(tool))}" for name, tool in self.tools.items()])
        
        step_history = []
        for step in range(1, max_steps + 1):
            print(f"[{self.agent_name} ReAct Step {step}/{max_steps}] Reasoning next action...")
            
            # Formulate thought and action
            prompt = ChatPromptTemplate.from_template(REACT_SYSTEM_PROMPT)
            chain = prompt | self.llm
            res = chain.invoke({
                "tool_descriptions": tool_desc,
                "query": query,
                "context": json.dumps(context, default=str)
            })
            
            content = res.content if hasattr(res, "content") else str(res)
            step_history.append(content)

            # Auto-execute tools if referenced
            executed_any = False
            for tool_name, tool_obj in self.tools.items():
                if tool_name in content:
                    try:
                        print(f"[{self.agent_name} ReAct Tool Selection] Executing tool '{tool_name}'...")
                        output = tool_obj.invoke({"student_id": context.get("student_id", "STU1024"), "query": query})
                        context[f"{tool_name}_output"] = output
                        executed_any = True
                        break
                    except Exception as e:
                        print(f"[{self.agent_name} Tool Exec Warning]: {e}")
            
            if not executed_any:
                break
                
        return {
            "agent_name": self.agent_name,
            "observations": context,
            "reasoning_history": step_history,
            "status": "completed"
        }
