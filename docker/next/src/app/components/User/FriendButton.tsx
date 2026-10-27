"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type FriendButtonProps = {
  currentUserId: number;
  profileUserId: number;
  isFriend: boolean;
};

export default function FriendButton({
  currentUserId,
  profileUserId,
  isFriend,
}: FriendButtonProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/friends", {
        method: isFriend ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: currentUserId,
          friendId: profileUserId,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error ?? "Something went wrong");
        return;
      }

      router.refresh();
    } catch (error) {
      console.error(error);
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="rounded border px-4 py-2"
      >
        {loading
          ? "Loading..."
          : isFriend
            ? "Remove friend"
            : "Add friend"}
      </button>

      {error && (
        <p className="mt-2 text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}