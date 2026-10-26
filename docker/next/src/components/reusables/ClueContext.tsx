"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

export type Clue = {
  word: string;
  count: number;
};

export type TeamTurn = "red" | "blue";

type ClueContextValue = {
  clue: Clue | null;
  setClue: (clue: Clue) => void;
  turn: TeamTurn;
  endTurn: () => void;
};

const ClueContext = createContext<ClueContextValue | null>(null);

// Shares the current clue and the team whose turn it is between the boards
export function ClueProvider({ children }: { children: ReactNode }) {
  const [clue, setClue] = useState<Clue | null>(null);
  const [turn, setTurn] = useState<TeamTurn>("red");

  // Hands over to the other team, the next spymaster has to give a new clue
  function endTurn() {
    setTurn((prev) => (prev === "red" ? "blue" : "red"));
    setClue(null);
  }

  return (
    <ClueContext value={{ clue, setClue, turn, endTurn }}>
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
