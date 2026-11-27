import { z } from "zod";
import { NextResponse } from "next/server";
import { db } from "@/prisma/db";
import { currentAccount } from "@/lib/session";
import { log } from "@/lib/log";

const updateUserSchema = z.object({
  email: z.email().optional(),
  username: z.string().min(3).optional(),
  displayName: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
}).strict();

function toPublicUser(user: {
  id: number;
  email: string;
  username: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  lastSeen: string | null;
  createdAt: string;
  updatedAt: string;
}) {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    displayName: user.displayName,
    bio: user.bio,
    avatarUrl: user.avatarUrl,
    lastSeen: user.lastSeen,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const me = await currentAccount();

  if (!me) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

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

  const isOwner = user.id === me.id;

  return NextResponse.json({
    ...toPublicUser(user),
    email: isOwner ? user.email : undefined,
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = Number(id);

    if (!Number.isInteger(userId) || userId <= 0) {
      return NextResponse.json(
        { error: "Invalid user id" },
        { status: 400 }
      );
    }

    const currentUser = await currentAccount();

    if (!currentUser) {
      log.warn({ service: "user", msg: "user update refused", reason: "session_user_not_found", target_user_id: userId });
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (currentUser.id !== userId) {
      log.warn({ service: "user", msg: "user update refused", reason: "forbidden", user_id: currentUser.id, target_user_id: userId });
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const body = await request.json();

    const parsed = updateUserSchema.safeParse(body);

    if (!parsed.success) {
      log.info({ service: "user", msg: "user update refused", reason: "invalid_body", user_id: userId });
      return NextResponse.json(
        {
          error: "Invalid request body",
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    if (Object.keys(parsed.data).length === 0) {
      log.info({ service: "user", msg: "user update refused", reason: "no_fields", user_id: userId });
      return NextResponse.json(
        { error: "No fields to update" },
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

    // A change revokes every existing token by modifying its sessionVersion.
    const identifierChanged =
      (parsed.data.email !== undefined && parsed.data.email !== currentUser.email) ||
      (parsed.data.username !== undefined && parsed.data.username !== currentUser.username);

    const updatePayload = identifierChanged
      ? { ...parsed.data, sessionVersion: (currentUser.sessionVersion ?? 0) + 1 }
      : parsed.data;

    const updatedUser = await db.orm.public.User
      .where({ id: userId })
      .update(updatePayload);

    if (!updatedUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    log.info({ service: "user", msg: "user updated", user_id: userId, fields: Object.keys(parsed.data) });
    return NextResponse.json(toPublicUser(updatedUser));
  } catch (error) {
    console.error(error);
    log.error({ service: "user", msg: "user update failed", error: String(error) });

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
