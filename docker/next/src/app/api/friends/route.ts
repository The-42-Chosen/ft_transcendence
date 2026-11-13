import { NextResponse } from "next/server";
import { db } from "@/prisma/db";
import { z } from "zod";
import { auth } from "@/auth";
import { log } from "@/lib/log";

const friendshipSchema = z.object({
  friendId: z.number().int().positive(),
});

// POST

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const currentUser = await db.orm.public.User
      .where({ email: session.user.email })
      .first();

    if (!currentUser) {
      log.warn({ service: "user", msg: "friend add refused", reason: "session_user_not_found" });
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = friendshipSchema.safeParse(body);

    if (!parsed.success) {
      log.info({ service: "user", msg: "friend add refused", reason: "invalid_body", user_id: currentUser.id });
      return NextResponse.json(
        {
          error: "Invalid data",
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const userId = currentUser.id;
    const { friendId } = parsed.data;

    if (userId === friendId) {
      log.info({ service: "user", msg: "friend add refused", reason: "self", user_id: userId });
      return NextResponse.json(
        { error: "You cannot add yourself as a friend" },
        { status: 400 }
      );
    }

    const friend = await db.orm.public.User
      .where({ id: friendId })
      .first();

    if (!friend) {
      log.info({ service: "user", msg: "friend add refused", reason: "friend_not_found", user_id: userId, friend_id: friendId });
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const existingFriendship =
      (await db.orm.public.Friendship
        .where({ userId, friendId })
        .first()) ??
      (await db.orm.public.Friendship
        .where({
          userId: friendId,
          friendId: userId,
        })
        .first());

    if (existingFriendship) {
      log.info({ service: "user", msg: "friend add refused", reason: "already_friends", user_id: userId, friend_id: friendId });
      return NextResponse.json(
        { error: "Friendship already exists" },
        { status: 409 }
      );
    }

    const friendship = await db.orm.public.Friendship.create({
      userId,
      friendId,
    });

    log.info({ service: "user", msg: "friend added", user_id: userId, friend_id: friendId });
    return NextResponse.json(friendship, {
      status: 201,
    });
  } catch (error) {
    console.error("Friendship creation failed:", error);
    log.error({ service: "user", msg: "friendship creation failed", error: String(error) });

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE

export async function DELETE(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const currentUser = await db.orm.public.User
      .where({ email: session.user.email })
      .first();

    if (!currentUser) {
      log.warn({ service: "user", msg: "friend remove refused", reason: "session_user_not_found" });
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = friendshipSchema.safeParse(body);

    if (!parsed.success) {
      log.info({ service: "user", msg: "friend remove refused", reason: "invalid_body", user_id: currentUser.id });
      return NextResponse.json(
        {
          error: "Invalid data",
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const userId = currentUser.id;
    const { friendId } = parsed.data;

    const friendship =
      (await db.orm.public.Friendship
        .where({
          userId,
          friendId,
        })
        .first()) ??
      (await db.orm.public.Friendship
        .where({
          userId: friendId,
          friendId: userId,
        })
        .first());

    if (!friendship) {
      log.info({ service: "user", msg: "friend remove refused", reason: "friendship_not_found", user_id: userId, friend_id: friendId });
      return NextResponse.json(
        { error: "Friendship not found" },
        { status: 404 }
      );
    }

    await db.orm.public.Friendship
      .where({ id: friendship.id })
      .delete();

    log.info({ service: "user", msg: "friend removed", user_id: userId, friend_id: friendId });
    return NextResponse.json({
      message: "Friend removed",
    });
  } catch (error) {
    console.error("Friendship deletion failed:", error);
    log.error({ service: "user", msg: "friendship deletion failed", error: String(error) });

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}