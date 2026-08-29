"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpDown, ShieldAlert } from "lucide-react";

type SkillGap = {
  skill: string;
  severity: "critical" | "important" | "nice_to_have";
  related_project: string | null;
  why_it_matters: string[];
};

type SkillGapDetail = {
  analysis_id: string;
  job_title: string;
  skill_gaps: SkillGap[];
};

const SEVERITY_ORDER = { critical: 0, important: 1, nice_to_have: 2 };
const SEVERITY_LABEL = {
  critical: "Critical",
  important: "Important",
  nice_to_have: "Nice to Have",
};
const SEVERITY_STYLE = {
  critical: "bg-danger text-white",
  important: "bg-amber-500 text-white",
  nice_to_have: "bg-border text-text-muted",
};

export default function SkillGapsDetailClient({
  initialData,
}: {
  initialData: SkillGapDetail;
}) {
  const [data] = useState<SkillGapDetail>(initialData);
  const [sortByPriority, setSortByPriority] = useState(false);

  const sortedGaps = useMemo(() => {
    if (!sortByPriority) return data.skill_gaps;
    return [...data.skill_gaps].sort(
      (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity],
    );
  }, [data, sortByPriority]);

  const criticalCount = useMemo(
    () => data.skill_gaps.filter((s) => s.severity === "critical").length,
    [data],
  );

  return (
    <div className="w-full flex flex-col gap-6">
      <Link
        href="/skill-gaps"
        className="flex items-center gap-1.5 text-sm text-text-muted hover:text-primary transition-colors w-fit"
      >
        <ArrowLeft size={16} />
        Back to Skill Gaps
      </Link>

      <div>
        <span className="text-label-sm uppercase text-primary">
          Skill Gap Analysis
        </span>
        <h1 className="mt-1.5 text-headline-lg text-text">{data.job_title}</h1>
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <span className="text-xs font-medium bg-background border border-border text-text px-2.5 py-1 rounded-full">
            {data.skill_gaps.length} skill gaps
          </span>
          {criticalCount > 0 && (
            <span className="flex items-center gap-1 text-xs font-bold uppercase tracking-wide bg-danger/10 text-danger px-2.5 py-1 rounded-full">
              <ShieldAlert size={12} />
              {criticalCount} critical
            </span>
          )}
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl shadow-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-text">
            Critical Technical Areas
          </h2>
          {data.skill_gaps.length > 1 && (
            <button
              type="button"
              onClick={() => setSortByPriority((v) => !v)}
              className="flex items-center gap-1.5 text-xs font-medium text-text-muted hover:text-primary transition-colors"
            >
              <ArrowUpDown size={13} />
              {sortByPriority ? "Sorted by priority" : "Sort by priority"}
            </button>
          )}
        </div>

        <div className="flex flex-col gap-3">
          {sortedGaps.map((s, i) => (
            <div key={i} className="border border-border rounded-lg px-4 py-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-bold text-text">{s.skill}</span>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full shrink-0 ${SEVERITY_STYLE[s.severity]}`}
                >
                  {SEVERITY_LABEL[s.severity]}
                </span>
              </div>
              <ul className="flex flex-col gap-2 mt-3">
                {s.why_it_matters.map((w, wi) => (
                  <li
                    key={wi}
                    className="text-sm text-text-muted leading-relaxed flex items-start gap-2"
                  >
                    <span className="mt-2 h-1 w-1 rounded-full bg-primary shrink-0" />
                    {w}
                  </li>
                ))}
              </ul>
              {s.related_project && (
                <p className="text-xs text-text-muted mt-3 pt-3 border-t border-border">
                  Addressed by:{" "}
                  <span className="font-semibold text-primary">
                    {s.related_project}
                  </span>
                </p>
              )}
            </div>
          ))}
          {data.skill_gaps.length === 0 && (
            <p className="text-sm text-text-muted">No skill gaps flagged.</p>
          )}
        </div>
      </div>
    </div>
  );
}
