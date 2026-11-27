import { NextResponse } from "next/server";
import { getPlayer } from "@/lib/player";
import { signRealtimeToken } from "@/lib/realtimeToken";
import { getRoom } from "@/lib/rooms";

// Asked by the browser before every socket (re)connection, see useGame()
export async function GET(_request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const room = getRoom(code);

  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  const player = await getPlayer();
  const playerId = player?.id ?? null;
  const token = signRealtimeToken({
    code: room.code,
    playerId,
    name: player?.name ?? null,
    seat: room.seatOf(playerId),
  });

  return NextResponse.json({ token, playerId }, { headers: { "Cache-Control": "no-store" } });
}
