"use client";

import { useLanguage } from "@/i18n/LanguageContext";
import { cn } from "@/lib/cn";
import UserCard from "@/components/reusables/UserCard";
import { teamStyles, type TeamColor } from "@/lib/lobby";

type Parameters = {
	team: TeamColor;
	teamOperatives: string[];
	teamSpymaster: string;
};

function PlayerChip({ name, team }: { name: string; team: TeamColor }) {
	return (
		<li className="flex w-fit max-w-full items-center gap-2 rounded-full border border-amber-200 bg-white py-1 pr-3 pl-1 shadow-sm">
			<UserCard username={name} size={32} />
			<span className={cn("truncate font-agent text-sm", teamStyles[team].label)} title={name}>{name}</span>
		</li>
	);
}

export default function TeamPanelBoard({ team, teamOperatives, teamSpymaster }: Parameters) {
	const { t } = useLanguage();
	const wr = t.waitingRoom;
	const label = "mb-1.5 text-xs font-semibold uppercase tracking-widest text-amber-900/70";

	return (
		<section className="flex min-h-48 max-h-96 flex-1 basis-0 flex-col rounded-xl bg-amber-50 p-4 text-sm">
			<h3 className={cn("mb-2 shrink-0 font-display text-xl tracking-widest uppercase", teamStyles[team].label)}>
				{wr.team.replace("{team}", wr[team])}
			</h3>
			<div className="min-h-0 flex-1 overflow-y-auto pr-1">
				<p className={label}>{wr.spymasters}</p>
				<ul className="mb-3 flex flex-col gap-1.5">
					{teamSpymaster ? <PlayerChip name={teamSpymaster} team={team} /> : <li className="text-amber-900/50">—</li>}
				</ul>
				<p className={label}>{wr.operatives}</p>
				<ul className="flex flex-col gap-1.5">
					{teamOperatives.map((operative, index) => (
						<PlayerChip key={`${operative}-${index}`} name={operative} team={team} />
					))}
				</ul>
			</div>
		</section>
	);
}
