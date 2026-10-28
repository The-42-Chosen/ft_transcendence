import { NextResponse } from "next/server";
import { db } from "@/prisma/db";
import { z } from "zod";
import bcrypt from "bcryptjs";

const createUserSchema = z.object({
  email: z.email(),
  username: z.string().min(3),
  password: z.string().min(8),
}).strict();

export async function GET() {
  const users = await db.orm.public.User.all();

  const publicUsers = users.map((user) => ({
    id: user.id,
    email: user.email,
    username: user.username,
    displayName: user.displayName,
    bio: user.bio,
    avatarUrl: user.avatarUrl,
    lastSeen: user.lastSeen,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }));

  return NextResponse.json(publicUsers);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const parsed = createUserSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Invalid request body",
          details: parsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { email, username, password } = parsed.data;

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await db.orm.public.User.create({
      email,
      username,
      passwordHash,
    });

    return NextResponse.json(
      {
        id: user.id,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        lastSeen: user.lastSeen,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("User creation failed:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}