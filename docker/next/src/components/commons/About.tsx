"use client";

import Image from 'next/image';
import { useLanguage } from '@/i18n/LanguageContext';

export default function About() {
  const { t } = useLanguage();

  return (
    <Image
      src="/assets/images/atab.jpg"
      width={500}
      height={500}
      className="m-auto h-auto w-auto"
      alt={t.home.imageAlt}
      loading="eager"
    />
  );
}
