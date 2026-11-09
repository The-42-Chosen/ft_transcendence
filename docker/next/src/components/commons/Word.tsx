"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import CardLabel from "@/components/reusables/CardLabel";
import { useClue } from "@/components/reusables/ClueContext";
import Modal from "@/components/reusables/Modal";
import WinnerBadge from "@/components/reusables/WinnerBadge";
import { cardColorClasses } from "@/lib/lobby";
import type { CardColor } from "@/lib/words";
import { useLanguage } from "@/i18n/LanguageContext";

type WordProps = {
  text: string;
  readOnly?: boolean;
  index: number;
};

export default function Word({ text, readOnly = false, index }: WordProps) {
  const [selected, setSelected] = useState(false);
  const [color, setColor] = useState<CardColor | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const { seat, turn, cards, guess, winner } = useClue();
  const { t } = useLanguage();
  const g = t.game;

  const shownColor = cards[index] ?? null;
  const [revealedOnLoad] = useState(shownColor !== null);
  const isMyTurn = seat === `${turn}-operative`;
  const locked = readOnly || shownColor !== null || !isMyTurn;

  return (
    <article
      onClick={locked ? undefined : () => setSelected((prev) => !prev)}
      className={cn(
        "@container relative flex h-24 items-center justify-center overflow-hidden rounded-2xl bg-green-500 px-3 transition",
        locked ? "cursor-default select-none" : "word cursor-pointer",
        shownColor ? cardColorClasses[shownColor] : selected && "ring-4 ring-amber-400 ring-inset",
        shownColor && !revealedOnLoad && "animate-flip-horizontal motion-reduce:animate-none"
      )}
    >
      {selected && !locked && (
        <p
          className="absolute top-1.5 right-2 z-10"
          onClick={async (e) => {
            e.stopPropagation();
            const result = await guess(text);
            setSelected(false);
            setColor(result.color ?? null);
            if (result.gameOver) {
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
          title={g.gameOverTitle}
          subtitle={color === "assassin" ? g.assassinFound : g.allWordsRevealed}
          content={g.wordDiscovered.replace("{word}", text)}
          bContent={g.close}
          onClose={() => setGameOver(false)}
        >
          {winner && <WinnerBadge winner={winner}/>}
        </Modal>
      )}
    </article>
  );
}
