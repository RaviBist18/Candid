"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import {
  ArrowLeft,
  Code2,
  Link2,
  Mail,
  FileText,
  ChevronRight,
  Check,
  Trash2,
  Sun,
  Moon,
  Upload,
  X,
} from "lucide-react";
import Link from "next/link";
import DeleteAccountModal from "@/components/DeleteAccountModal";
import { createClient } from "@/lib/supabase-browser";

export default function SettingsPage() {
  const [displayName, setDisplayName] = useState("Ravi@58");
  const [primaryProvider] = useState<"github" | "google">("github");
  const [linkedinText, setLinkedinText] = useState("");
  const [linkedinFile, setLinkedinFile] = useState<File | null>(null);
  const [linkedinDragActive, setLinkedinDragActive] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) setUserEmail(data.user.email);
    });
  }, []);

  useEffect(() => setMounted(true), []);

  return (
    <div className="w-full flex flex-col gap-6">
      <Link
        href="/dashboard"
        className="flex items-center gap-1.5 text-sm text-text-muted hover:text-primary transition-colors w-fit"
      >
        <ArrowLeft size={16} />
        Back
      </Link>
      <div>
        <h1 className="text-2xl font-bold text-text">Settings</h1>
        <p className="text-sm text-text-muted mt-1">
          Signed in as <span className="text-text">{userEmail}</span>
        </p>
      </div>

      {/* GENERAL */}
      <section className="bg-surface border border-border rounded-xl shadow-card overflow-hidden">
        <div className="px-5 py-3 border-b border-border">
          <span className="text-xs font-semibold uppercase tracking-wide text-text-muted">
            General
          </span>
        </div>

        <div className="px-5 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center font-semibold">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium text-text">Display name</p>
              <p className="text-xs text-text-muted">Shown in your profile</p>
            </div>
          </div>
        </div>
        <div className="px-5 pb-4 flex gap-2">
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="flex-1 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button
            type="button"
            className="bg-primary text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Save
          </button>
        </div>

        <div className="px-5 py-4 border-t border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sun size={16} className="text-text-muted" />
            <span className="text-sm text-text">Appearance</span>
          </div>
          {mounted && (
            <div className="flex bg-background border border-border rounded-full p-1 gap-1">
              {[
                { value: "light", label: "Light", icon: Sun },
                { value: "dark", label: "Dark", icon: Moon },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setTheme(opt.value)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    theme === opt.value
                      ? "bg-surface text-text shadow-card"
                      : "text-text-muted hover:text-text"
                  }`}
                >
                  <opt.icon size={13} />
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ACCOUNT */}
      <section className="bg-surface border border-border rounded-xl shadow-card overflow-hidden">
        <div className="px-5 py-3 border-b border-border">
          <span className="text-xs font-semibold uppercase tracking-wide text-text-muted">
            Account
          </span>
        </div>

        <div className="px-5 py-4 flex items-center justify-between border-b border-border">
          <div className="flex items-center gap-3">
            <Code2 size={18} className="text-text" />
            <div>
              <p className="text-sm font-medium text-text">GitHub</p>
              <p className="text-xs text-text-muted">ravibist178</p>
            </div>
          </div>
          {primaryProvider === "github" ? (
            <span className="flex items-center gap-1 text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium">
              <Check size={12} /> Primary
            </span>
          ) : (
            <button className="text-xs text-primary hover:underline font-medium">
              Connect
            </button>
          )}
        </div>

        <div className="px-5 py-4 flex items-center justify-between border-b border-border">
          <div className="flex items-center gap-3">
            <Mail size={18} className="text-text" />
            <div>
              <p className="text-sm font-medium text-text">Google</p>
              <p className="text-xs text-text-muted">ravibist178@gmail.com</p>
            </div>
          </div>
          {primaryProvider === "google" ? (
            <span className="flex items-center gap-1 text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-medium">
              <Check size={12} /> Primary
            </span>
          ) : (
            <button className="text-xs text-primary hover:underline font-medium">
              Connect
            </button>
          )}
        </div>

        <div className="px-5 py-4">
          <div className="flex items-center gap-3 mb-2">
            <Link2 size={18} className="text-text" />
            <p className="text-sm font-medium text-text">LinkedIn</p>
          </div>
          <p className="text-xs text-text-muted mb-2">
            Upload your LinkedIn PDF export, or paste your profile text below.
          </p>
          {linkedinFile ? (
            <div className="flex items-center justify-between gap-2 border border-border rounded-lg px-3 py-3 text-sm text-text mb-2">
              <span className="flex items-center gap-2 truncate">
                <Upload size={16} className="text-primary shrink-0" />
                {linkedinFile.name}
              </span>
              <button
                type="button"
                onClick={() => setLinkedinFile(null)}
                className="shrink-0 text-text-muted hover:text-danger transition-colors"
                aria-label="Remove file"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <label
              onDragOver={(e) => {
                e.preventDefault();
                setLinkedinDragActive(true);
              }}
              onDragLeave={() => setLinkedinDragActive(false)}
              onDrop={(e) => {
                e.preventDefault();
                setLinkedinDragActive(false);
                const file = e.dataTransfer.files?.[0];
                if (file && file.type === "application/pdf") {
                  setLinkedinFile(file);
                }
              }}
              className={`flex items-center justify-center gap-2 border border-dashed rounded-lg px-3 py-3 text-sm transition-colors cursor-pointer mb-2 ${
                linkedinDragActive
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border text-text-muted hover:border-primary hover:text-primary"
              }`}
            >
              <Upload size={16} />
              Upload PDF export, or drag & drop
              <input
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => setLinkedinFile(e.target.files?.[0] ?? null)}
              />
            </label>
          )}
          <textarea
            value={linkedinText}
            onChange={(e) => setLinkedinText(e.target.value)}
            placeholder="Or paste your LinkedIn profile text here..."
            rows={4}
            className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
          />
          <button className="mt-2 bg-primary text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors">
            Save
          </button>
        </div>
      </section>

      {/* LEGAL & RESOURCES */}
      <section className="bg-surface border border-border rounded-xl shadow-card overflow-hidden">
        <div className="px-5 py-3 border-b border-border">
          <span className="text-xs font-semibold uppercase tracking-wide text-text-muted">
            Legal & Resources
          </span>
        </div>
        {[
          { icon: FileText, label: "Privacy Policy", href: "/privacy" },
          { icon: FileText, label: "Terms of Service", href: "/terms" },
        ].map((item, i, arr) => (
          <Link
            key={item.label}
            href={item.href}
            className={`w-full flex items-center justify-between px-5 py-3.5 text-sm text-text hover:bg-primary/5 transition-colors ${
              i !== arr.length - 1 ? "border-b border-border" : ""
            }`}
          >
            <span className="flex items-center gap-3">
              <item.icon size={16} className="text-text-muted" />
              {item.label}
            </span>
            <ChevronRight size={16} className="text-text-muted" />
          </Link>
        ))}
      </section>

      {/* DANGER ZONE */}
      <section className="bg-surface border border-red-200 rounded-xl shadow-card overflow-hidden">
        <div className="px-5 py-3 border-b border-red-100">
          <span className="text-xs font-semibold uppercase tracking-wide text-red-600">
            Danger Zone
          </span>
        </div>
        <button
          type="button"
          onClick={() => setShowDeleteModal(true)}
          className="w-full px-5 py-4 flex items-center justify-between hover:bg-red-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Trash2 size={16} className="text-red-500" />
            <span className="text-sm text-red-600">Delete Account</span>
          </div>
          <ChevronRight size={16} className="text-red-400" />
        </button>
      </section>

      {showDeleteModal && userEmail && (
        <DeleteAccountModal
          userEmail={userEmail}
          onClose={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  );
}
