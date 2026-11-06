"use client";

import { useId, type FormEvent } from "react";
import { useClue } from "@/components/reusables/ClueContext";
import { useLanguage } from "@/i18n/LanguageContext";

export default function ClueForm() {
  const clueId = useId();
  const { setClue } = useClue();
  const { t } = useLanguage();
  const g = t.game;

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setClue({ word: String(data.get("clue")).trim(), count: Number(data.get("count")) });
    e.currentTarget.reset();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-2 text-left">
      <label htmlFor={clueId} className="pl-4 text-xs font-semibold uppercase tracking-widest text-amber-900/70">
        {g.giveClue}
      </label>
      <div className="flex items-center gap-2 rounded-full bg-white p-2 shadow-md ring-1 ring-amber-900/10 focus-within:ring-2 focus-within:ring-amber-500">
        <input
          id={clueId}
          type="text"
          name="clue"
          required
          autoComplete="off"
          placeholder={g.oneWord}
          className="min-w-0 flex-1 bg-transparent px-4 py-2 text-lg font-semibold uppercase tracking-wide text-amber-950 placeholder:normal-case placeholder:font-normal placeholder:text-amber-900/40 focus:outline-none"
        />
        <select
          name="count"
          defaultValue="1"
          aria-label={g.numberOfWords}
          className="h-11 w-16 cursor-pointer rounded-full bg-amber-100 text-center text-lg font-bold text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          {Array.from({ length: 10 }, (_, n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
        <button
          type="submit"
          className="h-11 rounded-full bg-amber-500 px-6 font-semibold text-white transition-colors hover:bg-amber-600 active:bg-amber-700"
        >
          {g.send}
        </button>
      </div>
    </form>
  );
}