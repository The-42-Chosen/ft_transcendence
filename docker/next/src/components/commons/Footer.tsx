"use client";

import { useContext, useEffect, useRef, useState } from 'react';
import { LanguageContext } from '@/i18n/LanguageContext';
import Link from "next/link";


export default function Footer() {
  const context = useContext(LanguageContext);
  const t = context?.t?.footer || {
    about: "About us",
    legal: "Legal",
    privacy: "Privacy policy",
    gdpr: "GDPR",
    terms: "Terms of service",
  };
  const [legalOpen, setLegalOpen] = useState(false);
  const legalRef = useRef<HTMLLIElement>(null);

  // Close the Legal menu on outside click or Escape
  useEffect(() => {
    if (!legalOpen) {
      return;
    }
    function onClick(event: MouseEvent) {
      if (legalRef.current && !legalRef.current.contains(event.target as Node)) {
        setLegalOpen(false);
      }
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setLegalOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [legalOpen]);

  const footerLinkClass = "cursor-pointer rounded-lg px-3 py-1.5 text-sm uppercase tracking-wider text-(--color-text-primary) transition-colors hover:bg-(--color-bg-elevated) hover:text-(--color-accent-gold) font-agent";
  const legalLinks = [
    { href: "/terms", label: t.terms },
    { href: "/policy", label: t.privacy },
    { href: "/gdpr", label: t.gdpr },
  ];


  return (
    <footer className="text fixed inset-x-0 bottom-0 z-40 flex flex-col items-center gap-1 center">
      <ul className="grid w-full max-w-3xl grid-cols-2">
        <li className="text-center">
          <Link
          href="/about"
          className={footerLinkClass}>{t.about}</Link>
        </li>
        <li ref={legalRef} className="relative text-center">
          <button
            type="button"
            onClick={() => setLegalOpen((prev) => !prev)}
            aria-haspopup="menu"
            aria-expanded={legalOpen}
            className={`${footerLinkClass} !bg-transparent hover:!bg-(--color-bg-elevated)`}
          >
            {t.legal} {legalOpen ? "▾" : "▴"}
          </button>
          {legalOpen && (
            <ul
              role="menu"
              className="absolute bottom-full left-1/2 mb-2 flex w-56 -translate-x-1/2 flex-col gap-1 rounded-2xl border border-(--color-border-default) bg-(--color-bg-surface) p-2 shadow-2xl"
            >
              {legalLinks.map((link) => (
                <li key={link.href} role="none">
                  <Link
                    href={link.href}
                    role="menuitem"
                    onClick={() => setLegalOpen(false)}
                    className={`${footerLinkClass} block`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </li>
      </ul>
      <p className="text-xs text-(--color-text-muted)">Copyright© Tonton&apos;s Forkers & Cie</p>
    </footer>
  );
}
