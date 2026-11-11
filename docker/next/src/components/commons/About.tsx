"use client";

import Image from 'next/image';
import { useLanguage } from '@/i18n/LanguageContext';
import LegalDocument from "@/components/commons/LegalDocument";

export default function About() {
  const { t } = useLanguage();

  return (
    <LegalDocument
      id="about"
      label="About Us"
      title="Les Tontons Forkers & Cie."
      intro="A lovely group of tutors. Thanks Tonton!"
      lastUpdated="28/10/2026"
      sections={[]}
    >
      <Image
        src="/assets/images/atab.jpg"
        width={500}
        height={500}
        className="mt-8 m-auto h-auto w-auto"
        alt={t.home.imageAlt}
        loading="eager"
      />
    </LegalDocument>
  );
}
