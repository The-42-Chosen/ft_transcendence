"use client";

import { Component } from 'react';
import UserCard from '@/components/reusables/UserCard';
import { LanguageContext, type Language } from '@/i18n/LanguageContext';

export default class Nav extends Component {
  static contextType = LanguageContext;
  declare context: React.ContextType<typeof LanguageContext>;

  changeLanguage = (lang: Language) => {
    if (this.context) {
      this.context.setLang(lang);
    }
  };

  render() {
    const t = this.context?.t?.nav || {
      play: "Play",
      ranking: "Ranking",
      friends: "Friends",
      login: "Login"
    };

    return (
      <nav className="flex min-w-0 justify-end">
        <ul className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1 sm:gap-x-6">
          <li>{t.play}</li>
          <li>{t.ranking}</li>
          <li>{t.friends}</li>
          <li>
            <ul className="flex items-center gap-2">
              <li>
                <button onClick={() => this.changeLanguage('fr')} className="cursor-pointer hover:scale-110 transition">
                  🇫🇷
                </button>
              </li>
              <li>
                <button onClick={() => this.changeLanguage('en')} className="cursor-pointer hover:scale-110 transition">
                  🇬🇧
                </button>
              </li>
              <li>
                <button onClick={() => this.changeLanguage('es')} className="cursor-pointer hover:scale-110 transition">
                  🇪🇸
                </button>
              </li>
            </ul>
          </li>
          <li>
            <div className="flex items-center gap-2">
              <UserCard username="Login" size={32} />
              <p className="hidden pr-2 sm:block">{t.login}</p>
            </div>
          </li>
        </ul>
      </nav>
    );
  }
}