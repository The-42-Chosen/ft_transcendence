import { NextResponse } from "next/server";
import { db } from "@/prisma/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const userId = Number(id);

  if (!Number.isInteger(userId) || userId <= 0) {
    return NextResponse.json(
      { error: "Invalid user id" },
      { status: 400 }
    );
  }

  const user = await db.orm.public.User
    .where({ id: userId })
    .first();

  if (!user) {
    return NextResponse.json(
      { error: "User not found" },
      { status: 404 }
    );
  }

  const friendshipsAsUser = await db.orm.public.Friendship
    .where({ userId })
    .all();

  const friendshipsAsFriend = await db.orm.public.Friendship
    .where({ friendId: userId })
    .all();

  const friendIds = [
    ...friendshipsAsUser.map((friendship) => friendship.friendId),
    ...friendshipsAsFriend.map((friendship) => friendship.userId),
  ];

  const friends = await Promise.all(
    friendIds.map(async (friendId) => {
      return db.orm.public.User
        .where({ id: friendId })
        .first();
    })
  );

  return NextResponse.json(
    friends
      .filter((friend) => friend !== null)
      .map((friend) => ({
        id: friend!.id,
        username: friend!.username,
        displayName: friend!.displayName,
        avatarUrl: friend!.avatarUrl,
      }))
  );
}