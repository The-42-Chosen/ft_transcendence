import { NextResponse } from "next/server";
import { db } from "@/prisma/db";
import { auth } from "@/auth";
import { log } from "@/lib/log";

// GET

export async function GET(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  const { id } = await params;
  const userId = Number(id);

  if (!Number.isInteger(userId)) {
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

  return NextResponse.json({
    lastSeen: user.lastSeen,
  });
}

// POST

export async function POST(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
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

  const { id } = await params;
  const userId = Number(id);

  if (!Number.isInteger(userId)) {
    return NextResponse.json(
      { error: "Invalid user id" },
      { status: 400 }
    );
  }

  if (currentUser.id !== userId) {
    log.warn({ service: "user", msg: "presence update refused", reason: "forbidden", user_id: currentUser.id, target_user_id: userId });
    return NextResponse.json(
      { error: "Forbidden" },
      { status: 403 }
    );
  }

  const user = await db.orm.public.User
    .where({ id: userId })
    .update({
      lastSeen: new Date().toISOString(),
    });

  if (!user) {
    return NextResponse.json(
      { error: "User not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({
    lastSeen: user.lastSeen,
  });
}