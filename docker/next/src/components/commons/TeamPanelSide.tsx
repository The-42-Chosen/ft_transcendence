"use client";

import { useRef } from "react";
import TeamPanelBoard from "@/components/reusables/TeamPanelBoard";
import UserCard from "@/components/reusables/UserCard";
import { useLanguage } from "@/i18n/LanguageContext";
import { cn } from "@/lib/cn";

type Parameters = {
	redOperatives: string[];
	blueOperatives: string[];
	redSpymaster: string;
	blueSpymaster: string;
	className?: string;
};

// Desktop (xl): side column with the same look as the chat panel.
// Smaller screens: a button that opens the same teams in a bottom sheet (native <dialog>).
export default function TeamPanelSide({ redOperatives, blueOperatives, redSpymaster, blueSpymaster, className }: Parameters) {
	const { t } = useLanguage();
	const g = t.game;
	const sheet = useRef<HTMLDialogElement>(null);

	const players = [redSpymaster, ...redOperatives, blueSpymaster, ...blueOperatives].filter(Boolean);
	const teams = (
		<>
			<TeamPanelBoard team="red" teamOperatives={redOperatives} teamSpymaster={redSpymaster} />
			<TeamPanelBoard team="blue" teamOperatives={blueOperatives} teamSpymaster={blueSpymaster} />
		</>
	);

	return (
		<>
			<aside className={cn("hidden flex-col gap-4 rounded-2xl bg-amber-100 p-6 text-left xl:flex", className)}>
				<h2 className="font-display text-3xl tracking-widest uppercase text-amber-900">{g.teams}</h2>
				{teams}
			</aside>

			<button
				type="button"
				onClick={() => sheet.current?.showModal()}
				aria-haspopup="dialog"
				aria-label={g.showTeams}
				className="flex items-center gap-3 rounded-full bg-amber-100 py-2 pr-5 pl-2 text-left shadow-md transition active:scale-[0.98] xl:hidden"
			>
				<span className="flex -space-x-2">
					{players.slice(0, 4).map((name, i) => (
						<span key={`${name}-${i}`} className="rounded-full ring-2 ring-amber-100">
							<UserCard username={name} size={28} />
						</span>
					))}
				</span>
				<span className="flex-1 font-display text-xl tracking-widest uppercase text-amber-900">{g.teams}</span>
				<span className="text-sm text-amber-900/70">{g.playersCount.replace("{count}", String(players.length))}</span>
				<span aria-hidden className="text-amber-900/70">▴</span>
			</button>

			<dialog
				ref={sheet}
				aria-label={g.teams}
				// Click on the backdrop (outside the sheet) closes it
				onClick={(event) => event.target === event.currentTarget && sheet.current?.close()}
				className="mx-auto mt-auto mb-0 h-[80dvh] w-full max-w-xl flex-col gap-4 rounded-t-3xl bg-amber-100 p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-left shadow-2xl backdrop:bg-black/40 backdrop:backdrop-blur-sm open:flex xl:hidden"
			>
				<div aria-hidden className="mx-auto -mt-3 h-1.5 w-12 shrink-0 rounded-full bg-amber-900/20" />
				<div className="flex shrink-0 items-center justify-between">
					<h2 className="font-display text-3xl tracking-widest uppercase text-amber-900">{g.teams}</h2>
					<form method="dialog">
						<button className="rounded-full bg-amber-500 px-4 py-1.5 font-semibold text-white transition hover:bg-amber-600 active:bg-amber-700">
							{g.close}
						</button>
					</form>
				</div>
				<div className="flex min-h-0 flex-1 flex-col gap-4">{teams}</div>
			</dialog>
		</>
	);
}
