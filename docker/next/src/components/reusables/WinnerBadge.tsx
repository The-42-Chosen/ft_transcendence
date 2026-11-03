import { cn } from "@/lib/cn";
import type { TeamTurn } from "@/components/reusables/ClueContext";

type WinnerBadgeProps = {
  winner: TeamTurn;
};

const winnerStyles: Record<TeamTurn, string> = {
  red: "bg-(--color-brand-red) shadow-(--color-brand-red)/50",
  blue: "bg-(--color-brand-blue) shadow-(--color-brand-blue)/50",
};

export default function WinnerBadge({ winner }: WinnerBadgeProps) {
  return (
    <div className="my-6 flex flex-col items-center gap-2">
      <p className="font-agent text-sm uppercase tracking-[0.3em] text-black/60">Winner</p>
      <p
        className={cn(
          "animate-pulse rounded-full px-8 py-2 font-display text-3xl tracking-widest text-white uppercase shadow-xl motion-reduce:animate-none",
          winnerStyles[winner]
        )}
      >
        🏆 {winner} team 🏆
      </p>
    </div>
  );
}
