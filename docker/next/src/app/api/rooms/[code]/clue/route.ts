import { NextResponse } from "next/server";
import { currentSeat, getRoom, playMove } from "@/lib/rooms";

export async function POST(request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const body = await request.json().catch(() => null);
  const room = getRoom(code);

  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }
  if (typeof body?.word !== "string" || typeof body?.count !== "number") {
    return NextResponse.json({ error: "Invalid clue" }, { status: 400 });
  }
  const seat = await currentSeat(room);
  return playMove(room, seat, () => ({ clue: room.giveClue(seat, body.word, body.count) }));
}
