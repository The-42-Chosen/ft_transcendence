import { NextResponse } from "next/server";
import { parseSeat } from "@/lib/lobby";
import { lobbyRoute } from "@/lib/rooms";

// Body: { seat }. Unknown seat = spectator.
// TODO: Fmotte Here is where you have to deal with user role
export async function POST(request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const body = await request.json().catch(() => null);

  if (typeof body?.seat !== "string") {
    return NextResponse.json({ error: "Invalid seat" }, { status: 400 });
  }
  return lobbyRoute(code, (room, player) => room.setSeat(player.id, parseSeat(body.seat)));
}
