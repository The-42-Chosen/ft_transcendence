"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { CardColor } from "@/lib/words";

export type Clue = {
  word: string;
  count: number;
};

export type TeamTurn = "red" | "blue";

export type Remaining = Record<TeamTurn, number>;

type ClueContextValue = {
  clue: Clue | null;
  setClue: (clue: Clue) => void;
  turn: TeamTurn;
  endTurn: () => Promise<void>;
  syncTurn: (turn: TeamTurn) => void;
  remaining: Remaining;
  setRemaining: (remaining: Remaining) => void;
  // Colors of the whole board, only known once the game is over
  revealed: CardColor[] | null;
  setRevealed: (colors: CardColor[]) => void;
};

type ClueProviderProps = {
  children: ReactNode;
  roomCode?: string;
  initialTurn?: TeamTurn;
  initialRemaining?: Remaining;
  initialRevealed?: CardColor[] | null;
};

const POLL_INTERVAL = 2000;

const ClueContext = createContext<ClueContextValue | null>(null);

// Shares the current clue and the team whose turn it is between the boards
export function ClueProvider({ children, roomCode, initialTurn = "red", initialRemaining = { red: 0, blue: 0 }, initialRevealed = null }: ClueProviderProps) {
  const [clue, setClue] = useState<Clue | null>(null);
  const [turn, setTurn] = useState<TeamTurn>(initialTurn);
  const [remaining, setRemaining] = useState<Remaining>(initialRemaining);
  const [revealed, setRevealed] = useState<CardColor[] | null>(initialRevealed);

  function syncTurn(next: TeamTurn) {
    if (next !== turn) {
      setTurn(next);
      setClue(null);
    }
  }

  // TODO: Replace polling with a websocket once the backend is ready
  useEffect(() => {
    if (!roomCode || revealed) {
      return;
    }
    const id = setInterval(async () => {
      const res = await fetch(`/api/rooms/${roomCode}/state`, { cache: "no-store" }).catch(() => null);
      const state = res?.ok ? await res.json() : null;
      if (!state) {
        return;
      }
      setRemaining({ red: state.len_red, blue: state.len_blue });
      if (state.turn !== turn) {
        setTurn(state.turn);
        setClue(null);
      }
      if (state.colors) {
        setRevealed(state.colors);
      }
    }, POLL_INTERVAL);
    return () => clearInterval(id);
  }, [roomCode, revealed, turn]);

  // Hands over to the other team, the next spymaster has to give a new clue
  async function endTurn() {
    if (!roomCode) {
      syncTurn(turn === "red" ? "blue" : "red");
      return;
    }
    const res = await fetch(`/api/rooms/${roomCode}/end-turn`, { method: "POST" }).catch(() => null);
    const room = res?.ok ? await res.json() : null;
    if (room?.turn) {
      syncTurn(room.turn);
    }
  }

  return (
    <ClueContext value={{ clue, setClue, turn, endTurn, syncTurn, remaining, setRemaining, revealed, setRevealed }}>
      {children}
    </ClueContext>
  );
}

export function useClue() {
  const context = useContext(ClueContext);
  if (!context) {
    throw new Error("useClue must be used inside a ClueProvider");
  }
  return context;
}
