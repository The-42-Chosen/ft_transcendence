import { NextResponse } from "next/server";
import { gameState, getRoom } from "@/lib/rooms";

// Update board for every player without refreshing
export async function GET(_request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const room = getRoom(code);

  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }
  if (room.status !== "playing") {
    return NextResponse.json({ error: "Game not started" }, { status: 409 });
  }
  return NextResponse.json(gameState(room));
}
