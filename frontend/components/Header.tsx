"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import NotificationDropdown from "@/components/NotificationDropdown";
import AvatarDropdown from "@/components/AvatarDropdown";
import { createClient } from "@/lib/supabase-browser";

export function CandidLogo({ size = 26 }: { size?: number }) {
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

export default function Header() {
  const [user, setUser] = useState<{
    name: string;
    email: string;
    avatarUrl?: string;
  } | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      const meta = data.user.user_metadata || {};
      setUser({
        name:
          meta.user_name ||
          meta.full_name ||
          meta.name ||
          data.user.email ||
          "User",
        email: data.user.email || "",
        avatarUrl: meta.avatar_url,
      });
    });
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-lg font-bold tracking-tight text-primary"
        >
          <CandidLogo size={26} />
          Candid
        </Link>
        <div className="flex items-center gap-4">
          <NotificationDropdown />
          <div className="w-px h-6 bg-border" />
          <div className="flex items-center gap-1">
            {user && (
              <AvatarDropdown
                name={user.name}
                email={user.email}
                avatarUrl={user.avatarUrl}
              />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
