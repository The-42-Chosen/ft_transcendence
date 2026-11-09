import { NextResponse } from "next/server";
import { publicRoom, startRoom } from "@/lib/rooms";
import { TEAM_COLORS, type TeamColor } from "@/lib/lobby";

export async function POST(request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const body = await request.json().catch(() => null);
  const requested: unknown[] = Array.isArray(body?.aiTeams) ? body.aiTeams : [];
  const aiTeams = TEAM_COLORS.filter((team: TeamColor) => requested.includes(team));
  const room = await startRoom(code, aiTeams);

  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }
  return NextResponse.json(publicRoom(room));
}
