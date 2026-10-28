import { NextResponse } from "next/server";
import { LANGUAGE_FLAGS, type Language } from "@/lib/lobby";
import { createRoom, publicRoom } from "@/lib/rooms";

const LANGUAGES = Object.values(LANGUAGE_FLAGS);

// Creates a new room and returns its code
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const language = body?.language as Language;

  if (!LANGUAGES.includes(language)) {
    return NextResponse.json({ error: "Invalid language" }, { status: 400 });
  }
  const room = createRoom(language);
  return NextResponse.json(publicRoom(room), { status: 201 });
}
