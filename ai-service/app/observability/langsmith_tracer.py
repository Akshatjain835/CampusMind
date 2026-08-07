import os
from typing import Dict, Any, Optional

def setup_langsmith_tracing(project_name: str = None):
    """
    Configures LangSmith environment variables for end-to-end multi-agent tracing,
    token usage monitoring, and trajectory auditing.
    """
    if project_name is None:
        project_name = os.getenv("LANGSMITH_PROJECT", os.getenv("LANGCHAIN_PROJECT", "CampusMind"))
        
    api_key = os.getenv("LANGSMITH_API_KEY", os.getenv("LANGCHAIN_API_KEY", ""))
    
    if api_key:
        os.environ["LANGSMITH_TRACING"] = "true"
        os.environ["LANGSMITH_ENDPOINT"] = "https://api.smith.langchain.com"
        os.environ["LANGSMITH_API_KEY"] = api_key
        os.environ["LANGSMITH_PROJECT"] = project_name
        
        # Dual-support for LangChain v2 env format
        os.environ["LANGCHAIN_TRACING_V2"] = "true"
        os.environ["LANGCHAIN_ENDPOINT"] = "https://api.smith.langchain.com"
        os.environ["LANGCHAIN_API_KEY"] = api_key
        os.environ["LANGCHAIN_PROJECT"] = project_name
        print(f"[LangSmith Observability]: Tracing active for project '{project_name}'.")
    else:
        print("[LangSmith Observability]: LANGSMITH_API_KEY not set. Local audit logging active.")

def audit_agent_step(agent_name: str, step_data: Dict[str, Any]):
    """Logs agent execution metrics for compliance and audit logs."""
    timestamp = step_data.get("timestamp", os.popen("date /t").read().strip() if os.name == "nt" else "")
    keys = list(step_data.get("shared_memory", {}).keys())
    print(f"[Audit Log] Agent: {agent_name} | Shared State Keys: {keys}")

setup_langsmith_tracing()
