"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import CardLabel from "@/components/reusables/CardLabel";
import { useClue, type TeamTurn } from "@/components/reusables/ClueContext";
import Modal from "@/components/reusables/Modal";
import { cardColorClasses } from "@/lib/lobby";
import type { CardColor } from "@/lib/words";

type WordProps = {
  text: string;
  readOnly?: boolean;
  roomCode?: string;
  // Position on the board, to find its color once the game is over
  index: number;
};

type GuessResult = {
  color?: CardColor;
  gameOver?: boolean;
  allWordsRevealed?: boolean;
  team?: string;
  len_red?: number;
  len_blue?: number;
  turn?: TeamTurn;
  colors?: CardColor[];
};

function isGameOver(result: GuessResult) {
  return (
    String(result.color).toLowerCase() === "assassin" ||
    result.len_red === 0 ||
    result.len_blue === 0 ||
    result.gameOver === true ||
    result.allWordsRevealed === true
  );
}

async function checkWord(roomCode: string, word: string): Promise<GuessResult | null> {
  const res = await fetch(`/api/rooms/${roomCode}/guess`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ word }),
  }).catch(() => null);
  return res?.ok ? await res.json() : null;
}

export default function Word({ text, readOnly = false, roomCode, index }: WordProps) {
  const [selected, setSelected] = useState(false);
  const [color, setColor] = useState<CardColor | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [allWordsRevealed, setAllWordsRevealed] = useState(false);
  const { syncTurn, setRemaining, revealed, setRevealed } = useClue();

  const shownColor = color ?? revealed?.[index] ?? null;
  const locked = readOnly || shownColor !== null;
  return (
    <article
      onClick={locked ? undefined : () => setSelected((prev) => !prev)}
      className={cn(
        "@container relative flex h-24 items-center justify-center overflow-hidden rounded-2xl bg-green-500 px-3 transition",
        locked ? "cursor-default select-none" : "word cursor-pointer",
        shownColor ? cardColorClasses[shownColor] : selected && "ring-4 ring-amber-400 ring-inset",
        color && "animate-flip-horizontal motion-reduce:animate-none"
      )}
    >
      {selected && !shownColor && roomCode && (
        <p
          className="absolute top-1.5 right-2 z-10"
          onClick={async (e) => {
            e.stopPropagation();
            const result = await checkWord(roomCode, text);
            setColor(result?.color ?? null);
            if (result?.len_red !== undefined && result.len_blue !== undefined) {
              setRemaining({ red: result.len_red, blue: result.len_blue });
            }
            if (result?.colors) {
              setRevealed(result.colors);
            }
            if (result?.turn) {
              syncTurn(result.turn);
            }
            if (result && isGameOver(result)) {
              setGameOver(true);
            }
          }}
        >
          ✔
        </p>
      )}
      <CardLabel text={text}/>
      {gameOver && (
        <Modal
          title="Game Over"
          subtitle={color === "assassin" ? "Assassin word found" : "All words revealed"}
          content={`The word ${text} has been discovered`}
          bContent="Close"
          onClose={() => setGameOver(false)}
        />
      )}
    </article>
  );
}
