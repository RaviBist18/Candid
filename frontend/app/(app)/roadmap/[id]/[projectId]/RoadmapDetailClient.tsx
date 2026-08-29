"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

type RoadmapItem = {
  id: string;
  project_title: string;
  title: string;
  description: string | null;
  is_checked: boolean;
  order_index: number;
};

type RoadmapDetail = {
  analysis_id: string;
  project_title: string;
  items: RoadmapItem[];
};

export default function RoadmapDetailClient({
  analysisId,
  initialData,
}: {
  analysisId: string;
  initialData: RoadmapDetail;
}) {
  const [data, setData] = useState<RoadmapDetail>(initialData);
  const [error, setError] = useState("");
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());

  const sortedItems = data.items;
  const highestCheckedPos = useMemo(() => {
    let pos = -1;
    sortedItems.forEach((item, i) => {
      if (item.is_checked) pos = i;
    });
    return pos;
  }, [sortedItems]);

  async function toggleItem(item: RoadmapItem, position: number) {
    if (pendingIds.has(item.id)) return;
    setError("");
    const wantChecked = !item.is_checked;

    if (wantChecked && position !== highestCheckedPos + 1) return;
    if (!wantChecked && position !== highestCheckedPos) return;

    setPendingIds((prev) => new Set(prev).add(item.id));

    const prevItems = data.items;
    const updatedItems = data.items.map((i) =>
      i.id === item.id ? { ...i, is_checked: wantChecked } : i,
    );
    setData({ ...data, items: updatedItems });

    try {
      await apiFetch(`/reports/roadmap-items/${item.id}`, {
        method: "PATCH",
        body: JSON.stringify({ is_checked: wantChecked }),
      });
    } catch (e: any) {
      setError(e.message);
    } finally {
      setPendingIds((prev) => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    }
  }

  if (sortedItems.length === 0) {
    return (
      <div className="mx-auto max-w-3xl w-full py-16 text-center text-sm text-text-muted">
        Roadmap not found.
      </div>
    );
  }

  const totalDone = sortedItems.filter((i) => i.is_checked).length;
  const totalItems = sortedItems.length;
  const overallProgress = Math.round((totalDone / totalItems) * 100);

  return (
    <div className="w-full flex flex-col gap-6">
      <Link
        href={`/roadmap/${analysisId}`}
        className="flex items-center gap-1.5 text-sm text-text-muted hover:text-primary transition-colors w-fit"
      >
        <ArrowLeft size={16} />
        Back to Projects
      </Link>

      {error && <p className="text-sm text-danger">{error}</p>}

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

      <div className="bg-surface border border-border rounded-xl shadow-card overflow-hidden">
        <div className="px-5 py-3.5 border-b border-border">
          <h2 className="text-base font-bold text-text">Steps</h2>
        </div>
        <div className="divide-y divide-border">
          {sortedItems.map((item, position) => {
            const isNextAllowed = position === highestCheckedPos + 1;
            const isUncheckAllowed = position === highestCheckedPos;
            const clickable =
              (item.is_checked ? isUncheckAllowed : isNextAllowed) &&
              !pendingIds.has(item.id);

            return (
              <button
                key={item.id}
                type="button"
                disabled={!clickable}
                onClick={() => toggleItem(item, position)}
                className={`w-full flex items-start gap-3 text-left px-5 py-4 transition-colors ${
                  clickable
                    ? "hover:bg-background cursor-pointer"
                    : "opacity-50 cursor-not-allowed"
                }`}
              >
                <div
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full mt-0.5 transition-colors ${
                    item.is_checked
                      ? "bg-primary text-white"
                      : "border-2 border-border text-transparent"
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
            );
          })}
        </div>
      </div>
    </div>
  );
}
