"use client";

import { useState } from "react";
import Link from "next/link";
import Avatar from "@/app/components/User/Avatar";

type UserResult = {
  id: number;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
};

export default function UserSearch() {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<UserResult[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleSearch(value: string) {
    setQuery(value);

    if (!value.trim()) {
      setUsers([]);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `/api/users/search?q=${encodeURIComponent(value)}`
      );

      if (!response.ok) {
        setUsers([]);
        return;
      }

      const data = await response.json();
      setUsers(data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <input
        type="text"
        value={query}
        onChange={(event) =>
          handleSearch(event.target.value)
        }
        placeholder="Search user..."
        className="w-full rounded border px-3 py-2"
      />

      {loading && (
        <p className="mt-2 text-sm">
          Searching...
        </p>
      )}

      {users.length > 0 && (
        <div className="mt-3 flex flex-col gap-2">
          {users.map((user) => (
            <Link
              key={user.id}
              href={`/users/${user.username}`}
              className="flex items-center gap-3 rounded border p-3"
            >
              <Avatar
                username={user.username}
                avatarUrl={user.avatarUrl}
                size={40}
              />

              <div>
                <p className="font-semibold">
                  {user.displayName ?? user.username}
                </p>

                <p className="text-sm text-gray-500">
                  @{user.username}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}