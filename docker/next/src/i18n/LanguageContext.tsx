"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import fr from "./fr.json";
import en from "./en.json";
import es from "./es.json";

export type Language = "fr" | "en" | "es";

const translations = { fr, en, es };

type LanguageContextValue = {
  lang: Language;
  setLang: (lang: Language) => void;
  t: typeof fr;
};

export const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>("fr");

  useEffect(() => {
    const saved = localStorage.getItem("lang") as Language | null;
    if (saved && translations[saved]) {
      setLangState(saved);
    }
  }, []);

  function setLang(next: Language) {
    setLangState(next);
    localStorage.setItem("lang", next);
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used inside a LanguageProvider");
  }
  return context;
}