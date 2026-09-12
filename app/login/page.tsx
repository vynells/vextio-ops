"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setChecking(true);

    const res = await fetch("/api/verify", {
      method: "POST",
      headers: { Authorization: `Bearer ${password}` },
    });

    if (res.ok) {
      localStorage.setItem("vextio_ops_token", password);
      router.push("/orders");
    } else {
      setError("Incorrect password.");
    }
    setChecking(false);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-bg px-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-[360px] animate-fadeIn rounded-2xl border border-border bg-surface p-8 shadow-2xl shadow-black/40"
      >
        <div className="mb-6">
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-accent/15">
            <span className="text-lg font-bold text-accent">V</span>
          </div>
          <h1 className="text-xl font-semibold text-text">Vextio Ops</h1>
          <p className="mt-1 text-[13px] text-muted">Sign in to manage orders and stock.</p>
        </div>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Admin password"
          autoFocus
          className="mb-3 w-full rounded-lg border border-border bg-surface2 px-4 py-2.5 text-[14px] text-text placeholder:text-muted/60 outline-none focus:border-accent/60 focus:ring-2 focus:ring-accent/20"
        />

        {error && <p className="mb-3 animate-fadeIn text-[13px] text-danger">{error}</p>}

        <button
          type="submit"
          disabled={checking || !password}
          className="w-full rounded-lg bg-accent px-6 py-3 text-[13px] font-medium uppercase tracking-[0.1em] text-white transition-colors hover:bg-accentHover disabled:cursor-not-allowed disabled:opacity-40"
        >
          {checking ? "Checking..." : "Sign in"}
        </button>
      </form>
    </main>
  );
}
