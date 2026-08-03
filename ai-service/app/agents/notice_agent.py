import datetime
import random

def generate_academic_notice(
    prompt: str,
    category: str = "Academic",
    target_audience: str = "All",
    department: str = "Computer Science & Engineering",
    author_name: str = "Head of Department",
    author_role: str = "HOD"
) -> dict:
    """
    Generates a structured, formal academic notice circular based on user prompt.
    """
    dept_code = "".join([w[0] for w in department.split() if w.isupper() or len(w) > 2])[:4].upper()
    if not dept_code:
        dept_code = "DEPT"
    
    current_year = datetime.datetime.now().year
    random_num = random.randint(100, 999)
    circular_no = f"Ref: {dept_code}/{current_year}/CIRC-{random_num}"
    current_date = datetime.datetime.now().strftime("%B %d, %Y")

    # Generate title from prompt
    prompt_clean = prompt.strip()
    if len(prompt_clean) > 80:
        title = prompt_clean[:77] + "..."
    else:
        title = prompt_clean.capitalize()

    # Formulate structured formal notice body
    body = (
        f"OFFICIAL CIRCULAR / NOTICE\n"
        f"{circular_no}\n"
        f"Date: {current_date}\n\n"
        f"DEPARTMENT OF {department.upper()}\n"
        f"Target Audience: {target_audience}\n\n"
        f"SUBJECT: {title.upper()}\n\n"
        f"This is to officially inform all concerned {target_audience.lower()} regarding the following updates:\n\n"
        f"• Overview:\n  {prompt_clean}\n\n"
        f"• Important Guidelines & Actions Required:\n"
        f"  1. All concerned individuals are requested to strictly adhere to the schedule/instructions specified above.\n"
        f"  2. Attendance/participation for the designated session is mandatory as per departmental academic governance.\n"
        f"  3. In case of any query or clarification, kindly contact the Departmental Coordination Committee.\n\n"
        f"By Order & Approval,\n\n"
        f"{author_name}\n"
        f"{author_role.upper()}, Department of {department}\n"
        f"Academic Governance & Administrative Intelligence System"
    )

    return {
        "title": title,
        "circularNumber": circular_no,
        "category": category,
        "content": body,
        "targetAudience": target_audience,
        "department": department,
        "authorName": author_name,
        "authorRole": author_role
    }
