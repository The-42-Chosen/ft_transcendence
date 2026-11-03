import { NextResponse } from "next/server";
import { endTurn, getRoom } from "@/lib/rooms";

// TODO: Check that it is the caller team turn once auth is done
export async function POST(_request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const room = getRoom(code);

  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }
  if (room.status !== "playing") {
    return NextResponse.json({ error: "Game not started" }, { status: 409 });
  }
  return NextResponse.json({ turn: endTurn(room) });
}
