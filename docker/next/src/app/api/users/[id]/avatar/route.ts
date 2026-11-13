import { NextResponse } from "next/server";
import { db } from "@/prisma/db";
import { log } from "@/lib/log";

import { mkdir, writeFile } from "fs/promises";
import { randomUUID } from "crypto";
import path from "path";

import { auth } from "@/auth";

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
      log.warn({service:'user', msg:'error avatar', error: 'Invalid user id'})
      return NextResponse.json(
        { error: "Invalid user id" },
        { status: 400 }
      );
    }

    const session = await auth();

    if (!session?.user?.email) { 
      log.warn({service:'user', msg:'error avatar', error: 'Unauthorized'})
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const currentUser = await db.orm.public.User
      .where({ email: session.user.email })
      .first();
    
    if (!currentUser) {
      log.warn({service:'user', msg:'error avatar', error: 'Unauthorized'})
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    if (currentUser.id !== userId) {
      log.warn({service:'user', msg:'error avatar', error: 'Forbidden', user_id: currentUser.id})
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const user = await db.orm.public.User
      .where({ id: userId })
      .first();

    if (!user) {
      log.warn({service:'user', msg:'error avatar', error: 'user not found'})
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("avatar");

    if (!(file instanceof File)) {
      log.info({service:'user', msg:'error avatar', error: 'no file', user_id: currentUser.id})
      return NextResponse.json(
        { error: "Avatar file is required" },
        { status: 400 }
      );
    }

    const extension = ALLOWED_TYPES[file.type];

    if (!extension) {
      log.info({service:'user', msg:'error avatar', error: 'unknown extension', user_id: currentUser.id})
      return NextResponse.json(
        { error: "Only JPEG, PNG and WebP are allowed" },
        { status: 400 }
      );
    }

    if (file.size === 0 || file.size > MAX_FILE_SIZE) {
      log.info({service:'user', msg:'error avatar', error: 'size avatar too big', user_id: currentUser.id})
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
    log.info({service: 'user', msg: 'new avatar uploaded', userId, extension});	
    return NextResponse.json(updatedUser);
  } catch (error) {
    log.error({service:'user', msg: 'error avatar', error: String(error)});
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
