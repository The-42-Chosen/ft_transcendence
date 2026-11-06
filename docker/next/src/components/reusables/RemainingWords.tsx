"use client";

import { useClue, type TeamTurn } from "@/components/reusables/ClueContext";
import { useLanguage } from "@/i18n/LanguageContext";
import { cn } from "@/lib/cn";

const teamClasses: Record<TeamTurn, string> = {
	red: "bg-(--color-brand-red) text-white",
	blue: "bg-(--color-brand-blue) text-white",
};

export default function RemainingWords() {
	const { remaining } = useClue();
	const { t } = useLanguage();
	const g = t.game;
	const wr = t.waitingRoom;

	return (
		<div className="mt-6 flex flex-col gap-2 text-left">
			<p className="pl-4 text-xs font-semibold uppercase tracking-widest text-amber-900/70">
				{g.wordsLeft}
			</p>
			<div aria-live="polite" className="grid grid-cols-2 gap-4">
				{(["red", "blue"] as TeamTurn[]).map((team) => (
					<div key={team} className={cn("flex items-center justify-between rounded-full px-6 py-2 shadow-md", teamClasses[team])}>
						<span className="font-display text-xl tracking-widest uppercase">
							{wr.team.replace("{team}", wr[team])}
						</span>
						<span
							aria-label={g.wordsLeftAria.replace("{count}", String(remaining[team])).replace("{team}", wr[team])}
							className="text-2xl font-bold"
						>
							{remaining[team]}
						</span>
					</div>
				))}
			</div>
		</div>
	);
}