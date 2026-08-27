"""
AI Layer — gap-analysis pipeline + follow-up chat, backed by Groq.
Structured JSON output maps directly to Report/RoadmapItem schema.
"""
from .db import supabase
from .groq_client import call_groq_json, GroqCallError


def _format_sources(sources: list[dict]) -> str:
    if not sources:
        return "No sources connected yet."
    parts = []
    for s in sources:
        parts.append(f"--- {s['source_type'].upper()} ---\n{s['raw_data']}")
    return "\n\n".join(parts)


GAP_ANALYSIS_SYSTEM_PROMPT = """You are a career analysis engine. Given a candidate's \
combined profile data (GitHub, resume, LinkedIn, portfolio) and a target job \
description, identify concrete gaps. Respond ONLY with a JSON object matching \
this exact shape, no extra text:

{
  "missing_projects": [{"title": str, "description": str, "estimated_time": str}],
  "skill_gaps": [{"skill": str, "why_it_matters": str}],
  "ats_issues": [{"issue": str, "fix": str}],
  "roadmap_items": [{"title": str, "description": str, "order_index": int}]
}

missing_projects should include concrete, buildable project suggestions (not \
vague labels) with a rough time estimate. roadmap_items should be an ordered \
weekly learning plan derived from the gaps above."""


def run_gap_analysis(analysis_id: str, user_id: str) -> None:
    supabase.table("analyses").update({"status": "processing"}).eq(
        "id", analysis_id
    ).execute()

    analysis = supabase.table("analyses").select("*").eq("id", analysis_id).execute()
    if not analysis.data:
        return
    job_description = analysis.data[0]["job_description"]

    sources = supabase.table("sources").select("*").eq("user_id", user_id).execute()

    messages = [
        {"role": "system", "content": GAP_ANALYSIS_SYSTEM_PROMPT},
        {
            "role": "user",
            "content": f"CANDIDATE PROFILE:\n{_format_sources(sources.data)}\n\n"
            f"TARGET JOB DESCRIPTION:\n{job_description}",
        },
    ]

    try:
        result = call_groq_json(messages)

        report = (
            supabase.table("reports")
            .insert(
                {
                    "analysis_id": analysis_id,
                    "missing_projects": result.get("missing_projects", []),
                    "skill_gaps": result.get("skill_gaps", []),
                    "ats_issues": result.get("ats_issues", []),
                }
            )
            .execute()
        )
        report_id = report.data[0]["id"]

        roadmap_items = result.get("roadmap_items", [])
        if roadmap_items:
            rows = [
                {
                    "report_id": report_id,
                    "title": item.get("title", ""),
                    "description": item.get("description"),
                    "is_checked": False,
                    "order_index": item.get("order_index", i),
                }
                for i, item in enumerate(roadmap_items)
            ]
            supabase.table("roadmap_items").insert(rows).execute()

        supabase.table("analyses").update({"status": "completed"}).eq(
            "id", analysis_id
        ).execute()

    except GroqCallError as e:
        supabase.table("analyses").update(
            {"status": "failed", "error_message": str(e)}
        ).eq("id", analysis_id).execute()
    except Exception as e:
        supabase.table("analyses").update(
            {"status": "failed", "error_message": f"Unexpected error: {e}"}
        ).eq("id", analysis_id).execute()


CHAT_SYSTEM_PROMPT = """You are a career coach answering follow-up questions about \
a specific gap-analysis report you already generated. Answer grounded only in \
the report content provided below — don't invent new gaps or projects not in \
it. Be concise and direct."""


def generate_chat_reply(report_id: str) -> str:
    report = supabase.table("reports").select("*").eq("id", report_id).execute()
    if not report.data:
        return "Sorry, I couldn't find that report to answer from."
    report_data = report.data[0]

    history = (
        supabase.table("chat_messages")
        .select("role, content")
        .eq("report_id", report_id)
        .order("created_at")
        .execute()
    )

    report_context = (
        f"Missing projects: {report_data['missing_projects']}\n"
        f"Skill gaps: {report_data['skill_gaps']}\n"
        f"ATS issues: {report_data['ats_issues']}"
    )

    messages = [
        {"role": "system", "content": f"{CHAT_SYSTEM_PROMPT}\n\nREPORT:\n{report_context}"}
    ]
    for m in history.data[-10:]:
        messages.append({"role": m["role"], "content": m["content"]})

    try:
        from .groq_client import _client, MODEL

        response = _client.chat.completions.create(
            model=MODEL, messages=messages, temperature=0.5
        )
        return response.choices[0].message.content
    except Exception:
        return "Sorry, I ran into an error generating a response. Try asking again."
