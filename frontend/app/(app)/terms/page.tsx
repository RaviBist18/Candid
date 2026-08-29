"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
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
        <h1 className="text-2xl font-bold text-text">Terms of Service</h1>
        <p className="text-sm text-text-muted mt-1">
          Last updated: August 2026
        </p>
      </div>

      <section className="bg-surface border border-border rounded-xl shadow-card p-6 flex flex-col gap-5 text-sm text-text leading-relaxed">
        <div>
          <h2 className="font-semibold text-text mb-1.5">1. Overview</h2>
          <p className="text-text-muted">
            Candid is a personal career-analysis tool that reviews information
            you provide — including GitHub activity, resume content, portfolio
            links, LinkedIn details, and target job descriptions — to generate
            skill-gap insights and a learning roadmap. By using Candid, you
            agree to these terms.
          </p>
        </div>

        <div>
          <h2 className="font-semibold text-text mb-1.5">2. Your Data</h2>
          <p className="text-text-muted">
            Data you submit is used only to generate your analysis and is tied
            to your account. You can update or remove connected sources at any
            time from Settings. Account deletion removes your stored analyses.
          </p>
        </div>

        <div>
          <h2 className="font-semibold text-text mb-1.5">
            3. AI-Generated Content
          </h2>
          <p className="text-text-muted">
            Reports, gap analyses, and roadmap suggestions are generated using
            an AI model and may contain errors or inaccuracies. Candid is a
            decision-support tool, not professional career or legal advice — use
            your own judgment.
          </p>
        </div>

        <div>
          <h2 className="font-semibold text-text mb-1.5">4. Acceptable Use</h2>
          <p className="text-text-muted">
            Don't use Candid to submit content you don't have rights to, attempt
            to disrupt the service, or misuse the analysis pipeline outside
            normal use.
          </p>
        </div>

        <div>
          <h2 className="font-semibold text-text mb-1.5">5. Changes</h2>
          <p className="text-text-muted">
            These terms may be updated as the product evolves. Continued use
            after changes means you accept the revised terms.
          </p>
        </div>
      </section>
    </main>
  );
}
