"use client";

import Link from "next/link";
import { ArrowLeft, CheckCircle2, Wrench, TrendingDown } from "lucide-react";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

type LedgerIssue = {
  issue: string;
  points: number;
  fix: string[];
};

type Strength = {
  factor: string;
  why: string[];
};

type AtsScoreData = {
  analysis_id: string;
  job_title: string;
  created_at: string;
  score: number;
  baseline: number;
  strengths: Strength[];
  issues: LedgerIssue[];
};

function verdictFor(score: number) {
  if (score >= 85) return { label: "Strong pass", tone: "text-success" };
  if (score >= 65)
    return { label: "Likely to pass, with gaps", tone: "text-primary" };
  return { label: "At risk of ATS filtering", tone: "text-danger" };
}

export default function AtsScoreClient({ data }: { data: AtsScoreData }) {
  const verdict = verdictFor(data.score);
  const totalDeduction = data.issues.reduce((s, x) => s + x.points, 0);

  return (
    <div className="w-full flex flex-col gap-6">
      <Link
        href={`/dashboard`}
        className="flex items-center gap-1.5 text-sm text-text-muted hover:text-primary transition-colors w-fit"
      >
        <ArrowLeft size={16} />
        Back to Dashboard
      </Link>

      {/* HERO — score + verdict */}
      <div className="bg-surface border border-border rounded-xl shadow-card p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div className="flex flex-col gap-2">
          <span className="text-label-sm uppercase text-primary tracking-wide">
            ATS Score
          </span>
          <h1 className="text-2xl font-bold text-text leading-snug">
            {data.job_title}
          </h1>
          <p className="text-sm text-text-muted">
            Analyzed {formatDate(data.created_at)}
          </p>
        </div>

        <div className="flex flex-col items-start sm:items-end gap-2">
          <div className="flex items-baseline gap-1.5">
            <span className="text-5xl font-bold text-text leading-none">
              {data.score}
            </span>
            <span className="text-base text-text-muted">/ {data.baseline}</span>
          </div>
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full bg-background border border-border ${verdict.tone}`}
          >
            {verdict.label}
          </span>
        </div>
      </div>

      {/* LEDGER — deductions only, baseline down to final score */}
      <div className="bg-surface border border-border rounded-xl shadow-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-base font-bold text-text">Score Breakdown</h2>
          <p className="text-xs text-text-muted mt-0.5">
            {data.baseline} points, minus {totalDeduction} for the issues below
          </p>
        </div>
        <div className="divide-y divide-border">
          <div className="flex items-center justify-between px-5 py-3.5">
            <span className="text-sm text-text-muted">Baseline</span>
            <span className="text-sm font-semibold text-text">
              {data.baseline}
            </span>
          </div>
          {data.issues.map((iss, i) => (
            <div
              key={i}
              className="flex items-center justify-between px-5 py-3.5"
            >
              <span className="flex items-center gap-2.5 text-sm text-text">
                <TrendingDown size={14} className="text-danger shrink-0" />
                {iss.issue}
              </span>
              <span className="text-sm font-semibold text-danger">
                −{iss.points}
              </span>
            </div>
          ))}
          <div className="flex items-center justify-between px-5 py-4 bg-background">
            <span className="text-sm font-bold text-text">Final Score</span>
            <span className="text-base font-bold text-text">
              {data.score} / {data.baseline}
            </span>
          </div>
        </div>
      </div>

      {/* STRENGTHS + ISSUES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <section className="bg-surface border border-border rounded-xl shadow-card overflow-hidden">
          <div className="px-5 py-3.5 border-b border-border">
            <h2 className="text-base font-bold text-text">
              What&apos;s Working
            </h2>
          </div>
          <div className="divide-y divide-border">
            {data.strengths.map((s, i) => (
              <div key={i} className="px-5 py-4 flex flex-col gap-2.5">
                <p className="text-sm font-semibold text-text flex items-start gap-2">
                  <CheckCircle2
                    size={14}
                    className="text-success shrink-0 mt-0.5"
                  />
                  {s.factor}
                </p>
                <ul className="flex flex-col gap-2 pl-[22px]">
                  {s.why.map((w, wi) => (
                    <li
                      key={wi}
                      className="text-sm text-text-muted leading-relaxed"
                    >
                      {w}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            {data.strengths.length === 0 && (
              <p className="px-5 py-4 text-sm text-text-muted">
                No strengths flagged.
              </p>
            )}
          </div>
        </section>

        <section className="bg-surface border border-border rounded-xl shadow-card overflow-hidden">
          <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
            <h2 className="text-base font-bold text-text">Issues to Fix</h2>
            <span className="text-xs font-semibold text-danger">
              −{totalDeduction} pts
            </span>
          </div>
          <div className="divide-y divide-border">
            {data.issues.map((iss, i) => (
              <div key={i} className="px-5 py-4 flex flex-col gap-2.5">
                <p className="text-sm font-semibold text-text">{iss.issue}</p>
                <ul className="flex flex-col gap-2">
                  {iss.fix.map((f, fi) => (
                    <li
                      key={fi}
                      className="text-sm text-text-muted leading-relaxed flex items-start gap-2"
                    >
                      <Wrench
                        size={13}
                        className="shrink-0 mt-0.5 text-primary"
                      />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            {data.issues.length === 0 && (
              <p className="px-5 py-4 text-sm text-text-muted">
                No issues flagged.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
