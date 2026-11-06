
"use client";

import io, { type Socket } from "socket.io-client";
import { useId, useEffect, useRef, useState, type FormEvent } from "react";
import { useLanguage } from "@/i18n/LanguageContext";

export default function ClueForm() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<string[]>([]);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const clueId = useId();
  // const { setClue } = useClue();
  const { t } = useLanguage();
  const g = t.game;

  useEffect(() => {
    let socket: Socket | undefined;
    let cancelled = false;

    function connectSocket() {
      try {
        if (cancelled) return;

        // Prod : meme domaine, nginx redirige /socket.io/ vers le service realtime.
        // Dev  : NEXT_PUBLIC_SOCKET_URL pointe directement sur realtime (:3001).
        const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL;
        const options = { path: "/socket.io" };
        socket = socketUrl ? io(socketUrl, options) : io(options);

        socketRef.current = socket;

        socket.on("connect", () => {
          setConnected(true);
          console.log("Socket connecté :", socket?.id);
        });

        socket.on("disconnect", () => {
          setConnected(false);
        });

        socket.on("connect_error", (error) => {
          console.error("Erreur Socket.IO :", error.message);
        });

        socket.on("message", (msg: string) => {
          setMessages((prev) => [...prev, msg]);
        });
      } catch (error) {
        console.error("Impossible d'initialiser le chat :", error);
      }
    }

    connectSocket();

    return () => {
      cancelled = true;
      socket?.disconnect();
      socketRef.current = null;
    };
  }, []);

  function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedMessage = message.trim();
    const socket = socketRef.current;

    if (!trimmedMessage || !socket?.connected) return;

    // Le serveur relaie le message aux autres utilisateurs.
    socket.emit("message", trimmedMessage);

    // L'expéditeur affiche son propre message.
    setMessages((prev) => [...prev, trimmedMessage]);
    setMessage("");
  }

  return (
    <form onSubmit={sendMessage} className="mt-6 flex flex-col gap-2 text-left">
      <label htmlFor={clueId} className="pl-4 text-xs font-semibold uppercase tracking-widest text-amber-900/70">
        {g.giveClue}
      </label>
      <div className="flex items-center gap-2 rounded-full bg-white p-2 shadow-md ring-1 ring-amber-900/10 focus-within:ring-2 focus-within:ring-amber-500">
        <input
          id={clueId}
          value={message}
          type="text"
          name="clue"
          required
          autoComplete="off"
          placeholder={g.oneWord}
          onChange={(event) => setMessage(event.target.value)}
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