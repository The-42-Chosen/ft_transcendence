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

export function LanguageProvider({
  children,
  initialLang = "fr",
}: {
  children: ReactNode;
  initialLang?: Language;
}) {
  const [lang, setLangState] = useState<Language>(initialLang);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("lang") as Language | null;
      if (saved && translations[saved] && saved !== lang) {
        setLangState(saved);
        document.cookie = `lang=${saved}; path=/; max-age=31536000; SameSite=Lax`;
      }
    } catch {}
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  function setLang(next: Language) {
    setLangState(next);
    try {
      window.localStorage.setItem("lang", next);
    } catch {}
    document.cookie = `lang=${next}; path=/; max-age=31536000; SameSite=Lax`;
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