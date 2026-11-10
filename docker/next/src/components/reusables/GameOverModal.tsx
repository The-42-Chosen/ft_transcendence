"use client";

import { useState } from "react";
import { useClue } from "@/components/reusables/ClueContext";
import Modal from "@/components/reusables/Modal";
import WinnerBadge from "@/components/reusables/WinnerBadge";
import { useLanguage } from "@/i18n/LanguageContext";

type Parameters = {
  words: string[];
};

export default function GameOverModal({ words }: Parameters) {
  const { revealed, found, lastFound, winner } = useClue();
  const { t } = useLanguage();
  const g = t.game;
  const [closed, setClosed] = useState(false);

  if (!revealed || closed) {
    return null;
  }

  const assassinFound = revealed.some((color, i) => color === "assassin" && found[i]);
  const lastWord = lastFound !== null ? words[lastFound]?.toUpperCase() : null;

  return (
    <Modal
      title={g.gameOverTitle}
      subtitle={assassinFound ? g.assassinFound : g.allWordsRevealed}
      content={lastWord ? g.wordDiscovered.replace("{word}", lastWord) : ""}
      bContent={g.close}
      onClose={() => setClosed(true)}
    >
      {winner && <WinnerBadge winner={winner}/>}
    </Modal>
  );
}
