"use client";

import { useClue } from "@/components/reusables/ClueContext";
import Button from "./Button";

type Parameters = {
	team: "red" | "blue" | "spectator";
};

export default function EndTurnButton({team}: Parameters) {
	const { clue, turn, endTurn } = useClue();
	const isMyTurn = team === turn;

	return (
		<div className="mt-4 flex flex-col items-center gap-2">
			<Button
				onClick={endTurn}
				disabled={!isMyTurn || !clue}
				variant="action"
			>
				End turn
			</Button>
			<p className="font-agent text-xs text-black/50">
				{!isMyTurn
					? `Team ${turn} is playing…`
					: !clue
						? "Wait for your spymaster's clue"
						: "Done guessing? Hand over to the other team"}
			</p>
		</div>
	);
}
