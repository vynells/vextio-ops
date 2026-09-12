"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/useAuth";
import OpsNav from "@/components/OpsNav";

type Order = {
  id: number;
  order_number: string;
  status: string;
  first_name: string;
  last_name: string;
  city: string;
  phone: string;
  total: string;
  items: { name: string; qty: number; size?: string }[];
  created_at: string;
};

const STATUS_TABS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "processing", label: "Processing" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
  { key: "cancelled", label: "Cancelled" },
];

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

export default function OrdersPage() {
  const { token, ready } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");

  const fetchOrders = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    const res = await fetch("/api/orders", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      setOrders(await res.json());
    }
    setLoading(false);
  }, [token]);

  useEffect(() => {
    if (ready) fetchOrders();
  }, [ready, fetchOrders]);

  if (!ready) return null;

  const filtered = orders.filter((o) => {
    const matchesTab = activeTab === "all" || o.status === activeTab;
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      o.order_number.toLowerCase().includes(q) ||
      `${o.first_name} ${o.last_name}`.toLowerCase().includes(q) ||
      (o.phone || "").toLowerCase().includes(q);
    return matchesTab && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-bg">
      <OpsNav />
      <main className="mx-auto max-w-[1000px] px-6 py-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-semibold text-text">Orders</h1>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order #, name, phone..."
            className="w-full max-w-[280px] rounded-lg border border-border bg-surface px-3 py-2 text-[13px] text-text placeholder:text-muted/60 outline-none focus:border-accent/60 focus:ring-2 focus:ring-accent/20"
          />
        </div>

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
                  {orders.filter((o) => o.status === tab.key).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-[72px] animate-pulse rounded-xl border border-border bg-surface"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="py-12 text-center text-[14px] text-muted">No orders found.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map((order, i) => (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
                className="group flex animate-fadeIn flex-col gap-2 rounded-xl border border-border bg-surface p-4 transition-all hover:border-accent/30 hover:bg-surface2 active:scale-[0.995] sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-[13px] font-medium text-text">
                    #{order.order_number}
                  </p>
                  <p className="text-[13px] text-muted">
                    {order.first_name} {order.last_name} — {order.city}
                  </p>
                  <p className="text-[12px] text-muted/70">
                    {order.items?.length || 0} item{order.items?.length === 1 ? "" : "s"} ·{" "}
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3 sm:flex-col sm:items-end sm:gap-1.5">
                  <span className={`flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide ${STATUS_TEXT[order.status] || "text-muted"}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[order.status] || "bg-muted"}`} />
                    {order.status}
                  </span>
                  <span className="text-[13px] font-semibold text-text">
                    PKR {Number(order.total).toLocaleString("en-PK")}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
