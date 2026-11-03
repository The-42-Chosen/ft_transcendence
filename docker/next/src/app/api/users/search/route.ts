import { NextResponse } from "next/server";
import { db } from "@/prisma/db";
import { auth } from "@/auth";

export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim().toLowerCase();

  if (!query) {
    return NextResponse.json([]);
  }

  const users = await db.orm.public.User.all();

  const results = users
    .filter((user) =>
      user.username.toLowerCase().includes(query)
    )
    .slice(0, 10)
    .map((user) => ({
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
    }));

  return NextResponse.json(results);
}