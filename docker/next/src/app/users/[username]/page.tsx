import Profile from "@/app/profile";
import Avatar from "@/app/components/User/Avatar";
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

  const friendshipsAsUser = await db.orm.public.Friendship
    .where({ userId: user.id })
    .all();

  const friendshipsAsFriend = await db.orm.public.Friendship
    .where({ friendId: user.id })
    .all();

  const friendIds = [
    ...friendshipsAsUser.map((friendship) => friendship.friendId),
    ...friendshipsAsFriend.map((friendship) => friendship.userId),
  ];

  const friends = await Promise.all(
    friendIds.map((friendId) =>
      db.orm.public.User
        .where({ id: friendId })
        .first()
    )
  );

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-8">
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

      <section className="w-full max-w-md">
        <h2 className="mb-4 text-xl font-semibold">
          Friends
        </h2>

        {friends.length === 0 ? (
          <p>No friends yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {friends
              .filter((friend) => friend !== null)
              .map((friend) => (
                <Link
                  key={friend!.id}
                  href={`/users/${friend!.username}`}
                  className="flex items-center gap-3 rounded border p-3"
                >
                  <Avatar
                    username={friend!.username}
                    avatarUrl={friend!.avatarUrl}
                    size={48}
                  />

                  <div>
                    <p className="font-semibold">
                      {friend!.displayName ?? friend!.username}
                    </p>

                    <p className="text-sm text-gray-500">
                      @{friend!.username}
                    </p>
                  </div>
                </Link>
              ))}
          </div>
        )}
      </section>
    </main>
  );
}