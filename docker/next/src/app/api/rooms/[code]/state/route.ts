import { NextResponse } from "next/server";
import { audienceOf } from "@/lib/game";
import { parseSeat } from "@/lib/lobby";
import { getRoom } from "@/lib/rooms";

// Full state of the game as seen from a seat, asked again by the browser when its socket (re)connects
export async function GET(request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  // TODO: Need to be changed once we will remove query
  const seat = parseSeat(new URL(request.url).searchParams.get("seat"));
  const room = getRoom(code);

  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }
  if (room.status !== "playing") {
    return NextResponse.json({ error: "Game not started" }, { status: 409 });
  }
  return NextResponse.json(room.viewFor(audienceOf(seat)));
}
