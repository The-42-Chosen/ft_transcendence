"use client";

import { useClue } from "@/components/reusables/ClueContext";
import { useLanguage } from "@/i18n/LanguageContext";
import Button from "./Button";

type Parameters = {
    team: "red" | "blue" | "spectator";
};

export default function EndTurnButton({team}: Parameters) {
    const { clue, turn, endTurn, revealed } = useClue();
    const { t } = useLanguage();
    const g = t.game;
    const wr = t.waitingRoom;
    const isMyTurn = team === turn;

    return (
        <div className="mt-4 flex flex-col items-center gap-2">
            <Button
                onClick={endTurn}
                disabled={!isMyTurn || !clue || revealed !== null}
                variant="action"
            >
                {g.endTurn}
            </Button>
            <p className="font-agent text-xs text-black/50">
                {revealed
                    ? g.gameOver
                    : !isMyTurn
                    ? g.teamPlaying.replace("{team}", wr[turn])
                    : !clue
                        ? g.waitClue
                        : g.doneGuessing}
            </p>
        </div>
    );
}