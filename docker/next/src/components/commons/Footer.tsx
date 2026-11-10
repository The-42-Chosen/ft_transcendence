"use client";

import { useContext } from 'react';
import { LanguageContext } from '@/i18n/LanguageContext';

export default function Footer() {
  const context = useContext(LanguageContext);
  const text = context?.t?.footer?.text || "Footer will be here";

  return <footer className="text">{text}</footer>;
}
