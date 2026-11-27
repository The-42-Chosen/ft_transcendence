"use client";

import { useCallback, useEffect, useState } from "react";
import { io, type Socket } from "socket.io-client";
import type { GameView } from "@/lib/game";
import type { Seat } from "@/lib/lobby";

export function useGame(roomCode: string, seat: Seat, initialState: GameView) {
  const [state, setState] = useState<GameView>(initialState);
  const [connected, setConnected] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);

  const applyState = useCallback((next: GameView) => {
    setState((current) => (next.version >= current.version ? next : current));
  }, []);

  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL;
   
    let retry = true;
    const options = {
      path: "/socket.io",
      auth: (send: (data: object) => void) => {
        fetch(`/api/rooms/${roomCode}/token`, { cache: "no-store" })
          .then((res) => {
            // No room any more: retrying would never succeed
            retry = res.status !== 404;
            return res.ok ? res.json() : null;
          })
          .catch(() => null)
          .then((data: { token?: string; playerId?: string | null } | null) => {
            setPlayerId(data?.playerId ?? null);
            send({ token: data?.token ?? "" });
          });
      },
    };
    const socket = socketUrl ? io(socketUrl, options) : io(options);

    socket.on("connect", async () => {
      setConnected(true);
      const res = await fetch(`/api/rooms/${roomCode}/state`, { cache: "no-store" }).catch(() => null);
      if (res?.ok) {
        const data: GameView = await res.json();
        applyState(data);
      }
    });
    socket.on("disconnect", () => setConnected(false));
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    socket.on("connect_error", (error) => {
      console.error("Socket.IO error:", error.message);
      // Refused by the server (bad or missing token): socket.io gives up, try again with a new token
      if (!socket.active && retry) {
        retryTimer = setTimeout(() => socket.connect(), 3000);
      }
    });
    socket.on("state", applyState);
    setSocket(socket);

    return () => {
      clearTimeout(retryTimer);
      socket.disconnect();
      setSocket(null);
    };
  }, [roomCode, seat, applyState]);

  return { state, applyState, connected, socket, playerId };
}
