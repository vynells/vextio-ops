"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function OpsNav() {
  const pathname = usePathname();
  const router = useRouter();

  function logout() {
    localStorage.removeItem("vextio_ops_token");
    router.push("/login");
  }

  const linkClass = (path: string) =>
    `relative px-1 py-1 text-[13px] font-medium transition-colors ${
      pathname?.startsWith(path) ? "text-text" : "text-muted hover:text-text"
    }`;

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-bg/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1000px] items-center justify-between px-6 py-4">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-accent/15">
              <span className="text-[11px] font-bold text-accent">V</span>
            </div>
            <span className="text-[14px] font-semibold text-text">Vextio Ops</span>
          </div>
          <nav className="flex gap-6">
            <Link href="/orders" className={linkClass("/orders")}>
              Orders
              {pathname?.startsWith("/orders") && (
                <span className="absolute -bottom-[17px] left-0 right-0 h-[2px] rounded-full bg-accent" />
              )}
            </Link>
            <Link href="/stock" className={linkClass("/stock")}>
              Stock
              {pathname?.startsWith("/stock") && (
                <span className="absolute -bottom-[17px] left-0 right-0 h-[2px] rounded-full bg-accent" />
              )}
            </Link>
            <Link href="/support" className={linkClass("/support")}>
              Support
              {pathname?.startsWith("/support") && (
                <span className="absolute -bottom-[17px] left-0 right-0 h-[2px] rounded-full bg-accent" />
              )}
            </Link>
          </nav>
        </div>
        <button
          type="button"
          onClick={logout}
          className="rounded-md px-3 py-1.5 text-[12px] text-muted transition-colors hover:bg-surface hover:text-text"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
