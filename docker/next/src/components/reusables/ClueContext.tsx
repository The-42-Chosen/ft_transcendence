"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

export type Clue = {
  word: string;
  count: number;
};

type ClueContextValue = {
  clue: Clue | null;
  setClue: (clue: Clue) => void;
};

const ClueContext = createContext<ClueContextValue | null>(null);

// Shares the current clue between the spymaster form and the read-only clue bars
export function ClueProvider({ children }: { children: ReactNode }) {
  const [clue, setClue] = useState<Clue | null>(null);
  return (
    <ClueContext value={{ clue, setClue }}>
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
