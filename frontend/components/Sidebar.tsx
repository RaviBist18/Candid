"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FolderKanban, Sparkles } from "lucide-react";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/sources", label: "Sources", icon: FolderKanban },
  { href: "/analyze", label: "Run Analysis", icon: Sparkles },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col border-r border-border bg-surface">
      <div className="px-6 py-6">
        <Link
          href="/dashboard"
          className="text-xl font-bold tracking-tight text-primary"
        >
          Candid
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {links.map((link) => {
          const active = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-primary/10 text-primary"
                  : "text-text-muted hover:bg-background hover:text-text"
              }`}
            >
              <Icon size={18} strokeWidth={active ? 2.5 : 2} />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
