"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { cn } from "@/lib/cn";
import { useClue } from "@/components/reusables/ClueContext";
import { useLanguage } from "@/i18n/LanguageContext";


type ChatChannel = "room" | "spymasters";

type ChatMessage = {
  id: string;
  channel: ChatChannel;
  playerId: string;
  name: string;
  seat: string;
  text: string;
  at: number;
};

const CHAT_MAX_LENGTH = 200;

const EMPTY: Record<ChatChannel, ChatMessage[]> = { room: [], spymasters: [] };

function seatColor(seat: string): string {
  if (seat.startsWith("red")) return "text-(--color-brand-red)";
  if (seat.startsWith("blue")) return "text-(--color-brand-blue)";
  return "text-amber-900/70";
}

// distribute channel according to their role
function channelsFor(isSpymaster: boolean): ChatChannel[] {
  return isSpymaster ? ["spymasters", "room"] : ["room"];
}

type ChatProps = {
  className?: string;
};

export default function Chat({ className }: ChatProps) {
  const { socket, playerId, seat } = useClue();
  const { t } = useLanguage();
  const c = t.game.chat;
  const isSpymaster = seat.endsWith("-spymaster");
  const channels = channelsFor(isSpymaster);

  const [active, setActive] = useState<ChatChannel>(channels[0]);
  const [messages, setMessages] = useState(EMPTY);
  const [unread, setUnread] = useState<Record<ChatChannel, number>>({ room: 0, spymasters: 0 });
  const [text, setText] = useState("");
  const listRef = useRef<HTMLUListElement>(null);
  const activeRef = useRef(active);
  const inputId = useId();

  const readOnly = active === "room" && isSpymaster;
  const canWrite = Boolean(socket && playerId) && !readOnly;

  useEffect(() => {
    if (!socket) {
      return;
    }
    const loadHistory = () => {
      for (const channel of channelsFor(isSpymaster)) {
        socket.emit("chat:history", channel, (history: ChatMessage[]) =>
          setMessages((current) => ({ ...current, [channel]: history })));
      }
    };
    const onMessage = (message: ChatMessage) => {
      setMessages((current) => ({ ...current, [message.channel]: [...current[message.channel], message] }));
      if (message.channel !== activeRef.current) {
        setUnread((current) => ({ ...current, [message.channel]: current[message.channel] + 1 }));
      }
    };
    socket.on("connect", loadHistory);
    socket.on("chat", onMessage);
    if (socket.connected) {
      loadHistory();
    }
    return () => {
      socket.off("connect", loadHistory);
      socket.off("chat", onMessage);
    };
  }, [socket, isSpymaster]);

  const shown = messages[active];

  // Scroll to  display the new message
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [shown]);

  function selectTab(channel: ChatChannel) {
    activeRef.current = channel;
    setActive(channel);
    setUnread((current) => ({ ...current, [channel]: 0 }));
  }

  function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || !socket?.connected || !canWrite) {
      return;
    }
    socket.emit("chat", { channel: active, text: trimmed });
    setText("");
  }

  const tabLabel: Record<ChatChannel, string> = { room: c.tabRoom, spymasters: c.tabSpymasters };

  return (
    <aside className={cn("flex flex-col rounded-2xl bg-amber-100 p-6 text-left", className)}>
      <h3 className="mb-3 font-display text-2xl tracking-widest uppercase text-amber-900">{c.title}</h3>
      {channels.length > 1 && (
        <div role="tablist" className="mb-3 flex gap-2">
          {channels.map((channel) => (
            <button
              key={channel}
              type="button"
              role="tab"
              aria-selected={active === channel}
              onClick={() => selectTab(channel)}
              className={cn(
                "relative flex-1 rounded-full px-3 py-1.5 text-sm font-semibold transition",
                active === channel ? "bg-amber-500 text-white shadow" : "bg-white/70 text-amber-900 hover:bg-white"
              )}
            >
              {tabLabel[channel]}
              {unread[channel] > 0 && (
                <span
                  aria-label={c.unread.replace("{count}", String(unread[channel]))}
                  className="absolute -top-1.5 -right-1 min-w-5 rounded-full bg-(--color-brand-red) px-1.5 text-xs leading-5 text-white"
                >
                  {unread[channel]}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
      <ul ref={listRef} role={channels.length > 1 ? "tabpanel" : undefined} aria-live="polite" className="mb-3 flex h-48 flex-col gap-1 overflow-y-auto rounded-xl bg-white/70 p-3 xl:h-0 xl:min-h-48 xl:flex-1">
        {shown.length === 0 ? (
          <li className="m-auto text-sm text-amber-900/40">{c.empty}</li>
        ) : (
          shown.map((message) => (
            <li key={message.id} className="break-words text-sm text-amber-950">
              <span className={cn("font-semibold", seatColor(message.seat))}>
                {message.playerId === playerId ? c.you : message.name}
              </span>
              {" : "}
              {message.text}
            </li>
          ))
        )}
      </ul>
      {readOnly ? (
        <p className="rounded-full bg-white/50 px-4 py-3 text-center text-xs text-amber-900/60">{c.readOnly}</p>
      ) : (
        <form onSubmit={send}>
          <label htmlFor={inputId} className="sr-only">{c.placeholder}</label>
          <fieldset disabled={!canWrite} className="flex w-full min-w-0 items-center gap-2 rounded-full bg-white p-2 shadow-md ring-1 ring-amber-900/10 focus-within:ring-2 focus-within:ring-amber-500 disabled:opacity-50">
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
      )}
    </aside>
  );
}
