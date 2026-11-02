"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { CardColor } from "@/lib/words";

export type Clue = {
  word: string;
  count: number;
};

export type TeamTurn = "red" | "blue";

// Words each team still has to find
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

const ClueContext = createContext<ClueContextValue | null>(null);

// Shares the current clue and the team whose turn it is between the boards
export function ClueProvider({ children, roomCode, initialTurn = "red", initialRemaining = { red: 0, blue: 0 }, initialRevealed = null }: ClueProviderProps) {
  const [clue, setClue] = useState<Clue | null>(null);
  const [turn, setTurn] = useState<TeamTurn>(initialTurn);
  const [remaining, setRemaining] = useState<Remaining>(initialRemaining);
  const [revealed, setRevealed] = useState<CardColor[] | null>(initialRevealed);

  // Applies the turn sent by the server, a new team needs a new clue
  function syncTurn(next: TeamTurn) {
    if (next !== turn) {
      setTurn(next);
      setClue(null);
    }
  }

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
