"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import {
  ArrowLeft,
  ArrowRight,
  Code2,
  Link2,
  Check,
  FileText,
  Target,
  Loader2,
  ShieldCheck,
} from "lucide-react";

type SourceStatus = { connected: boolean; username?: string };

const STEPS = [
  { number: 1, label: "Sources" },
  { number: 2, label: "Job Description" },
  { number: 3, label: "Review" },
];

function StepTracker({ step }: { step: number }) {
  return (
    <div className="flex items-center">
      {STEPS.map((s, i) => {
        const isComplete = step > s.number;
        const isActive = step === s.number;
        return (
          <div
            key={s.number}
            className="flex items-center flex-1 last:flex-initial"
          >
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold shrink-0 transition-colors ${
                  isComplete
                    ? "bg-primary text-white"
                    : isActive
                      ? "border-2 border-primary text-primary bg-surface"
                      : "border border-border text-text-muted bg-surface"
                }`}
              >
                {isComplete ? <Check size={14} /> : s.number}
              </div>
              <span
                className={`text-[11px] font-medium whitespace-nowrap ${
                  isActive || isComplete ? "text-text" : "text-text-muted"
                }`}
              >
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`h-px flex-1 mx-2 mb-5 transition-colors ${
                  isComplete ? "bg-primary" : "bg-border"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function AnalyzePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  // Real source status, loaded from backend (GitHub + LinkedIn live in /sources)
  const [githubStatus, setGithubStatus] = useState<SourceStatus>({
    connected: false,
  });
  const [linkedinStatus, setLinkedinStatus] = useState<SourceStatus>({
    connected: false,
  });
  const [loadingSources, setLoadingSources] = useState(true);
  const [phase, setPhase] = useState<"form" | "processing">("form");
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [analysisStatus, setAnalysisStatus] = useState<string>("pending");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    apiFetch("/sources")
      .then((data: any[]) => {
        const gh = data.find((s) => s.source_type === "github");
        const li = data.find((s) => s.source_type === "linkedin");
        setGithubStatus(
          gh
            ? { connected: true, username: gh.raw_data.username }
            : { connected: false },
        );
        setLinkedinStatus(li ? { connected: true } : { connected: false });
      })
      .finally(() => setLoadingSources(false));
  }, []);
  useEffect(() => {
    if (phase !== "processing" || !analysisId) return;
    let cancelled = false;

    async function poll() {
      try {
        const analysis = await apiFetch(`/analyses/${analysisId}`);
        if (cancelled) return;

        if (analysis.status === "failed") {
          setSubmitError(
            analysis.error_message || "Analysis failed. Try again.",
          );
          setPhase("form");
          setSubmitting(false);
          return;
        }

        setAnalysisStatus(analysis.status);

        if (analysis.status === "completed") {
          router.push(`/report/${analysisId}`);
          return;
        }

        setTimeout(poll, 2000);
      } catch (e: any) {
        if (!cancelled) {
          setSubmitError(e.message || "Something went wrong. Try again.");
          setPhase("form");
          setSubmitting(false);
        }
      }
    }

    poll();
    return () => {
      cancelled = true;
    };
  }, [phase, analysisId, router]);

  // Step 1 state — resume + portfolio, entered fresh per analysis (not saved to sources)
  const [resumeText, setResumeText] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");

  // Step 2 state
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");

  const canGoNextFromStep1 = resumeText.trim().length > 0;
  const canGoNextFromStep2 =
    jobDescription.trim().length > 0 && jobTitle.trim().length > 0;

  async function handleSubmit() {
    setSubmitting(true);
    setSubmitError("");
    try {
      const res = await apiFetch("/analyses", {
        method: "POST",
        body: JSON.stringify({
          job_title: jobTitle,
          job_description: jobDescription,
          resume_text: resumeText,
          portfolio_url: portfolioUrl || null,
        }),
      });
      setAnalysisId(res.id);
      setPhase("processing");
    } catch (e: any) {
      setSubmitting(false);
      setSubmitError(e.message || "Failed to start analysis. Try again.");
    }
  }

  return (
    <div className="mx-auto max-w-2xl w-full flex flex-col gap-8">
      <Link
        href="/dashboard"
        className="flex items-center gap-1.5 text-sm text-text-muted hover:text-primary transition-colors w-fit"
      >
        <ArrowLeft size={16} />
        Back to Dashboard
      </Link>

      <div className="flex flex-col gap-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-primary">
            New Analysis
          </span>
          <h1 className="mt-1.5 text-2xl font-bold text-text">
            {step === 1 && "Confirm your sources"}
            {step === 2 && "Paste the target job description"}
            {step === 3 && "Review and submit"}
          </h1>
        </div>

        <StepTracker step={step} />
      </div>

      {/* STEP 1 — SOURCES */}
      {step === 1 && (
        <div className="flex flex-col gap-5">
          {/* Real status chips — GitHub + LinkedIn come from /sources */}
          <div className="flex flex-wrap gap-2.5">
            <div className="flex items-center gap-2 border border-border bg-surface rounded-full pl-1.5 pr-3.5 py-1.5">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                <Code2 size={12} className="text-primary" />
              </div>
              <span className="text-xs font-medium text-text">
                <span className="text-text-muted">GitHub</span>
                {githubStatus.connected && (
                  <span className="text-text-muted"> &middot; </span>
                )}
                {githubStatus.connected && githubStatus.username}
              </span>
              {loadingSources ? (
                <Loader2 size={13} className="animate-spin text-text-muted" />
              ) : githubStatus.connected ? (
                <Check size={13} className="text-primary" />
              ) : (
                <Link
                  href="/sources"
                  className="text-xs text-primary hover:underline font-medium"
                >
                  Connect
                </Link>
              )}
            </div>

            <div className="flex items-center gap-2 border border-border bg-surface rounded-full pl-1.5 pr-3.5 py-1.5">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                <Link2 size={12} className="text-primary" />
              </div>
              <span className="text-xs font-medium text-text">
                <span className="text-text-muted">LinkedIn</span>
                {linkedinStatus.connected && (
                  <span className="text-text-muted"> &middot; </span>
                )}
                {linkedinStatus.connected && "Profile added"}
              </span>
              {loadingSources ? (
                <Loader2 size={13} className="animate-spin text-text-muted" />
              ) : linkedinStatus.connected ? (
                <Check size={13} className="text-primary" />
              ) : (
                <Link
                  href="/sources"
                  className="text-xs text-primary hover:underline font-medium"
                >
                  Add
                </Link>
              )}
            </div>
          </div>

          {/* Resume — fresh per analysis, not saved */}
          <div className="bg-surface border border-border rounded-xl shadow-card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <FileText size={16} className="text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-text">Resume</p>
                <p className="text-xs text-text-muted">
                  Paste the version you&apos;re using for this specific
                  application.
                </p>
              </div>
            </div>

            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your resume text here..."
              rows={8}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
          </div>

          {/* Portfolio — fresh per analysis, not saved */}
          <div className="bg-surface border border-border rounded-xl shadow-card p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Link2 size={16} className="text-primary" />
              </div>
              <p className="text-sm font-medium text-text">Portfolio URL</p>
            </div>
            <input
              value={portfolioUrl}
              onChange={(e) => setPortfolioUrl(e.target.value)}
              placeholder="https://yourportfolio.com"
              className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <p className="text-xs text-text-muted mt-1.5">
              Optional, but improves ATS/completeness signal.
            </p>
          </div>
        </div>
      )}

      {/* STEP 2 — JOB DESCRIPTION */}
      {step === 2 && (
        <div className="bg-surface border border-border rounded-xl shadow-card p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Target size={16} className="text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-text">
                  Target Job Description
                </p>
                <p className="text-xs text-text-muted">
                  Paste the full JD you&apos;re analyzing against
                </p>
              </div>
            </div>
            <span className="text-[11px] font-semibold uppercase tracking-wide text-primary bg-primary/10 px-2 py-0.5 rounded-full shrink-0">
              Required
            </span>
          </div>

          <div className="mb-4">
            <label className="text-xs font-medium text-text-muted mb-1.5 block">
              Job Title
            </label>
            <input
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g. Backend Developer"
              className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the job description here — include responsibilities, required skills, and qualifications for the most accurate gap analysis."
            rows={16}
            className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          />

          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-text-muted">
              More detail in the JD = sharper gap analysis.
            </p>
            <span className="text-xs text-text-muted shrink-0">
              {jobDescription.trim().length === 0
                ? "0 characters"
                : `${jobDescription.trim().length.toLocaleString()} characters`}
            </span>
          </div>
        </div>
      )}

      {/* STEP 3 — REVIEW */}
      {step === 3 && phase === "form" && (
        <div className="flex flex-col gap-5">
          <div className="bg-surface border border-border rounded-xl shadow-card overflow-hidden">
            <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
              <span className="text-sm font-semibold text-text">
                Ready to analyze
              </span>
              <span className="text-xs text-text-muted">
                Edit anything by going back
              </span>
            </div>
            <div className="divide-y divide-border">
              <div className="px-5 py-3.5 flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-primary font-medium">
                  <Code2 size={14} /> GitHub
                </span>
                <span className="flex items-center gap-1.5 text-sm text-text font-medium">
                  {githubStatus.connected ? (
                    <>
                      {githubStatus.username}
                      <Check size={13} className="text-primary" />
                    </>
                  ) : (
                    "Not connected"
                  )}
                </span>
              </div>
              <div className="px-5 py-3.5 flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-primary font-medium">
                  <Link2 size={14} /> LinkedIn
                </span>
                <span className="flex items-center gap-1.5 text-sm text-text font-medium">
                  {linkedinStatus.connected ? (
                    <>
                      Added
                      <Check size={13} className="text-primary" />
                    </>
                  ) : (
                    "Not added"
                  )}
                </span>
              </div>
              <div className="px-5 py-3.5 flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-primary font-medium">
                  <FileText size={14} /> Resume
                </span>
                <span className="text-sm text-text font-medium truncate max-w-[60%]">
                  {resumeText ? "Pasted text" : "Not provided"}
                </span>
              </div>
              <div className="px-5 py-3.5 flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-primary font-medium">
                  <Link2 size={14} /> Portfolio
                </span>
                <span className="text-sm text-text font-medium truncate max-w-[60%]">
                  {portfolioUrl || "Not provided"}
                </span>
              </div>
              <div className="px-5 py-3.5 flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-primary font-medium">
                  <Target size={14} /> Job Description
                </span>
                <span className="text-sm text-text font-medium">
                  {jobDescription.trim().length.toLocaleString()} characters
                </span>
              </div>
              <div className="px-5 py-3.5 flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-primary font-medium">
                  <Target size={14} /> Job Title
                </span>
                <span className="text-sm text-text font-medium">
                  {jobTitle}
                </span>
              </div>
            </div>
          </div>

          {submitError && (
            <div className="rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
              {submitError}
            </div>
          )}

          <div className="flex items-start gap-2.5 border border-border rounded-lg px-4 py-3 bg-surface">
            <ShieldCheck size={16} className="text-primary shrink-0 mt-0.5" />
            <p className="text-xs text-text-muted leading-relaxed">
              Nothing is analyzed until you click Start Analysis below. This
              usually takes under a minute.
            </p>
          </div>
        </div>
      )}

      {phase === "processing" && (
        <div className="bg-surface border border-border rounded-xl shadow-card flex flex-col items-center justify-center gap-4 py-16 text-center">
          <div className="relative flex h-16 w-16 items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-border" />
            <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
            <Target size={22} className="text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-text">
              {analysisStatus === "processing"
                ? "Analyzing your profile against the JD..."
                : "Starting analysis..."}
            </p>
            <p className="text-xs text-text-muted mt-1.5">
              This usually takes under a minute. Stay on this page.
            </p>
          </div>
        </div>
      )}

      {/* NAVIGATION */}
      {phase === "form" && (
        <div className="flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="text-sm font-semibold text-text-muted hover:text-text transition-colors px-4 py-2.5"
            >
              Back
            </button>
          ) : (
            <span />
          )}

          {step < totalSteps ? (
            <button
              type="button"
              disabled={step === 1 ? !canGoNextFromStep1 : !canGoNextFromStep2}
              onClick={() => setStep((s) => s + 1)}
              className="flex items-center gap-2 bg-primary text-white text-sm font-semibold px-5 py-2.5 rounded-lg shadow-sm hover:bg-primary-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 bg-primary text-white text-sm font-semibold px-5 py-2.5 rounded-lg shadow-sm hover:bg-primary-hover transition-colors disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Starting Analysis...
                </>
              ) : (
                <>
                  <Target size={16} />
                  Start Analysis
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
