"use client";

import { cn } from "@/lib/cn";
import type { TeamTurn } from "@/components/reusables/ClueContext";
import { useLanguage } from "@/i18n/LanguageContext";

type WinnerBadgeProps = {
  winner: TeamTurn;
};

const winnerStyles: Record<TeamTurn, string> = {
  red: "bg-(--color-brand-red) shadow-(--color-brand-red)/50",
  blue: "bg-(--color-brand-blue) shadow-(--color-brand-blue)/50",
};

function fitFontSize(text: string) {
  const em = 0.5 * Math.max(text.length, 1) + 2.6;
  return `min(1.875rem, calc((100cqi - 3rem) / ${em.toFixed(1)}))`;
}

export default function WinnerBadge({ winner }: WinnerBadgeProps) {
  const { t } = useLanguage();
  const g = t.game;
  const wr = t.waitingRoom;
  const teamName = wr.team.replace("{team}", wr[winner]);

  return (
    <div className="@container my-6 flex w-full flex-col items-center gap-2">
      <p className="font-agent text-sm uppercase tracking-[0.3em] text-black/60">{g.winner}</p>
      <p
        className={cn(
          "max-w-full animate-pulse whitespace-nowrap rounded-full px-6 py-2 font-display tracking-widest text-white uppercase shadow-xl motion-reduce:animate-none",
          winnerStyles[winner]
        )}
        style={{ fontSize: fitFontSize(teamName) }}
      >
        🏆 {teamName} 🏆
      </p>
    </div>
  );
}