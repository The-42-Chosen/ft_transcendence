"use client";

import { useId, type FormEvent } from "react";
import Button from "./Button";
import { ROOM_CODE_LENGTH } from "@/lib/lobby";

type Items = {
  title: string;
  label: string;
  info: string;
  onSubmit?: (value: string) => void;
  error?: string | null;
  pending?: boolean;
};

export default function GameInput ({title, label, info, onSubmit, error, pending = false}: Items) {
  const inputId = useId();

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    onSubmit?.(String(data.get("inpt")).trim().toUpperCase());
  }

  return (
    <div className="bg-amber-100 p-6 m-4 rounded-2xl shadow-xl">
      <h3 className="mb-5 font-display text-4xl tracking-wide">{title}</h3>
      <form onSubmit={handleSubmit} className="mx-auto flex max-w-md flex-col items-center gap-3">
        <label htmlFor={inputId} className="font-agent text-sm uppercase tracking-widest text-amber-800">{label}</label>
        <div className="flex w-full gap-2">
          <input
            name="inpt"
            id={inputId}
            required
            autoComplete="off"
            maxLength={ROOM_CODE_LENGTH}
            placeholder={"X".repeat(ROOM_CODE_LENGTH)}
            className="min-w-0 flex-1 rounded-2xl border-2 border-dashed border-amber-400 bg-white/70 px-4 py-3 text-center font-display text-3xl uppercase tracking-[0.4em] text-amber-900 placeholder:text-amber-300 outline-none transition focus:border-solid focus:border-amber-600 focus:bg-white"
          />
          <Button type="submit" disabled={pending} className="rounded-2xl bg-amber-500 px-6 font-display text-2xl tracking-widest shadow-md hover:bg-amber-600 active:bg-amber-700">
            Go
          </Button>
        </div>
        {error ? (
          <p role="alert" className="font-agent text-xs text-(--color-brand-red)">{error}</p>
        ) : info && (
          <p className="font-agent text-xs text-black/50">{info}</p>
        )}
      </form>
    </div>
  );
}
