"use client";

import { Component } from 'react';
import UserCard from '@/components/reusables/UserCard';

export default class Nav extends Component {
  render() {
    return (
      <nav className="flex min-w-0 justify-end">
        <ul className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1 sm:gap-x-6">
          <li>Play</li>
          <li>Ranking</li>
          <li>Friends</li>
          <li>
            <ul className="flex items-center gap-2">
              <li>🇫🇷</li>
              <li>🇬🇧</li>
              <li>🇪🇸</li>
            </ul>
          </li>
          <li>
            <div className="flex items-center gap-2">
              <UserCard username="Login" size={32} />
              <p className="hidden pr-2 sm:block">Login</p>
            </div>
          </li>
        </ul>
      </nav>
    );
  }
}
