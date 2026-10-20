import Profile from "@/app/profile";
import { db } from "@/prisma/db";
import Link from "next/link";

export default async function UserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const userId = Number(id);

  if (!Number.isInteger(userId) || userId <= 0) {
    return <p>Invalid user id</p>;
  }

  const user = await db.orm.public.User
    .where({ id: userId })
    .first();

  if (!user) {
    return <p>User not found</p>;
  }

  return (
    <main className="min-h-screen flex items-center justify-center">
      <Profile
        username={user.username}
        displayName={user.displayName}
        email={user.email}
        avatarUrl={user.avatarUrl}
      />
      <Link
        href={`/users/${user.id}/edit`}
        className="rounded border px-4 py-2"
        >
        Edit profile
        </Link>
    </main>
  );
}