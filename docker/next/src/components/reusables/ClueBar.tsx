"use client";

import { useClue } from "@/components/reusables/ClueContext";

export default function ClueBar() {
  const { clue } = useClue();

  return (
    <div className="mt-6 flex flex-col gap-2 text-left">
      <p className="pl-4 text-xs font-semibold uppercase tracking-widest text-amber-900/70">
        Current clue
      </p>
      <div
        aria-live="polite"
        className="flex min-h-15 items-center gap-2 rounded-full bg-white/70 p-2 shadow-inner ring-1 ring-amber-900/10"
      >
        {clue ? (
          <>
            <span className="min-w-0 flex-1 truncate px-4 text-lg font-semibold uppercase tracking-wide text-amber-950">
              {clue.word}
            </span>
            <span
              aria-label={`${clue.count} words`}
              className="flex h-11 w-16 items-center justify-center rounded-full bg-amber-500 text-lg font-bold text-white"
            >
              {clue.count}
            </span>
          </>
        ) : (
          <span className="px-4 italic text-amber-900/40">Waiting for the spymaster…</span>
        )}
      </div>
    </div>
  );
}
