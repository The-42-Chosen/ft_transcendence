import { NextResponse } from "next/server";
import { currentSeat, getRoom, playMove } from "@/lib/rooms";

export async function POST(_request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const room = getRoom(code);

  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }
  const seat = await currentSeat(room);
  return playMove(room, seat, () => ({ turn: room.endTurn(seat) }));
}
