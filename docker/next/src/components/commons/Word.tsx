"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

type WordProps = {
  text: string;
};


function checkWord(word: string): string[] {
  console.log("checking", word);
  return [];
}

export default function Word({ text }: WordProps) {
  const [selected, setSelected] = useState(false);
  const [checked, setChecked] = useState(false);
  return (
    <article
      onClick={() => setSelected((prev) => !prev)}
      className={cn(
        "word bg-green-500 relative cursor-pointer rounded-2xl p-8 text-center",
        selected ? "border-4 border-amber-400" : ""
      )}
    >
      {selected && (
        <p
          className="absolute top-1.5 right-2 z-10"
          onClick={(e) => {
            e.stopPropagation();
            checkWord(text);
            setChecked(true);
          }}
        >
          ✔
        </p>
      )}
      {text}
    </article>
  );
}
