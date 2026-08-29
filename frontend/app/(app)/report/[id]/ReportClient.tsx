"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import {
  ArrowLeft,
  Briefcase,
  Clock,
  CheckCircle2,
  MessageCircle,
  X,
  RotateCcw,
  Send,
  Sparkles,
  Wrench,
  Copy,
  Check,
  User,
} from "lucide-react";

type RoadmapItem = {
  id: string;
  project_title: string; // ties item to a missing_project.title
  title: string;
  description: string | null;
  is_checked: boolean;
  order_index: number;
};

type Report = {
  id: string;
  analysis_id: string;
  missing_projects: {
    title: string;
    tagline: string;
    reasons: string[];
    estimated_time: string;
  }[];
  skill_gaps: { skill: string; why_it_matters: string[] }[];
  ats_issues: { issue: string; fix: string[] }[];
};

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const NAV_SECTIONS = [
  { id: "projects", label: "Missing Projects" },
  { id: "gaps", label: "Skill Gaps" },
  { id: "ats", label: "ATS Issues" },
  { id: "roadmap", label: "Roadmap" },
];

function MiniNav({ active }: { active: string }) {
  const scrollTo = (id: string) => {
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="sticky top-0 z-20 -mx-4 px-4 sm:mx-0 sm:px-0 bg-background/95 backdrop-blur-sm border-b border-border">
      <nav className="flex items-center gap-1 overflow-x-auto py-2.5 scrollbar-none">
        {NAV_SECTIONS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => scrollTo(s.id)}
            className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors whitespace-nowrap ${
              active === s.id
                ? "bg-primary text-white"
                : "text-text-muted hover:text-text hover:bg-surface"
            }`}
          >
            {s.label}
          </button>
        ))}
      </nav>
    </div>
  );
}

function ReportChatWidget({
  messages,
  input,
  setInput,
  sending,
  onSend,
  onReset,
}: {
  messages: ChatMessage[];
  input: string;
  setInput: (v: string) => void;
  sending: boolean;
  onSend: (text?: string) => void;
  onReset: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const suggested = [
    "Why is this project suggested first?",
    "Explain one of my skill gaps",
    "How urgent is this ATS issue?",
  ];

  const copyMessage = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const copyAll = () => {
    const text = messages
      .map(
        (m) =>
          `${m.role === "user" ? "You" : "Report Assistant"}: ${m.content}`,
      )
      .join("\n\n");
    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 1500);
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open report assistant"
        className="fixed bottom-20 right-6 z-30 flex h-[52px] w-[52px] items-center justify-center rounded-full bg-primary text-white shadow-lg hover:bg-primary-hover transition-all hover:scale-105"
      >
        <MessageCircle size={22} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-20 right-6 z-30 w-[380px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[calc(100vh-8rem)] bg-surface border border-border rounded-xl shadow-lg flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
            <Sparkles size={15} className="text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-text leading-none">
              Report Assistant
            </p>
            <p className="text-[11px] text-text-muted mt-1 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Grounded to this report
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Copy all"
            title={copiedAll ? "Copied!" : "Copy all"}
            onClick={copyAll}
            className="p-1.5 text-text-muted hover:text-text rounded-md transition-colors"
          >
            {copiedAll ? <Check size={15} /> : <Copy size={15} />}
          </button>
          <button
            type="button"
            aria-label="Clear chat"
            title="Clear chat"
            onClick={onReset}
            className="p-1.5 text-text-muted hover:text-text rounded-md transition-colors"
          >
            <RotateCcw size={15} />
          </button>
          <button
            type="button"
            aria-label="Close"
            onClick={() => setOpen(false)}
            className="p-1.5 text-text-muted hover:text-text rounded-md transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
        <div className="flex items-start gap-2.5">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary mt-0.5">
            <Sparkles size={11} className="text-white" />
          </div>
          <div className="flex flex-col gap-1 items-start">
            <div className="bg-background border border-border rounded-lg rounded-bl-sm px-3.5 py-2.5 text-sm text-text max-w-[85%]">
              I&apos;m grounded to this specific report. Ask me why
              something&apos;s flagged, or how to prioritize what&apos;s next.
            </div>
          </div>
        </div>

        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex gap-2.5 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}
          >
            <div
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full mt-0.5 ${
                m.role === "assistant"
                  ? "bg-primary"
                  : "bg-background border border-border"
              }`}
            >
              {m.role === "assistant" ? (
                <Sparkles size={11} className="text-white" />
              ) : (
                <User size={11} className="text-text-muted" />
              )}
            </div>
            <div
              className={`flex flex-col gap-1 max-w-[78%] ${m.role === "user" ? "items-end" : "items-start"}`}
            >
              <div
                className={`rounded-lg px-3.5 py-2.5 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-primary text-white rounded-br-sm"
                    : "bg-background border border-border text-text rounded-bl-sm"
                }`}
              >
                {m.content}
              </div>
              <button
                type="button"
                onClick={() => copyMessage(m.id, m.content)}
                className="flex items-center gap-1 text-[11px] text-text-muted hover:text-primary transition-colors px-1"
              >
                {copiedId === m.id ? (
                  <>
                    <Check size={11} /> Copied
                  </>
                ) : (
                  <>
                    <Copy size={11} /> Copy
                  </>
                )}
              </button>
            </div>
          </div>
        ))}

        {messages.length === 0 && (
          <div className="flex flex-col gap-1.5 pl-[34px]">
            {suggested.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => onSend(q)}
                className="text-left text-xs text-text bg-background border border-border rounded-lg px-3 py-2 hover:border-primary hover:text-primary transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {sending && (
          <div className="flex items-center gap-2.5">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary">
              <Sparkles size={11} className="text-white" />
            </div>
            <div className="flex items-center gap-1.5 px-3.5 py-3 rounded-lg bg-background border border-border">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="h-1.5 w-1.5 rounded-full bg-text-muted animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-border p-3 shrink-0">
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSend()}
            placeholder="Ask about this report..."
            disabled={sending}
            className="flex-1 text-sm border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-60"
          />
          <button
            type="button"
            onClick={() => onSend()}
            disabled={sending || !input.trim()}
            aria-label="Send"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary-hover transition-colors"
          >
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ---- Per-project roadmap card ----
function ProjectRoadmap({
  projectTitle,
  items,
  onToggle,
  pendingIds,
}: {
  projectTitle: string;
  items: RoadmapItem[];
  onToggle: (item: RoadmapItem) => void;
  pendingIds: Set<string>;
}) {
  const total = items.length;
  const done = items.filter((i) => i.is_checked).length;
  const progress = total > 0 ? Math.round((done / total) * 100) : 0;

  const sorted = [...items].sort((a, b) => a.order_index - b.order_index);

  let highestCheckedPos = -1;
  sorted.forEach((item, i) => {
    if (item.is_checked) highestCheckedPos = i;
  });

  return (
    <div className="bg-surface border border-border rounded-xl shadow-card overflow-hidden">
      <div className="px-5 py-3.5 border-b border-border flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <Briefcase size={13} className="text-primary" />
          </div>
          <p className="text-sm font-bold text-text truncate">{projectTitle}</p>
        </div>
        {total > 0 && (
          <span className="shrink-0 text-xs font-medium text-text-muted">
            {done}/{total} done
          </span>
        )}
      </div>

      {total > 0 && (
        <div className="h-1 w-full bg-border overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {total === 0 ? (
        <p className="px-5 py-4 text-sm text-text-muted">No roadmap items.</p>
      ) : (
        <div className="px-5 pt-5 pb-1">
          {sorted.map((item, i, arr) => {
            const isNextAllowed = i === highestCheckedPos + 1;
            const isUncheckAllowed = i === highestCheckedPos;
            const clickable =
              (item.is_checked ? isUncheckAllowed : isNextAllowed) &&
              !pendingIds.has(item.id);

            return (
              <button
                key={item.id}
                type="button"
                disabled={!clickable}
                onClick={() => clickable && onToggle(item)}
                className={`w-full flex items-start gap-3.5 text-left group ${
                  clickable ? "" : "opacity-50 cursor-not-allowed"
                }`}
              >
                <div className="flex flex-col items-center shrink-0">
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                      item.is_checked
                        ? "bg-primary text-white"
                        : clickable
                          ? "border-2 border-border text-text-muted group-hover:border-primary group-hover:text-primary"
                          : "border-2 border-border text-text-muted"
                    }`}
                  >
                    {item.is_checked ? <CheckCircle2 size={14} /> : i + 1}
                  </div>
                  {i < arr.length - 1 && (
                    <div
                      className={`w-px flex-1 my-1 min-h-[1.75rem] transition-colors ${
                        item.is_checked ? "bg-primary" : "bg-border"
                      }`}
                    />
                  )}
                </div>
                <div className="pb-6">
                  <p
                    className={`text-sm font-semibold ${
                      item.is_checked ? "text-primary" : "text-text"
                    }`}
                  >
                    {item.title}
                  </p>
                  {item.description && (
                    <p className="text-sm text-text-muted leading-relaxed mt-1">
                      {item.description}
                    </p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function ReportClient({
  initialReport,
  initialRoadmap,
  initialChatMessages,
}: {
  initialReport: Report;
  initialRoadmap: RoadmapItem[];
  initialChatMessages: ChatMessage[];
}) {
  const [report] = useState<Report>(initialReport);
  const [roadmap, setRoadmap] = useState<RoadmapItem[]>(initialRoadmap);
  const [chatMessages, setChatMessages] =
    useState<ChatMessage[]>(initialChatMessages);
  const [chatInput, setChatInput] = useState("");
  const [chatSending, setChatSending] = useState(false);
  const [error, setError] = useState("");
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const [active, setActive] = useState("projects");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-30% 0px -60% 0px" },
    );
    NAV_SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  async function toggleItem(item: RoadmapItem) {
    if (pendingIds.has(item.id)) return;
    setError("");
    setPendingIds((prev) => new Set(prev).add(item.id));

    const updated = { ...item, is_checked: !item.is_checked };
    setRoadmap((prev) => prev.map((r) => (r.id === item.id ? updated : r)));
    try {
      await apiFetch(`/reports/roadmap-items/${item.id}`, {
        method: "PATCH",
        body: JSON.stringify({ is_checked: updated.is_checked }),
      });
    } catch (e: any) {
      setRoadmap((prev) => prev.map((r) => (r.id === item.id ? item : r)));
      setError(e.message);
    } finally {
      setPendingIds((prev) => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    }
  }

  async function sendChatMessage(overrideText?: string) {
    const content = (overrideText ?? chatInput).trim();
    if (!report || !content) return;
    setChatInput("");
    setChatSending(true);
    const userMsg = {
      id: `temp-${Date.now()}`,
      role: "user" as const,
      content,
    };
    setChatMessages((prev) => [...prev, userMsg]);

    try {
      await apiFetch(`/reports/${report.id}/chat`, {
        method: "POST",
        body: JSON.stringify({ content }),
      });
      const messages = await apiFetch(`/reports/${report.id}/chat`);
      setChatMessages(messages);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setChatSending(false);
    }
  }

  function handleResetChat() {
    setChatMessages([]);
    setChatInput("");
  }

  // roadmap totals now aggregated across ALL projects, for the section header
  const totalItems = roadmap.length;
  const doneItems = roadmap.filter((r) => r.is_checked).length;

  return (
    <div className="w-full flex flex-col gap-6">
      <Link
        href="/dashboard"
        className="flex items-center gap-1.5 text-sm text-text-muted hover:text-primary transition-colors w-fit"
      >
        <ArrowLeft size={16} />
        Back
      </Link>

      {error && <p className="text-sm text-danger">{error}</p>}

      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-primary">
          Analysis Report
        </span>
        <h1 className="mt-1.5 text-2xl font-bold text-text">Gap Report</h1>
        <div className="flex flex-wrap gap-2 mt-3">
          <span className="text-xs font-medium bg-background border border-border text-text px-2.5 py-1 rounded-full">
            Missing Projects: {report.missing_projects.length}
          </span>
          <span className="text-xs font-medium bg-background border border-border text-text px-2.5 py-1 rounded-full">
            Skill Gaps: {report.skill_gaps.length}
          </span>
          <span className="text-xs font-medium bg-background border border-border text-text px-2.5 py-1 rounded-full">
            ATS Issues: {report.ats_issues.length}
          </span>
        </div>
      </div>

      <MiniNav active={active} />

      {/* MISSING PROJECTS */}
      <section id="projects" className="scroll-mt-16 flex flex-col gap-3">
        <h2 className="text-base font-bold text-text">Missing Projects</h2>
        {report.missing_projects.map((p, i) => (
          <div
            key={i}
            className="bg-surface border border-border rounded-xl shadow-card p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Briefcase size={17} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-text leading-snug">
                    {p.title}
                  </p>
                  <p className="text-xs font-medium text-text-muted mt-1.5">
                    {p.tagline}
                  </p>
                </div>
              </div>
              <span className="shrink-0 flex items-center gap-1 text-xs font-medium text-text-muted bg-background border border-border px-2.5 py-1 rounded-full">
                <Clock size={12} />
                {p.estimated_time}
              </span>
            </div>
            <ul className="flex flex-col gap-2 mt-4 pl-[52px]">
              {p.reasons.map((r, ri) => (
                <li
                  key={ri}
                  className="text-sm text-text-muted leading-relaxed flex items-start gap-2"
                >
                  <span className="mt-2 h-1 w-1 rounded-full bg-primary shrink-0" />
                  {r}
                </li>
              ))}
            </ul>
          </div>
        ))}
        {report.missing_projects.length === 0 && (
          <p className="text-sm text-text-muted">
            No missing projects flagged.
          </p>
        )}
      </section>

      {/* SKILL GAPS */}
      <section
        id="gaps"
        className="scroll-mt-16 bg-surface border border-border rounded-xl shadow-card p-5"
      >
        <h2 className="text-base font-bold text-text mb-4">Skill Gaps</h2>
        <div className="flex flex-col gap-3">
          {report.skill_gaps.map((s, i) => (
            <div key={i} className="border border-border rounded-lg px-4 py-4">
              <span className="text-xs font-semibold bg-primary/10 text-primary px-2.5 py-1 rounded-full">
                {s.skill}
              </span>
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
            </div>
          ))}
          {report.skill_gaps.length === 0 && (
            <p className="text-sm text-text-muted">No skill gaps flagged.</p>
          )}
        </div>
      </section>

      {/* ATS ISSUES */}
      <section
        id="ats"
        className="scroll-mt-16 bg-surface border border-border rounded-xl shadow-card overflow-hidden"
      >
        <div className="px-5 py-3.5 border-b border-border">
          <h2 className="text-base font-bold text-text">ATS Issues</h2>
        </div>
        <div className="divide-y divide-border">
          {report.ats_issues.map((a, i) => (
            <div key={i} className="px-5 py-4 flex flex-col gap-2.5">
              <p className="text-sm text-text font-semibold">{a.issue}</p>
              <ul className="flex flex-col gap-2">
                {a.fix.map((f, fi) => (
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
          {report.ats_issues.length === 0 && (
            <p className="px-5 py-4 text-sm text-text-muted">
              No ATS issues flagged.
            </p>
          )}
        </div>
      </section>

      {/* ROADMAP — one card per missing project */}
      <section id="roadmap" className="scroll-mt-16 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-text">Your Roadmap</h2>
          {totalItems > 0 && (
            <span className="text-xs font-medium text-text-muted">
              {doneItems}/{totalItems} done overall
            </span>
          )}
        </div>

        {report.missing_projects.length === 0 ? (
          <p className="text-sm text-text-muted">No roadmap items.</p>
        ) : (
          report.missing_projects.map((p) => (
            <ProjectRoadmap
              key={p.title}
              projectTitle={p.title}
              items={roadmap.filter((r) => r.project_title === p.title)}
              onToggle={toggleItem}
              pendingIds={pendingIds}
            />
          ))
        )}
      </section>

      <ReportChatWidget
        messages={chatMessages}
        input={chatInput}
        setInput={setChatInput}
        sending={chatSending}
        onSend={sendChatMessage}
        onReset={handleResetChat}
      />
    </div>
  );
}
