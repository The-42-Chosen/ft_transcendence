"use client";

import { useEffect, useState } from "react";

type OnlineStatusProps = {
  lastSeen: string | null;
};

export default function OnlineStatus({
  lastSeen,
}: OnlineStatusProps) {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    function updateStatus() {
      if (!lastSeen) {
        setIsOnline(false);
        return;
      }

      const lastSeenTime = new Date(lastSeen).getTime();

      setIsOnline(
        Date.now() - lastSeenTime < 60_000
      );
    }

    updateStatus();

    const interval = setInterval(
      updateStatus,
      5000
    );

    return () => {
      clearInterval(interval);
    };
  }, [lastSeen]);

  return (
    <div className="flex items-center gap-2">
      <span
        className={`h-2 w-2 rounded-full ${
          isOnline
            ? "bg-green-500"
            : "bg-gray-400"
        }`}
      />

      <span className="text-sm">
        {isOnline ? "Online" : "Offline"}
      </span>
    </div>
  );
}