"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Search, Map, ArrowRight } from "lucide-react";

type RoadmapListItem = {
  id: string;
  job_title: string;
  project_count: number;
  done_items: number;
  total_items: number;
  updated_at: string; // ISO
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function RoadmapListPage() {
  // ⚠️ TEMP MOCK — remove and uncomment real fetch below before backend testing
  const [roadmaps] = useState<RoadmapListItem[]>([
    {
      id: "a1",
      job_title: "Senior Backend Engineer",
      project_count: 2,
      done_items: 3,
      total_items: 6,
      updated_at: "2026-08-23T10:00:00Z",
    },
    {
      id: "a2",
      job_title: "Platform Engineer, Infra",
      project_count: 1,
      done_items: 1,
      total_items: 3,
      updated_at: "2026-08-19T10:00:00Z",
    },
    {
      id: "a5",
      job_title: "Software Engineer II",
      project_count: 2,
      done_items: 5,
      total_items: 5,
      updated_at: "2026-07-30T10:00:00Z",
    },
  ]);

  // ---- REAL FETCH (uncomment when backend ready) ----
  // const [roadmaps, setRoadmaps] = useState<RoadmapListItem[]>([]);
  // useEffect(() => {
  //   async function load() {
  //     const data = await apiFetch("/roadmaps"); // aggregated per analysis
  //     setRoadmaps(data);
  //   }
  //   load();
  // }, []);

  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return roadmaps.filter((r) =>
      r.job_title.toLowerCase().includes(query.toLowerCase()),
    );
  }, [roadmaps, query]);

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
          Learning Roadmaps
        </span>
        <h1 className="mt-1.5 text-headline-lg text-text">Your Roadmaps</h1>
        <p className="mt-1.5 text-sm text-text-muted">
          Pick an analysis to see its project roadmaps.
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
              <Map size={19} className="text-primary" />
            </div>
            <p className="text-sm font-semibold text-text">
              No roadmaps match your search
            </p>
            <p className="text-sm text-text-muted max-w-xs">
              Try a different job title.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((r) => {
              const progress =
                r.total_items > 0
                  ? Math.round((r.done_items / r.total_items) * 100)
                  : 0;
              return (
                <Link
                  key={r.id}
                  href={`/roadmap/${r.id}`}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-background transition-colors group"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Map size={16} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text truncate">
                      {r.job_title}
                    </p>
                    <p className="text-xs text-text-muted mt-0.5">
                      {r.project_count}{" "}
                      {r.project_count === 1 ? "project" : "projects"} ·{" "}
                      {r.done_items}/{r.total_items} done overall · updated{" "}
                      {formatDate(r.updated_at)}
                    </p>
                  </div>
                  <div className="hidden sm:flex items-center gap-2 shrink-0 w-28">
                    <div className="h-1.5 flex-1 bg-border rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-text-muted w-8 text-right">
                      {progress}%
                    </span>
                  </div>
                  <ArrowRight
                    size={16}
                    className="shrink-0 text-text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
                  />
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
