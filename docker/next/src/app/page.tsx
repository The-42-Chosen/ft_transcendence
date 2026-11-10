"use client";

import Image from 'next/image';
import Footer from '@/components/commons/Footer';
import Header from '@/components/commons/Header';
import Game from '@/components/commons/Game';
import { useLanguage } from '@/i18n/LanguageContext';
import { useEffect } from "react";

export default function Home() {
  const { t } = useLanguage();
  useEffect(() => {
    fetch("/api/socket");
  }, []);

  return (
    <main className="min-h-screen text-center">
      <Header/>
      <div id="main-title">
        <h1 className="font-display text-6xl tracking-wide">{t.home.title}</h1>
      </div>
      <Game/>
      <Image
          src="/assets/images/atab.jpg"
          width={500}
          height={500}
          className="m-auto h-auto w-auto"
          alt={t.home.imageAlt}
          loading="eager"
      />
      <Footer/>
    </main>
  );
}