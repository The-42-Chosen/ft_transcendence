import { NextResponse } from "next/server";
import { lobbyRoute } from "@/lib/rooms";

// AI list player present in game
export async function POST(request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const body = await request.json().catch(() => null);

  if (!Array.isArray(body?.aiTeams)) {
    return NextResponse.json({ error: "Invalid aiTeams" }, { status: 400 });
  }
  return lobbyRoute(code, (room) => room.setAi(body.aiTeams), { hostOnly: true });
}
