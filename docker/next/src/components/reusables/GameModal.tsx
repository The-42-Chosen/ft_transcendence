"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import Button from "./Button";

type Items = {
  title: string;
  text1: string;
  text2: string;
  text3: string;
  action?: string;
  onConfirm?: (choice: string) => void;
  pending?: boolean;
  error?: string | null;
};

export default function GameModal ({title, text1, text2, text3, action = "Continue", onConfirm, pending = false, error}: Items) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="bg-amber-100 p-6 m-4 rounded-2xl shadow-xl">
      <h3 className="mb-5 font-display text-4xl tracking-wide">{title}</h3>
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[text1, text2, text3].map((text) => (
          <li key={text}>
            <button
              type="button"
              onClick={() => setSelected(text)}
              aria-pressed={selected === text}
              className={cn(
                "w-full rounded-2xl border-2 px-4 py-4 font-display text-2xl tracking-wider shadow-md transition",
                "hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0",
                selected === text
                  ? "border-amber-600 bg-amber-500 text-white hover:bg-amber-500"
                  : "border-amber-300 bg-white/70 text-amber-900 hover:border-amber-500 hover:bg-white"
              )}
            >
              {text}
            </button>
          </li>
        ))}
      </ul>
      <footer className="mt-6 flex flex-col items-center gap-2">
        <Button variant="action" disabled={!selected || pending} onClick={() => selected && onConfirm?.(selected)}>
          {action}
        </Button>
        {error ? (
          <p role="alert" className="font-agent text-xs text-(--color-brand-red)">{error}</p>
        ) : !selected && (
          <p className="font-agent text-xs text-black/50">Pick an option first</p>
        )}
      </footer>
    </div>
  );
}
