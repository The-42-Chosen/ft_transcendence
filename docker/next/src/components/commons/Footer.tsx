"use client";

import { useContext } from 'react';
import { LanguageContext } from '@/i18n/LanguageContext';
import Link from "next/link";


export default function Footer() {
  const context = useContext(LanguageContext);
  const t = context?.t?.footer || {
    about: "About us",
    privacy: "Privacy policy",
    gdpr: "GDPR",
  };
  const footerLinkClass = "cursor-pointer rounded-lg px-3 py-1.5 text-sm uppercase tracking-wider text-(--color-text-primary) transition-colors hover:bg-(--color-bg-elevated) hover:text-(--color-accent-gold) font-agent";


  return (
    <footer className="text fixed inset-x-0 bottom-0 z-40 flex flex-col items-center gap-1 center">
      <ul className="grid w-full max-w-3xl grid-cols-3">
        <li className="text-center">
          <Link
          href="/about"
          className={footerLinkClass}>{t.about}</Link>
        </li>
        <li className="text-center">
          <Link
          href="/policy"
          className={footerLinkClass}>{t.privacy}</Link>
        </li>
        <li className="text-center">
          <Link
          href="/gdpr"
          className={footerLinkClass}>{t.gdpr}</Link>
        </li>
      </ul>
      <p className="text-xs text-(--color-text-muted)">Copyright© Tonton&apos;s Forkers & Cie</p>
    </footer>
  );
}
