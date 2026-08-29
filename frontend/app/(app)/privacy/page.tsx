"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
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
        <h1 className="text-2xl font-bold text-text">Privacy Policy</h1>
        <p className="text-sm text-text-muted mt-1">
          Last updated: August 2026
        </p>
      </div>

      <section className="bg-surface border border-border rounded-xl shadow-card p-6 flex flex-col gap-5 text-sm text-text leading-relaxed">
        <div>
          <h2 className="font-semibold text-text mb-1.5">1. What We Collect</h2>
          <p className="text-text-muted">
            Candid collects the information you choose to connect or paste in —
            GitHub profile data via OAuth, resume content, LinkedIn profile
            text, portfolio URLs, and the job descriptions you submit for
            analysis. We also store your account email and display name from
            your sign-in provider (GitHub or Google).
          </p>
        </div>

        <div>
          <h2 className="font-semibold text-text mb-1.5">2. How We Use It</h2>
          <p className="text-text-muted">
            Your data is used solely to generate your career analysis, skill-gap
            reports, and roadmap — nothing else. Analysis runs are processed
            through our AI provider to produce your results; your data is not
            used to train external models.
          </p>
        </div>

        <div>
          <h2 className="font-semibold text-text mb-1.5">3. Data Storage</h2>
          <p className="text-text-muted">
            Data is stored securely and tied to your account. You can update or
            remove connected sources anytime from Settings. Requesting account
            deletion removes your stored analyses and profile data.
          </p>
        </div>

        <div>
          <h2 className="font-semibold text-text mb-1.5">4. Third Parties</h2>
          <p className="text-text-muted">
            We don't sell or share your personal data with advertisers or third
            parties. Data may pass through our AI provider and hosting
            infrastructure solely to operate the service.
          </p>
        </div>

        <div>
          <h2 className="font-semibold text-text mb-1.5">5. Your Rights</h2>
          <p className="text-text-muted">
            You can view, update, or delete your connected sources and account
            data at any time from Settings. Contact support if you need help
            with a data request.
          </p>
        </div>

        <div>
          <h2 className="font-semibold text-text mb-1.5">6. Changes</h2>
          <p className="text-text-muted">
            This policy may be updated as the product evolves. Continued use
            after changes means you accept the revised policy.
          </p>
        </div>
      </section>
    </main>
  );
}
