"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/useAuth";
import OpsNav from "@/components/OpsNav";

type SupportMessage = {
  id: number;
  from_email: string;
  from_name: string | null;
  subject: string;
  body_text: string | null;
  body_html: string | null;
  status: string;
  ai_draft_reply: string | null;
  replied_at: string | null;
  created_at: string;
};

export default function SupportDetailPage() {
  const { token, ready } = useAuth();
  const params = useParams();
  const id = params?.id as string;

  const [message, setMessage] = useState<SupportMessage | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [sent, setSent] = useState(false);

  const fetchMessage = useCallback(async () => {
    if (!token || !id) return;
    setLoading(true);
    const res = await fetch(`/api/support/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      setMessage(data);
    }
    setLoading(false);
  }, [token, id]);

  useEffect(() => {
    if (ready) fetchMessage();
  }, [ready, fetchMessage]);

  async function sendReply() {
    if (!token || !replyText.trim()) return;
    setSending(true);
    const res = await fetch(`/api/support/${id}/reply`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ replyText }),
    });
    if (res.ok) {
      setSent(true);
      setMessage((prev) => (prev ? { ...prev, status: "replied" } : prev));
    }
    setSending(false);
  }

  if (!ready || loading) {
    return (
      <div className="min-h-screen bg-bg">
        <OpsNav />
        <main className="mx-auto max-w-[700px] px-6 py-8">
          <div className="h-24 animate-pulse rounded-xl bg-surface" />
        </main>
      </div>
    );
  }

  if (!message) {
    return (
      <div className="min-h-screen bg-bg">
        <OpsNav />
        <main className="mx-auto max-w-[700px] px-6 py-8">
          <p className="text-[14px] text-muted">Message not found.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <OpsNav />
      <main className="mx-auto max-w-[700px] animate-fadeIn px-6 py-8">
        <Link
          href="/support"
          className="mb-4 inline-flex items-center gap-1 text-[13px] text-muted transition-colors hover:text-text"
        >
          ← Back to support
        </Link>

        <div className="mb-6 rounded-xl border border-border bg-surface p-5">
          <h1 className="mb-1 text-xl font-semibold text-text">
            {message.subject || "(no subject)"}
          </h1>
          <p className="mb-4 text-[13px] text-muted">
            {message.from_name ? `${message.from_name} — ` : ""}
            {message.from_email} · {new Date(message.created_at).toLocaleString()}
          </p>
          <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-text">
            {message.body_text || "(no content)"}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-5">
          <h2 className="mb-3 text-[12px] font-medium uppercase tracking-wide text-muted">
            Your reply
          </h2>

          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            rows={8}
            placeholder="Write your reply here..."
            className="mb-3 w-full rounded-lg border border-border bg-surface2 px-4 py-3 text-[14px] text-text placeholder:text-muted/50 outline-none focus:border-accent/60 focus:ring-2 focus:ring-accent/20"
          />

          {sent && (
            <p className="mb-3 text-[13px] text-success">Reply sent.</p>
          )}

          <button
            type="button"
            onClick={sendReply}
            disabled={sending || !replyText.trim()}
            className="rounded-lg bg-accent px-5 py-2.5 text-[12px] font-medium uppercase tracking-wide text-white transition-all hover:bg-accentHover disabled:opacity-40"
          >
            {sending ? "Sending..." : "Send reply"}
          </button>
        </div>
      </main>
    </div>
  );
}
