"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Clock,
} from "lucide-react";

type RoadmapItem = {
  id: string;
  title: string;
  description: string | null;
  is_checked: boolean;
  order_index: number;
};

type RoadmapWeek = {
  week_number: number;
  theme: string;
  estimated_time: string;
  items: RoadmapItem[];
};

type RoadmapDetail = {
  analysis_id: string;
  project_id: string;
  project_title: string;
  weeks: RoadmapWeek[];
};

export default function RoadmapDetailPage() {
  const params = useParams();
  const analysisId = params.id as string;
  const projectId = params.projectId as string;

  const [data, setData] = useState<RoadmapDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openWeeks, setOpenWeeks] = useState<Set<number>>(new Set());

  useEffect(() => {
    // ⚠️ TEMP MOCK — remove this block and uncomment real fetch below before backend testing
    setData({
      analysis_id: analysisId,
      project_id: projectId,
      project_title: "REST API with Authentication & Automated Tests",
      weeks: [
        {
          week_number: 1,
          theme: "Foundations & Auth",
          estimated_time: "~5-6 days",
          items: [
            {
              id: "r1",
              title: "Set up the basic project structure",
              description:
                "Create the folders, routes, and database connection your API will run on.",
              is_checked: true,
              order_index: 1,
            },
            {
              id: "r2",
              title: "Add login and authentication",
              description:
                "Let users securely log in, and use refresh tokens so they stay logged in safely.",
              is_checked: true,
              order_index: 2,
            },
          ],
        },
        {
          week_number: 2,
          theme: "Testing Discipline",
          estimated_time: "~4-5 days",
          items: [
            {
              id: "r3",
              title: "Write tests for your login system",
              description:
                "Make sure auth works correctly by testing it automatically, not just by hand.",
              is_checked: true,
              order_index: 3,
            },
            {
              id: "r4",
              title: "Add broader tests for the whole app",
              description:
                "Aim for 80%+ of your code covered, so bugs get caught before they reach users.",
              is_checked: false,
              order_index: 4,
            },
          ],
        },
        {
          week_number: 3,
          theme: "Containerization",
          estimated_time: "~3-4 days",
          items: [
            {
              id: "r5",
              title: "Package the app with Docker",
              description:
                "Write a Dockerfile so the app runs the same way on any machine or server.",
              is_checked: false,
              order_index: 5,
            },
          ],
        },
        {
          week_number: 4,
          theme: "CI/CD Automation",
          estimated_time: "~2-3 days",
          items: [
            {
              id: "r6",
              title: "Automate testing and deployment",
              description:
                "Set up GitHub Actions so tests run and code deploys automatically on every push.",
              is_checked: false,
              order_index: 6,
            },
          ],
        },
      ],
    });
    setLoading(false);

    // ---- REAL FETCH (uncomment when backend ready) ----
    // async function load() {
    //   try {
    //     const d = await apiFetch(`/roadmaps/${analysisId}/${projectId}`);
    //     setData(d);
    //   } catch (e: any) {
    //     setError(e.message);
    //   } finally {
    //     setLoading(false);
    //   }
    // }
    // load();
  }, [analysisId, projectId]);

  async function toggleItem(weekNumber: number, item: RoadmapItem) {
    if (!data) return;
    const updated = { ...item, is_checked: !item.is_checked };
    setData({
      ...data,
      weeks: data.weeks.map((w) =>
        w.week_number === weekNumber
          ? {
              ...w,
              items: w.items.map((i) => (i.id === item.id ? updated : i)),
            }
          : w,
      ),
    });
    try {
      await apiFetch(`/roadmap-items/${item.id}`, {
        method: "PATCH",
        body: JSON.stringify({ is_checked: updated.is_checked }),
      });
    } catch (e: any) {
      setData({
        ...data,
        weeks: data.weeks.map((w) =>
          w.week_number === weekNumber
            ? {
                ...w,
                items: w.items.map((i) => (i.id === item.id ? item : i)),
              }
            : w,
        ),
      });
      setError(e.message);
    }
  }

  function toggleWeekOpen(weekNumber: number) {
    setOpenWeeks((prev) => {
      const next = new Set(prev);
      if (next.has(weekNumber)) next.delete(weekNumber);
      else next.add(weekNumber);
      return next;
    });
  }

  const { currentWeek, totalDone, totalItems } = useMemo(() => {
    if (!data) return { currentWeek: null, totalDone: 0, totalItems: 0 };
    let done = 0;
    let total = 0;
    let current: RoadmapWeek | null = null;
    for (const w of data.weeks) {
      const weekDone = w.items.filter((i) => i.is_checked).length;
      done += weekDone;
      total += w.items.length;
      if (!current && weekDone < w.items.length) current = w;
    }
    return { currentWeek: current, totalDone: done, totalItems: total };
  }, [data]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl w-full py-16 text-center text-sm text-text-muted">
        Loading roadmap...
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl w-full py-16 text-center text-sm text-danger">
        {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-3xl w-full py-16 text-center text-sm text-text-muted">
        Roadmap not found.
      </div>
    );
  }

  const overallProgress =
    totalItems > 0 ? Math.round((totalDone / totalItems) * 100) : 0;
  const allDone = totalDone === totalItems;

  return (
    <div className="w-full flex flex-col gap-6">
      <Link
        href={`/roadmap/${analysisId}`}
        className="flex items-center gap-1.5 text-sm text-text-muted hover:text-primary transition-colors w-fit"
      >
        <ArrowLeft size={16} />
        Back to Projects
      </Link>

      <div>
        <span className="text-label-sm uppercase text-primary">
          Learning Roadmap
        </span>
        <h1 className="mt-1.5 text-headline-lg text-text">
          {data.project_title}
        </h1>
        <div className="mt-3 flex items-center gap-3 max-w-sm">
          <div className="h-1.5 flex-1 bg-border rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
          <span className="text-xs font-medium text-text-muted shrink-0">
            {totalDone}/{totalItems} done
          </span>
        </div>
      </div>

      {/* THIS WEEK — spotlight */}
      {currentWeek ? (
        <div className="bg-surface border-2 border-primary/30 rounded-xl shadow-card p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                <Sparkles size={15} className="text-white" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-primary">
                  This Week · Week {currentWeek.week_number} of{" "}
                  {data.weeks.length}
                </p>
                <p className="text-sm font-semibold text-text mt-0.5">
                  {currentWeek.theme}
                </p>
              </div>
            </div>
            <span className="flex items-center gap-1.5 text-xs font-medium text-text-muted bg-background border border-border px-2.5 py-1 rounded-full shrink-0">
              <Clock size={12} />
              {currentWeek.estimated_time}
            </span>
          </div>

          <div className="flex flex-col gap-2 pl-[2px]">
            {currentWeek.items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => toggleItem(currentWeek.week_number, item)}
                className="w-full flex items-start gap-3 text-left group px-3 py-2.5 rounded-lg hover:bg-background transition-colors"
              >
                <div
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full mt-0.5 transition-colors ${
                    item.is_checked
                      ? "bg-primary text-white"
                      : "border-2 border-border text-transparent group-hover:border-primary"
                  }`}
                >
                  <CheckCircle2 size={13} />
                </div>
                <div>
                  <p
                    className={`text-sm font-semibold ${
                      item.is_checked ? "text-primary" : "text-text"
                    }`}
                  >
                    {item.title}
                  </p>
                  {item.description && (
                    <p className="text-sm text-text-muted leading-relaxed mt-0.5">
                      {item.description}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        allDone && (
          <div className="bg-surface border-2 border-success/30 rounded-xl shadow-card p-6 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success">
              <CheckCircle2 size={16} className="text-white" />
            </div>
            <p className="text-sm font-semibold text-text">
              All caught up — every week of this roadmap is complete.
            </p>
          </div>
        )
      )}

      {/* FULL TIMELINE — all weeks, collapsible */}
      <div className="bg-surface border border-border rounded-xl shadow-card overflow-hidden">
        <div className="px-5 py-3.5 border-b border-border">
          <h2 className="text-base font-bold text-text">Full Timeline</h2>
        </div>
        <div className="divide-y divide-border">
          {data.weeks.map((w) => {
            const weekDone = w.items.filter((i) => i.is_checked).length;
            const isComplete = weekDone === w.items.length;
            const isCurrent = currentWeek?.week_number === w.week_number;
            const isOpen = openWeeks.has(w.week_number);

            return (
              <div key={w.week_number}>
                <button
                  type="button"
                  onClick={() => toggleWeekOpen(w.week_number)}
                  className="w-full flex items-center gap-3.5 px-5 py-4 text-left hover:bg-background transition-colors"
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                      isComplete
                        ? "bg-primary text-white"
                        : isCurrent
                          ? "border-2 border-primary text-primary"
                          : "border border-border text-text-muted"
                    }`}
                  >
                    {isComplete ? <CheckCircle2 size={14} /> : w.week_number}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text flex items-center gap-2 flex-wrap">
                      Week {w.week_number}: {w.theme}
                      {isCurrent && (
                        <span className="text-[10px] font-bold uppercase tracking-wide text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                          You are here
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-text-muted mt-0.5">
                      {weekDone}/{w.items.length} done · {w.estimated_time}
                    </p>
                  </div>
                  {isOpen ? (
                    <ChevronDown
                      size={16}
                      className="shrink-0 text-text-muted"
                    />
                  ) : (
                    <ChevronRight
                      size={16}
                      className="shrink-0 text-text-muted"
                    />
                  )}
                </button>

                {isOpen && (
                  <div className="pl-[52px] pr-5 pb-4 flex flex-col gap-1">
                    {w.items.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleItem(w.week_number, item)}
                        className="w-full flex items-start gap-2.5 text-left group px-2 py-2 rounded-lg hover:bg-background transition-colors"
                      >
                        <div
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full mt-0.5 transition-colors ${
                            item.is_checked
                              ? "bg-primary text-white"
                              : "border-2 border-border text-transparent group-hover:border-primary"
                          }`}
                        >
                          <CheckCircle2 size={11} />
                        </div>
                        <div>
                          <p
                            className={`text-sm font-medium ${
                              item.is_checked ? "text-primary" : "text-text"
                            }`}
                          >
                            {item.title}
                          </p>
                          {item.description && (
                            <p className="text-xs text-text-muted leading-relaxed mt-0.5">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
