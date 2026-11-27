"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import TeamPanel from '@/components/reusables/TeamPanel';
import RoleSection from '@/components/reusables/RoleSection';
import RoomCode from '@/components/reusables/RoomCode';
import Button from './Button';
import { cn } from '@/lib/cn';
import type { LobbyView } from '@/lib/game';
import { AI_PLAYER, TEAM_COLORS, teamStyles, type Seat, type TeamColor, type Teams } from '@/lib/lobby';
import { useLanguage } from '@/i18n/LanguageContext';

type Parameters = {
    roomCode: string;
    meId: string;
    initialLobby: LobbyView;
}

// TODO: Replace polling with the "lobby" event of the realtime service
const POLL_INTERVAL = 2000;

const aiButtonClass = "rounded-full border-2 border-amber-400 bg-white/70 font-agent text-sm text-amber-900 hover:bg-amber-200 active:bg-amber-300";
const aiTeamButtonClass: Record<TeamColor, string> = {
    red: "bg-(--color-brand-red) hover:bg-(--color-brand-red-dark) active:bg-(--color-brand-red-dark)",
    blue: "bg-(--color-brand-blue) hover:bg-(--color-brand-blue-dark) active:bg-(--color-brand-blue-dark)",
};

export default function WaitingRoom({ roomCode, meId, initialLobby }: Parameters) {
    const router = useRouter();
    const { t } = useLanguage();
    const wr = t.waitingRoom;

    const [lobby, setLobby] = useState<LobbyView>(initialLobby);
    const [starting, setStarting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [choosingAiTeam, setChoosingAiTeam] = useState(false);

    const me = lobby.players.find((p) => p.id === meId);
    const seat: Seat = me?.seat ?? "spectator";
    const isHost = lobby.hostId === meId;
    const others = lobby.players.filter((p) => p.id !== meId);
    const namesAt = (s: Seat) => others.filter((p) => p.seat === s).map((p) => p.name);
    const teams = Object.fromEntries(TEAM_COLORS.map((team) => [team, {
        spymasters: [...(lobby.aiTeams.includes(team) ? [AI_PLAYER] : []), ...namesAt(`${team}-spymaster`)],
        operatives: namesAt(`${team}-operative`),
    }])) as Teams;
    const hasSpymaster = (team: TeamColor) => teams[team].spymasters.length > 0 || seat === `${team}-spymaster`;
    const aiFreeTeams = TEAM_COLORS.filter((team) => !lobby.aiTeams.includes(team));

    function applyLobby(next: LobbyView) {
        setLobby((current) => (next.version >= current.version ? next : current));
    }

    useEffect(() => {
        const id = setInterval(async () => {
            const res = await fetch(`/api/rooms/${roomCode}/lobby`, { cache: "no-store" }).catch(() => null);
            if (res?.ok) {
                applyLobby(await res.json());
            } else if (res?.status === 404) {
                clearInterval(id);
                router.replace("/");
            }
        }, POLL_INTERVAL);
        return () => clearInterval(id);
    }, [roomCode, router]);

    useEffect(() => {
        if (lobby.status === "playing") {
            router.push(`/room/${roomCode}/game`);
        }
    }, [lobby.status, roomCode, router]);

    async function send(action: string, body?: object): Promise<boolean> {
        setError(null);
        const res = await fetch(`/api/rooms/${roomCode}/${action}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body ?? {}),
        }).catch(() => null);
        const data = res ? await res.json().catch(() => null) : null;
        if (!res?.ok || !data) {
            setError(action === "start" ? wr.errorStart : wr.errorAction);
            return false;
        }
        applyLobby(data);
        return true;
    }

    function pickSeat(next: Seat) {
        void send("seat", { seat: next });
    }

    function addAi(team: TeamColor) {
        void send("ai", { aiTeams: [...lobby.aiTeams, team] });
        setChoosingAiTeam(false);
    }

    function removeAi(team: TeamColor) {
        void send("ai", { aiTeams: lobby.aiTeams.filter((t) => t !== team) });
    }

    function shuffleSeats() {
        void send("shuffle");
        setChoosingAiTeam(false);
    }

    async function startGame() {
        setStarting(true);
        if (!(await send("start"))) {
            setStarting(false);
        }
    }

    return (
        <section className="page-wide my-4 bg-amber-100 rounded-2xl p-6 shadow-xl">
            <h2 className="mb-4 font-display text-5xl text-black tracking-wide">{wr.title}</h2>
            <RoomCode code={roomCode}/>
            <article className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <TeamPanel team="red" roster={teams.red} seat={seat} playerName={me?.name} onJoin={pickSeat}/>
                <TeamPanel team="blue" roster={teams.blue} seat={seat} playerName={me?.name} onJoin={pickSeat}/>
            </article>
            <aside className={cn("mt-4 rounded-2xl border-2 p-4 text-left", teamStyles.spectator.panel)}>
                <RoleSection
                    title={wr.spectators}
                    team="spectator"
                    players={namesAt("spectator")}
                    isYou={seat === "spectator"}
                    playerName={me?.name}
                    onJoin={() => pickSeat("spectator")}
                />
            </aside>
            <footer className="mt-6 flex flex-col items-center gap-2">
                {isHost ? (
                    <>
                        <Button variant="secondary" className={aiButtonClass} onClick={shuffleSeats}>
                            {wr.shuffle}
                        </Button>
                        {lobby.aiTeams.length > 0 && (
                            <div className="flex flex-wrap items-center justify-center gap-2">
                                {lobby.aiTeams.map((team) => (
                                    <Button key={team} variant="secondary" className={aiButtonClass} onClick={() => removeAi(team)}>
                                        {wr.removeAi.replace("{name}", AI_PLAYER).replace("{team}", wr[team])}
                                    </Button>
                                ))}
                            </div>
                        )}
                        {aiFreeTeams.length === 0 ? null : choosingAiTeam ? (
                            <div className="flex items-center gap-2 font-agent text-sm">
                                <span className="text-amber-900">{wr.addAiTo.replace("{name}", AI_PLAYER)}</span>
                                {aiFreeTeams.map((team) => (
                                    <Button key={team} variant="secondary" className={cn("rounded-full border-0 font-display text-lg tracking-widest text-white capitalize", aiTeamButtonClass[team])} disabled={hasSpymaster(team)} onClick={() => addAi(team)}>
                                        {wr[team]}
                                    </Button>
                                ))}
                                <Button variant="secondary" className={aiButtonClass} onClick={() => setChoosingAiTeam(false)}>{wr.cancel}</Button>
                            </div>
                        ) : (
                            <Button variant="secondary" className={aiButtonClass} onClick={() => setChoosingAiTeam(true)}>
                                {wr.addAi.replace("{name}", AI_PLAYER)}
                            </Button>
                        )}
                        <Button variant="action" disabled={!lobby.canStart || starting} onClick={startGame}>
                            {wr.play}
                        </Button>
                        {error ? (
                            <p role="alert" className="font-agent text-xs text-(--color-brand-red)">{error}</p>
                        ) : !lobby.canStart && (
                            <p className="font-agent text-xs text-black/50">{wr.needRoles}</p>
                        )}
                    </>
                ) : (
                    <>
                        <p className="font-agent text-sm text-black/50">
                            {seat !== "spectator" ? wr.waitingMaster : wr.pickWhileReady}
                        </p>
                        {error && (
                            <p role="alert" className="font-agent text-xs text-(--color-brand-red)">{error}</p>
                        )}
                    </>
                )}
            </footer>
        </section>
    );
}
