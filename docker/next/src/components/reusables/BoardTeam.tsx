"use client";

import { cn } from "@/lib/cn";
import { useLanguage } from "@/i18n/LanguageContext";
import { usePlayerName } from "@/lib/usePlayerName";

type Team = "red" | "blue" | "spectator";

const teamClasses: Record<Team, string> = {
    red: "bg-(--color-brand-red) text-white",
    blue: "bg-(--color-brand-blue) text-white",
    spectator: "bg-amber-200 text-black",
};

type Parameters = {
    team: Team;
    display: "lobby" | "board";
};

export default function BoardTeam({ display, team }: Parameters) {
    const { t } = useLanguage();
    const wr = t.waitingRoom;
    const playerName = usePlayerName();

    return (                  
        <>
            {display === "lobby" && (
                <p className={cn("font-display text-2xl tracking-widest uppercase rounded-4xl py-1.5 mb-3", teamClasses[team])}>
                    {wr.team.replace("{team}", wr[team])}
                </p>
            )}
            {
                display === "board" && (
                    <div className={cn("flex justify-around font-display text-2xl tracking-widest uppercase rounded-4xl py-1.5 mb-3", teamClasses[team])}>
                        <p>{playerName}</p>
                        <p>
                            {wr.team.replace("{team}", wr[team])}
                        </p>
                    </div>
                )
            }
        </>
    );
}