"use client";

import Nav from '@/components/commons/Nav';
import Logo from '@/components/commons/Logo';

export default function Header() {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between gap-4 px-4 py-2.5 text-(--color-text-primary) shadow-md">
      <Logo />
      <Nav />
    </header>
  );
}
