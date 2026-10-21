import { NextResponse } from "next/server";
import { db } from "@/prisma/db";

import { mkdir, writeFile } from "fs/promises";
import { randomUUID } from "crypto";
import path from "path";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 2 * 1024 * 1024;

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function POST(
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

    const user = await db.orm.public.User
      .where({ id: userId })
      .first();

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("avatar");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Avatar file is required" },
        { status: 400 }
      );
    }

    const extension = ALLOWED_TYPES[file.type];

    if (!extension) {
      return NextResponse.json(
        { error: "Only JPEG, PNG and WebP are allowed" },
        { status: 400 }
      );
    }

    if (file.size === 0 || file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Avatar must be between 1 byte and 2 MB" },
        { status: 400 }
      );
    }

    const filename = `${userId}-${randomUUID()}.${extension}`;

    const uploadDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      "avatars"
    );

    await mkdir(uploadDir, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());

    await writeFile(
      path.join(uploadDir, filename),
      buffer
    );

    const avatarUrl = `/uploads/avatars/${filename}`;

    const updatedUser = await db.orm.public.User
      .where({ id: userId })
      .update({ avatarUrl });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Avatar upload failed:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}