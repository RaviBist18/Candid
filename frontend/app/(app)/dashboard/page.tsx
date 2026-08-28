"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Target,
  Sparkles,
  Plus,
  ArrowRight,
  Clock,
  FileCheck2,
  BarChart3,
  Map,
  SearchCheck,
  FileText,
  MessageCircleQuestion,
} from "lucide-react";
import { createClient } from "@/lib/supabase-browser";
import { apiFetch } from "@/lib/api";

function timeAgo(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function DashboardPage() {
  const [userName, setUserName] = useState<string | null>(null);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [hasAnalyses, setHasAnalyses] = useState<boolean | null>(null);
  const [totalAnalyses, setTotalAnalyses] = useState<number | null>(null);
  const [totalAnalysesThisMonth, setTotalAnalysesThisMonth] = useState<
    number | null
  >(null);
  const [mostRecent, setMostRecent] = useState<{
    id: string;
    role: string | null;
    created_at: string;
    ats_score: number | null;
  } | null>(null);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      const name =
        data.user?.user_metadata?.full_name ??
        data.user?.user_metadata?.name ??
        data.user?.email ??
        "there";
      setUserName(name);
    });

    async function loadStats() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        // Auth listener below retriggers loadStats() once ready.
        return;
      }

      apiFetch("/dashboard/insight")
        .then((res) => {
          setAiInsight(res.insight);
          setHasAnalyses(res.has_analyses);
        })
        .catch(() => {
          setAiInsight("Insight unavailable right now.");
          setHasAnalyses(true);
        });

      apiFetch("/dashboard/stats")
        .then((res) => {
          setTotalAnalyses(res.total_analyses);
          setTotalAnalysesThisMonth(res.total_analyses_this_month);
          setMostRecent(res.most_recent);
        })
        .catch(() => {
          // leave existing values as-is on failure — don't show fake 0
        });
    }

    loadStats();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) loadStats();
    });

    return () => subscription.unsubscribe();
  }, []);

  const firstTimeGreetings = [
    `Welcome, ${userName ?? "there"}. Let's get started.`,
    `Great to have you, ${userName ?? "there"}. Let's map out your path forward.`,
    `Hello, ${userName ?? "there"}. Ready to see where you stand?`,
  ];

  const nightGreetings = [
    `Good to see you, ${userName}.`,
    `Working late tonight, ${userName}?`,
    `Welcome back, ${userName}, let's finish it well.`,
  ];

  const morningGreetings = [
    `Good morning, ${userName}.`,
    `Welcome back, ${userName}. Ready to start the day?`,
    `Hello, ${userName}. Let's see what's next.`,
  ];

  const afternoonGreetings = [
    `Good afternoon, ${userName}.`,
    `Welcome back, ${userName}. Hope your day is going well.`,
    `Hello, ${userName}. Let's continue where you left off.`,
  ];

  const eveningGreetings = [
    `Good evening, ${userName}.`,
    `Welcome back, ${userName}. Wrapping up for the day?`,
    `Hello, ${userName}. Good to see you this evening.`,
  ];

  const [greetingSeed] = useState(() => Math.random());

  function getGreeting() {
    if (hasAnalyses === false) {
      return firstTimeGreetings[
        Math.floor(greetingSeed * firstTimeGreetings.length)
      ];
    }
    if (!userName) return "Welcome back.";
    const hour = new Date().getHours();
    const pool =
      hour < 6
        ? nightGreetings
        : hour < 12
          ? morningGreetings
          : hour < 18
            ? afternoonGreetings
            : eveningGreetings;
    return pool[Math.floor(greetingSeed * pool.length)];
  }

  return (
    <>
      {/* HERO SECTION (Quick Action & Insights) */}
      <section className="relative rounded-xl">
        <div className="flex flex-col mt-1 gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text">
              {getGreeting()}
            </h1>
            <p className="mt-1 text-sm text-text-muted">
              Here is an overview of your career analysis and roadmap progress.
            </p>
          </div>
          <Link
            href="/analyze"
            className="flex shrink-0 items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-hover"
          >
            <Target size={16} />
            Initiate New Analysis
          </Link>
        </div>

        <div className="mt-6 border-t border-border pt-6">
          <div className="flex items-center gap-4 rounded-xl border border-border bg-background px-5 py-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary">
              <Sparkles size={18} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-primary">
                AI Analysis
              </p>
              <p className="mt-0.5 text-sm text-text">
                {aiInsight ?? "Loading insight..."}
              </p>
            </div>
          </div>
        </div>

        {/* COMPACT STATS ROW */}
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {/* Total Analyses Card */}
          <Link
            href="/analyses"
            className="border border-border p-4 rounded-xl flex flex-col gap-2.5 hover:bg-gray-50 transition-colors group"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <BarChart3 size={18} className="text-primary" />
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                Total Analyses
              </h3>
              <p className="mt-1.5 text-2xl font-bold text-text">
                {totalAnalyses ?? "—"}
              </p>
              <p className="text-sm text-text-muted">
                +{totalAnalysesThisMonth ?? 0} this month
              </p>
            </div>
          </Link>

          {/* Most Recent Analysis Card */}
          <Link
            href={mostRecent ? `/report/${mostRecent.id}` : "/analyze"}
            className="border border-border p-4 rounded-xl flex flex-col gap-2.5 hover:bg-gray-50 transition-colors group"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <Clock size={18} className="text-primary" />
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                Most Recent Analysis
              </h3>
              <p className="mt-1.5 font-bold text-lg text-text truncate">
                {mostRecent?.role ?? "No analyses yet"}
              </p>
              <p className="text-sm text-text-muted">
                {mostRecent
                  ? timeAgo(mostRecent.created_at)
                  : "Run your first one"}
              </p>
            </div>
          </Link>

          {/* Latest ATS Score Card */}
          <Link
            href={mostRecent ? `/report/${mostRecent.id}` : "/analyze"}
            className="border border-border p-4 rounded-xl flex flex-col gap-2.5 hover:bg-gray-50 transition-colors group"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <FileCheck2 size={18} className="text-primary" />
            </div>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                Latest ATS Score
              </h3>
              <p className="mt-1.5 font-bold text-lg text-text">
                {mostRecent?.ats_score != null
                  ? `${mostRecent.ats_score}/100`
                  : "—"}
              </p>
              <p className="text-sm text-text-muted truncate">
                {mostRecent?.role ?? "—"}
              </p>
            </div>
          </Link>
        </div>
      </section>

      {/* WHAT NOW SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-lg w-full items-start">
        {/* Dark Blue Action Block */}
        <div className="bg-primary rounded-xl flex flex-col justify-center items-center text-center gap-4 h-full min-h-[300px] p-8 shadow-card">
          <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-2">
            <Target size={32} className="text-white" />
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-white">
              Ready for your next move?
            </h2>
            <p className="text-sm text-white/80">
              Start a deep-dive analysis of your current skills against market
              demand.
            </p>
          </div>
          <Link
            href="/analyze"
            className="mt-6 bg-white text-primary px-5 py-3 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-transform hover:-translate-y-0.5 flex items-center gap-2"
          >
            <Plus size={16} />
            Start Mapping
          </Link>
        </div>

        {/* What Now list */}
        <section className="flex flex-col gap-3 w-full">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-text-muted mb-1">
            What now?
          </h3>
          <div className="flex flex-col gap-3">
            {[
              {
                title: "Continue Roadmap",
                desc: "View the critical learning path to secure Senior Engineering roles.",
                href: "/roadmap",
                icon: Map,
              },
              {
                title: "Skill Gap Analysis",
                desc: "Identify critical technical areas for your next role.",
                href: "/skill-gaps",
                icon: SearchCheck,
              },
              {
                title: "View Sample Report",
                desc: "See a full example analysis to understand the depth of insights.",
                href: "/sample-report",
                icon: FileText,
              },
              {
                title: "Ask a Question",
                desc: "Get instant AI guidance on your career path.",
                href: "/ask",
                icon: MessageCircleQuestion,
              },
            ].map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="border border-border bg-surface rounded-lg p-4 flex items-center gap-4 text-left hover:border-primary transition-colors shadow-card group"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <item.icon size={16} className="text-primary" />
                </div>
                <div className="flex flex-col gap-1 flex-1">
                  <span className="font-semibold text-text">{item.title}</span>
                  <span className="text-sm text-text-muted mt-0.5">
                    {item.desc}
                  </span>
                </div>
                <ArrowRight
                  size={18}
                  className="shrink-0 text-text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
                />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
