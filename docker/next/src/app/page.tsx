"use client";

import Image from 'next/image';
import Footer from '@/components/commons/Footer';
import Header from '@/components/commons/Header';
import Game from '@/components/commons/Game';
import { useLanguage } from '@/i18n/LanguageContext';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center text-center">
      <div id="main-title">
        <h1 className="text-4xl font-semibold red">All Tutors are Badass</h1>
      </div>
      <Image
          src="/assets/images/atab.jpg"
          width={500}
          height={500}
          alt="The dear Atab Tutors"
      />
      <Footer/>
    </main>
  );
}
