"use client";

import { Component } from 'react';

export default class Nav extends Component {
  render() {
    return (
      <nav className="flex justify-end">
        <ul className="flex items-center gap-6">
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
              <p className="mask-circle bg-amber-50 w-8">EP</p>
              <p className="pr-2">erpascua</p>
            </div>
          </li>
        </ul>
      </nav>
    );
  }
}
