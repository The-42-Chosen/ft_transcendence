import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { Game, GameError, audienceOf } from "@/lib/game";
import { generateRoomCode, type Language, type Seat, type TeamColor } from "@/lib/lobby";
import { log } from "@/lib/log";

// TODO: In-memory store until rooms are saved in Postgres.
const store = globalThis as unknown as { rooms?: Map<string, Game> };
const rooms = (store.rooms ??= new Map<string, Game>());

const REALTIME_URL = process.env.REALTIME_INTERNAL_URL ?? "http://realtime:3001";

export function createRoom(language: Language): Game {
	let code = generateRoomCode();
	while (rooms.has(code)) {
		code = generateRoomCode();
	}
	const room = new Game(code, language);
	rooms.set(code, room);
	log.info({ service: "game", msg: "room created", room_code: code, language });
	return room;
}

export function getRoom(code: string): Game | null {
	return rooms.get(code.trim().toUpperCase()) ?? null;
}

export async function startRoom(code: string, aiTeams: TeamColor[] = []): Promise<Game | null> {
	const room = getRoom(code);
	if (room?.start(aiTeams)) {
		log.info({ service: "game", msg: "game started", room_code: room.code, language: room.language, ai_teams: aiTeams, turn: room.turn });
		await publish(room);
	}
	return room;
}

export function publicRoom({ code, language, status }: Game) {
	return { code, language, status };
}

export async function publish(room: Game) {
	saveAiBoard(room);
	const body = { code: room.code, views: { spymaster: room.viewFor("spymaster"), agent: room.viewFor("agent") } };
	await fetch(`${REALTIME_URL}/broadcast`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
		signal: AbortSignal.timeout(2000),
	})
		.then((res) => {
			if (!res.ok) {
				console.error("Realtime broadcast failed: HTTP", res.status);
				log.error({ service: "game", msg: "realtime broadcast failed", error: `HTTP ${res.status}`, room_code: room.code });
			}
		})
		.catch((error) => {
			console.error("Realtime broadcast failed:", error);
			log.error({ service: "game", msg: "realtime broadcast failed", error: String(error), room_code: room.code });
		});
}

export async function playMove(room: Game, seat: Seat, move: () => object) {
	try {
		const result = move();
		log.info({ service: "game", msg: "move played", room_code: room.code, seat, ...result });
		if (room.isOver()) {
			log.info({ service: "game", msg: "game over", room_code: room.code, winner: room.winner(), remaining_red: room.remaining("red"), remaining_blue: room.remaining("blue"), duration_ms: Date.now() - room.createdAt });
		}
		await publish(room);
		return NextResponse.json({ ...result, state: room.viewFor(audienceOf(seat)) });
	} catch (error) {
		if (error instanceof GameError) {
			log.info({ service: "game", msg: "move refused", room_code: room.code, seat, reason: error.message, status: error.status });
			return NextResponse.json({ error: error.message }, { status: error.status });
		}
		log.error({ service: "game", msg: "move failed", error: String(error), room_code: room.code, seat });
		throw error;
	}
}

// TODO: Temporary file until the board is sent straight to the AI
const CURRENT_ROOMS_DIR = path.join(process.cwd(), "current_rooms");

function saveAiBoard(room: Game) {
	mkdirSync(CURRENT_ROOMS_DIR, { recursive: true });
	writeFileSync(path.join(CURRENT_ROOMS_DIR, `${room.code}.json`), JSON.stringify(room.aiBoard(), null, 2));
}
