import { NextResponse } from "next/server";
import { PlayerError, publicPlayer, requirePlayer } from "@/lib/player";

// The current player (account or guest), without the email
export async function GET() {
	try {
		const player = await requirePlayer();
		return NextResponse.json(publicPlayer(player));
	} catch (error) {
		if (error instanceof PlayerError) {
			return NextResponse.json({ error: error.message }, { status: error.status });
		}
		throw error;
	}
}
