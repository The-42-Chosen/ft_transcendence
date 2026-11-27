"use client";

import { useEffect, useState } from "react";

export function usePlayerName(): string | null {
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/me")
      .then((res) => (res.ok ? res.json() : null))
      .catch(() => null)
      .then((player) => {
        if (!cancelled) {
          setName(player?.name ?? null);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return name;
}
