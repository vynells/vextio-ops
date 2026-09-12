"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function useAuth() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("vextio_ops_token");
    if (!stored) {
      router.push("/login");
      return;
    }
    setToken(stored);
    setReady(true);
  }, [router]);

  return { token, ready };
}
