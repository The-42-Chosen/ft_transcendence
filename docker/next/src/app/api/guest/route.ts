import { NextResponse } from "next/server";
import { cleanGuestName, setGuest } from "@/lib/player";

export async function POST(request: Request) {
	const body = await request.json().catch(() => null);
	const name = cleanGuestName(body?.name);

	if (!name) {
		return NextResponse.json({ error: "Invalid name" }, { status: 400 });
	}
	return NextResponse.json(await setGuest(name), { status: 201 });
}
