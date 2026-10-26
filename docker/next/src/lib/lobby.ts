import type { CardColor } from "@/lib/words";

export type TeamColor = "red" | "blue";

export type TeamRoster = {
	spymasters: string[];
	operatives: string[];
};

export type Teams = Record<TeamColor, TeamRoster>;

export const MAX_SPYMASTERS = 1;

export type Side = TeamColor | "spectator";

// Team the AI plays in, "none" when it did not take a seat
export type AiTeam = TeamColor | "none";

// TODO: Name of the AI player in the rosters, until it gets a real account
export const AI_PLAYER = "Agent Fmotte";

export type Role = "game_master" | "player" | "spectator";

export type Position = "spymaster" | "operative";

export type Seat = `${TeamColor}-${Position}` | "spectator";

const SEATS: Seat[] = ["red-spymaster", "red-operative", "blue-spymaster", "blue-operative", "spectator"];

export function parseSeat(value?: string | null): Seat {
	return SEATS.includes(value as Seat) ? (value as Seat) : "spectator";
}

export function seatBoard(seat: Seat): { type: "agent" | "spymaster" | "spectator"; team: Side } {
	if (seat === "spectator") {
		return { type: "spectator", team: "spectator" };
	}
	const [team, position] = seat.split("-") as [TeamColor, Position];
	return { type: position === "spymaster" ? "spymaster" : "agent", team };
}

export const ROLES: Role[] = ["game_master", "player", "spectator"];

export type Language = "en" | "fr" | "es";

// Flags shown in the language modal and the word list they pick
export const LANGUAGE_FLAGS: Record<string, Language> = {
	"🇬🇧": "en",
	"🇫🇷": "fr",
	"🇪🇦": "es",
};

// TODO: Need to be replaces once backend connected
export const defaultTeams: Teams = {
	red: {
		spymasters: [],
		operatives: ["Benjamin Suger", "Salome Brochard", "Fmotte", "Guillaume Pollastri", "Eric Pascual", "Tom Bagnara", "Tom Lorette"],
	},
	blue: {
		spymasters: [],
		operatives: ["Sashouille", "Coco"],
	},
};

// TODO: Need to be replaces once backend connected
export const defaultSpectators: string[] = ["Moulinette", "Norminette"];

// No 0/O or 1/I/L so the code is easy to read out loud
const ROOM_CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
export const ROOM_CODE_LENGTH = 6;

export function generateRoomCode(): string {
	const bytes = crypto.getRandomValues(new Uint8Array(ROOM_CODE_LENGTH));
	return Array.from(bytes, (b) => ROOM_CODE_ALPHABET[b % ROOM_CODE_ALPHABET.length]).join("");
}

export const teamStyles: Record<Side, { panel: string; label: string; slot: string }> = {
	red: {
		panel: "border-(--color-brand-red)/30 bg-(--color-brand-red)/5",
		label: "text-(--color-brand-red)",
		slot: "border-(--color-brand-red)/40 text-(--color-brand-red)/60 hover:bg-(--color-brand-red)/10",
	},
	blue: {
		panel: "border-(--color-brand-blue)/30 bg-(--color-brand-blue)/5",
		label: "text-(--color-brand-blue)",
		slot: "border-(--color-brand-blue)/40 text-(--color-brand-blue)/60 hover:bg-(--color-brand-blue)/10",
	},
	spectator: {
		panel: "border-amber-400/40 bg-amber-200/30",
		label: "text-amber-800",
		slot: "border-amber-500/40 text-amber-700/60 hover:bg-amber-500/10",
	},
};

export const cardColorClasses: Record<CardColor, string> = {
	red: "bg-(--color-brand-red) text-white",
	blue: "bg-(--color-brand-blue) text-white",
	neutral: "bg-amber-200 text-black",
	assassin: "bg-black text-white",
};
