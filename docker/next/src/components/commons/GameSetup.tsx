"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import GameModal from '@/components/reusables/GameModal';
import GameInput from '@/components/reusables/GameInput';
import { LANGUAGE_FLAGS, type Role } from '@/lib/lobby';

type Step = "mode" | "language" | "room_code";

const CREATE_GAME = "Create a game";
const JOIN_GAME = "Join a game";
const SPECTATOR = "Spectator";

const MODE_ROLES: Record<string, Role> = {
  [CREATE_GAME]: "game_master",
  [JOIN_GAME]: "player",
  [SPECTATOR]: "spectator",
};

const [EN, FR, ES] = Object.keys(LANGUAGE_FLAGS);

// Walks the player through the setup modals, one at a time, then sends them to the waiting room
export default function GameSetup() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("mode");
  const [role, setRole] = useState<Role>("player");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function goTo(next: Step) {
    setError(null);
    setStep(next);
  }

  function pickMode(choice: string) {
    setRole(MODE_ROLES[choice]);
    goTo(choice === CREATE_GAME ? "language" : "room_code");
  }

  async function createRoom(flag: string) {
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language: LANGUAGE_FLAGS[flag] }),
      });
      if (!res.ok) {
        throw new Error();
      }
      const { code } = await res.json();
      router.push(`/room/${code}?role=game_master`);
    } catch {
      setError("Could not create the room, try again");
      setPending(false);
    }
  }

  async function joinRoom(code: string) {
    setPending(true);
    setError(null);
    try {
      const res = await fetch(`/api/rooms/${encodeURIComponent(code)}`);
      if (res.status === 404) {
        setError(`No room found with the code ${code}`);
        setPending(false);
        return;
      }
      if (!res.ok) {
        throw new Error();
      }
      router.push(`/room/${code}?role=${role}`);
    } catch {
      setError("Could not reach the server, try again");
      setPending(false);
    }
  }

  return (
    <>
      {step === "mode" && (
        <GameModal
          title="What do you wanna do?"
          text1={CREATE_GAME}
          text2={JOIN_GAME}
          text3={SPECTATOR}
          action="Next"
          onConfirm={pickMode}
        />
      )}
      {step === "language" && (
        <GameModal
          title="Pick your language?"
          text1={EN}
          text2={FR}
          text3={ES}
          action="Confirm"
          onConfirm={createRoom}
          pending={pending}
          error={error}
        />
      )}
      {step === "room_code" && (
        <GameInput
          title="Room code"
          label="Enter the room code below"
          info="Enter the code of the room you want to reach."
          onSubmit={joinRoom}
          pending={pending}
          error={error}
        />
      )}
      {step !== "mode" && (
        <button
          type="button"
          onClick={() => goTo("mode")}
          className="font-agent text-sm text-(--color-text-secondary) bg-transparent hover:bg-transparent hover:text-(--color-text-primary) transition-colors"
        >
          ← Back
        </button>
      )}
    </>
  );
}
