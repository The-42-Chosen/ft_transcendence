import { NextResponse } from "next/server";
import { parseSeat } from "@/lib/lobby";
import { getRoom, playMove } from "@/lib/rooms";

// TODO: Take the seat from the logged user once seats are saved, the client can lie about it
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
  const seat = parseSeat(body.seat);
  return playMove(room, seat, () => ({ clue: room.giveClue(seat, body.word, body.count) }));
}
