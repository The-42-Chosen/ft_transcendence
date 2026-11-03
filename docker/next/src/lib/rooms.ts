import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { generateRoomCode, type Language, type TeamColor } from "@/lib/lobby";
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
	// Teams whose spymaster is the AI, it can play for both
	aiTeams: TeamColor[];
	// Team that has to play now
	turn: TeamColor;
};

// TODO: In-memory store until rooms are saved in Postgres.
const store = globalThis as unknown as { rooms?: Map<string, Room> };
const rooms = (store.rooms ??= new Map<string, Room>());

export function createRoom(language: Language): Room {
	let code = generateRoomCode();
	while (rooms.has(code)) {
		code = generateRoomCode();
	}
	const room: Room = { code, language, status: "waiting", createdAt: Date.now(), words: [], colors: [], found: [], aiTeams: [], turn: "red" };
	rooms.set(code, room);
	return room;
}

export function getRoom(code: string): Room | null {
	return rooms.get(code.trim().toUpperCase()) ?? null;
}

export function startRoom(code: string, aiTeams: TeamColor[] = []): Room | null {
	const room = getRoom(code);
	if (room && room.status === "waiting") {
		room.words = pickRandomWords(room.language);
		room.colors = pickCardColors();
		room.found = room.words.map(() => false);
		room.aiTeams = aiTeams;
		// The team with 9 cards starts
		room.turn = room.colors.filter((c) => c === "red").length > 8 ? "red" : "blue";
		room.status = "playing";
		saveAiBoard(room);
	}
	return room;
}

export function publicRoom({ code, language, status }: Room) {
	return { code, language, status };
}

export function aiBoard({ language, words, colors, found, aiTeams, turn }: Room) {
	const pick = (color: CardColor) => words.filter((_, i) => colors[i] === color && !found[i]).map((w) => w.toUpperCase());
	return {
		langue: language,
		list_red: pick("red"),
		len_red: pick("red").length,
		list_blue: pick("blue"),
		len_blue: pick("blue").length,
		list_neutral: pick("neutral"),
		agent_fmotte_teams: aiTeams,
		current_turn: turn,
		assassin_word: pick("assassin")[0] ?? null,
	};
}

// TODO: Temporary file until the board is sent straight to the AI
const CURRENT_ROOMS_DIR = path.join(process.cwd(), "current_rooms");

function saveAiBoard(room: Room) {
	mkdirSync(CURRENT_ROOMS_DIR, { recursive: true });
	writeFileSync(path.join(CURRENT_ROOMS_DIR, `${room.code}.json`), JSON.stringify(aiBoard(room), null, 2));
}

// The game ends when the assassin is found or a team found all its words
export function isGameOver({ colors, found }: Room): boolean {
	const left = (color: CardColor) => colors.some((c, i) => c === color && !found[i]);
	return colors.some((c, i) => c === "assassin" && found[i]) || !left("red") || !left("blue");
}

// Hands over to the other team, rewrites the room JSON and returns the new turn
export function endTurn(room: Room): TeamColor {
	room.turn = room.turn === "red" ? "blue" : "red";
	saveAiBoard(room);
	return room.turn;
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

export function gameState(room: Room) {
	const { len_red, len_blue } = aiBoard(room);
	const over = isGameOver(room);
	return { turn: room.turn, len_red, len_blue, gameOver: over, colors: over ? room.colors : undefined };
}
