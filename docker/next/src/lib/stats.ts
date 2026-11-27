import 'server-only';
import { db } from "@/prisma/db";
import type { Game } from "@/lib/game";
import type { TeamColor } from "@/lib/lobby";
import { log } from "@/lib/log";

export type PlayerStats = {
	userId: number;
	team: TeamColor;
	role: "spymaster" | "operative";
	won: boolean;
};

export type GameStats = {
	room: string;
	startedAt: string;
	durationMs: number;
	winner: TeamColor;
	assassinFound: boolean;
	wordsFound: Record<TeamColor, number>;
	players: PlayerStats[];
};

// TODO: Stats Module link
const STATS_URL = process.env.STATS_INTERNAL_URL;

// No stats for Guests and AI
export async function buildStats(room: Game): Promise<GameStats | null> {
	const winner = room.winner();
	if (!winner || room.startedAt === null) {
		return null;
	}
	const players: PlayerStats[] = [];
	for (const { player, seat } of room.lineup) {
		if (!player.email || seat === "spectator") {
			continue;
		}
		const user = await db.orm.public.User.where({ email: player.email }).first();
		if (!user) {
			continue;
		}
		const [team, role] = seat.split("-") as [TeamColor, PlayerStats["role"]];
		players.push({
			userId: user.id,
			team,
			role,
			won: team === winner,
		});
	}
	return {
		room: room.code,
		startedAt: new Date(room.startedAt).toISOString(),
		durationMs: Date.now() - room.startedAt,
		winner,
		assassinFound: room.assassinFound(),
		wordsFound: { red: room.wordsFound("red"), blue: room.wordsFound("blue") },
		players,
	};
}

export async function sendStats(room: Game) {
	try {
		const stats = await buildStats(room);
		if (!stats) {
			return;
		}
		if (!STATS_URL) {
			log.info({ service: "game", msg: "game stats (no STATS_INTERNAL_URL, not sent)", room_code: room.code, stats: JSON.stringify(stats) });
			return;
		}
		const response = await fetch(STATS_URL, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(stats),
			signal: AbortSignal.timeout(5000),
		});
		if (!response.ok) {
			log.error({ service: "game", msg: "stats refused", room_code: room.code, status: response.status });
			return;
		}
		log.info({ service: "game", msg: "stats sent", room_code: room.code, players: stats.players.length });
	} catch (error) {
		log.error({ service: "game", msg: "stats failed", room_code: room.code, error: String(error) });
	}
}
