"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { CardColor } from "@/lib/words";
import type { GameView } from "@/lib/game";
import type { Seat } from "@/lib/lobby";
import { useGame } from "@/lib/useGame";

export type Clue = {
  word: string;
  count: number;
};

export type TeamTurn = "red" | "blue";

export type Remaining = Record<TeamTurn, number>;

export type MoveResult = {
  error?: string;
  color?: CardColor;
  gameOver?: boolean;
};

type ClueContextValue = {
  seat: Seat;
  clue: Clue | null;
  turn: TeamTurn;
  remaining: Remaining;
  cards: (CardColor | null)[];
  found: boolean[];
  lastFound: number | null;
  revealed: CardColor[] | null;
  winner: TeamTurn | null;
  connected: boolean;
  giveClue: (word: string, count: number) => Promise<MoveResult>;
  guess: (word: string) => Promise<MoveResult>;
  endTurn: () => Promise<MoveResult>;
};

type ClueProviderProps = {
  children: ReactNode;
  roomCode: string;
  seat: Seat;
  initialState: GameView;
};

const ClueContext = createContext<ClueContextValue | null>(null);

export function ClueProvider({ children, roomCode, seat, initialState }: ClueProviderProps) {
  const { state, applyState, connected } = useGame(roomCode, seat, initialState);

  // Sends a move to the server, the new state then comes back to everybody through the socket
  async function play(move: string, body: object = {}): Promise<MoveResult> {
    const res = await fetch(`/api/rooms/${roomCode}/${move}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...body, seat }),
    }).catch(() => null);
    const data = res ? await res.json().catch(() => null) : null;
    if (data?.state) {
      applyState(data.state);
    }
    return data ?? { error: "Server unreachable" };
  }

  const value: ClueContextValue = {
    seat,
    clue: state.clue,
    turn: state.turn,
    remaining: state.remaining,
    cards: state.cards,
    found: state.found,
    lastFound: state.lastFound,
    revealed: state.gameOver ? (state.cards as CardColor[]) : null,
    winner: state.winner,
    connected,
    giveClue: (word, count) => play("clue", { word, count }),
    guess: (word) => play("guess", { word }),
    endTurn: () => play("end-turn"),
  };

  return <ClueContext value={value}>{children}</ClueContext>;
}

export function useClue() {
  const context = useContext(ClueContext);
  if (!context) {
    throw new Error("useClue must be used inside a ClueProvider");
  }
  return context;
}
