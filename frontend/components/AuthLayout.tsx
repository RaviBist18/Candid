"use client";

import { GitBranch, Target, Map } from "lucide-react";

function CandidLogo({ size = 28 }: { size?: number }) {
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

export default function AuthLayout({
  headline,
  subhead,
  children,
}: {
  headline: string;
  subhead: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen md:grid-cols-2">
      {/* Left — light brand panel */}
      <div className="flex flex-col bg-background p-10">
        <div className="flex items-center gap-2 text-lg font-bold text-primary">
          <CandidLogo size={26} />
          Candid
        </div>

        <div className="flex flex-1 items-center">
          <div className="max-w-sm">
            <h1 className="text-3xl font-bold leading-tight tracking-tight text-text md:text-4xl">
              Make the gap visible.
              <br />
              Then make a plan.
            </h1>
            <p className="mt-3 text-sm text-text-muted">
              A practical career intelligence workspace for the role you
              actually want.
            </p>

            <div className="mt-10 space-y-5 border-t border-border pt-8">
              {[
                {
                  icon: GitBranch,
                  title: "Connect your real evidence",
                  desc: "GitHub, resume, LinkedIn, portfolio — not a form to fill out.",
                },
                {
                  icon: Target,
                  title: "See the gap, not just a score",
                  desc: "Critical gaps ranked by what the role actually needs.",
                },
                {
                  icon: Map,
                  title: "Get a weekly plan",
                  desc: "Concrete projects to close the gap, tracked as you go.",
                },
              ].map((item) => (
                <div key={item.title} className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <item.icon size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text">
                      {item.title}
                    </p>
                    <p className="text-xs text-text-muted">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="text-xs text-text-muted">Candid · Private by design</p>
      </div>

      {/* Right — dark auth panel */}
      <div className="flex items-center justify-center bg-[#0B1220] p-10">
        <div className="w-full max-w-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-white/50">
            {subhead}
          </p>
          <h2 className="mt-1 text-2xl font-bold text-white">{headline}</h2>
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
