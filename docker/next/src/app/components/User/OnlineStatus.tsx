"use client";

import { useEffect, useState } from "react";

type OnlineStatusProps = {
  userId: number;
};

export default function OnlineStatus({
  userId,
}: OnlineStatusProps) {
  const [online, setOnline] = useState(false);

  useEffect(() => {
    async function checkStatus() {
      try {
        const response = await fetch(
          `/api/users/${userId}/presence`,
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          setOnline(false);
          return;
        }

        const data = await response.json();

        if (!data.lastSeen) {
          setOnline(false);
          return;
        }

        const lastSeenTime = new Date(
          data.lastSeen
        ).getTime();

        const difference =
          Date.now() - lastSeenTime;

        setOnline(difference < 60_000);
      } catch {
        setOnline(false);
      }
    }

    checkStatus();

    const interval = setInterval(
      checkStatus,
      5_000
    );

    return () => clearInterval(interval);
  }, [userId]);

  return (
    <span
      className={
        online
          ? "text-green-500"
          : "text-gray-500"
      }
    >
      {online ? "Online" : "Offline"}
    </span>
  );
}