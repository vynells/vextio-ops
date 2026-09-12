"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/useAuth";
import OpsNav from "@/components/OpsNav";

type SupportMessage = {
  id: number;
  from_email: string;
  from_name: string | null;
  subject: string;
  body_text: string | null;
  status: string;
  created_at: string;
};

const STATUS_TABS = [
  { key: "all", label: "All" },
  { key: "open", label: "Open" },
  { key: "replied", label: "Replied" },
  { key: "closed", label: "Closed" },
];

const STATUS_DOT: Record<string, string> = {
  open: "bg-warn",
  replied: "bg-success",
  closed: "bg-muted",
};

export default function SupportPage() {
  const { token, ready } = useAuth();
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("open");

  const fetchMessages = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    const res = await fetch("/api/support", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      setMessages(await res.json());
    }
    setLoading(false);
  }, [token]);

  useEffect(() => {
    if (ready) fetchMessages();
  }, [ready, fetchMessages]);

  if (!ready) return null;

  const filtered = messages.filter(
    (m) => activeTab === "all" || m.status === activeTab
  );

  return (
    <div className="min-h-screen bg-bg">
      <OpsNav />
      <main className="mx-auto max-w-[1000px] px-6 py-8">
        <h1 className="mb-6 text-2xl font-semibold text-text">Support</h1>

        <div className="mb-6 flex flex-wrap gap-2">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-full px-3.5 py-1.5 text-[12px] font-medium transition-all ${
                activeTab === tab.key
                  ? "bg-accent text-white shadow-md shadow-accent/20"
                  : "bg-surface text-muted hover:bg-surface2 hover:text-text"
              }`}
            >
              {tab.label}
              {tab.key !== "all" && (
                <span className="ml-1.5 opacity-70">
                  {messages.filter((m) => m.status === tab.key).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col gap-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-[72px] animate-pulse rounded-xl border border-border bg-surface" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="py-12 text-center text-[14px] text-muted">No messages here.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map((message, i) => (
              <Link
                key={message.id}
                href={`/support/${message.id}`}
                style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
                className="flex animate-fadeIn flex-col gap-1 rounded-xl border border-border bg-surface p-4 transition-all hover:border-accent/30 hover:bg-surface2 active:scale-[0.995]"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate text-[13px] font-medium text-text">
                    {message.subject || "(no subject)"}
                  </p>
                  <span className={`flex flex-shrink-0 items-center gap-1.5 text-[11px] uppercase tracking-wide text-muted`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[message.status] || "bg-muted"}`} />
                    {message.status}
                  </span>
                </div>
                <p className="text-[12px] text-muted">
                  {message.from_name ? `${message.from_name} — ` : ""}
                  {message.from_email}
                </p>
                <p className="truncate text-[12px] text-muted/70">
                  {message.body_text?.slice(0, 120) || ""}
                </p>
                <p className="mt-1 text-[11px] text-muted/60">
                  {new Date(message.created_at).toLocaleString()}
                </p>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
