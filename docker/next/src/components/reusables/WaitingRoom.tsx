"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import TeamPanel from '@/components/reusables/TeamPanel';
import RoleSection from '@/components/reusables/RoleSection';
import RoomCode from '@/components/reusables/RoomCode';
import Button from './Button';
import { cn } from '@/lib/cn';
import { AI_PLAYER, TEAM_COLORS, defaultSpectators, defaultTeams, teamStyles, type Role, type Seat, type TeamColor, type Teams } from '@/lib/lobby';

type Parameters = {
	role: Role;
	roomCode: string;
	teams?: Teams;
	spectators?: string[];
}

const POLL_INTERVAL = 2000;

const aiButtonClass = "rounded-full border-2 border-amber-400 bg-white/70 font-agent text-sm text-amber-900 hover:bg-amber-200 active:bg-amber-300";
const aiTeamButtonClass: Record<TeamColor, string> = {
	red: "bg-(--color-brand-red) hover:bg-(--color-brand-red-dark) active:bg-(--color-brand-red-dark)",
	blue: "bg-(--color-brand-blue) hover:bg-(--color-brand-blue-dark) active:bg-(--color-brand-blue-dark)",
};

export default function WaitingRoom({role, teams: humanTeams = defaultTeams, spectators = defaultSpectators, roomCode}: Parameters) {
	const router = useRouter();
	const [seat, setSeat] = useState<Seat | null>(role === "spectator" ? "spectator" : null);
	const [starting, setStarting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [aiTeams, setAiTeams] = useState<TeamColor[]>([]);
	const [choosingAiTeam, setChoosingAiTeam] = useState(false);
	// TODO: Only the game master sees the AI until the rosters come from the backend
	const teams = aiTeams.reduce((acc, team) => ({
		...acc,
		[team]: { ...acc[team], spymasters: [...acc[team].spymasters, AI_PLAYER] },
	}), humanTeams);
	const hasSpymaster = (team: TeamColor) => teams[team].spymasters.length > 0 || seat === `${team}-spymaster`;
	const canStart = hasSpymaster("red") && hasSpymaster("blue");
	// Teams the AI can still take the spymaster seat in
	const aiFreeTeams = TEAM_COLORS.filter((team) => !aiTeams.includes(team));
	const onJoin = role === "spectator" ? undefined : setSeat;
	const gameUrl = `/room/${roomCode}/game?seat=${seat ?? "spectator"}`;

	// TODO: Replace polling with a websocket once the backend is ready
	useEffect(() => {
		if (role === "game_master") {
			return;
		}
		const id = setInterval(async () => {
			const res = await fetch(`/api/rooms/${roomCode}`).catch(() => null);
			const room = res?.ok ? await res.json() : null;
			if (room?.status === "playing") {
				router.push(gameUrl);
			}
		}, POLL_INTERVAL);
		return () => clearInterval(id);
	}, [role, roomCode, gameUrl, router]);

	function addAi(team: TeamColor) {
		setAiTeams((current) => TEAM_COLORS.filter((t) => t === team || current.includes(t)));
		setChoosingAiTeam(false);
	}

	function removeAi(team: TeamColor) {
		setAiTeams((current) => current.filter((t) => t !== team));
	}

	async function startGame() {
		setStarting(true);
		setError(null);
		const res = await fetch(`/api/rooms/${roomCode}/start`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ aiTeams }),
		}).catch(() => null);
		if (!res?.ok) {
			setError("Could not start the game, try again");
			setStarting(false);
			return;
		}
		router.push(gameUrl);
	}

	return (
			<section className="bg-amber-100 rounded-2xl p-6 m-4 shadow-xl">
				<h2 className="mb-4 font-display text-5xl tracking-wide">Waiting Room</h2>
				<RoomCode code={roomCode}/>
				<article className="grid grid-cols-1 gap-4 md:grid-cols-2">
					<TeamPanel team="red" roster={teams.red} seat={seat} onJoin={onJoin}/>
					<TeamPanel team="blue" roster={teams.blue} seat={seat} onJoin={onJoin}/>
				</article>
				<aside className={cn("mt-4 rounded-2xl border-2 p-4 text-left", teamStyles.spectator.panel)}>
					<RoleSection
						title="Spectators"
						team="spectator"
						players={spectators}
						isYou={seat === "spectator"}
						onJoin={onJoin && (() => onJoin("spectator"))}
					/>
				</aside>
				<footer className="mt-6 flex flex-col items-center gap-2">
					{role === "game_master" ? (
						<>
							{aiTeams.length > 0 && (
								<div className="flex flex-wrap items-center justify-center gap-2">
									{aiTeams.map((team) => (
										<Button key={team} variant="secondary" className={aiButtonClass} onClick={() => removeAi(team)}>
											Remove AI {AI_PLAYER} from {team}
										</Button>
									))}
								</div>
							)}
							{aiFreeTeams.length === 0 ? null : choosingAiTeam ? (
								<div className="flex items-center gap-2 font-agent text-sm">
									<span className="text-amber-900">Add AI {AI_PLAYER} to</span>
									{aiFreeTeams.map((team) => (
										<Button key={team} variant="secondary" className={cn("rounded-full border-0 font-display text-lg tracking-widest text-white capitalize", aiTeamButtonClass[team])} disabled={hasSpymaster(team)} onClick={() => addAi(team)}>
											{team}
										</Button>
									))}
									<Button variant="secondary" className={aiButtonClass} onClick={() => setChoosingAiTeam(false)}>Cancel</Button>
								</div>
							) : (
								<Button variant="secondary" className={aiButtonClass} onClick={() => setChoosingAiTeam(true)}>
									Add AI {AI_PLAYER}
								</Button>
							)}
							<Button variant="action" disabled={!canStart || !seat || starting} onClick={startGame}>
								Play
							</Button>
							{error ? (
								<p role="alert" className="font-agent text-xs text-(--color-brand-red)">{error}</p>
							) : !seat ? (
								<p className="font-agent text-xs text-black/50">Pick your seat first</p>
							) : !canStart && (
								<p className="font-agent text-xs text-black/50">Each team needs a spymaster to start</p>
							)}
						</>
					) : (
						<p className="font-agent text-sm text-black/50">
							{seat ? "Waiting for the game master to start the game…" : "Pick your seat while the game master gets ready"}
						</p>
					)}
				</footer>
			</section>
	)
}
