import { NextResponse } from "next/server";
import { publicRoom, startRoom } from "@/lib/rooms";
import type { AiTeam } from "@/lib/lobby";

const AI_TEAMS: AiTeam[] = ["red", "blue", "none"];

export async function POST(request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const body = await request.json().catch(() => null);
  const aiTeam = AI_TEAMS.includes(body?.aiTeam) ? (body.aiTeam as AiTeam) : "none";
  const room = startRoom(code, aiTeam);

  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }
  return NextResponse.json(publicRoom(room));
}
