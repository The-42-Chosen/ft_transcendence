import { NextResponse } from "next/server";
import { getPlayer, publicPlayer } from "@/lib/player";

// The current player (account or guest), without the email
export async function GET() {
	const player = await getPlayer();
	return NextResponse.json(player ? publicPlayer(player) : null);
}
