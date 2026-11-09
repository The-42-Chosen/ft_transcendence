import type { Language, Seat, TeamColor } from "@/lib/lobby";
import { pickCardColors, pickRandomWords, type CardColor } from "@/lib/words";

export type RoomStatus = "waiting" | "playing";

export type Clue = {
	word: string;
	count: number;
	team: TeamColor;
};

export type Audience = "spymaster" | "agent";

export function audienceOf(seat: Seat): Audience {
	return seat.endsWith("-spymaster") ? "spymaster" : "agent";
}

export type GameView = {
	version: number;
	turn: TeamColor;
	clue: Clue | null;
	cards: (CardColor | null)[];
	found: boolean[];
	remaining: Record<TeamColor, number>;
	gameOver: boolean;
	winner: TeamColor | null;
};

export class GameError extends Error {
	constructor(message: string, readonly status: number) {
		super(message);
	}
}

export class Game {
	status: RoomStatus = "waiting";
	readonly createdAt = Date.now();
	words: string[] = [];
	colors: CardColor[] = [];
	found: boolean[] = [];
	aiTeams: TeamColor[] = [];
	turn: TeamColor = "red";
	clue: Clue | null = null;
	version = 0;

	constructor(readonly code: string, readonly language: Language) {}

	start(aiTeams: TeamColor[]): boolean {
		if (this.status !== "waiting") {
			return false;
		}
		this.words = pickRandomWords(this.language);
		this.colors = pickCardColors();
		this.found = this.words.map(() => false);
		this.aiTeams = aiTeams;
		// The team with 9 cards starts
		this.turn = this.colors.filter((c) => c === "red").length > 8 ? "red" : "blue";
		this.status = "playing";
		this.version++;
		return true;
	}

	giveClue(seat: Seat, word: string, count: number): Clue {
		this.assertPlaying();
		if (seat !== `${this.turn}-spymaster`) {
			throw new GameError("Only the spymaster of the playing team can give a clue", 403);
		}
		if (this.clue) {
			throw new GameError("A clue was already given this turn", 409);
		}
		const clean = word.trim().toUpperCase();
		if (!/^[\p{L}'-]+$/u.test(clean)) {
			throw new GameError("The clue must be one word", 400);
		}
		if (this.words.some((w, i) => !this.found[i] && w.toUpperCase() === clean)) {
			throw new GameError("The clue cannot be a word of the board", 400);
		}
		if (!Number.isInteger(count) || count < 0 || count > 9) {
			throw new GameError("The number of words must be between 0 and 9", 400);
		}
		this.clue = { word: clean, count, team: this.turn };
		this.version++;
		return this.clue;
	}

	guess(seat: Seat, word: string): CardColor {
		this.assertPlaying();
		if (seat !== `${this.turn}-operative`) {
			throw new GameError("Only the operatives of the playing team can guess", 403);
		}
		// TODO: The AI spymaster does not send its clue yet, so its team can guess without one
		if (!this.clue && !this.aiTeams.includes(this.turn)) {
			throw new GameError("Wait for the clue of your spymaster", 409);
		}
		const i = this.words.findIndex((w) => w.toUpperCase() === word.trim().toUpperCase());
		if (i === -1 || this.found[i]) {
			throw new GameError("Word not on the board or already found", 409);
		}
		this.found[i] = true;
		if (this.colors[i] !== this.turn) {
			this.passTurn();
		}
		this.version++;
		return this.colors[i];
	}

	endTurn(seat: Seat): TeamColor {
		this.assertPlaying();
		if (seat !== `${this.turn}-operative`) {
			throw new GameError("Only the operatives of the playing team can end the turn", 403);
		}
		this.passTurn();
		this.version++;
		return this.turn;
	}

	remaining(color: CardColor): number {
		return this.colors.filter((c, i) => c === color && !this.found[i]).length;
	}

	isOver(): boolean {
		const assassinFound = this.colors.some((c, i) => c === "assassin" && this.found[i]);
		return this.status === "playing" && (assassinFound || this.remaining("red") === 0 || this.remaining("blue") === 0);
	}

	winner(): TeamColor | null {
		if (!this.isOver()) {
			return null;
		}
		if (this.remaining("red") === 0) {
			return "red";
		}
		if (this.remaining("blue") === 0) {
			return "blue";
		}
		// Assassin found
		return this.turn;
	}

	viewFor(audience: Audience): GameView {
		const over = this.isOver();
		// Once the game is over the whole board is shown to everybody
		const seesAll = audience === "spymaster" || over;
		return {
			version: this.version,
			turn: this.turn,
			clue: this.clue,
			cards: this.colors.map((c, i) => (seesAll || this.found[i] ? c : null)),
			found: [...this.found],
			remaining: { red: this.remaining("red"), blue: this.remaining("blue") },
			gameOver: over,
			winner: this.winner(),
		};
	}

	aiBoard() {
		const pick = (color: CardColor) => this.words.filter((_, i) => this.colors[i] === color && !this.found[i]).map((w) => w.toUpperCase());
		return {
			langue: this.language,
			list_red: pick("red"),
			len_red: pick("red").length,
			list_blue: pick("blue"),
			len_blue: pick("blue").length,
			list_neutral: pick("neutral"),
			agent_fmotte_teams: this.aiTeams,
			current_turn: this.turn,
			assassin_word: pick("assassin")[0] ?? null,
		};
	}

	private passTurn() {
		this.turn = this.turn === "red" ? "blue" : "red";
		this.clue = null;
	}

	private assertPlaying() {
		if (this.status !== "playing") {
			throw new GameError("Game not started", 409);
		}
		if (this.isOver()) {
			throw new GameError("Game is over", 409);
		}
	}
}
