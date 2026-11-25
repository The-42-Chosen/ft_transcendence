import { NextResponse } from "next/server";
import { audienceOf } from "@/lib/game";
import { currentSeat, getRoom } from "@/lib/rooms";

export async function GET(_request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const room = getRoom(code);

  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }
  if (room.status !== "playing") {
    return NextResponse.json({ error: "Game not started" }, { status: 409 });
  }
  return NextResponse.json(room.viewFor(audienceOf(await currentSeat(room))));
}
