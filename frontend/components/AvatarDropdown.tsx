"use client";

import { useState, useRef, useEffect } from "react";
import { Settings, HelpCircle, LogOut, ChevronDown } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";

type Props = {
  name: string;
  email: string;
  avatarUrl?: string;
};

export default function AvatarDropdown({ name, email, avatarUrl }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout() {
    setOpen(false);
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-full hover:opacity-80 transition-opacity"
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={name}
            className="h-9 w-9 rounded-full object-cover"
          />
        ) : (
          <div className="h-9 w-9 rounded-full bg-primary text-white flex items-center justify-center text-sm font-semibold">
            {name.charAt(0).toUpperCase()}
          </div>
        )}
        <ChevronDown size={16} className="text-text-muted" />
      </button>

      {open && (
        <div className="absolute left-1/2 -translate-x-[10%] mt-2 w-[240px] bg-surface border border-border rounded-xl shadow-card z-50">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-sm font-semibold text-text">{name}</p>
            <p className="text-xs text-primary truncate">{email}</p>
          </div>

          <div className="py-1">
            <Link
              href="/settings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-text hover:bg-primary/5 transition-colors"
            >
              <Settings size={16} className="text-text-muted" />
              Settings
            </Link>
            <Link
              href="/help"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-text hover:bg-primary/5 transition-colors"
            >
              <HelpCircle size={16} className="text-text-muted" />
              Get help
            </Link>
          </div>

          <div className="border-t border-border py-1">
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
            >
              <LogOut size={16} />
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
