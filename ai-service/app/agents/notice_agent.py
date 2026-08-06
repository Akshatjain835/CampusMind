import os
import datetime
import random
from app.agents.llm_factory import get_llm

def generate_academic_notice(
    prompt: str,
    category: str = "Academic",
    target_audience: str = "All",
    department: str = "Computer Science & Engineering",
    author_name: str = "Head of Department",
    author_role: str = "HOD"
) -> dict:
    """
    Generates a structured, formal academic notice circular using Google Gemini LLM.
    """
    dept_code = "".join([w[0] for w in department.split() if w.isupper() or len(w) > 2])[:4].upper()
    if not dept_code:
        dept_code = "DEPT"
    
    current_year = datetime.datetime.now().year
    random_num = random.randint(100, 999)
    circular_no = f"Ref: {dept_code}/{current_year}/CIRC-{random_num}"
    current_date = datetime.datetime.now().strftime("%B %d, %Y")

    prompt_clean = prompt.strip()
    title = prompt_clean[:77] + "..." if len(prompt_clean) > 80 else prompt_clean.capitalize()

    llm = get_llm()
    if llm:
        try:
            llm_prompt = (
                f"Write an official university academic circular/notice.\n"
                f"Department: {department}\n"
                f"Category: {category}\n"
                f"Target Audience: {target_audience}\n"
                f"Topic/Instructions: {prompt_clean}\n"
                f"Circular No: {circular_no}\n"
                f"Issued By: {author_name} ({author_role})\n"
                f"Format it professionally with an official subject heading and bullet points."
            )
            response = llm.invoke(llm_prompt)
            return {
                "title": title,
                "circularNumber": circular_no,
                "category": category,
                "content": response.content,
                "targetAudience": target_audience,
                "department": department,
                "authorName": author_name,
                "authorRole": author_role
            }
        except Exception as err:
            print(f"[Notice LLM Error]: {err}")

    # Intelligent Prompt-Driven Circular Synthesizer (Fallback & Primary Engine)
    sections = [p.strip() for p in prompt_clean.split('.') if p.strip()]
    main_point = sections[0] if len(sections) > 0 else prompt_clean
    secondary_points = sections[1:] if len(sections) > 1 else [
        "All concerned individuals must adhere strictly to specified timelines.",
        "Attendance/participation is mandatory as per departmental governance guidelines.",
        "For further clarifications, please reach out to the Departmental Coordination Committee."
    ]

    action_items_str = "\n".join([f"  {idx + 1}. {pt.strip() if pt.endswith('.') else pt.strip() + '.'}" for idx, pt in enumerate(secondary_points[:4])])

    body = (
        f"🏛️ OFFICIAL ACADEMIC CIRCULAR & NOTICE\n"
        f"{circular_no}\n"
        f"Date: {current_date}\n\n"
        f"DEPARTMENT OF {department.upper()}\n"
        f"Category: {category} | Target Audience: {target_audience}\n\n"
        f"📌 SUBJECT: {title.upper()}\n\n"
        f"Dear {target_audience},\n\n"
        f"This is an official departmental communication regarding: {main_point}.\n\n"
        f"📋 KEY DIRECTIVES & ACTION REQUIRED:\n"
        f"{action_items_str}\n\n"
        f"⚠️ IMPORTANT COMPLIANCE NOTE:\n"
        f"Please note that non-compliance with the above instructions may affect academic evaluations or departmental attendance records as per NAAC/NBA standards.\n\n"
        f"By Order & Authorization,\n\n"
        f"✍️ {author_name}\n"
        f"{author_role.upper()} | Department of {department}\n"
        f"CampusMind AI Administrative Governance Portal"
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
