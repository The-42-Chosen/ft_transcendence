"use client";

import { Component } from 'react';
import { LanguageContext } from '@/i18n/LanguageContext';

export default class Footer extends Component {
  static contextType = LanguageContext;
  declare context: React.ContextType<typeof LanguageContext>;

  render() {
    const text = this.context?.t?.footer?.text || "Footer will be here";
    return <footer className="text">{text}</footer>;
  }
}