"use client";

import { useEffect, useState } from "react";
import { GUEST_NAME_KEY } from "@/lib/lobby";

function readGuestName(): string | null {
  try {
    return sessionStorage.getItem(GUEST_NAME_KEY);
  } catch {
    return null;
  }
}

export function usePlayerName(): string | null {
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/session")
      .then((res) => (res.ok ? res.json() : null))
      .catch(() => null)
      .then((session) => {
        if (!cancelled) {
          setName(session?.user?.name || readGuestName());
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return name;
}
