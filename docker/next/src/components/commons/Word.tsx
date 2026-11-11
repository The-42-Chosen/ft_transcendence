"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import CardLabel from "@/components/reusables/CardLabel";
import { useClue } from "@/components/reusables/ClueContext";
import { cardColorClasses } from "@/lib/lobby";

type WordProps = {
  text: string;
  readOnly?: boolean;
  index: number;
};

export default function Word({ text, readOnly = false, index }: WordProps) {
  const [selected, setSelected] = useState(false);
  const { seat, turn, cards, guess } = useClue();

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
            await guess(text);
            setSelected(false);
          }}
        >
          ✔
        </p>
      )}
      <CardLabel text={text}/>
    </article>
  );
}
