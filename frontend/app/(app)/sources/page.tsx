"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { fetchGithubData } from "@/lib/github";
import { Code2, FileText, Link2, Loader2, Check } from "lucide-react";

type Source = {
  id: string;
  source_type: string;
  raw_data: any;
  updated_at: string;
};

export default function SourcesPage() {
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [githubStatus, setGithubStatus] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [linkedinText, setLinkedinText] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function loadSources() {
    setLoading(true);
    try {
      const data = await apiFetch("/sources");
      setSources(data);
      const resume = data.find((s: Source) => s.source_type === "resume");
      if (resume) setResumeText(resume.raw_data.text || "");
      const linkedin = data.find((s: Source) => s.source_type === "linkedin");
      if (linkedin) setLinkedinText(linkedin.raw_data.text || "");
      const portfolio = data.find((s: Source) => s.source_type === "portfolio");
      if (portfolio) setPortfolioUrl(portfolio.raw_data.url || "");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSources();
  }, []);

  async function saveSource(source_type: string, raw_data: any) {
    setSaving(source_type);
    setError("");
    try {
      await apiFetch("/sources", {
        method: "PUT",
        body: JSON.stringify({ source_type, raw_data }),
      });
      await loadSources();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(null);
    }
  }

  async function connectGithub() {
    setGithubStatus("Fetching from GitHub...");
    setError("");
    try {
      const data = await fetchGithubData();
      await saveSource("github", data);
      setGithubStatus("Connected.");
    } catch (e: any) {
      setError(e.message);
      setGithubStatus("");
    }
  }

  const githubSource = sources.find((s) => s.source_type === "github");

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-sm text-text-muted">
        <Loader2 size={18} className="animate-spin mr-2" />
        Loading sources...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl w-full flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text">
          Connect Sources
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          These feed your gap analysis. Update anytime.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
          {error}
        </div>
      )}

      {/* GitHub */}
      <section className="bg-surface border border-border rounded-xl shadow-card p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <Code2 size={16} className="text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-text">GitHub</p>
            {githubSource ? (
              <p className="text-xs text-text-muted">
                Connected as{" "}
                <span className="font-medium text-text">
                  {githubSource.raw_data.username}
                </span>{" "}
                &middot; {githubSource.raw_data.public_repos} public repos
              </p>
            ) : (
              <p className="text-xs text-text-muted">Not connected yet.</p>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={connectGithub}
          disabled={saving === "github"}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:opacity-60"
        >
          {saving === "github" ? (
            <>
              <Loader2 size={14} className="animate-spin" /> Connecting...
            </>
          ) : githubSource ? (
            <>
              <Check size={14} /> Re-sync GitHub
            </>
          ) : (
            "Fetch from GitHub"
          )}
        </button>
        {githubStatus && (
          <span className="ml-3 text-xs text-text-muted">{githubStatus}</span>
        )}
      </section>

      {/* Resume */}
      <section className="bg-surface border border-border rounded-xl shadow-card p-5">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <FileText size={16} className="text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-text">Resume</p>
            <p className="text-xs text-text-muted">
              Paste your resume text below. File upload (PDF/Word) coming next.
            </p>
          </div>
        </div>
        <textarea
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
          rows={6}
          placeholder="Paste resume text here..."
          className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
        />
        <button
          type="button"
          onClick={() => saveSource("resume", { text: resumeText })}
          disabled={saving === "resume" || !resumeText.trim()}
          className="mt-3 flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {saving === "resume" ? (
            <>
              <Loader2 size={14} className="animate-spin" /> Saving...
            </>
          ) : (
            "Save Resume"
          )}
        </button>
      </section>

      {/* LinkedIn */}
      <section className="bg-surface border border-border rounded-xl shadow-card p-5">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <Link2 size={16} className="text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-text">LinkedIn</p>
            <p className="text-xs text-text-muted">
              Paste your LinkedIn profile text (copy from your profile page).
            </p>
          </div>
        </div>
        <textarea
          value={linkedinText}
          onChange={(e) => setLinkedinText(e.target.value)}
          rows={6}
          placeholder="Paste LinkedIn profile text here..."
          className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
        />
        <button
          type="button"
          onClick={() => saveSource("linkedin", { text: linkedinText })}
          disabled={saving === "linkedin" || !linkedinText.trim()}
          className="mt-3 flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {saving === "linkedin" ? (
            <>
              <Loader2 size={14} className="animate-spin" /> Saving...
            </>
          ) : (
            "Save LinkedIn"
          )}
        </button>
      </section>

      {/* Portfolio */}
      <section className="bg-surface border border-border rounded-xl shadow-card p-5">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <Link2 size={16} className="text-primary" />
          </div>
          <p className="text-sm font-semibold text-text">Portfolio URL</p>
        </div>
        <input
          type="url"
          value={portfolioUrl}
          onChange={(e) => setPortfolioUrl(e.target.value)}
          placeholder="https://yourportfolio.com"
          className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <button
          type="button"
          onClick={() => saveSource("portfolio", { url: portfolioUrl })}
          disabled={saving === "portfolio" || !portfolioUrl.trim()}
          className="mt-3 flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {saving === "portfolio" ? (
            <>
              <Loader2 size={14} className="animate-spin" /> Saving...
            </>
          ) : (
            "Save Portfolio URL"
          )}
        </button>
      </section>
    </div>
  );
}
