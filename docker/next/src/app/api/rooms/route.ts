import { NextResponse } from "next/server";
import { LANGUAGE_FLAGS, type Language } from "@/lib/lobby";
import { PlayerError, requirePlayer } from "@/lib/player";
import { createRoom, publicRoom } from "@/lib/rooms";

const LANGUAGES = Object.values(LANGUAGE_FLAGS);

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const language = body?.language as Language;

  if (!LANGUAGES.includes(language)) {
    return NextResponse.json({ error: "Invalid language" }, { status: 400 });
  }
  try {
    const room = createRoom(language, await requirePlayer());
    return NextResponse.json(publicRoom(room), { status: 201 });
  } catch (error) {
    if (error instanceof PlayerError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    throw error;
  }
}