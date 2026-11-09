"use client";

import { useId, useState, type FormEvent } from "react";
import { useClue } from "@/components/reusables/ClueContext";
import { useLanguage } from "@/i18n/LanguageContext";

export default function ClueForm() {
  const [word, setWord] = useState("");
  const [count, setCount] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const clueId = useId();
  const { seat, turn, clue, revealed, giveClue } = useClue();
  const { t } = useLanguage();
  const g = t.game;

  // Only the spymaster of the playing team gives a clue, once per turn
  const canGive = seat === `${turn}-spymaster` && !clue && !revealed;

  async function sendClue(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = word.trim();
    if (!trimmed || !canGive) {
      return;
    }
    setSending(true);
    // The server checks the clue and sends it to every player of the room
    const result = await giveClue(trimmed, count);
    setSending(false);
    setError(result.error ?? null);
    if (!result.error) {
      setWord("");
    }
  }

  return (
    <form onSubmit={sendClue} className="mt-6 flex flex-col gap-2 text-left">
      <label htmlFor={clueId} className="pl-4 text-xs font-semibold uppercase tracking-widest text-amber-900/70">
        {g.giveClue}
      </label>
      <fieldset disabled={!canGive || sending} className="flex items-center gap-2 rounded-full bg-white p-2 shadow-md ring-1 ring-amber-900/10 focus-within:ring-2 focus-within:ring-amber-500 disabled:opacity-50">
        <input
          id={clueId}
          value={word}
          type="text"
          name="clue"
          required
          autoComplete="off"
          placeholder={g.oneWord}
          onChange={(event) => setWord(event.target.value)}
          className="min-w-0 flex-1 bg-transparent px-4 py-2 text-lg font-semibold uppercase tracking-wide text-amber-950 placeholder:normal-case placeholder:font-normal placeholder:text-amber-900/40 focus:outline-none"
        />
        <select
          name="count"
          value={count}
          onChange={(event) => setCount(Number(event.target.value))}
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
      </fieldset>
      {error && <p role="alert" className="pl-4 text-sm text-red-700">{error}</p>}
    </form>
  );
}
