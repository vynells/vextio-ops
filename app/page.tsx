"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("vextio_ops_token");
    router.push(token ? "/orders" : "/login");
  }, [router]);

  return null;
}
