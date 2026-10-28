import { NextResponse } from "next/server";
import { aiBoard, getRoom, revealWord } from "@/lib/rooms";

// TODO: Check that it is the caller team turn once auth and turns are done
export async function POST(request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const body = await request.json().catch(() => null);
  const room = getRoom(code);

  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }
  if (room.status !== "playing") {
    return NextResponse.json({ error: "Game not started" }, { status: 409 });
  }
  if (typeof body?.word !== "string") {
    return NextResponse.json({ error: "Invalid word" }, { status: 400 });
  }
  const color = revealWord(room, body.word);
  if (!color) {
    return NextResponse.json({ error: "Word not on the board or already found" }, { status: 409 });
  }
  const { len_red, len_blue } = aiBoard(room);
  return NextResponse.json({ word: body.word.toUpperCase(), color, len_red, len_blue });
}
