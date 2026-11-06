"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import GameModal from '@/components/reusables/GameModal';
import GameInput from '@/components/reusables/GameInput';
import { LANGUAGE_FLAGS, type Role } from '@/lib/lobby';
import { useLanguage } from '@/i18n/LanguageContext';

type Step = "mode" | "language" | "room_code";

const [EN, FR, ES] = Object.keys(LANGUAGE_FLAGS);

// Walks the player through the setup modals, one at a time, then sends them to the waiting room
export default function GameSetup() {
  const router = useRouter();
  const { t } = useLanguage();
  const s = t.setup;

  const [step, setStep] = useState<Step>("mode");
  const [role, setRole] = useState<Role>("player");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function goTo(next: Step) {
    setError(null);
    setStep(next);
  }

  function pickMode(choice: string) {
    const nextRole: Role =
      choice === s.createGame ? "game_master" :
        choice === s.joinGame ? "player" :
          "spectator";
    setRole(nextRole);
    goTo(choice === s.createGame ? "language" : "room_code");
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
      setError(s.errorCreate);
      setPending(false);
    }
  }

  async function joinRoom(code: string) {
    setPending(true);
    setError(null);
    try {
      const res = await fetch(`/api/rooms/${encodeURIComponent(code)}`);
      if (res.status === 404) {
        setError(s.errorNotFound.replace("{code}", code));
        setPending(false);
        return;
      }
      if (!res.ok) {
        throw new Error();
      }
      router.push(`/room/${code}?role=${role}`);
    } catch {
      setError(s.errorServer);
      setPending(false);
    }
  }

  return (
    <>
      {step === "mode" && (
        <GameModal
          title={s.whatToDo}
          text1={s.createGame}
          text2={s.joinGame}
          text3={s.spectator}
          action={s.next}
          onConfirm={pickMode}
        />
      )}
      {step === "language" && (
        <GameModal
          title={s.pickLanguage}
          text1={EN}
          text2={FR}
          text3={ES}
          action={s.confirm}
          onConfirm={createRoom}
          pending={pending}
          error={error}
        />
      )}
      {step === "room_code" && (
        <GameInput
          title={s.roomCodeTitle}
          label={s.roomCodeLabel}
          info={s.roomCodeInfo}
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
          {s.back}
        </button>
      )}
    </>
  );
}