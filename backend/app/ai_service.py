"""
AI Layer — gap-analysis pipeline + follow-up chat, backed by Groq.
Structured JSON output maps directly to Report/RoadmapItem schema.
"""

import re

from .db import supabase
from .groq_client import call_groq_json, GroqCallError
from .ats_scoring import compute_ats_score

_STOPWORDS = {
    "the",
    "and",
    "for",
    "with",
    "you",
    "our",
    "are",
    "will",
    "have",
    "this",
    "that",
    "from",
    "your",
    "who",
    "has",
    "not",
    "can",
    "all",
    "but",
    "was",
    "were",
    "been",
    "into",
    "than",
    "then",
    "them",
    "they",
    "their",
    "what",
    "when",
    "where",
    "which",
    "while",
    "about",
    "role",
    "job",
    "work",
    "years",
    "experience",
    "team",
    "strong",
    "ability",
    "skills",
    "including",
    "etc",
    "using",
    "use",
    "years",
    "year",
    "looking",
    "join",
    "candidate",
    "must",
}


def _format_sources(sources: list[dict]) -> str:
    if not sources:
        return "No sources connected yet."
    parts = []
    for s in sources:
        parts.append(f"--- {s['source_type'].upper()} ---\n{s['raw_data']}")
    return "\n\n".join(parts)


GAP_ANALYSIS_SYSTEM_PROMPT = """You are a senior technical recruiter and career \
strategist with deep hiring experience at top engineering organizations. You are \
reviewing a candidate's full profile against a specific target job description, \
and producing a precise, evidence-based gap analysis — the kind a candidate \
would pay a career coach for.

Your tone is direct, respectful, and specific. Never generic, never vague, never \
padded with filler advice. Every gap you name must be traceable to something \
actually missing or weak in the candidate's profile, compared against something \
actually required or implied by the job description. Do not invent gaps that \
aren't supported by the material given.

Respond ONLY with a JSON object matching this exact shape — no preamble, no \
markdown, no extra text outside the JSON:

{
  "missing_projects": [{"title": str, "tagline": str, "reasons": [str], "estimated_time": str}],
    "skill_gaps": [{"skill": str, "severity": "critical"|"important"|"nice_to_have", "why_it_matters": [str], "related_project": str|null}],
  "ats_issues": [{"issue": str, "fix": [str]}],
    "roadmap_items": [{"project_title": str, "title": str, "description": str, "order_index": int}]
}

Guidelines for each field:
- Calibrate everything to the candidate's actual current level, inferred from \
their profile — not to the JD's most senior requirement. If the JD asks for \
skills far beyond the candidate's current level (e.g. a frontend-only developer \
against a full-stack/infra-heavy JD), recommend the next reachable step, not \
the deepest possible one. A gap analysis that only a senior engineer could act \
on is not useful to this candidate.
- missing_projects: 2-3 concrete, buildable project ideas the candidate could \
realistically start now — never vague labels like "build a project," and never \
a project whose prerequisites the candidate doesn't have yet. Each needs a \
short, sharp tagline (one line, no fluff, no unexplained jargon), 2-4 specific \
reasons grounded in the candidate's actual gap versus the JD, and a realistic \
time estimate for someone at their level building it part-time.
- skill_gaps: 3-5 skill gaps maximum, never more. Assign each a severity: \
"critical" (blocking for this JD, must fix), "important" (expected, weakens \
candidacy if missing), or "nice_to_have" (bonus, not disqualifying). If a gap \
is directly addressed by one of the missing_projects above, set \
related_project to that project's exact title string; otherwise null. If more \
than 5 individual \
gaps would apply, group closely related ones under one broader umbrella skill \
instead of listing each tool separately — combine narrow, overlapping tools \
into one category-level entry rather than naming every individual one. \
Prioritize the gaps that matter most for this specific JD, drop or merge the \
rest rather than listing everything found. Each why_it_matters is 2-4 short, \
concrete bullet points — not generic career advice, but specific to why this \
skill matters for this JD and this candidate's current level. When naming a \
skill or tool, briefly say what it does in plain terms the first time it's \
mentioned — assume the reader may not already know the term, don't assume \
expert vocabulary.
- ats_issues: concrete, fixable resume/formatting/parsing problems, if any exist \
in the material given. Each fix is 2-3 short, actionable bullet points a \
candidate could apply immediately. If nothing meaningful is wrong, return an \
empty list rather than inventing filler issues.
- roadmap_items: an ordered, realistic weekly learning plan that directly \
addresses the gaps above, sequenced sensibly (foundational skills before \
advanced ones, one project's prerequisites before that project). Each item's \
project_title must exactly match one of the titles used in missing_projects \
above — every roadmap item belongs to a specific project, none are standalone. \
Give each missing_project at least 2-3 roadmap_items. Each item's title should \
be a short, concrete, actionable step (start with a verb — "Set up," "Write," \
"Deploy," "Test") that the candidate could check off in a single sitting or a \
few days, not a vague milestone like "Learn Kubernetes." Each description \
should explain in plain, everyday language what to actually do and why it \
matters — no unexplained jargon, no assuming prior expertise with the tool \
being introduced.

Write as if this analysis will be read by someone serious about their career \
and their time — clear, credible, and worth acting on. No corporate jargon, no \
motivational filler, no hedging.Write for someone motivated but not yet senior — clear enough that a mid-level \
or junior engineer can read every project, skill gap, and roadmap step and \
immediately understand both what it means and why it matters, with no \
unexplained acronyms or infrastructure jargon left undefined."""


