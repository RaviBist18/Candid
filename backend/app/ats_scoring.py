"""
Deterministic, rule-based ATS scoring — no LLM involved.
Mirrors how real ATS/resume-checker tools (Jobscan-style) score:
keyword overlap + structural formatting checks. Same input always
produces the same output.
"""

import re


_STOPWORDS = {
    "the",
    "and",
    "a",
    "an",
    "to",
    "of",
    "in",
    "on",
    "for",
    "with",
    "is",
    "are",
    "as",
    "at",
    "by",
    "or",
    "be",
    "this",
    "that",
    "will",
    "your",
    "you",
    "we",
    "our",
    "us",
    "from",
    "have",
    "has",
    "had",
    "it",
    "its",
    "who",
    "what",
    "which",
    "their",
    "they",
    "them",
    "can",
    "may",
    "if",
    "not",
    "but",
    "all",
    "any",
    "into",
    "using",
    "use",
    "per",
    "etc",
}

_ROLE_WORDS = {
    "engineer",
    "developer",
    "manager",
    "designer",
    "analyst",
    "scientist",
    "architect",
    "specialist",
    "consultant",
    "lead",
    "senior",
    "junior",
    "director",
    "administrator",
    "coordinator",
}


def _tokenize(text: str) -> set[str]:
    words = re.findall(r"\b[a-zA-Z][a-zA-Z\-]{2,}\b", text.lower())
    return {w for w in words if w not in _STOPWORDS and len(w) > 3}


def compute_ats_score(resume_text: str, job_description: str) -> dict:
    strengths: list[dict] = []
    issues: list[dict] = []

    # 1. Hard skills match (40 pts)
    jd_keywords = _tokenize(job_description)
    resume_keywords = _tokenize(resume_text)
    if jd_keywords:
        matched = jd_keywords & resume_keywords
        skills_pct = len(matched) / len(jd_keywords)
    else:
        matched = set()
        skills_pct = 1.0
    skills_pts = round(40 * skills_pct)
    if skills_pct >= 0.6:
        strengths.append(
            {
                "factor": "Strong keyword match with job description",
                "why": [
                    f"{len(matched)} of {len(jd_keywords)} key terms from the job description appear in your resume",
                ],
            }
        )
    else:
        issues.append(
            {
                "issue": "Low keyword overlap with job description",
                "points": 40 - skills_pts,
                "fix": [
                    "Mirror the exact terms the job description uses for your skills and tools",
                    "ATS keyword matching is literal — synonyms and paraphrases often don't count",
                ],
            }
        )

    # 2. Job title / role match (10 pts)
    jd_roles = _ROLE_WORDS & _tokenize(job_description)
    resume_roles = _ROLE_WORDS & resume_keywords
    if jd_roles:
        title_pct = len(jd_roles & resume_roles) / len(jd_roles)
    else:
        title_pct = 1.0
    title_pts = round(10 * title_pct)
    if title_pts < 10:
        issues.append(
            {
                "issue": "Resume title/role wording doesn't match the job description",
                "points": 10 - title_pts,
                "fix": [
                    "Use the same role title language as the job posting where accurate",
                    "ATS and recruiter searches both filter by title keywords",
                ],
            }
        )
    else:
        strengths.append(
            {
                "factor": "Role title language matches the job description",
                "why": ["Your resume uses similar role terminology to the posting"],
            }
        )

    # 3. Section/structure checks (25 pts, 5 each)
    has_email = bool(re.search(r"[\w.+-]+@[\w-]+\.[\w.-]+", resume_text))
    has_skills = bool(re.search(r"(?i)\bskills\b", resume_text))
    has_experience = bool(
        re.search(r"(?i)\b(experience|work history|employment)\b", resume_text)
    )
    has_education = bool(re.search(r"(?i)\beducation\b", resume_text))
    pipe_count = resume_text.count("|")
    clean_layout = pipe_count < 15

    section_checks = [
        (
            has_email,
            "Contact email detected",
            "No email address found — add one, ATS parsers look for it explicitly",
        ),
        (
            has_skills,
            "Dedicated Skills section present",
            "No 'Skills' section header found — add one, ATS parsers scan for it specifically",
        ),
        (
            has_experience,
            "Work Experience section present",
            "No 'Experience' section header found — use a standard header so it's parsed correctly",
        ),
        (
            has_education,
            "Education section present",
            "No 'Education' section header found — add one even if brief",
        ),
        (
            clean_layout,
            "Clean, parseable layout",
            "Resume layout may use tables or columns that break ATS parsing — use a single-column format",
        ),
    ]
    section_pts = 0
    for passed, good_label, fix_label in section_checks:
        if passed:
            section_pts += 5
            strengths.append(
                {"factor": good_label, "why": ["Detected in your resume text"]}
            )
        else:
            issues.append(
                {
                    "issue": good_label.replace("present", "missing").replace(
                        "detected", "missing"
                    ),
                    "points": 5,
                    "fix": [fix_label],
                }
            )

    # 4. Measurable results (10 pts)
    lines = [l.strip() for l in resume_text.splitlines() if l.strip()]
    bullet_like = [l for l in lines if len(l) < 200]
    metric_lines = [l for l in bullet_like if re.search(r"\d", l)]
    metric_pct = len(metric_lines) / len(bullet_like) if bullet_like else 0
    metrics_pts = round(10 * min(metric_pct * 2, 1.0))
    if metrics_pts >= 7:
        strengths.append(
            {
                "factor": "Quantified achievements",
                "why": ["Many of your bullet points include measurable results"],
            }
        )
    else:
        issues.append(
            {
                "issue": "Few quantified results in bullet points",
                "points": 10 - metrics_pts,
                "fix": [
                    "Add numbers, percentages, or scale to bullet points where possible — both ATS ranking and recruiters weight this"
                ],
            }
        )

    # 5. Length/density (10 pts)
    word_count = len(resume_text.split())
    if 300 <= word_count <= 1200:
        length_pts = 10
        strengths.append(
            {
                "factor": "Healthy resume length",
                "why": [
                    f"{word_count} words — in the range recruiters and parsers handle well"
                ],
            }
        )
    else:
        length_pts = max(0, 10 - abs(word_count - 750) // 150)
        issues.append(
            {
                "issue": "Resume length outside the typical healthy range",
                "points": 10 - length_pts,
                "fix": [
                    "Aim for roughly 300–1200 words — too short reads as thin, too long dilutes keyword density"
                ],
            }
        )

    # 6. Date formatting consistency (5 pts)
    has_dates = (
        bool(
            re.search(
                r"(?i)\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+\d{4}\b",
                resume_text,
            )
        )
        or bool(re.search(r"\b\d{4}\s*-\s*\d{4}\b", resume_text))
        or bool(re.search(r"\b\d{2}/\d{4}\b", resume_text))
    )
    date_pts = 5 if has_dates else 0
    if date_pts:
        strengths.append(
            {
                "factor": "Consistent date formatting detected",
                "why": ["Dates follow a standard, parseable format"],
            }
        )
    else:
        issues.append(
            {
                "issue": "No clear, consistent date formatting detected",
                "points": 5,
                "fix": ["Use a consistent format like 'Jan 2023 – Present' throughout"],
            }
        )

    total = skills_pts + title_pts + section_pts + metrics_pts + length_pts + date_pts

    return {
        "score": total,
        "baseline": 100,
        "strengths": strengths,
        "issues": issues,
    }
