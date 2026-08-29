"use client";

import Link from "next/link";
import { ArrowLeft, Mail, MessageCircleQuestion } from "lucide-react";

const faqs = [
  {
    q: "How does the analysis work?",
    a: "Candid reads your connected sources (GitHub, resume, LinkedIn, portfolio) alongside a target job description you paste in, then identifies skill gaps, missing projects, and ATS issues specific to that role.",
  },
  {
    q: "How long does an analysis take?",
    a: "Most analyses complete within a couple of minutes. If a run fails or times out, you'll see a notification and can retry from the Run Analysis page.",
  },
  {
    q: "Can I update my sources after signing up?",
    a: "Yes — head to Settings to reconnect GitHub, update your LinkedIn paste, or change your primary login.",
  },
  {
    q: "Is my data shared with anyone?",
    a: "No. Your sources and reports are private to your account.",
  },
];

export default function HelpPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-10 flex flex-col gap-6">
      <Link
        href="/settings"
        className="flex items-center gap-1.5 text-sm text-text-muted hover:text-primary transition-colors w-fit"
      >
        <ArrowLeft size={16} />
        Back
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-text">Get Help</h1>
        <p className="text-sm text-text-muted mt-1">
          Answers to common questions, or reach out directly.
        </p>
      </div>

      <section className="bg-surface border border-border rounded-xl shadow-card overflow-hidden">
        <div className="px-5 py-3 border-b border-border flex items-center gap-2">
          <MessageCircleQuestion size={16} className="text-text-muted" />
          <span className="text-xs font-semibold uppercase tracking-wide text-text-muted">
            Frequently Asked
          </span>
        </div>
        {faqs.map((item, i) => (
          <div
            key={item.q}
            className={`px-5 py-4 ${i !== faqs.length - 1 ? "border-b border-border" : ""}`}
          >
            <p className="text-sm font-semibold text-text">{item.q}</p>
            <p className="text-sm text-text-muted mt-1">{item.a}</p>
          </div>
        ))}
      </section>

      <section className="bg-surface border border-border rounded-xl shadow-card p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
            <Mail size={16} className="text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-text">Still need help?</p>
            <p className="text-xs text-text-muted">
              We usually respond within a day.
            </p>
          </div>
        </div>

        <a
          href="mailto:support@candid.app"
          className="text-sm font-semibold text-primary hover:underline"
        >
          Email support
        </a>
      </section>
    </main>
  );
}
