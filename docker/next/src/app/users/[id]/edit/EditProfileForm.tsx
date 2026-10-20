"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type EditProfileFormProps = {
  id: number;
  username: string;
  email: string;
  displayName?: string | null;
};

export default function EditProfileForm({
  id,
  username,
  email,
  displayName,
}: EditProfileFormProps) {
  const router = useRouter();

  const [form, setForm] = useState({
    username,
    email,
    displayName: displayName ?? "",
  });

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError(null);

    const response = await fetch(`/api/users/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: form.username,
        email: form.email,
        displayName: form.displayName,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error ?? "Unable to update profile");
      setLoading(false);
      return;
    }

    router.push(`/users/${id}`);
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md space-y-4"
    >
      <div>
        <label htmlFor="username" className="block mb-1">
          Username
        </label>

        <input
          id="username"
          type="text"
          value={form.username}
          onChange={(event) =>
            setForm({
              ...form,
              username: event.target.value,
            })
          }
          className="w-full rounded border px-3 py-2"
        />
      </div>

      <div>
        <label htmlFor="email" className="block mb-1">
          Email
        </label>

        <input
          id="email"
          type="email"
          value={form.email}
          onChange={(event) =>
            setForm({
              ...form,
              email: event.target.value,
            })
          }
          className="w-full rounded border px-3 py-2"
        />
      </div>

      <div>
        <label htmlFor="displayName" className="block mb-1">
          Display name
        </label>

        <input
          id="displayName"
          type="text"
          value={form.displayName}
          onChange={(event) =>
            setForm({
              ...form,
              displayName: event.target.value,
            })
          }
          className="w-full rounded border px-3 py-2"
        />
      </div>

      {error && (
        <p className="text-red-500">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="rounded border px-4 py-2"
      >
        {loading ? "Saving..." : "Save"}
      </button>
    </form>
  );
}