"use client";

import { useContext, useState } from 'react';
import Link from 'next/link';
import UserCard from '@/components/reusables/UserCard';
import { LanguageContext, type Language } from '@/i18n/LanguageContext';

export default function Nav() {
  const context = useContext(LanguageContext);
  const [isOpen, setIsOpen] = useState(false);

  const changeLanguage = (lang: Language) => {
    if (context) {
      context.setLang(lang);
    }
  };

  const toggleMenu = () => {
    setIsOpen((prev) => !prev);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const { lang } = context || { lang: 'fr' };
  const t = context?.t?.nav || {
    play: "Play",
    ranking: "Ranking",
    friends: "Friends",
    login: "Login"
  };


  const navLinkClass =
    "cursor-pointer rounded-lg px-3 py-1.5 text-sm uppercase tracking-wider text-(--color-text-primary) transition-colors hover:bg-(--color-bg-elevated) hover:text-(--color-accent-gold) font-agent";


  const flagButtonClass = (targetLang: Language) =>
    `!rounded-md px-1.5 py-0.5 text-lg transition hover:scale-110 ${lang === targetLang
      ? "!bg-(--color-bg-subtle) ring-1 ring-(--color-accent-gold)"
      : "!bg-transparent opacity-60 hover:!bg-white/10 hover:opacity-100"
    }`;

  return (
    <nav className="relative flex min-w-0 items-center justify-end">

      <button
        type="button"
        onClick={toggleMenu}
        aria-label="Toggle navigation menu"
        aria-expanded={isOpen}
        className="flex h-10 w-10 items-center justify-center !rounded-xl border border-(--color-border-default) !bg-(--color-bg-elevated) text-xl text-(--color-text-primary) transition hover:!bg-(--color-bg-subtle) hover:text-(--color-accent-gold) md:hidden"
      >
        {isOpen ? "✕" : "☰"}
      </button>


      <ul className="hidden items-center justify-end gap-x-2 lg:gap-x-5 md:flex">
        <li>
          <Link href="/" className={navLinkClass}>
            {t.play}
          </Link>
        </li>
        <li>
          <Link href="#ranking" className={navLinkClass}>
            {t.ranking}
          </Link>
        </li>
        <li>
          <Link href="#friends" className={navLinkClass}>
            {t.friends}
          </Link>
        </li>
        <li>
          <ul className="flex items-center gap-1 rounded-full border border-(--color-border-default) bg-(--color-bg-surface) px-2 py-1">
            <li>
              <button type="button" onClick={() => changeLanguage('fr')} className={flagButtonClass('fr')}>
                🇫🇷
              </button>
            </li>
            <li>
              <button type="button" onClick={() => changeLanguage('en')} className={flagButtonClass('en')}>
                🇬🇧
              </button>
            </li>
            <li>
              <button type="button" onClick={() => changeLanguage('es')} className={flagButtonClass('es')}>
                🇪🇸
              </button>
            </li>
          </ul>
        </li>
        <li>
          <Link
            href="/login"
            className="flex cursor-pointer items-center gap-2 rounded-full border border-(--color-border-default) bg-(--color-bg-elevated) px-3 py-1 text-(--color-text-primary) transition hover:border-(--color-accent-gold) hover:text-(--color-accent-gold)"
          >
            <UserCard username={t.login} size={32} />
            <span className="pr-1 font-agent text-sm">{t.login}</span>
          </Link>
        </li>
      </ul>


      {isOpen && (
        <div className="absolute top-13 right-0 z-50 w-64 rounded-2xl border border-(--color-border-default) bg-(--color-bg-surface) p-4 text-(--color-text-primary) shadow-2xl md:hidden">
          <ul className="flex flex-col gap-2 text-left">
            <li>
              <Link
                href="/"
                onClick={closeMenu}
                className="block w-full rounded-lg px-3 py-2 font-semibold text-sm uppercase tracking-wider transition hover:bg-(--color-bg-elevated) hover:text-(--color-accent-gold)"
              >
                {t.play}
              </Link>
            </li>
            <li>
              <Link
                href="#ranking"
                onClick={closeMenu}
                className="block w-full rounded-lg px-3 py-2 font-sans font-semibold text-sm uppercase tracking-wider transition hover:bg-(--color-bg-elevated) hover:text-(--color-accent-gold)"
              >
                {t.ranking}
              </Link>
            </li>
            <li>
              <Link
                href="#friends"
                onClick={closeMenu}
                className="block w-full rounded-lg px-3 py-2 font-sans font-semibold text-sm uppercase tracking-wider transition hover:bg-(--color-bg-elevated) hover:text-(--color-accent-gold)"
              >
                {t.friends}
              </Link>
            </li>

            <hr className="my-1 border-(--color-border-default)" />


            <li className="flex items-center justify-center gap-4 py-1">
              <button type="button" onClick={() => changeLanguage('fr')} className={flagButtonClass('fr')}>
                🇫🇷
              </button>
              <button type="button" onClick={() => changeLanguage('en')} className={flagButtonClass('en')}>
                🇬🇧
              </button>
              <button type="button" onClick={() => changeLanguage('es')} className={flagButtonClass('es')}>
                🇪🇸
              </button>
            </li>

            <hr className="my-1 border-(--color-border-default)" />


            <li>
              <Link
                href="/login"
                onClick={closeMenu}
                className="flex items-center justify-center gap-2 rounded-xl border border-(--color-border-default) bg-(--color-bg-elevated) py-2 font-sans font-semibold text-sm transition hover:border-(--color-accent-gold) hover:text-(--color-accent-gold)"
              >
                <UserCard username={t.login} size={28} />
                <span>{t.login}</span>
              </Link>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
}
