"use client";

import { cn } from "@/lib/cn";
import { useLanguage } from "@/i18n/LanguageContext";

type Team = "red" | "blue" | "spectator";

const teamClasses: Record<Team, string> = {
    red: "bg-(--color-brand-red) text-white",
    blue: "bg-(--color-brand-blue) text-white",
    spectator: "bg-amber-200 text-black",
};

type Parameters = {
    team: Team;
};

export default function BoardTeam ({team}: Parameters) {
    const { t } = useLanguage();
    const wr = t.waitingRoom;

    return (
        <h3 className={cn("font-display text-2xl tracking-widest uppercase rounded-4xl py-1.5 mb-3", teamClasses[team])}>
            {wr.team.replace("{team}", wr[team])}
        </h3>
    );
}