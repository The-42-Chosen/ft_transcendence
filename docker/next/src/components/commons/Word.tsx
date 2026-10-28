"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import CardLabel from "@/components/reusables/CardLabel";
import Modal from "@/components/reusables/Modal";
import { cardColorClasses } from "@/lib/lobby";
import type { CardColor } from "@/lib/words";

type WordProps = {
  text: string;
  readOnly?: boolean;
  roomCode?: string;
};

type GuessResult = {
  color?: CardColor;
  gameOver?: boolean;
  allWordsRevealed?: boolean;
  team?: string;
  len_red?: number;
  len_blue?: number;
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

export default function Word({ text, readOnly = false, roomCode }: WordProps) {
  const [selected, setSelected] = useState(false);
  const [color, setColor] = useState<CardColor | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [allWordsRevealed, setAllWordsRevealed] = useState(false);

  useEffect(() => {
    console.log("GameOver:", gameOver);
  }, [gameOver]);

  const locked = readOnly || color !== null;
  return (
    <article
      onClick={locked ? undefined : () => setSelected((prev) => !prev)}
      className={cn(
        "@container relative flex h-24 items-center justify-center overflow-hidden rounded-2xl bg-green-500 px-3 transition",
        locked ? "cursor-default select-none" : "word cursor-pointer",
        color ? cardColorClasses[color] : selected && "ring-4 ring-amber-400 ring-inset"
      )}
    >
      {selected && !color && roomCode && (
        <p
          className="absolute top-1.5 right-2 z-10"
          onClick={async (e) => {
            e.stopPropagation();
            const result = await checkWord(roomCode, text);
            setColor(result?.color ?? null);
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
          subtitle={color === "assassin" ? "Assassin found" : "All words revealed"}
          content={`The word ${text} has been discovered`}
          bContent="Close"
          onClose={() => setGameOver(false)}
        />
      )}
    </article>
  );
}
