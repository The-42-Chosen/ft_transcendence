import Profile from "@/app/profile";
import { db } from "@/prisma/db";
import Link from "next/link";

export default async function UserPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  const user = await db.orm.public.User
    .where({ username })
    .first();

  if (!user) {
    return <p>User not found</p>;
  }

  return (
    <main className="min-h-screen flex items-center justify-center gap-4">
      <Profile
        username={user.username}
        displayName={user.displayName}
        email={user.email}
        avatarUrl={user.avatarUrl}
      />

      <Link
        href={`/users/${user.username}/edit`}
        className="rounded border px-4 py-2"
      >
        Edit profile
      </Link>
    </main>
  );
}