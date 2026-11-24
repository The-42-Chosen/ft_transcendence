"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { cn } from "@/lib/cn";
import { useClue } from "@/components/reusables/ClueContext";
import { useLanguage } from "@/i18n/LanguageContext";
import { usePlayerName } from "@/lib/usePlayerName";

// Same shape as ChatMessage in docker/realtime/src/server.ts
type ChatMessage = {
  id: string;
  name: string;
  seat: string;
  text: string;
  at: number;
};

const CHAT_MAX_LENGTH = 200;

function seatColor(seat: string): string {
  if (seat.startsWith("red")) return "text-(--color-brand-red)";
  if (seat.startsWith("blue")) return "text-(--color-brand-blue)";
  return "text-amber-900/70";
}

type ChatProps = {
  className?: string;
};

export default function Chat({ className }: ChatProps) {
  const { socket, seat } = useClue();
  const { t } = useLanguage();
  const c = t.game.chat;
  const playerName = usePlayerName();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const listRef = useRef<HTMLUListElement>(null);
  const inputId = useId();

  useEffect(() => {
    if (!socket) {
      return;
    }
    const loadHistory = () => socket.emit("chat:history", (history: ChatMessage[]) => setMessages(history));
    const onMessage = (message: ChatMessage) => setMessages((current) => [...current, message]);
    socket.on("connect", loadHistory);
    socket.on("chat", onMessage);
    if (socket.connected) {
      loadHistory();
    }
    return () => {
      socket.off("connect", loadHistory);
      socket.off("chat", onMessage);
    };
  }, [socket]);

  // Keep the last message in sight
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages]);

  function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || !socket?.connected) {
      return;
    }
    socket.emit("chat", { name: playerName, text: trimmed });
    setText("");
  }

  return (
    <section className={cn("flex flex-col rounded-2xl bg-amber-100 p-6 text-left", className)}>
      <h3 className="mb-3 font-display text-2xl tracking-widest uppercase text-amber-900">{c.title}</h3>
      <ul ref={listRef} aria-live="polite" className="mb-3 flex h-48 flex-col gap-1 overflow-y-auto rounded-xl bg-white/70 p-3 xl:h-0 xl:min-h-48 xl:flex-1">
        {messages.length === 0 ? (
          <li className="m-auto text-sm text-amber-900/40">{c.empty}</li>
        ) : (
          messages.map((message) => (
            <li key={message.id} className="break-words text-sm text-amber-950">
              <span className={cn("font-semibold", seatColor(message.seat))}>
                {message.name === playerName && message.seat === seat ? c.you : message.name}
              </span>
              {" : "}
              {message.text}
            </li>
          ))
        )}
      </ul>
      <form onSubmit={send}>
        <label htmlFor={inputId} className="sr-only">{c.placeholder}</label>
        <fieldset disabled={!socket} className="flex w-full min-w-0 items-center gap-2 rounded-full bg-white p-2 shadow-md ring-1 ring-amber-900/10 focus-within:ring-2 focus-within:ring-amber-500 disabled:opacity-50">
          <input
            id={inputId}
            value={text}
            maxLength={CHAT_MAX_LENGTH}
            autoComplete="off"
            placeholder={c.placeholder}
            onChange={(event) => setText(event.target.value)}
            className="w-full min-w-0 flex-1 bg-transparent px-3 py-2 text-amber-950 placeholder:text-amber-900/40 focus:outline-none"
          />
          <button type="submit" className="shrink-0 rounded-full bg-amber-500 px-4 py-2 font-display tracking-widest text-white hover:bg-amber-600 active:bg-amber-700">
            {c.send}
          </button>
        </fieldset>
      </form>
    </section>
  );
}
