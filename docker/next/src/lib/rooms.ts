import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { generateRoomCode, type AiTeam, type Language } from "@/lib/lobby";
import { pickCardColors, pickRandomWords, type CardColor } from "@/lib/words";

export type RoomStatus = "waiting" | "playing";

export type Room = {
	code: string;
	language: Language;
	status: RoomStatus;
	createdAt: number;
	words: string[];
	colors: CardColor[];
	found: boolean[];
	aiTeam: AiTeam;
};

// TODO: In-memory store until rooms are saved in Postgres.
const store = globalThis as unknown as { rooms?: Map<string, Room> };
const rooms = (store.rooms ??= new Map<string, Room>());

export function createRoom(language: Language): Room {
	let code = generateRoomCode();
	while (rooms.has(code)) {
		code = generateRoomCode();
	}
	const room: Room = { code, language, status: "waiting", createdAt: Date.now(), words: [], colors: [], found: [], aiTeam: "none" };
	rooms.set(code, room);
	return room;
}

export function getRoom(code: string): Room | null {
	return rooms.get(code.trim().toUpperCase()) ?? null;
}

export function startRoom(code: string, aiTeam: AiTeam = "none"): Room | null {
	const room = getRoom(code);
	if (room && room.status === "waiting") {
		room.words = pickRandomWords(room.language);
		room.colors = pickCardColors();
		room.found = room.words.map(() => false);
		room.aiTeam = aiTeam;
		room.status = "playing";
		saveAiBoard(room);
	}
	return room;
}

export function publicRoom({ code, language, status }: Room) {
	return { code, language, status };
}

// assassin_word must stay the last key for the AI
// Found words are left out so the AI only sees what is still on the board
export function aiBoard({ language, words, colors, found, aiTeam }: Room) {
	const pick = (color: CardColor) => words.filter((_, i) => colors[i] === color && !found[i]).map((w) => w.toUpperCase());
	return {
		langue: language,
		list_red: pick("red"),
		list_blue: pick("blue"),
		list_neutral: pick("neutral"),
		agent_fmotte_team: aiTeam,
		assassin_word: pick("assassin")[0] ?? null,
	};
}

// TODO: Temporary file until the board is sent straight to the AI
const CURRENT_ROOMS_DIR = path.join(process.cwd(), "current_rooms");

function saveAiBoard(room: Room) {
	mkdirSync(CURRENT_ROOMS_DIR, { recursive: true });
	writeFileSync(path.join(CURRENT_ROOMS_DIR, `${room.code}.json`), JSON.stringify(aiBoard(room), null, 2));
}

// Marks a word as found, rewrites the room JSON and returns the color the word had
export function revealWord(room: Room, word: string): CardColor | null {
	const i = room.words.findIndex((w) => w.toUpperCase() === word.trim().toUpperCase());
	if (i === -1 || room.found[i]) {
		return null;
	}
	room.found[i] = true;
	saveAiBoard(room);
	return room.colors[i];
}
