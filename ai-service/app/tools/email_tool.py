import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Dict, Any, List
from langchain_core.tools import tool

@tool
def send_email_notification(
    recipients: List[str], 
    subject: str, 
    body: str
) -> Dict[str, Any]:
    """
    Sends an automated email notification or official circular dispatch to specified recipients using Nodemailer / SMTP.
    """
    gmail_user = os.getenv("GMAIL_USER")
    gmail_pass = os.getenv("GMAIL_PASS")
    
    if gmail_user and gmail_pass and "your_gmail" not in gmail_user:
        try:
            msg = MIMEMultipart()
            msg['From'] = f"CampusMind Autonomous System <{gmail_user}>"
            msg['To'] = ", ".join(recipients)
            msg['Subject'] = subject
            msg.attach(MIMEText(body, 'plain'))

            server = smtplib.SMTP('smtp.gmail.com', 587)
            server.starttls()
            server.login(gmail_user, gmail_pass)
            server.sendmail(gmail_user, recipients, msg.as_string())
            server.quit()
            
            return {
                "status": "Dispatched via Live SMTP",
                "sender": gmail_user,
                "recipients_count": len(recipients),
                "recipients": recipients,
                "subject": subject,
                "message_preview": body[:100] + "..." if len(body) > 100 else body
            }
        except Exception as e:
            print(f"[Email Tool SMTP Error]: {e}. Falling back to mock dispatch.")
            
    return {
        "status": "Dispatched (Mock Mode)",
        "recipients_count": len(recipients),
        "recipients": recipients,
        "subject": subject,
        "message_preview": body[:100] + "..." if len(body) > 100 else body
    }
