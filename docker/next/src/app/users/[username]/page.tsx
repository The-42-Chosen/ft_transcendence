import Profile from "@/app/profile";
import Avatar from "@/app/components/User/Avatar";
import FriendButton from "@/app/components/User/FriendButton";
import { db } from "@/prisma/db";
import Link from "next/link";
import PresenceHeartbeat from "@/app/components/User/PresenceHeartbeat";

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

  // Temporaire : utilisateur connecté simulé
  const currentUserId = 1;

  // -------------------------
  // Amis du profil affiché
  // -------------------------

  const friendshipsAsUser = await db.orm.public.Friendship
    .where({ userId: user.id })
    .all();

  const friendshipsAsFriend = await db.orm.public.Friendship
    .where({ friendId: user.id })
    .all();

  const friendIds = [
    ...friendshipsAsUser.map(
      (friendship) => friendship.friendId
    ),
    ...friendshipsAsFriend.map(
      (friendship) => friendship.userId
    ),
  ];

  const friends = await Promise.all(
    friendIds.map((friendId) =>
      db.orm.public.User
        .where({ id: friendId })
        .first()
    )
  );

  // -------------------------
  // Amis de l'utilisateur connecté
  // -------------------------

  const currentUserFriendshipsAsUser =
    await db.orm.public.Friendship
      .where({ userId: currentUserId })
      .all();

  const currentUserFriendshipsAsFriend =
    await db.orm.public.Friendship
      .where({ friendId: currentUserId })
      .all();

  const currentUserFriendIds = [
    ...currentUserFriendshipsAsUser.map(
      (friendship) => friendship.friendId
    ),
    ...currentUserFriendshipsAsFriend.map(
      (friendship) => friendship.userId
    ),
  ];

  const isFriend =
    currentUserFriendIds.includes(user.id);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-8">
      <PresenceHeartbeat userId={1} />
      
      <Profile
        username={user.username}
        displayName={user.displayName}
        email={user.email}
        avatarUrl={user.avatarUrl}
      />

      {currentUserId === user.id ? (
        <Link
          href={`/users/${user.username}/edit`}
          className="rounded border px-4 py-2"
        >
          Edit profile
        </Link>
      ) : (
        <FriendButton
          currentUserId={currentUserId}
          profileUserId={user.id}
          isFriend={isFriend}
        />
      )}

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
                      {friend!.displayName ??
                        friend!.username}
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