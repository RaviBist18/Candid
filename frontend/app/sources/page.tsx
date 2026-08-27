"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { fetchGithubData } from "@/lib/github";

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
    return <main style={{ padding: "4rem" }}>Loading...</main>;
  }

  return (
    <main style={{ padding: "4rem", fontFamily: "system-ui", maxWidth: 640 }}>
      <h1>Connect Sources</h1>
      <p>These feed your gap analysis. Update anytime.</p>

      {error && (
        <p style={{ color: "crimson", marginTop: "1rem" }}>{error}</p>
      )}

      {/* GitHub */}
      <section style={{ marginTop: "2rem" }}>
        <h2>GitHub</h2>
        {githubSource ? (
          <p>
            Connected as <strong>{githubSource.raw_data.username}</strong> —{" "}
            {githubSource.raw_data.public_repos} public repos.
          </p>
        ) : (
          <p>Not connected yet.</p>
        )}
        <button onClick={connectGithub} disabled={saving === "github"}>
          {saving === "github" ? "Connecting..." : "Fetch from GitHub"}
        </button>
        {githubStatus && <span style={{ marginLeft: "0.5rem" }}>{githubStatus}</span>}
      </section>

      {/* Resume */}
      <section style={{ marginTop: "2rem" }}>
        <h2>Resume</h2>
        <p style={{ fontSize: "0.85rem", color: "#666" }}>
          Paste your resume text below. File upload (PDF/Word) coming next.
        </p>
        <textarea
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
          rows={6}
          style={{ width: "100%" }}
          placeholder="Paste resume text here..."
        />
        <br />
        <button
          onClick={() => saveSource("resume", { text: resumeText })}
          disabled={saving === "resume" || !resumeText.trim()}
        >
          {saving === "resume" ? "Saving..." : "Save Resume"}
        </button>
      </section>

      {/* LinkedIn */}
      <section style={{ marginTop: "2rem" }}>
        <h2>LinkedIn</h2>
        <p style={{ fontSize: "0.85rem", color: "#666" }}>
          Paste your LinkedIn profile text (copy from your profile page).
        </p>
        <textarea
          value={linkedinText}
          onChange={(e) => setLinkedinText(e.target.value)}
          rows={6}
          style={{ width: "100%" }}
          placeholder="Paste LinkedIn profile text here..."
        />
        <br />
        <button
          onClick={() => saveSource("linkedin", { text: linkedinText })}
          disabled={saving === "linkedin" || !linkedinText.trim()}
        >
          {saving === "linkedin" ? "Saving..." : "Save LinkedIn"}
        </button>
      </section>

      {/* Portfolio */}
      <section style={{ marginTop: "2rem" }}>
        <h2>Portfolio</h2>
        <input
          type="url"
          value={portfolioUrl}
          onChange={(e) => setPortfolioUrl(e.target.value)}
          placeholder="https://yourportfolio.com"
          style={{ width: "100%" }}
        />
        <br />
        <button
          onClick={() => saveSource("portfolio", { url: portfolioUrl })}
          disabled={saving === "portfolio" || !portfolioUrl.trim()}
          style={{ marginTop: "0.5rem" }}
        >
          {saving === "portfolio" ? "Saving..." : "Save Portfolio URL"}
        </button>
      </section>
    </main>
  );
}