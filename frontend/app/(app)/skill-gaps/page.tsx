"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Search, ShieldCheck, ArrowRight } from "lucide-react";

type SkillGapListItem = {
  id: string;
  job_title: string;
  critical_count: number;
  total_count: number;
  updated_at: string; // ISO
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function SkillGapsListPage() {
  // ⚠️ TEMP MOCK — remove and uncomment real fetch below before backend testing
  const [items] = useState<SkillGapListItem[]>([
    {
      id: "a1",
      job_title: "Senior Backend Engineer",
      critical_count: 2,
      total_count: 3,
      updated_at: "2026-08-23T10:00:00Z",
    },
    {
      id: "a2",
      job_title: "Platform Engineer, Infra",
      critical_count: 1,
      total_count: 4,
      updated_at: "2026-08-19T10:00:00Z",
    },
    {
      id: "a5",
      job_title: "Software Engineer II",
      critical_count: 0,
      total_count: 2,
      updated_at: "2026-07-30T10:00:00Z",
    },
  ]);

  // ---- REAL FETCH (uncomment when backend ready) ----
  // const [items, setItems] = useState<SkillGapListItem[]>([]);
  // useEffect(() => {
  //   async function load() {
  //     const data = await apiFetch("/skill-gaps");
  //     setItems(data);
  //   }
  //   load();
  // }, []);

  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return items.filter((r) =>
      r.job_title.toLowerCase().includes(query.toLowerCase()),
    );
  }, [items, query]);

  return (
    <div className="w-full flex flex-col gap-6">
      <Link
        href="/dashboard"
        className="flex items-center gap-1.5 text-sm text-text-muted hover:text-primary transition-colors w-fit"
      >
        <ArrowLeft size={16} />
        Back to Dashboard
      </Link>

      <div>
        <span className="text-label-sm uppercase text-primary">
          Skill Gap Analysis
        </span>
        <h1 className="mt-1.5 text-headline-lg text-text">Your Skill Gaps</h1>
        <p className="mt-1.5 text-sm text-text-muted">
          Pick an analysis to see the critical technical areas for that role.
        </p>
      </div>

      <div className="relative sm:max-w-sm">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by job title..."
          className="w-full text-sm border border-border rounded-lg pl-9 pr-3 py-2 bg-surface focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      <div className="bg-surface border border-border rounded-xl shadow-card overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 px-6 text-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10">
              <ShieldCheck size={19} className="text-primary" />
            </div>
            <p className="text-sm font-semibold text-text">
              No analyses match your search
            </p>
            <p className="text-sm text-text-muted max-w-xs">
              Try a different job title.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((r) => (
              <Link
                key={r.id}
                href={`/skill-gaps/${r.id}`}
                className="flex items-center gap-4 px-5 py-4 hover:bg-background transition-colors group"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <ShieldCheck size={16} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text truncate">
                    {r.job_title}
                  </p>
                  <p className="text-xs text-text-muted mt-0.5">
                    {r.total_count} skill gaps · updated{" "}
                    {formatDate(r.updated_at)}
                  </p>
                </div>
                {r.critical_count > 0 && (
                  <span className="hidden sm:inline-flex shrink-0 text-[10px] font-bold uppercase tracking-wide bg-danger/10 text-danger px-2 py-1 rounded-full">
                    {r.critical_count} critical
                  </span>
                )}
                <ArrowRight
                  size={16}
                  className="shrink-0 text-text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
                />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
