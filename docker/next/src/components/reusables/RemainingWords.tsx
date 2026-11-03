"use client";

import { useClue, type TeamTurn } from "@/components/reusables/ClueContext";
import { cn } from "@/lib/cn";

const teamClasses: Record<TeamTurn, string> = {
	red: "bg-(--color-brand-red) text-white",
	blue: "bg-(--color-brand-blue) text-white",
};

export default function RemainingWords() {
	const { remaining } = useClue();

	return (
		<div className="mt-6 flex flex-col gap-2 text-left">
			<p className="pl-4 text-xs font-semibold uppercase tracking-widest text-amber-900/70">
				Words left to find
			</p>
			<div aria-live="polite" className="grid grid-cols-2 gap-4">
				{(["red", "blue"] as TeamTurn[]).map((team) => (
					<div key={team} className={cn("flex items-center justify-between rounded-full px-6 py-2 shadow-md", teamClasses[team])}>
						<span className="font-display text-xl tracking-widest uppercase">Team {team}</span>
						<span aria-label={`${remaining[team]} words left for team ${team}`} className="text-2xl font-bold">{remaining[team]}</span>
					</div>
				))}
			</div>
		</div>
	);
}
