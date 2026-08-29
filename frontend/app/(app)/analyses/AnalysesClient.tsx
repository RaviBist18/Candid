"use client";

import { useState, useMemo, useEffect } from "react";
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
  Star,
} from "lucide-react";

type AnalysisRow = {
  id: string;
  job_title: string;
  created_at: string; // ISO
  status: "pending" | "completed" | "processing" | "failed";
  ats_score: number | null;
  roadmap_done: number;
  roadmap_total: number;
  is_sample: boolean;
};

const FILTERS = ["All", "Completed", "Processing", "Failed"] as const;
type Filter = (typeof FILTERS)[number];

function StatusBadge({ status }: { status: AnalysisRow["status"] }) {
  const map = {
    pending: {
      icon: Loader2,
      label: "Pending",
      cls: "text-text-muted",
    },
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

export default function AnalysesClient({
  initialRows,
}: {
  initialRows: AnalysisRow[];
}) {
  const [rows, setRows] = useState<AnalysisRow[]>(initialRows);

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 1000);
  }

  function handleDownload(e: React.MouseEvent, id: string) {
    e.preventDefault();
    e.stopPropagation();
    // Backend gap — no export endpoint yet, not built. Not clicking through.
    console.log("download report", id);
  }

  function requestDelete(e: React.MouseEvent, id: string) {
    e.preventDefault();
    e.stopPropagation();
    setDeleteTarget(id);
  }

  async function handleSetSample(e: React.MouseEvent, id: string) {
    e.preventDefault();
    e.stopPropagation();
    try {
      await apiFetch(`/analyses/${id}/sample`, { method: "PATCH" });
      setRows((prev) => prev.map((r) => ({ ...r, is_sample: r.id === id })));
      showToast("Marked as sample report.");
    } catch (e: any) {
      showToast(`Failed: ${e.message}`);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    const id = deleteTarget;
    setDeleteTarget(null);
    try {
      await apiFetch(`/analyses/${id}`, { method: "DELETE" });
      setRows((prev) => prev.filter((r) => r.id !== id));
      showToast("Analysis deleted.");
    } catch (e: any) {
      showToast(`Delete failed: ${e.message}`);
    }
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

  const PAGE_SIZE = 10;
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [query, filter, fromDate, toDate]);

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
          {`${rows.length} total, ${filtered.length} shown`}
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
            <div className="hidden sm:grid grid-cols-[minmax(0,1.6fr)_100px_110px_90px_100px_80px] gap-3 px-5 py-3 border-b border-border text-label-sm uppercase text-text-muted">
              <span>Job Title</span>
              <span>Date</span>
              <span>Status</span>
              <span>ATS Score</span>
              <span>Roadmap</span>
              <span />
            </div>

            <div className="divide-y divide-border">
              {paginated.map((r) => (
                <Link
                  key={r.id}
                  href={`/report/${r.id}`}
                  className="grid grid-cols-1 sm:grid-cols-[minmax(0,1.6fr)_100px_110px_90px_100px_80px] gap-1.5 sm:gap-3 sm:items-center px-5 py-4 hover:bg-background transition-colors group"
                >
                  <span className="text-sm font-semibold text-text flex items-center gap-1.5">
                    {r.job_title}
                    {r.is_sample && (
                      <Star
                        size={12}
                        className="text-primary fill-primary shrink-0"
                      />
                    )}
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
                      title={
                        r.is_sample
                          ? "Current sample report"
                          : "Mark as sample report"
                      }
                      aria-label="Mark as sample report"
                      onClick={(e) => handleSetSample(e, r.id)}
                      disabled={r.is_sample}
                      className={`p-1.5 rounded-md transition-colors ${
                        r.is_sample
                          ? "text-primary cursor-default"
                          : "text-text-muted hover:text-primary"
                      }`}
                    >
                      <Star
                        size={15}
                        className={r.is_sample ? "fill-primary" : ""}
                      />
                    </button>
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
                      onClick={(e) => requestDelete(e, r.id)}
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

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            type="button"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="text-sm px-3 py-1.5 rounded-lg border border-border disabled:opacity-40 hover:bg-background transition-colors"
          >
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPage(p)}
              className={`text-sm w-8 h-8 rounded-lg transition-colors ${
                p === page
                  ? "bg-primary text-white"
                  : "border border-border hover:bg-background"
              }`}
            >
              {p}
            </button>
          ))}
          <button
            type="button"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="text-sm px-3 py-1.5 rounded-lg border border-border disabled:opacity-40 hover:bg-background transition-colors"
          >
            Next
          </button>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-xl shadow-lg max-w-sm w-full p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-danger/10">
                <Trash2 size={18} className="text-danger" />
              </div>
              <div>
                <p className="font-semibold text-text">Delete this analysis?</p>
                <p className="text-sm text-text-muted mt-0.5">
                  This cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="flex-1 text-sm font-semibold px-4 py-2.5 rounded-lg border border-border hover:bg-background transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="flex-1 text-sm font-semibold px-4 py-2.5 rounded-lg bg-danger text-white hover:opacity-90 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none px-4">
          <div className="flex items-center gap-2.5 bg-primary text-white text-sm font-medium px-4 py-3 rounded-lg shadow-lg animate-in fade-in duration-200">
            <CheckCircle2 size={16} className="text-white shrink-0" />
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}
