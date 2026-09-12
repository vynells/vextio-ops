"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/useAuth";
import OpsNav from "@/components/OpsNav";

type OrderItem = { id: string; name: string; price: string; qty: number; size?: string };

type Order = {
  id: number;
  order_number: string;
  status: string;
  contact: string;
  first_name: string;
  last_name: string;
  address: string;
  apartment: string | null;
  city: string;
  postal_code: string | null;
  phone: string;
  payment_method: string;
  items: OrderItem[];
  subtotal: string;
  shipping: string;
  total: string;
  created_at: string;
};

const STATUS_FLOW = ["pending", "processing", "shipped", "delivered"];

const STATUS_DOT: Record<string, string> = {
  pending: "bg-muted",
  processing: "bg-warn",
  shipped: "bg-accent",
  delivered: "bg-success",
  cancelled: "bg-danger",
};

const STATUS_TEXT: Record<string, string> = {
  pending: "text-muted",
  processing: "text-warn",
  shipped: "text-accent",
  delivered: "text-success",
  cancelled: "text-danger",
};

export default function OrderDetailPage() {
  const { token, ready } = useAuth();
  const params = useParams();
  const id = params?.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchOrder = useCallback(async () => {
    if (!token || !id) return;
    setLoading(true);
    const res = await fetch(`/api/orders/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      setOrder(await res.json());
    }
    setLoading(false);
  }, [token, id]);

  useEffect(() => {
    if (ready) fetchOrder();
  }, [ready, fetchOrder]);

  async function updateStatus(status: string) {
    if (!token || !order) return;
    setUpdating(true);
    const res = await fetch(`/api/orders/${order.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setOrder((prev) => (prev ? { ...prev, status } : prev));
    }
    setUpdating(false);
  }

  if (!ready || loading) {
    return (
      <div className="min-h-screen bg-bg">
        <OpsNav />
        <main className="mx-auto max-w-[700px] px-6 py-8">
          <div className="flex flex-col gap-3">
            <div className="h-8 w-40 animate-pulse rounded-lg bg-surface" />
            <div className="h-24 animate-pulse rounded-xl bg-surface" />
            <div className="h-24 animate-pulse rounded-xl bg-surface" />
          </div>
        </main>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-bg">
        <OpsNav />
        <main className="mx-auto max-w-[700px] px-6 py-8">
          <p className="text-[14px] text-muted">Order not found.</p>
        </main>
      </div>
    );
  }

  const currentStepIndex = STATUS_FLOW.indexOf(order.status);
  const nextStatus =
    order.status === "cancelled" ? null : STATUS_FLOW[currentStepIndex + 1];

  return (
    <div className="min-h-screen bg-bg">
      <OpsNav />
      <main className="mx-auto max-w-[700px] animate-fadeIn px-6 py-8">
        <Link
          href="/orders"
          className="mb-4 inline-flex items-center gap-1 text-[13px] text-muted transition-colors hover:text-text"
        >
          ← Back to orders
        </Link>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-text">#{order.order_number}</h1>
            <p className="text-[13px] text-muted">
              {new Date(order.created_at).toLocaleString()}
            </p>
          </div>
          <span className={`flex items-center gap-2 rounded-full bg-surface px-3 py-1.5 text-[11px] font-medium uppercase tracking-wide ${STATUS_TEXT[order.status] || "text-muted"}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[order.status] || "bg-muted"}`} />
            {order.status}
          </span>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {nextStatus && (
            <button
              type="button"
              disabled={updating}
              onClick={() => updateStatus(nextStatus)}
              className="rounded-lg bg-accent px-5 py-2.5 text-[12px] font-medium uppercase tracking-wide text-white transition-all hover:bg-accentHover disabled:opacity-40"
            >
              Mark as {nextStatus}
            </button>
          )}
          {order.status !== "delivered" && order.status !== "cancelled" && (
            <button
              type="button"
              disabled={updating}
              onClick={() => updateStatus("cancelled")}
              className="rounded-lg border border-danger/40 px-5 py-2.5 text-[12px] font-medium uppercase tracking-wide text-danger transition-all hover:bg-danger/10 disabled:opacity-40"
            >
              Cancel order
            </button>
          )}
          {order.status === "cancelled" && (
            <button
              type="button"
              disabled={updating}
              onClick={() => updateStatus("pending")}
              className="rounded-lg border border-border px-5 py-2.5 text-[12px] font-medium uppercase tracking-wide text-text transition-all hover:bg-surface2 disabled:opacity-40"
            >
              Reopen as pending
            </button>
          )}
        </div>

        <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-surface p-4">
            <h2 className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted">
              Customer
            </h2>
            <p className="text-[14px] text-text">
              {order.first_name} {order.last_name}
            </p>
            <p className="text-[13px] text-muted">{order.contact}</p>
            <p className="text-[13px] text-muted">{order.phone}</p>
          </div>
          <div className="rounded-xl border border-border bg-surface p-4">
            <h2 className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted">
              Shipping address
            </h2>
            <p className="text-[14px] text-text">
              {order.address}
              {order.apartment ? `, ${order.apartment}` : ""}
            </p>
            <p className="text-[13px] text-muted">
              {order.city} {order.postal_code || ""}
            </p>
          </div>
        </div>

        <div className="mb-4 rounded-xl border border-border bg-surface p-4">
          <h2 className="mb-1 text-[11px] font-medium uppercase tracking-wide text-muted">
            Payment
          </h2>
          <p className="text-[14px] text-text">{order.payment_method}</p>
        </div>

        <div className="mb-4 rounded-xl border border-border bg-surface p-4">
          <h2 className="mb-3 text-[11px] font-medium uppercase tracking-wide text-muted">
            Items
          </h2>
          <div className="flex flex-col gap-2">
            {order.items.map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between border-b border-border/60 pb-2 text-[13px] last:border-0 last:pb-0"
              >
                <span className="text-text">
                  {item.name}
                  {item.size && <span className="text-muted"> — {item.size}</span>}
                  <span className="text-muted"> × {item.qty}</span>
                </span>
                <span className="text-text">{item.price}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface p-4">
          <div className="flex flex-col gap-1.5 text-[13px]">
            <div className="flex justify-between text-muted">
              <span>Subtotal</span>
              <span>PKR {Number(order.subtotal).toLocaleString("en-PK")}</span>
            </div>
            <div className="flex justify-between text-muted">
              <span>Shipping</span>
              <span>PKR {Number(order.shipping).toLocaleString("en-PK")}</span>
            </div>
            <div className="mt-1 flex justify-between border-t border-border pt-2 font-semibold text-text">
              <span>Total</span>
              <span>PKR {Number(order.total).toLocaleString("en-PK")}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
