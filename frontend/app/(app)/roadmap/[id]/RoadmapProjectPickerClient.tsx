"use client";

import Link from "next/link";
import { ArrowLeft, Briefcase, ArrowRight } from "lucide-react";

type ProjectRoadmapSummary = {
  project_title: string;
  done_items: number;
  total_items: number;
};

type AnalysisRoadmaps = {
  analysis_id: string;
  job_title: string;
  projects: ProjectRoadmapSummary[];
};

export default function RoadmapProjectPickerClient({
  data,
}: {
  data: AnalysisRoadmaps;
}) {
  return (
    <div className="w-full flex flex-col gap-6">
      <Link
        href="/roadmap"
        className="flex items-center gap-1.5 text-sm text-text-muted hover:text-primary transition-colors w-fit"
      >
        <ArrowLeft size={16} />
        Back to Roadmap
      </Link>

      <div>
        <span className="text-label-sm uppercase text-primary">
          Learning Roadmap
        </span>
        <h1 className="mt-1.5 text-headline-lg text-text">{data.job_title}</h1>
        <p className="mt-1.5 text-sm text-text-muted">
          {data.projects.length}{" "}
          {data.projects.length === 1 ? "project" : "projects"} to build for
          this role. Pick one to see its plan.
        </p>
      </div>

      <div className="bg-surface border border-border rounded-xl shadow-card overflow-hidden">
        <div className="divide-y divide-border">
          {data.projects.map((p) => {
            const progress =
              p.total_items > 0
                ? Math.round((p.done_items / p.total_items) * 100)
                : 0;
            return (
              <Link
                key={p.project_title}
                href={`/roadmap/${data.analysis_id}/${encodeURIComponent(p.project_title)}`}
                className="flex items-center gap-4 px-5 py-4 hover:bg-background transition-colors group"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Briefcase size={16} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text truncate">
                    {p.project_title}
                  </p>
                  <p className="text-xs text-text-muted mt-0.5">
                    {p.done_items}/{p.total_items} done
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
      </div>
    </div>
  );
}
