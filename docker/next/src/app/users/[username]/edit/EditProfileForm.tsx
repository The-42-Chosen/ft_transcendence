"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type EditProfileFormProps = {
  id: number;
  username: string;
  email: string;
  displayName: string | null;
};

export default function EditProfileForm({
  id,
  username: initialUsername,
  email: initialEmail,
  displayName: initialDisplayName,
}: EditProfileFormProps) {
  const router = useRouter();

  const [username, setUsername] = useState(initialUsername);
  const [email, setEmail] = useState(initialEmail);
  const [displayName, setDisplayName] = useState(
    initialDisplayName ?? ""
  );

  const [avatar, setAvatar] = useState<File | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);
    setLoading(true);

    try {
      const response = await fetch(`/api/users/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          email,
          displayName: displayName || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();

        setError(data.error ?? "Unable to update profile");
        setLoading(false);
        return;
      }

      const updatedUser = await response.json();

      if (avatar) {
        const formData = new FormData();

        formData.append("avatar", avatar);

        const avatarResponse = await fetch(
          `/api/users/${id}/avatar`,
          {
            method: "POST",
            body: formData,
          }
        );

        if (!avatarResponse.ok) {
          const data = await avatarResponse.json();

          setError(data.error ?? "Unable to upload avatar");
          setLoading(false);
          return;
        }
      }

      router.push(`/users/${updatedUser.username}`);
      router.refresh();
    } catch (error) {
      console.error(error);
      setError("Something went wrong");
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-md flex-col gap-4"
    >
      <div className="flex flex-col gap-1">
        <label htmlFor="username">
          Username
        </label>

        <input
          id="username"
          type="text"
          value={username}
          onChange={(event) =>
            setUsername(event.target.value)
          }
          className="rounded border px-3 py-2"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="email">
          Email
        </label>

        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) =>
            setEmail(event.target.value)
          }
          className="rounded border px-3 py-2"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="displayName">
          Display name
        </label>

        <input
          id="displayName"
          type="text"
          value={displayName}
          onChange={(event) =>
            setDisplayName(event.target.value)
          }
          className="rounded border px-3 py-2"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="avatar">
          Avatar
        </label>

        <input
          id="avatar"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={(event) => {
            const file =
              event.target.files?.[0] ?? null;

            setAvatar(file);
          }}
        />
      </div>

      {avatar && (
        <p className="text-sm text-gray-500">
          Selected: {avatar.name}
        </p>
      )}

      {error && (
        <p className="text-sm text-red-500">
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