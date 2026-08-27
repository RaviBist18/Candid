"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";
import AuthLayout from "@/components/AuthLayout";
import { ArrowRight, Eye, EyeOff } from "lucide-react";

function GithubIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

function GoogleIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.07-1.48-.22-2.13H12v3.86h6.6c-.13 1.1-.85 2.76-2.45 3.87l-.02.15 3.56 2.76.25.02c2.26-2.09 3.58-5.17 3.58-8.53z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.07 7.93-2.9l-3.78-2.93c-1.01.7-2.37 1.19-4.15 1.19-3.17 0-5.86-2.09-6.82-4.98l-.14.01-3.7 2.86-.05.13C3.26 21.3 7.31 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.18 14.38A7.4 7.4 0 0 1 4.75 12c0-.83.15-1.63.42-2.38l-.01-.16-3.75-2.9-.12.06A12 12 0 0 0 0 12c0 1.93.47 3.76 1.29 5.38l3.89-3z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c2.26 0 3.78.97 4.65 1.79l3.39-3.3C17.94 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.89 3C6.14 6.84 8.83 4.75 12 4.75z"
      />
    </svg>
  );
}

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleGitHub() {
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  async function handleGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    router.push("/dashboard");
  }

  return (
    <AuthLayout headline="Log in to your workspace" subhead="Welcome back">
      <div className="space-y-3">
        <button
          onClick={handleGitHub}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-white px-4 py-3 text-sm font-semibold text-[#0B1220] transition-opacity hover:opacity-90"
        >
          <GithubIcon size={18} />
          Continue with GitHub
        </button>
        <button
          onClick={handleGoogle}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/15 bg-transparent px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/5"
        >
          <GoogleIcon size={18} />
          Continue with Google
        </button>
      </div>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-white/10" />
        <span className="text-xs text-white/40">or continue with email</span>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      <form onSubmit={handleEmailLogin} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-white">
            Email address
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="yourname@email.com"
            className="mt-1 w-full rounded-lg border border-white/15 bg-transparent px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-primary focus:outline-none"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-white">Password</label>
          <div className="relative mt-1">
            <div className="relative mt-1">
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full rounded-lg border border-white/15 bg-transparent px-3 py-2.5 pr-10 text-sm text-white placeholder:text-white/30 focus:border-primary focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-white px-4 py-3 text-sm font-semibold text-[#0B1220] transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Log in"} <ArrowRight size={16} />
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-white/60">
        New here?{" "}
        <Link
          href="/signup"
          className="font-semibold text-white hover:underline"
        >
          Create an account
        </Link>
      </p>
    </AuthLayout>
  );
}
