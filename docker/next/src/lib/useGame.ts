"use client";

import { useCallback, useEffect, useState } from "react";
import { io } from "socket.io-client";
import type { GameView } from "@/lib/game";
import type { Seat } from "@/lib/lobby";

export function useGame(roomCode: string, seat: Seat, initialState: GameView) {
  const [state, setState] = useState<GameView>(initialState);
  const [connected, setConnected] = useState(false);

  const applyState = useCallback((next: GameView) => {
    setState((current) => (next.version >= current.version ? next : current));
  }, []);

  useEffect(() => {
    // Prod : same domain, nginx sends /socket.io/ to the realtime service
    // Dev  : NEXT_PUBLIC_SOCKET_URL points straight at realtime (:3001)
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL;
    const options = { path: "/socket.io", query: { code: roomCode, seat } };
    const socket = socketUrl ? io(socketUrl, options) : io(options);

    socket.on("connect", async () => {
      setConnected(true);
      const res = await fetch(`/api/rooms/${roomCode}/state?seat=${seat}`, { cache: "no-store" }).catch(() => null);
      if (res?.ok) {
        applyState(await res.json());
      }
    });
    socket.on("disconnect", () => setConnected(false));
    socket.on("connect_error", (error) => console.error("Socket.IO error:", error.message));
    socket.on("state", applyState);

    return () => {
      socket.disconnect();
    };
  }, [roomCode, seat, applyState]);

  return { state, applyState, connected };
}
