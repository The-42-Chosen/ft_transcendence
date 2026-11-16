"use client";

import { useLanguage } from '@/i18n/LanguageContext';
import LegalDocument, { ContactEmail, LEGAL_CONTACT, type LegalSection } from "@/components/commons/LegalDocument";

export default function PrivacyPolicy() {
  const { t } = useLanguage();

  const sections: LegalSection[] = [
    {
      title: t.privacyPage.sections["1"].title,
      content: (
        <>
          <p>{t.privacyPage.sections["1"].intro}</p>
          <ul>
            <li>{t.privacyPage.sections["1"].company} {LEGAL_CONTACT.company}</li>
            <li>{t.privacyPage.sections["1"].address} {LEGAL_CONTACT.address}</li>
            <li>{t.privacyPage.sections["1"].email} <ContactEmail/></li>
          </ul>
        </>
      ),
    },
    {
      title: t.privacyPage.sections["2"].title,
      content: (
        <>
          <p>{t.privacyPage.sections["2"].intro}</p>
          <ul>
            <li>{t.privacyPage.sections["2"].points[0]}</li>
            <li>{t.privacyPage.sections["2"].points[1]}</li>
            <li>{t.privacyPage.sections["2"].points[2]}</li>
            <li>{t.privacyPage.sections["2"].points[3]}</li>
            <li>{t.privacyPage.sections["2"].points[4]}</li>
          </ul>
          <p>{t.privacyPage.sections["2"].outro}</p>
        </>
      ),
    },
    {
      title: t.privacyPage.sections["3"].title,
      content: (
        <>
          <p>{t.privacyPage.sections["3"].intro}</p>
          <ul>
            <li>{t.privacyPage.sections["3"].points[0]}</li>
            <li>{t.privacyPage.sections["3"].points[1]}</li>
            <li>{t.privacyPage.sections["3"].points[2]}</li>
            <li>{t.privacyPage.sections["3"].points[3]}</li>
            <li>{t.privacyPage.sections["3"].points[4]}</li>
            <li>{t.privacyPage.sections["3"].points[5]}</li>
          </ul>
          <p>{t.privacyPage.sections["3"].outro}</p>
        </>
      ),
    },
    {
      title: t.privacyPage.sections["4"].title,
      content: <p>{t.privacyPage.sections["4"].content}</p>,
    },
    {
      title: t.privacyPage.sections["5"].title,
      content: <p>{t.privacyPage.sections["5"].content}</p>,
    },
    {
      title: t.privacyPage.sections["6"].title,
      content: <p>{t.privacyPage.sections["6"].content}</p>,
    },
    {
      title: t.privacyPage.sections["7"].title,
      content: <p>{t.privacyPage.sections["7"].content}</p>,
    },
    {
      title: t.privacyPage.sections["8"].title,
      content: <p>{t.privacyPage.sections["8"].content}</p>,
    },
    {
      title: t.privacyPage.sections["9"].title,
      content: (
        <>
          <p>{t.privacyPage.sections["9"].intro}</p>
          <ul>
            <li>{t.privacyPage.sections["9"].points[0]}</li>
            <li>{t.privacyPage.sections["9"].points[1]}</li>
            <li>{t.privacyPage.sections["9"].points[2]}</li>
            <li>{t.privacyPage.sections["9"].points[3]}</li>
            <li>{t.privacyPage.sections["9"].points[4]}</li>
            <li>{t.privacyPage.sections["9"].points[5]}</li>
            <li>{t.privacyPage.sections["9"].points[6]}</li>
          </ul>
          <p>{t.privacyPage.sections["9"].contactIntro} <ContactEmail/>.</p>
          <p>{t.privacyPage.sections["9"].outro}</p>
        </>
      ),
    },
    {
      title: t.privacyPage.sections["10"].title,
      content: <p>{t.privacyPage.sections["10"].content}</p>,
    },
    {
      title: t.privacyPage.sections["11"].title,
      content: <p>{t.privacyPage.sections["11"].content}</p>,
    },
    {
      title: t.privacyPage.sections["12"].title,
      content: (
        <p>
          {t.privacyPage.sections["12"].content} <ContactEmail/>.
        </p>
      ),
    },
  ];

  return (
    <LegalDocument
      id="privacy"
      label={t.privacyPage.label}
      title={t.privacyPage.title}
      intro={t.privacyPage.intro}
      lastUpdated="28/10/2026"
      sections={sections}
    />
  );
}