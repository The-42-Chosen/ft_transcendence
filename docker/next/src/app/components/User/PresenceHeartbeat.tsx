"use client";

import { useEffect } from "react";

type PresenceHeartbeatProps = {
  userId: number;
};

export default function PresenceHeartbeat({
  userId,
}: PresenceHeartbeatProps) {
  useEffect(() => {
    async function updatePresence() {
      await fetch(`/api/users/${userId}/presence`, {
        method: "POST",
      });
    }

    updatePresence();

    const interval = setInterval(
      updatePresence,
      30000
    );

    return () => {
      clearInterval(interval);
    };
  }, [userId]);

  return null;
}