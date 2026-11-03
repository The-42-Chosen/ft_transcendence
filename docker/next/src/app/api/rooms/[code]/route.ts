import { NextResponse } from "next/server";
import { getRoom, publicRoom } from "@/lib/rooms";

// Checks that a room exists before joining it
export async function GET(_request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const room = getRoom(code);

  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }
  return NextResponse.json(publicRoom(room));
}
