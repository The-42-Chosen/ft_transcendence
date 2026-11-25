import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { Game, GameError, audienceOf } from "@/lib/game";
import { generateRoomCode, type Language, type Seat } from "@/lib/lobby";
import { log } from "@/lib/log";
import { PlayerError, getPlayer, requirePlayer, type SessionPlayer } from "@/lib/player";

// TODO: In-memory store until rooms are saved in Postgres.
const store = globalThis as unknown as { rooms?: Map<string, Game> };
const rooms = (store.rooms ??= new Map<string, Game>());

const REALTIME_URL = process.env.REALTIME_INTERNAL_URL ?? "http://realtime:3001";

export function createRoom(language: Language, host: SessionPlayer): Game {
	let code = generateRoomCode();
	while (rooms.has(code)) {
		code = generateRoomCode();
	}
	const room = new Game(code, language);
	room.join(host);
	rooms.set(code, room);
	log.info({ service: "game", msg: "room created", room_code: code, language, player_id: host.id });
	return room;
}

export function getRoom(code: string): Game | null {
	return rooms.get(code.trim().toUpperCase()) ?? null;
}

export async function startRoom(room: Game) {
	room.start();
	log.info({ service: "game", msg: "game started", room_code: room.code, language: room.language, ai_teams: room.aiTeams, turn: room.turn, players: room.players.size });
	await publish(room);
}

export async function currentSeat(room: Game): Promise<Seat> {
	return room.seatOf((await getPlayer())?.id);
}

type LobbyAction = (room: Game, player: SessionPlayer) => void | Promise<void>;

export async function lobbyRoute(code: string, action: LobbyAction, { hostOnly = false } = {}) {
	const room = getRoom(code);
	if (!room) {
		return NextResponse.json({ error: "Room not found" }, { status: 404 });
	}
	try {
		const player = await requirePlayer();
		if (!room.players.has(player.id)) {
			throw new GameError("Not in this room", 403);
		}
		if (hostOnly && !room.isHost(player.id)) {
			throw new GameError("Only the host can do this", 403);
		}
		await action(room, player);
		// TODO: Send the lobby through the realtime service instead of polling
		return NextResponse.json(room.lobbyView());
	} catch (error) {
		if (error instanceof GameError || error instanceof PlayerError) {
			log.info({ service: "game", msg: "lobby action refused", room_code: room.code, reason: error.message, status: error.status });
			return NextResponse.json({ error: error.message }, { status: error.status });
		}
		throw error;
	}
}

export function publicRoom({ code, language, status }: Game) {
	return { code, language, status };
}

export async function publish(room: Game) {
	saveAiBoard(room);
	const body = { code: room.code, views: { spymaster: room.viewFor("spymaster"), agent: room.viewFor("agent"), ai: room.aiBoard()} };

	try {
		const response = await fetch(`${REALTIME_URL}/broadcast`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
			// The realtime service waits for the AI before answering
			signal: AbortSignal.timeout(2000),
		});

		if (!response.ok) {
			console.error("Broadcast failed:", response.status);
			return;
		}

		// If the AI played, the realtime service sends back the views with its clue:
		// save it in the Game, or the next viewFor() / publish() would lose it.
		const answer = await response.json();
		const aiClue = answer?.views?.spymaster?.clue;
		if (aiClue && !room.clue) {
			room.giveClue(`${room.turn}-spymaster` as Seat, String(aiClue.word), Number(aiClue.count));
		}
	} catch (error) {
		console.error("Broadcast error:", error);
	}
}

export async function playMove(room: Game, seat: Seat, move: () => object) {
	try {
		const result = move();
		await publish(room);
		// Read the view after publish(): it now holds the AI clue if the AI played
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
