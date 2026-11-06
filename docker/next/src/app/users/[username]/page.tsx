import Profile from "@/app/profile";
import Avatar from "@/app/components/User/Avatar";
import FriendButton from "@/app/components/User/FriendButton";
import PresenceHeartbeat from "@/app/components/User/PresenceHeartbeat";
import OnlineStatus from "@/app/components/User/OnlineStatus";
import LogOutButton from "@/app/components/User/LogOutButton";
import UserSearch from "@/app/components/User/UserSearch";
import { db } from "@/prisma/db";
import Link from "next/link";
import { auth } from "@/auth";

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

  const session = await auth();

  if (!session?.user?.email) {
    return <p>You must be logged in</p>;
  }

  const currentUser = await db.orm.public.User
    .where({ email: session.user.email })
    .first();

  if (!currentUser) {
    return <p>User not found</p>;
  }

  const currentUserId = currentUser.id;

  // Friends of the displayed profile
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
      <UserSearch />

      <PresenceHeartbeat userId={currentUserId} />

      <Profile
        username={user.username}
        displayName={user.displayName}
        email={user.email}
        avatarUrl={user.avatarUrl}
      />

      {currentUserId === user.id ? (
        <div className="flex gap-4">
          <Link
            href={`/users/${user.username}/edit`}
            className="rounded border px-4 py-2"
          >
            Edit profile
          </Link>

          <LogOutButton />
        </div>
      ) : (
        <FriendButton
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

                    <OnlineStatus
                      userId={friend!.id}
                    />
                  </div>
                </Link>
              ))}
          </div>
        )}
      </section>
    </main>
  );
}