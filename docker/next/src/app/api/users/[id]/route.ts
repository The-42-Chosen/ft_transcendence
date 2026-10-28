import { z } from "zod";
import { NextResponse } from "next/server";
import { db } from "@/prisma/db";

const updateUserSchema = z.object({
  email: z.email().optional(),
  username: z.string().min(3).optional(),
  displayName: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  avatarUrl: z.string().nullable().optional(),
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

  return NextResponse.json(toPublicUser(user));
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

    const body = await request.json();

    const parsed = updateUserSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    if (Object.keys(parsed.data).length === 0) {
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

    const updatedUser = await db.orm.public.User
      .where({ id: userId })
      .update(parsed.data);

    return NextResponse.json(toPublicUser(updatedUser));

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}