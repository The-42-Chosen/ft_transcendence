"use client";

import { useId, type FormEvent } from "react";
import Button from "./Button";
import { ROOM_CODE_LENGTH } from "@/lib/lobby";
import { useLanguage } from "@/i18n/LanguageContext";

type Items = {
  title: string;
  label: string;
  info: string;
  onSubmit?: (value: string) => void;
  error?: string | null;
  pending?: boolean;
  variant?: "code" | "text";
  maxLength?: number;
  placeholder?: string;
};

export default function GameInput ({title, label, info, onSubmit, error, pending = false, variant = "code", maxLength = ROOM_CODE_LENGTH, placeholder}: Items) {
  const isCode = variant === "code";
  const inputId = useId();
  const { t } = useLanguage();

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const value = String(data.get("inpt")).trim();
    onSubmit?.(isCode ? value.toUpperCase() : value);
  }

  return (
    <div className="bg-amber-100 p-6 m-4 rounded-2xl shadow-xl">
      <h3 className="mb-5 font-display text-4xl text-black tracking-wide">{title}</h3>
      <form onSubmit={handleSubmit} className="mx-auto flex max-w-md flex-col items-center gap-3">
        <label htmlFor={inputId} className="font-agent text-sm uppercase tracking-widest text-amber-800">{label}</label>
        <div className="flex w-full gap-2">
          <input
            name="inpt"
            id={inputId}
            required
            autoComplete="off"
            maxLength={maxLength}
            pattern={isCode ? undefined : ".*\\S.*"}
            placeholder={placeholder ?? (isCode ? "X".repeat(maxLength) : "")}
            className={`min-w-0 flex-1 rounded-2xl border-2 border-dashed border-amber-400 bg-white/70 px-4 py-3 text-center font-display text-3xl ${isCode ? "uppercase tracking-[0.4em]" : "tracking-wide"} text-amber-900 placeholder:text-amber-300 outline-none transition focus:border-solid focus:border-amber-600 focus:bg-white`}
          />
          <Button type="submit" disabled={pending} className="rounded-2xl bg-amber-500 px-6 font-display text-2xl tracking-widest shadow-md hover:bg-amber-600 active:bg-amber-700">
            {t.setup.go}
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