"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Code2,
  Link2,
  Upload,
  X,
  Check,
  FileText,
  Target,
  Loader2,
  ShieldCheck,
} from "lucide-react";

// ---- Replace with real data from /sources/status ----
const sourceStatus = {
  github: { connected: true, username: "ravibist178" },
  linkedin: { connected: true },
};

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

  // Step 1 state
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState("");
  const [resumeDragActive, setResumeDragActive] = useState(false);
  const [portfolioUrl, setPortfolioUrl] = useState("");

  // Step 2 state
  const [jobDescription, setJobDescription] = useState("");

  // Step 3 state
  const [submitting, setSubmitting] = useState(false);

  const canGoNextFromStep1 = resumeFile || resumeText.trim().length > 0;
  const canGoNextFromStep2 = jobDescription.trim().length > 0;

  function handleSubmit() {
    setSubmitting(true);
    // ⚠️ TEMP MOCK — remove this block and uncomment real fetch below before backend testing
    setTimeout(() => {
      router.push("/report/a1");
    }, 1500);

    // ---- REAL FETCH (uncomment when backend ready) ----
    // async function submit() {
    //   try {
    //     const res = await apiFetch("/analyze", {
    //       method: "POST",
    //       body: JSON.stringify({
    //         resumeText,
    //         portfolioUrl,
    //         jobDescription,
    //       }),
    //     });
    //     router.push(`/report/${res.analysis_id}`);
    //   } catch (e: any) {
    //     setSubmitting(false);
    //     // TODO: show error state
    //   }
    // }
    // submit();
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
          {/* Read-only status chips */}
          <div className="flex flex-wrap gap-2.5">
            <div className="flex items-center gap-2 border border-border bg-surface rounded-full pl-1.5 pr-3.5 py-1.5">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                <Code2 size={12} className="text-primary" />
              </div>
              <span className="text-xs font-medium text-text">
                <span className="text-text-muted">GitHub</span>
                {sourceStatus.github.connected && (
                  <span className="text-text-muted"> · </span>
                )}
                {sourceStatus.github.connected && sourceStatus.github.username}
              </span>
              {sourceStatus.github.connected ? (
                <Check size={13} className="text-primary" />
              ) : (
                <Link
                  href="/settings"
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
                {sourceStatus.linkedin.connected && (
                  <span className="text-text-muted"> · </span>
                )}
                {sourceStatus.linkedin.connected && "Profile added"}
              </span>
              {sourceStatus.linkedin.connected ? (
                <Check size={13} className="text-primary" />
              ) : (
                <Link
                  href="/settings"
                  className="text-xs text-primary hover:underline font-medium"
                >
                  Add
                </Link>
              )}
            </div>
          </div>

          {/* Resume — primary input */}
          <div className="bg-surface border border-border rounded-xl shadow-card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <FileText size={16} className="text-primary" />
              </div>
              <p className="text-sm font-medium text-text">Resume</p>
            </div>

            {resumeFile ? (
              <div className="flex items-center justify-between gap-2 border border-border rounded-lg px-3 py-3 text-sm text-text mb-3">
                <span className="flex items-center gap-2 truncate">
                  <Upload size={16} className="text-primary shrink-0" />
                  {resumeFile.name}
                </span>
                <button
                  type="button"
                  onClick={() => setResumeFile(null)}
                  className="shrink-0 text-text-muted hover:text-danger transition-colors"
                  aria-label="Remove file"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <label
                onDragOver={(e) => {
                  e.preventDefault();
                  setResumeDragActive(true);
                }}
                onDragLeave={() => setResumeDragActive(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setResumeDragActive(false);
                  const file = e.dataTransfer.files?.[0];
                  if (
                    file &&
                    (file.type === "application/pdf" ||
                      file.type ===
                        "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
                  ) {
                    setResumeFile(file);
                  }
                }}
                className={`flex flex-col items-center justify-center gap-1.5 border border-dashed rounded-lg px-3 py-6 text-sm transition-colors cursor-pointer mb-3 ${
                  resumeDragActive
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border text-text-muted hover:border-primary hover:text-primary"
                }`}
              >
                <Upload size={18} />
                <span className="font-medium">
                  Upload PDF or DOCX, or drag & drop
                </span>
                <input
                  type="file"
                  accept=".pdf,.docx"
                  className="hidden"
                  onChange={(e) => setResumeFile(e.target.files?.[0] ?? null)}
                />
              </label>
            )}

            <div className="flex items-center gap-3 mb-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-[11px] font-medium uppercase tracking-wide text-text-muted">
                Or
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your resume text here..."
              rows={3}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
          </div>

          {/* Portfolio — optional input */}
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
      {step === 3 && (
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
                  {sourceStatus.github.connected ? (
                    <>
                      {sourceStatus.github.username}
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
                  {sourceStatus.linkedin.connected ? (
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
                  {resumeFile
                    ? resumeFile.name
                    : resumeText
                      ? "Pasted text"
                      : "Not provided"}
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
            </div>
          </div>

          <div className="flex items-start gap-2.5 border border-border rounded-lg px-4 py-3 bg-surface">
            <ShieldCheck size={16} className="text-primary shrink-0 mt-0.5" />
            <p className="text-xs text-text-muted leading-relaxed">
              Nothing is analyzed until you click Start Analysis below. This
              usually takes under a minute.
            </p>
          </div>
        </div>
      )}

      {/* NAVIGATION */}
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
    </div>
  );
}