def run_gap_analysis(analysis_id: str, user_id: str) -> None:
    supabase.table("analyses").update({"status": "processing"}).eq(
        "id", analysis_id
    ).execute()

    analysis = supabase.table("analyses").select("*").eq("id", analysis_id).execute()
    if not analysis.data:
        return

    job_description = analysis.data[0]["job_description"]
    resume_text = analysis.data[0].get("resume_text", "")
    portfolio_url = analysis.data[0].get("portfolio_url")

    sources = supabase.table("sources").select("*").eq("user_id", user_id).execute()

    profile_parts = _format_sources(sources.data)
    if resume_text:
        profile_parts += f"\n\n--- RESUME (this analysis) ---\n{resume_text}"
    if portfolio_url:
        profile_parts += f"\n\n--- PORTFOLIO URL (this analysis) ---\n{portfolio_url}"

    messages = [
        {"role": "system", "content": GAP_ANALYSIS_SYSTEM_PROMPT},
        {
            "role": "user",
            "content": f"CANDIDATE PROFILE:\n{profile_parts}\n\n"
            f"TARGET JOB DESCRIPTION:\n{job_description}",
        },
    ]

    try:
        result = call_groq_json(messages)

        ats_result = compute_ats_score(resume_text, job_description)
        ats_score = ats_result["score"]

        report = (
            supabase.table("reports")
            .insert(
                {
                    "analysis_id": analysis_id,
                    "missing_projects": result.get("missing_projects", []),
                    "skill_gaps": result.get("skill_gaps", []),
                    "ats_issues": result.get("ats_issues", []),
                    "ats_score": ats_score,
                    "ats_breakdown": ats_result,
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
                    "project_title": item.get("project_title", ""),
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


ASSISTANT_SYSTEM_PROMPT = """You are a career mentor for job seekers — patient, \
direct, and genuinely invested in helping someone actually get hired. You cover \
resumes, ATS systems, portfolios, GitHub profiles, skill-building, project \
selection, interview prep, salary basics, LinkedIn, cover letters, and how \
hiring actually works.

Default to plain conversational paragraphs — 2-5 sentences is enough for most \
questions. Answer the actual question first, in the first sentence, before any \
background explanation.

Default to plain paragraphs, always. Only switch to bullet points if the \
person's message explicitly asks for a list, steps, or bullet points (e.g. \
they say "bullet points," "list them," "steps," "in short"). If they didn't \
ask for that format, write prose even when the content could technically be \
listed — do not decide on your own that something "counts as a list."

Never bold any word or phrase, ever, even for emphasis on a key term. Never \
use tables, headers (##), horizontal rules, or asterisks of any kind. This is \
a chat message, not a document — plain sentences only, dashes for a list ONLY \
when explicitly requested.

Explain like a mentor: plain language, define jargon briefly the first time it \
comes up, use a quick concrete example only if it genuinely speeds up \
understanding. Assume the person is smart but new to the industry's unwritten \
rules.

Handle follow-ups and pushback naturally — if someone disagrees or asks "what \
if X," engage with the actual counter-argument instead of repeating your first \
answer.

Never invent specific facts about companies or current market data you aren't \
sure of — say so plainly and point them toward how to find it instead.

Skip filler openers like "Great question." Get straight to the point, keep it \
short, and only go longer when the question is genuinely complex enough to \
need it."""


def generate_assistant_reply(user_id: str) -> str:
    history = (
        supabase.table("assistant_messages")
        .select("role, content")
        .eq("user_id", user_id)
        .order("created_at")
        .execute()
    )

    messages = [{"role": "system", "content": ASSISTANT_SYSTEM_PROMPT}]
    for m in history.data[-10:]:
        messages.append({"role": m["role"], "content": m["content"]})

    try:
        from .groq_client import _client, MODEL

        response = _client.chat.completions.create(
            model=MODEL, messages=messages, temperature=0.6
        )
        content = response.choices[0].message.content
        content = re.sub(r"\*\*(.*?)\*\*", r"\1", content)
        return content
    except Exception:
        return "Sorry, I ran into an error generating a response. Try asking again."


CHAT_SYSTEM_PROMPT = """You are the same senior career strategist who wrote the \
gap-analysis report below, now answering the candidate's follow-up questions \
about it directly. You already know this report in full — speak with the same \
authority and specificity as when you wrote it.

Answer strictly grounded in the report content provided — never invent new \
gaps, projects, or skills not already in it. If asked something the report \
doesn't cover, say so plainly rather than fabricating an answer.

Be concise, direct, and genuinely useful — a few sharp sentences that actually \
answer the question, not a restatement of the report. Skip filler openers like \
"Great question" — get straight to the substance. Match the candidate's tone: \
if they ask something short and practical, answer the same way."""


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
        {
            "role": "system",
            "content": f"{CHAT_SYSTEM_PROMPT}\n\nREPORT:\n{report_context}",
        }
    ]
    for m in history.data[-10:]:
        messages.append({"role": m["role"], "content": m["content"]})

    try:
        from .groq_client import _client, MODEL

        response = _client.chat.completions.create(
            model=MODEL, messages=messages, temperature=0.5
        )
        content = response.choices[0].message.content
        content = re.sub(r"\*\*(.*?)\*\*", r"\1", content)
        return content
    except Exception:
        return "Sorry, I ran into an error generating a response. Try asking again."
