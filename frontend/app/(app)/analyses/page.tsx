"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import {
  ArrowLeft,
  Search,
  CheckCircle2,
  Loader2,
  XCircle,
  FileSearch,
  Download,
  Trash2,
} from "lucide-react";

type AnalysisRow = {
  id: string;
  job_title: string;
  created_at: string; // ISO
  status: "completed" | "processing" | "failed";
  ats_score: number | null;
  roadmap_done: number;
  roadmap_total: number;
};

const FILTERS = ["All", "Completed", "Processing", "Failed"] as const;
type Filter = (typeof FILTERS)[number];

function StatusBadge({ status }: { status: AnalysisRow["status"] }) {
  const map = {
    completed: {
      icon: CheckCircle2,
      label: "Completed",
      cls: "text-success",
    },
    processing: {
      icon: Loader2,
      label: "Processing",
      cls: "text-text-muted",
    },
    failed: {
      icon: XCircle,
      label: "Failed",
      cls: "text-danger",
    },
  } as const;
  const { icon: Icon, label, cls } = map[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-sm font-medium ${cls}`}
    >
      <Icon
        size={14}
        className={status === "processing" ? "animate-spin" : ""}
      />
      {label}
    </span>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function AnalysesPage() {
  const [rows] = useState<AnalysisRow[]>([
    // ⚠️ TEMP MOCK — remove and uncomment real fetch below before backend testing
    {
      id: "a1",
      job_title: "Senior Backend Engineer",
      created_at: "2026-08-23T10:00:00Z",
      status: "completed",
      ats_score: 82,
      roadmap_done: 4,
      roadmap_total: 6,
    },
    {
      id: "a2",
      job_title: "Platform Engineer, Infra",
      created_at: "2026-08-19T10:00:00Z",
      status: "completed",
      ats_score: 76,
      roadmap_done: 2,
      roadmap_total: 5,
    },
    {
      id: "a3",
      job_title: "Full Stack Developer (Fintech)",
      created_at: "2026-08-14T10:00:00Z",
      status: "failed",
      ats_score: null,
      roadmap_done: 0,
      roadmap_total: 0,
    },
    {
      id: "a4",
      job_title: "Backend Engineer, Payments",
      created_at: "2026-08-08T10:00:00Z",
      status: "processing",
      ats_score: null,
      roadmap_done: 0,
      roadmap_total: 0,
    },
    {
      id: "a5",
      job_title: "Software Engineer II",
      created_at: "2026-07-30T10:00:00Z",
      status: "completed",
      ats_score: 68,
      roadmap_done: 6,
      roadmap_total: 6,
    },
  ]);

  // ---- REAL FETCH (uncomment when backend ready) ----
  // const [rows, setRows] = useState<AnalysisRow[]>([]);
  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState("");
  // useEffect(() => {
  //   async function load() {
  //     try {
  //       const data = await apiFetch(`/analyses`);
  //       setRows(data);
  //     } catch (e: any) {
  //       setError(e.message);
  //     } finally {
  //       setLoading(false);
  //     }
  //   }
  //   load();
  // }, []);

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  function handleDownload(e: React.MouseEvent, id: string) {
    e.preventDefault();
    e.stopPropagation();
    // ---- REAL FETCH (backend gap — no export endpoint yet) ----
    // window.open(`/api/reports/${id}/export`, "_blank");
    console.log("download report", id);
  }

  function handleDelete(e: React.MouseEvent, id: string) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Delete this analysis? This can't be undone.")) return;
    // ---- REAL FETCH (backend gap — no delete endpoint yet) ----
    // await apiFetch(`/analyses/${id}`, { method: "DELETE" });
    console.log("delete analysis", id);
  }

  const failedCount = rows.filter((r) => r.status === "failed").length;

  function handleDeleteAllFailed() {
    if (
      !confirm(
        `Delete all ${failedCount} failed analyses? This can't be undone.`,
      )
    )
      return;
    // ---- REAL FETCH (backend gap — no bulk-delete endpoint yet) ----
    // await apiFetch(`/analyses/failed`, { method: "DELETE" });
    console.log("delete all failed");
  }
  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const matchesFilter =
        filter === "All" || r.status === filter.toLowerCase();
      const matchesQuery = r.job_title
        .toLowerCase()
        .includes(query.toLowerCase());
      const rowDate = r.created_at.slice(0, 10); // "YYYY-MM-DD"
      const matchesFrom = !fromDate || rowDate >= fromDate;
      const matchesTo = !toDate || rowDate <= toDate;
      return matchesFilter && matchesQuery && matchesFrom && matchesTo;
    });
  }, [rows, query, filter, fromDate, toDate]);

  return (
    <div className="w-full flex flex-col gap-4">
      <Link
        href="/dashboard"
        className="flex items-center gap-1.5 mt-2 text-sm text-text-muted hover:text-primary transition-colors w-fit"
      >
        <ArrowLeft size={16} />
        Back to Dashboard
      </Link>

      <div className="mt-4">
        <span className="text-label-sm uppercase text-primary">
          Analysis History
        </span>
        <h1 className="mt-1.5 text-headline-lg text-text">Your Analyses</h1>
        <p className="mt-1.5 text-sm text-text-muted">
          {rows.length} total, {filtered.length} shown
        </p>
      </div>

      {/* Search + Filters (+ bulk action) */}
      <div className="flex flex-col ">
        {failedCount > 0 && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleDeleteAllFailed}
              className="shrink-0 inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-full border border-danger/30 bg-danger/10 text-danger hover:bg-danger/20 transition-colors whitespace-nowrap"
            >
              <Trash2 size={14} />
              Delete all failed ({failedCount})
            </button>
          </div>
        )}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 sm:max-w-lg">
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
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors whitespace-nowrap ${
                  filter === f
                    ? "bg-primary text-white"
                    : "text-text-muted hover:text-text hover:bg-surface border border-border"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Date range */}
      <div className="flex items-center gap-2 text-sm">
        <label className="text-text-muted">From</label>
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          className="border border-border rounded-lg px-2.5 py-1.5 bg-surface text-text focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <label className="text-text-muted">To</label>
        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          className="border border-border rounded-lg px-2.5 py-1.5 bg-surface text-text focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        {(fromDate || toDate) && (
          <button
            type="button"
            onClick={() => {
              setFromDate("");
              setToDate("");
            }}
            className="text-xs text-text-muted hover:text-primary transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-surface border border-border rounded-xl shadow-card overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 px-6 text-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10">
              <FileSearch size={19} className="text-primary" />
            </div>
            <p className="text-sm font-semibold text-text">
              {rows.length === 0
                ? "No analyses yet"
                : "No analyses match your search"}
            </p>
            <p className="text-sm text-text-muted max-w-xs">
              {rows.length === 0
                ? "Run your first analysis to see it show up here."
                : "Try a different job title or clear the filter."}
            </p>
            {rows.length === 0 && (
              <Link
                href="/analyze"
                className="mt-1 text-sm font-semibold text-primary hover:text-primary-hover transition-colors"
              >
                Run an analysis →
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* Header row — hidden on mobile */}
            <div className="hidden sm:grid grid-cols-[minmax(0,1.6fr)_100px_110px_90px_100px_56px] gap-3 px-5 py-3 border-b border-border text-label-sm uppercase text-text-muted">
              <span>Job Title</span>
              <span>Date</span>
              <span>Status</span>
              <span>ATS Score</span>
              <span>Roadmap</span>
              <span />
            </div>

            <div className="divide-y divide-border">
              {filtered.map((r) => (
                <Link
                  key={r.id}
                  href={`/report/${r.id}`}
                  className="grid grid-cols-1 sm:grid-cols-[minmax(0,1.6fr)_100px_110px_90px_100px_56px] gap-1.5 sm:gap-3 sm:items-center px-5 py-4 hover:bg-background transition-colors group"
                >
                  <span className="text-sm font-semibold text-text">
                    {r.job_title}
                  </span>
                  <span className="text-sm text-text-muted">
                    {formatDate(r.created_at)}
                  </span>
                  <StatusBadge status={r.status} />
                  <span className="text-sm font-semibold text-text">
                    {r.ats_score !== null ? `${r.ats_score}/100` : "—"}
                  </span>
                  <span className="text-sm text-text-muted">
                    {r.roadmap_total > 0
                      ? `${r.roadmap_done}/${r.roadmap_total} done`
                      : "—"}
                  </span>
                  <div className="flex items-center gap-2 justify-self-start">
                    <button
                      type="button"
                      title="Download report"
                      aria-label="Download report"
                      onClick={(e) => handleDownload(e, r.id)}
                      className="p-1.5 text-text-muted hover:text-primary rounded-md transition-colors"
                    >
                      <Download size={15} />
                    </button>
                    <button
                      type="button"
                      title="Delete analysis"
                      aria-label="Delete analysis"
                      onClick={(e) => handleDelete(e, r.id)}
                      className="p-1.5 text-text-muted hover:text-danger rounded-md transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
