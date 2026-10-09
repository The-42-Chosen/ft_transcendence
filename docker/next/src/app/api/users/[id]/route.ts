import { z } from "zod";
import { NextResponse } from "next/server";
import { db } from "@/prisma/db";

const updateUserSchema = z.object({
  email: z.email().optional(),
  username: z.string().min(3).optional(),
  displayName: z.string().nullable().optional(),
  avatarUrl: z.string().nullable().optional(),
}).strict();

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
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

    return NextResponse.json(updatedUser);

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}