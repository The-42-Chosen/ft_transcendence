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
    <footer className="text">
      <ul  className="grid grid-cols-3">
        <li>
          <Link
          href="/about"
          className={footerLinkClass}>{t.about}</Link>
        </li>
        <li>
          <Link
          href="/policy"
          className={footerLinkClass}>{t.privacy}</Link>
        </li>
        <li>
          <Link
          href="/gdpr"
          className={footerLinkClass}>{t.gdpr}</Link>
        </li>
      </ul>
      <p>Copyright© Tonton&apos;s Forkers & Cie</p>
    </footer>
  );
}
