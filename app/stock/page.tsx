"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { useAuth } from "@/lib/useAuth";
import OpsNav from "@/components/OpsNav";

const SIZE_ORDER = ["S", "M", "L", "XL", "XXL"];

type Product = {
  id: string;
  name: string;
  image_url: string;
  price: string;
  sizes: Record<string, number> | null;
};

export default function StockPage() {
  const { token, ready } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);

  const fetchStock = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    const res = await fetch("/api/stock", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      setProducts(await res.json());
    }
    setLoading(false);
  }, [token]);

  useEffect(() => {
    if (ready) fetchStock();
  }, [ready, fetchStock]);

  async function updateQty(productId: string, size: string, qty: number) {
    if (!token) return;
    const key = `${productId}-${size}`;
    setSavingKey(key);

    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? { ...p, sizes: { ...(p.sizes || {}), [size]: qty } }
          : p
      )
    );

    await fetch("/api/stock", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ productId, size, qty }),
    });

    setSavingKey(null);
  }

  if (!ready) return null;

  return (
    <div className="min-h-screen bg-bg">
      <OpsNav />
      <main className="mx-auto max-w-[900px] px-6 py-8">
        <h1 className="mb-6 text-2xl font-semibold text-text">Stock</h1>

        {loading ? (
          <div className="flex flex-col gap-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-[88px] animate-pulse rounded-xl border border-border bg-surface" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <p className="py-12 text-center text-[14px] text-muted">No products found.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {products.map((product, i) => {
              const sizes = product.sizes || {};
              return (
                <div
                  key={product.id}
                  style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
                  className="flex animate-fadeIn flex-col gap-4 rounded-xl border border-border bg-surface p-4 transition-colors hover:border-border/80 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative h-16 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-surface2">
                      <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-[14px] font-medium text-text">{product.name}</p>
                      <p className="text-[12px] text-muted">{product.price}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {SIZE_ORDER.filter((s) => s in sizes).map((size) => {
                      const qty = sizes[size] ?? 0;
                      const key = `${product.id}-${size}`;
                      return (
                        <div key={size} className="flex flex-col items-center gap-1.5">
                          <span className="text-[10px] font-medium uppercase text-muted">{size}</span>
                          <input
                            type="number"
                            min={0}
                            value={qty}
                            disabled={savingKey === key}
                            onChange={(e) =>
                              updateQty(product.id, size, parseInt(e.target.value, 10) || 0)
                            }
                            className={`h-9 w-14 rounded-lg border bg-surface2 text-center text-[13px] font-medium outline-none transition-all focus:ring-2 focus:ring-accent/20 ${
                              qty > 0
                                ? "border-border text-text focus:border-accent/60"
                                : "border-danger/40 text-danger focus:border-danger/60"
                            }`}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
