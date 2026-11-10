"use client";

import { Component } from 'react';
import Link from 'next/link';
import UserCard from '@/components/reusables/UserCard';
import { LanguageContext, type Language } from '@/i18n/LanguageContext';

type NavState = {
  isOpen: boolean;
};

export default class Nav extends Component<object, NavState> {
  static contextType = LanguageContext;
  declare context: React.ContextType<typeof LanguageContext>;

  state: NavState = {
    isOpen: false,
  };

  changeLanguage = (lang: Language) => {
    if (this.context) {
      this.context.setLang(lang);
    }
  };

  toggleMenu = () => {
    this.setState((prev) => ({ isOpen: !prev.isOpen }));
  };

  closeMenu = () => {
    this.setState({ isOpen: false });
  };

  render() {
    const { lang } = this.context || { lang: 'fr' };
    const t = this.context?.t?.nav || {
      play: "Play",
      ranking: "Ranking",
      friends: "Friends",
      login: "Login"
    };
    const { isOpen } = this.state;

    // Style des liens de navigation (Play, Ranking, Friends)
    const navLinkClass =
      "cursor-pointer rounded-lg px-3 py-1.5 font-sans font-semibold text-sm uppercase tracking-wider text-(--color-text-primary) transition-colors hover:bg-(--color-bg-elevated) hover:text-(--color-accent-gold)";

    // Style des boutons de drapeaux (neutralise le fond bleu de globals.css)
    const flagButtonClass = (targetLang: Language) =>
      `!rounded-md px-1.5 py-0.5 text-lg transition hover:scale-110 ${
        lang === targetLang
          ? "!bg-(--color-bg-subtle) ring-1 ring-(--color-accent-gold)"
          : "!bg-transparent opacity-60 hover:!bg-white/10 hover:opacity-100"
      }`;

    return (
      <nav className="relative flex min-w-0 items-center justify-end">
        {/* Bouton Burger Mobile (caché sur PC avec md:hidden) */}
        <button
          type="button"
          onClick={this.toggleMenu}
          aria-label="Toggle navigation menu"
          aria-expanded={isOpen}
          className="flex h-10 w-10 items-center justify-center !rounded-xl border border-(--color-border-default) !bg-(--color-bg-elevated) text-xl text-(--color-text-primary) transition hover:!bg-(--color-bg-subtle) hover:text-(--color-accent-gold) md:hidden"
        >
          {isOpen ? "✕" : "☰"}
        </button>

        {/* Barre horizontale Desktop (cachée sur mobile, visible à partir de md) */}
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
                <button type="button" onClick={() => this.changeLanguage('fr')} className={flagButtonClass('fr')}>
                  🇫🇷
                </button>
              </li>
              <li>
                <button type="button" onClick={() => this.changeLanguage('en')} className={flagButtonClass('en')}>
                  🇬🇧
                </button>
              </li>
              <li>
                <button type="button" onClick={() => this.changeLanguage('es')} className={flagButtonClass('es')}>
                  🇪🇸
                </button>
              </li>
            </ul>
          </li>
          <li>
            <Link
              href="#login"
              className="flex cursor-pointer items-center gap-2 rounded-full border border-(--color-border-default) bg-(--color-bg-elevated) px-3 py-1 text-(--color-text-primary) transition hover:border-(--color-accent-gold) hover:text-(--color-accent-gold)"
            >
              <UserCard username={t.login} size={32} />
              <span className="pr-1 font-sans font-semibold text-sm">{t.login}</span>
            </Link>
          </li>
        </ul>

        {/* Menu déroulant Mobile (s'ouvre sous le bouton Burger sur téléphone) */}
        {isOpen && (
          <div className="absolute top-13 right-0 z-50 w-64 rounded-2xl border border-(--color-border-default) bg-(--color-bg-surface) p-4 text-(--color-text-primary) shadow-2xl md:hidden">
            <ul className="flex flex-col gap-2 text-left">
              <li>
                <Link
                  href="/"
                  onClick={this.closeMenu}
                  className="block w-full rounded-lg px-3 py-2 font-sans font-semibold text-sm uppercase tracking-wider transition hover:bg-(--color-bg-elevated) hover:text-(--color-accent-gold)"
                >
                  {t.play}
                </Link>
              </li>
              <li>
                <Link
                  href="#ranking"
                  onClick={this.closeMenu}
                  className="block w-full rounded-lg px-3 py-2 font-sans font-semibold text-sm uppercase tracking-wider transition hover:bg-(--color-bg-elevated) hover:text-(--color-accent-gold)"
                >
                  {t.ranking}
                </Link>
              </li>
              <li>
                <Link
                  href="#friends"
                  onClick={this.closeMenu}
                  className="block w-full rounded-lg px-3 py-2 font-sans font-semibold text-sm uppercase tracking-wider transition hover:bg-(--color-bg-elevated) hover:text-(--color-accent-gold)"
                >
                  {t.friends}
                </Link>
              </li>

              <hr className="my-1 border-(--color-border-default)" />

              {/* Drapeaux centrés dans le menu mobile */}
              <li className="flex items-center justify-center gap-4 py-1">
                <button type="button" onClick={() => this.changeLanguage('fr')} className={flagButtonClass('fr')}>
                  🇫🇷
                </button>
                <button type="button" onClick={() => this.changeLanguage('en')} className={flagButtonClass('en')}>
                  🇬🇧
                </button>
                <button type="button" onClick={() => this.changeLanguage('es')} className={flagButtonClass('es')}>
                  🇪🇸
                </button>
              </li>

              <hr className="my-1 border-(--color-border-default)" />

              {/* Bouton Login dans le menu mobile */}
              <li>
                <Link
                  href="#login"
                  onClick={this.closeMenu}
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
}