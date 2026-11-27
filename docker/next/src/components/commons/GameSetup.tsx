"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import GameModal from '@/components/reusables/GameModal';
import GameInput from '@/components/reusables/GameInput';
import { GUEST_NAME_MAX, LANGUAGE_FLAGS } from '@/lib/lobby';
import { useLanguage } from '@/i18n/LanguageContext';

type Step = "mode" | "connexion" | "guest_name" | "language" | "room_code";

const [EN, FR, ES] = Object.keys(LANGUAGE_FLAGS);

export default function GameSetup() {
  const router = useRouter();
  const { t } = useLanguage();
  const s = t.setup;

  const [step, setStep] = useState<Step>("mode");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [afterLogin, setAfterLogin] = useState<Step>("language");
  const sessionCheck = useRef<Promise<boolean> | null>(null);

  useEffect(() => {
    sessionCheck.current = fetch("/api/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((player) => !!player && player.guest === false)
      .catch(() => false);
  }, []);

  function goTo(next: Step) {
    setError(null);
    setStep(next);
  }

  async function pickMode(choice: string) {
    const next: Step = choice === s.createGame ? "language" : "room_code";
    const userLogged = await (sessionCheck.current ?? Promise.resolve(false));
    if (userLogged) {
      goTo(next);
    } else {
      setAfterLogin(next);
      goTo("connexion");
    }
  }

  function pickConnexion(choice: string) {
    if (choice === s.connexion) {
      router.push("/login");
    } else {
      goTo("guest_name");
    }
  }

  async function pickGuestName(name: string) {
    setPending(true);
    setError(null);
    const res = await fetch("/api/guest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    }).catch(() => null);
    setPending(false);
    if (!res?.ok) {
      setError(s.errorServer);
      return;
    }
    goTo(afterLogin);
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
      router.push(`/room/${code}`);
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
      router.push(`/room/${code}`);
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
      {step === "connexion" && (
        <GameModal
          title={s.notLogged}
          text1={s.connexion}
          text2={s.guest}
          action={s.next}
          onConfirm={pickConnexion}
        />
      )}
      {step === "guest_name" && (
        <GameInput
          title={s.guestNameTitle}
          label={s.guestNameLabel}
          info={s.guestNameInfo}
          variant="text"
          maxLength={GUEST_NAME_MAX}
          onSubmit={pickGuestName}
          pending={pending}
          error={error}
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