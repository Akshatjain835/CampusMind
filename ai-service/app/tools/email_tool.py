from typing import Dict, Any, List
from langchain_core.tools import tool

@tool
def send_email_notification(
    recipients: List[str], 
    subject: str, 
    body: str
) -> Dict[str, Any]:
    """
    Sends an automated email notification or official circular dispatch to specified recipients.
    """
    return {
        "status": "Dispatched",
        "recipients_count": len(recipients),
        "recipients": recipients,
        "subject": subject,
        "message_preview": body[:100] + "..." if len(body) > 100 else body
    }
