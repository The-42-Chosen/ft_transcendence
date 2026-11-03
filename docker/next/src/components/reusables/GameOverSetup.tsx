"use client";

import { useEffect, useRef, useState } from "react";
import GameSetup from "@/components/commons/GameSetup";
import Button from "@/components/reusables/Button";
import { useClue } from "@/components/reusables/ClueContext";

// Once the game is over, leaves the revealed board in sight and offers a new game on demand
export default function GameOverSetup() {
  const { revealed } = useClue();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (open && !ref.current?.open) {
      ref.current?.showModal();
    }
  }, [open]);

  if (!revealed) {
    return null;
  }

  return (
    <>
      <footer className="mb-6 flex justify-center">
        <Button variant="action" onClick={() => setOpen(true)}>
          New game
        </Button>
      </footer>
      {open && (
        <dialog
          ref={ref}
          onClose={() => setOpen(false)}
          className="m-auto w-full max-w-3xl bg-transparent text-center backdrop:bg-black/50"
        >
          <GameSetup/>
          <button
            type="button"
            onClick={() => ref.current?.close()}
            className="mx-auto mt-3 block font-agent text-sm text-white/80 bg-transparent hover:bg-transparent hover:text-white transition-colors"
          >
            Back to the board
          </button>
        </dialog>
      )}
    </>
  );
}
