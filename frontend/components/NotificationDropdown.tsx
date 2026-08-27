"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, CheckCircle2, XCircle, Map } from "lucide-react";

type Notification = {
  id: string;
  type: "complete" | "failed" | "roadmap";
  title: string;
  time: string;
  unread: boolean;
};

const dummyNotifications: Notification[] = [
  {
    id: "1",
    type: "complete",
    title: "Analysis Complete: Senior Backend Engineer",
    time: "2 hours ago",
    unread: true,
  },
  {
    id: "2",
    type: "failed",
    title: "Analysis Failed: Retry your Frontend Developer analysis",
    time: "5 hours ago",
    unread: true,
  },
  {
    id: "3",
    type: "roadmap",
    title: "New Roadmap Item: Containerization deep-dive added",
    time: "1 day ago",
    unread: false,
  },
];

const iconMap = {
  complete: CheckCircle2,
  failed: XCircle,
  roadmap: Map,
};

export default function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(dummyNotifications);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => n.unread).length;

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  }

  function handleNotifClick(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n)),
    );
    setOpen(false);
    // TODO: route to target page per notif type once report/roadmap pages exist
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-label="Notifications"
        onClick={() => setOpen((o) => !o)}
        className="relative flex h-9 w-9 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-primary/5 hover:text-text"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
        )}
      </button>

      {open && (
        <div className="absolute left-1/2 -translate-x-[18%] mt-2 w-[360px] bg-surface border border-border rounded-xl shadow-card z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="font-semibold text-text">Notifications</span>
            <button
              type="button"
              onClick={markAllRead}
              className="text-sm text-primary hover:underline"
            >
              Mark all as read
            </button>
          </div>

          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-text-muted">
              <Bell size={24} />
              <span className="text-sm">No notifications yet</span>
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((n) => {
                const Icon = iconMap[n.type];
                return (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => handleNotifClick(n.id)}
                    className={`flex items-start gap-3 px-4 py-3 text-left border-b border-border last:border-b-0 transition-colors hover:bg-primary/5 ${
                      n.unread ? "bg-primary/5" : "bg-transparent"
                    }`}
                  >
                    {n.unread && (
                      <span className="mt-1.5 h-2 w-2 rounded-full bg-primary shrink-0" />
                    )}
                    <div
                      className={`flex flex-col gap-0.5 ${!n.unread ? "ml-5" : ""}`}
                    >
                      <span className="text-sm font-semibold text-text leading-snug">
                        {n.title}
                      </span>
                      <span className="text-xs text-text-muted">{n.time}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
