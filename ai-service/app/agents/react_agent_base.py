from typing import List, Dict, Any, Optional
from langchain_core.tools import BaseTool
from app.agents.llm_factory import get_llm
from app.state.state import AgentState

def run_react_agent_step(
    agent_name: str,
    state: AgentState,
    tools: List[BaseTool],
    system_instruction: str,
    fallback_execution_fn
) -> AgentState:
    """
    Executes a ReAct reasoning step (Thought -> Action -> Observation -> Thought -> Final Answer).
    Uses LangChain model tool binding if available, falling back gracefully to fallback_execution_fn.
    """
    agent_chain = list(state.get("agent_chain", []))
    agent_chain.append(f"{agent_name} (ReAct)")
    
    shared_memory = dict(state.get("shared_memory", {}))
    completed_tasks = list(state.get("completed_tasks", []))
    task_queue = list(state.get("task_queue", []))
    
    current_task_id = state.get("current_task_id")
    
    llm = get_llm(temperature=0.2)
    tool_results = dict(state.get("tool_results", {}))
    
    if llm and tools:
        try:
            # Bind tools to LLM
            llm_with_tools = llm.bind_tools(tools)
            prompt = (
                f"{system_instruction}\n\n"
                f"Current Shared Memory Context:\n{shared_memory}\n\n"
                f"User Query: {state.get('query')}\n\n"
                f"Perform Thought -> Action -> Observation reasoning step. Use attached tools if necessary."
            )
            response = llm_with_tools.invoke(prompt)
            
            # Check for tool calls
            if hasattr(response, "tool_calls") and response.tool_calls:
                for tool_call in response.tool_calls:
                    t_name = tool_call["name"]
                    t_args = tool_call["args"]
                    print(f"[{agent_name} ReAct] Thought: Calling tool '{t_name}' with args {t_args}")
                    
                    # Execute matching tool
                    for t in tools:
                        if t.name == t_name:
                            res = t.invoke(t_args)
                            tool_results[f"{agent_name}_{t_name}"] = res
                            shared_memory[t_name] = res
                            print(f"[{agent_name} ReAct] Observation: Tool '{t_name}' returned: {res}")
                            break
                            
            shared_memory[agent_name.lower().replace(" ", "_")] = {
                "thought": response.content if hasattr(response, "content") else str(response),
                "tools_used": list(tool_results.keys())
            }
        except Exception as e:
            print(f"[{agent_name} ReAct Warning]: {e}. Using deterministic fallback.")
            fallback_res = fallback_execution_fn(state)
            shared_memory.update(fallback_res)
    else:
        fallback_res = fallback_execution_fn(state)
        shared_memory.update(fallback_res)

    if current_task_id and current_task_id not in completed_tasks:
        completed_tasks.append(current_task_id)

    return {
        **state,
        "agent_chain": agent_chain,
        "shared_memory": shared_memory,
        "tool_results": tool_results,
        "completed_tasks": completed_tasks,
        "current_task_id": None
    }
