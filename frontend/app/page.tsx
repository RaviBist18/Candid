"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";

function CandidLogo({ size = 26 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="1" y="1" width="30" height="30" rx="8" />
      <path d="M9 21V15" />
      <path d="M23 21V9" />
      <path d="M12.5 12.5L19.5 17.5" />
      <path d="M19.5 12.5L17 14.3" />
    </svg>
  );
}
import {
  GitBranch,
  FileText,
  Target,
  Map,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Zap,
} from "lucide-react";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Top nav */}
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="flex items-center gap-2 text-lg font-bold tracking-tight text-primary">
            <CandidLogo size={26} />
            Candid
          </span>
          <nav className="hidden items-center gap-8 text-sm font-medium text-text-muted md:flex">
            <a href="#how-it-works" className="hover:text-text">
              How it works
            </a>
            <a href="#analysis" className="hover:text-text">
              What you get
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-text-muted hover:text-text"
            >
              Log in
            </Link>
            <Link
              href="/login"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-16 pb-20">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <motion.div initial="hidden" animate="show" variants={fadeUp}>
            <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              Built for the job you actually want
            </span>
            <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight text-text md:text-5xl">
              See how your experience matches the job you actually want.
            </h1>
            <p className="mt-4 text-base text-text-muted">
              Candid connects your GitHub, resume, and portfolio against a
              specific job description — then shows you exactly what's missing,
              and a weekly plan to close the gap.
            </p>
            <div className="mt-8 flex gap-3">
              <Link
                href="/login"
                className="flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
              >
                Analyze My Career <ArrowRight size={16} />
              </Link>
              <a
                href="#analysis"
                className="rounded-lg border border-border bg-surface px-5 py-3 text-sm font-semibold text-text transition-colors hover:border-primary"
              >
                See what you get
              </a>
            </div>
          </motion.div>

          {/* Floating stat preview card — improved v2 */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
            className="relative rounded-xl border border-border bg-surface p-6 shadow-card"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                  Analysis Report
                </p>
                <p className="mt-1 text-lg font-bold text-text">
                  Senior Backend Engineer
                </p>
              </div>

              <div className="relative h-16 w-16 shrink-0">
                <svg className="h-16 w-16 -rotate-90" viewBox="0 0 64 64">
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    fill="none"
                    stroke="#E5E7EB"
                    strokeWidth="6"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    fill="none"
                    stroke="#0B3B60"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 28}
                    strokeDashoffset={2 * Math.PI * 28 * (1 - 0.76)}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-primary">
                  76%
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {["Backend", "Cloud", "Testing"].map((tag, i) => (
                <span
                  key={tag}
                  className={
                    i === 0
                      ? "rounded-full bg-primary px-2.5 py-1 text-xs font-medium text-white"
                      : "rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
                  }
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 text-sm text-text">
                <CheckCircle2 size={16} className="text-success" />
                <span>2 strengths matched from GitHub</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-text">
                <AlertCircle size={16} className="text-danger" />
                <span>2 critical gaps found</span>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2 border-t border-border pt-4">
              <div className="rounded-lg bg-danger/10 px-2 py-2.5 text-center">
                <p className="text-lg font-bold text-danger">2</p>
                <p className="text-[11px] text-text-muted">Critical gaps</p>
              </div>
              <div className="rounded-lg bg-primary/10 px-2 py-2.5 text-center">
                <p className="text-lg font-bold text-primary">4</p>
                <p className="text-[11px] text-text-muted">Projects</p>
              </div>
              <div className="rounded-lg bg-success/10 px-2 py-2.5 text-center">
                <p className="text-lg font-bold text-success">3 wks</p>
                <p className="text-[11px] text-text-muted">To build proof</p>
              </div>
            </div>

            <div className="absolute -bottom-4 left-4 flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-2 text-xs font-medium text-text shadow-card">
              <Zap size={14} className="text-primary" />
              Next: ship a production API
            </div>
          </motion.div>
        </div>
      </section>

      {/* 4-step flow */}
      <section id="how-it-works" className="border-t border-border bg-surface">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <motion.p
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
            className="text-xs font-semibold uppercase tracking-wide text-primary"
          >
            A clearer preparation loop
          </motion.p>
          <motion.h2
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            variants={fadeUp}
            className="mt-2 text-2xl font-bold tracking-tight text-text"
          >
            From scattered evidence to a focused next step.
          </motion.h2>

          <div className="mt-10 grid gap-8 md:grid-cols-4">
            {[
              {
                n: "01",
                title: "Connect evidence",
                desc: "GitHub, resume, LinkedIn, and portfolio — the skills you want to be known for.",
              },
              {
                n: "02",
                title: "Add a target role",
                desc: "Paste the job description you're preparing to apply for.",
              },
              {
                n: "03",
                title: "See the gaps",
                desc: "What's supported by evidence, what's missing, and why it matters.",
              },
              {
                n: "04",
                title: "Follow the roadmap",
                desc: "A role-specific weekly plan that builds stronger proof over time.",
              },
            ].map((step, i) => (
              <motion.div
                key={step.n}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                variants={fadeUp}
                transition={{ delay: i * 0.08 }}
              >
                <div className="border-t-2 border-primary pt-3">
                  <span className="text-xs font-semibold text-primary">
                    {step.n}
                  </span>
                  <p className="mt-2 font-semibold text-text">{step.title}</p>
                  <p className="mt-1 text-sm text-text-muted">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 2x2 feature grid */}
      <section id="analysis" className="mx-auto max-w-6xl px-6 py-16">
        <motion.p
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeUp}
          className="text-xs font-semibold uppercase tracking-wide text-primary"
        >
          What you get
        </motion.p>
        <motion.h2
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeUp}
          className="mt-2 text-2xl font-bold tracking-tight text-text"
        >
          Specific enough to act on.
        </motion.h2>
        <motion.p
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeUp}
          className="mt-2 max-w-xl text-sm text-text-muted"
        >
          Built around real evidence, not generic advice. Every recommendation
          connects back to the role you selected.
        </motion.p>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {[
            {
              icon: GitBranch,
              title: "Multi-source connect",
              desc: "Bring your actual work — GitHub, resume, LinkedIn, and portfolio — into one analysis.",
            },
            {
              icon: Target,
              title: "Skill gap detection",
              desc: "Separate critical gaps from nice-to-have polish, ranked by what the role actually needs.",
            },
            {
              icon: FileText,
              title: "Project recommendations",
              desc: "Get build ideas that close the missing proof — not just a list of skills to learn.",
            },
            {
              icon: Map,
              title: "Roadmap + report chat",
              desc: "Ask why something was flagged, and track your weekly roadmap as you go.",
            },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              variants={fadeUp}
              transition={{ delay: i * 0.06 }}
              className="rounded-xl border border-border bg-surface p-5 shadow-card transition-transform hover:-translate-y-0.5"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <f.icon size={18} />
              </div>
              <p className="mt-3 font-semibold text-text">{f.title}</p>
              <p className="mt-1 text-sm text-text-muted">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Bottom CTA band — dark contrast */}
      <section className="bg-primary">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-6 py-14 text-center md:flex-row md:text-left">
          <div>
            <h3 className="text-2xl font-bold text-white">
              Your next application deserves a sharper plan.
            </h3>
            <p className="mt-1 text-sm text-white/80">
              Start with the evidence you have. The gaps become clearer from
              there.
            </p>
          </div>
          <Link
            href="/login"
            className="flex shrink-0 items-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-primary transition-transform hover:-translate-y-0.5"
          >
            Start an analysis <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 text-xs text-text-muted">
          <span>Candid</span>
          <span>Career clarity, grounded in your evidence.</span>
        </div>
      </footer>
    </div>
  );
}
