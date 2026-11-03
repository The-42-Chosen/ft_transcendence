import { NextResponse } from "next/server";
import { db } from "@/prisma/db";
import { z } from "zod";
import { auth } from "@/auth";

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
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = friendshipSchema.safeParse(body);

    if (!parsed.success) {
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
      return NextResponse.json(
        { error: "You cannot add yourself as a friend" },
        { status: 400 }
      );
    }

    const friend = await db.orm.public.User
      .where({ id: friendId })
      .first();

    if (!friend) {
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
      return NextResponse.json(
        { error: "Friendship already exists" },
        { status: 409 }
      );
    }

    const friendship = await db.orm.public.Friendship.create({
      userId,
      friendId,
    });

    return NextResponse.json(friendship, {
      status: 201,
    });
  } catch (error) {
    console.error("Friendship creation failed:", error);

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
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = friendshipSchema.safeParse(body);

    if (!parsed.success) {
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
      return NextResponse.json(
        { error: "Friendship not found" },
        { status: 404 }
      );
    }

    await db.orm.public.Friendship
      .where({ id: friendship.id })
      .delete();

    return NextResponse.json({
      message: "Friend removed",
    });
  } catch (error) {
    console.error("Friendship deletion failed:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}