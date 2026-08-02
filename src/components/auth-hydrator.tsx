"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/auth";
import type { User } from "@/lib/types";

export function AuthHydrator() {
  const setUser = useAuthStore((s) => s.setUser);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/auth/me");
        const json = await res.json();
        if (!cancelled && json.success) {
          setUser(json.data as User);
        } else if (!cancelled && !json.success && user) {
          setUser(null);
        }
      } catch {
        // session check failed; keep whatever we have locally
      }
    })();
    return () => {
      cancelled = true;
    };
    // only on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
