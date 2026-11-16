"use client";

import { useLanguage } from '@/i18n/LanguageContext';
import LegalDocument, { ContactEmail, LEGAL_CONTACT, type LegalSection } from "@/components/commons/LegalDocument";

export default function GDPRPolicy() {
  const { t } = useLanguage();

  const sections: LegalSection[] = [
    {
      title: t.gdprPage.sections["1"].title,
      content: <p>{t.gdprPage.sections["1"].content}</p>,
    },
    {
      title: t.gdprPage.sections["2"].title,
      content: <p>{t.gdprPage.sections["2"].content}</p>,
    },
    {
      title: t.gdprPage.sections["3"].title,
      content: (
        <>
          <p>{t.gdprPage.sections["3"].intro}</p>
          <ul>
            <li><strong>{t.gdprPage.sections["3"].points[0].bold}</strong> {t.gdprPage.sections["3"].points[0].text}</li>
            <li><strong>{t.gdprPage.sections["3"].points[1].bold}</strong> {t.gdprPage.sections["3"].points[1].text}</li>
            <li><strong>{t.gdprPage.sections["3"].points[2].bold}</strong> {t.gdprPage.sections["3"].points[2].text}</li>
            <li><strong>{t.gdprPage.sections["3"].points[3].bold}</strong> {t.gdprPage.sections["3"].points[3].text}</li>
            <li><strong>{t.gdprPage.sections["3"].points[4].bold}</strong> {t.gdprPage.sections["3"].points[4].text}</li>
            <li><strong>{t.gdprPage.sections["3"].points[5].bold}</strong> {t.gdprPage.sections["3"].points[5].text}</li>
            <li><strong>{t.gdprPage.sections["3"].points[6].bold}</strong> {t.gdprPage.sections["3"].points[6].text}</li>
          </ul>
        </>
      ),
    },
    {
      title: t.gdprPage.sections["4"].title,
      content: (
        <>
          <p>{t.gdprPage.sections["4"].intro}</p>
          <ul>
            <li><strong>{t.gdprPage.sections["4"].points[0].bold}</strong> {t.gdprPage.sections["4"].points[0].text}</li>
            <li><strong>{t.gdprPage.sections["4"].points[1].bold}</strong> {t.gdprPage.sections["4"].points[1].text}</li>
            <li><strong>{t.gdprPage.sections["4"].points[2].bold}</strong> {t.gdprPage.sections["4"].points[2].text}</li>
            <li><strong>{t.gdprPage.sections["4"].points[3].bold}</strong> {t.gdprPage.sections["4"].points[3].text}</li>
            <li><strong>{t.gdprPage.sections["4"].points[4].bold}</strong> {t.gdprPage.sections["4"].points[4].text}</li>
          </ul>
          <p>{t.gdprPage.sections["4"].outro}</p>
        </>
      ),
    },
    {
      title: t.gdprPage.sections["5"].title,
      content: (
        <>
          <p>{t.gdprPage.sections["5"].intro}</p>
          <ul>
            <li>{t.gdprPage.sections["5"].points[0]}</li>
            <li>{t.gdprPage.sections["5"].points[1]}</li>
            <li>{t.gdprPage.sections["5"].points[2]}</li>
            <li>{t.gdprPage.sections["5"].points[3]}</li>
            <li>{t.gdprPage.sections["5"].points[4]}</li>
            <li>{t.gdprPage.sections["5"].points[5]}</li>
            <li>{t.gdprPage.sections["5"].points[6]}</li>
            <li>{t.gdprPage.sections["5"].points[7]}</li>
          </ul>
          <p>
            {t.gdprPage.sections["5"].contactIntro} <ContactEmail/>. {t.gdprPage.sections["5"].outro}
          </p>
        </>
      ),
    },
    {
      title: t.gdprPage.sections["6"].title,
      content: <p>{t.gdprPage.sections["6"].content}</p>,
    },
    {
      title: t.gdprPage.sections["7"].title,
      content: <p>{t.gdprPage.sections["7"].content}</p>,
    },
    {
      title: t.gdprPage.sections["8"].title,
      content: <p>{t.gdprPage.sections["8"].content}</p>,
    },
    {
      title: t.gdprPage.sections["9"].title,
      content: <p>{t.gdprPage.sections["9"].content}</p>,
    },
    {
      title: t.gdprPage.sections["10"].title,
      content: <p>{t.gdprPage.sections["10"].content}</p>,
    },
    {
      title: t.gdprPage.sections["11"].title,
      content: <p>{t.gdprPage.sections["11"].content}</p>,
    },
    {
      title: t.gdprPage.sections["12"].title,
      content: <p>{t.gdprPage.sections["12"].content}</p>,
    },
    {
      title: t.gdprPage.sections["13"].title,
      content: <p>{t.gdprPage.sections["13"].content}</p>,
    },
    {
      title: t.gdprPage.sections["14"].title,
      content: <p>{t.gdprPage.sections["14"].content}</p>,
    },
    {
      title: t.gdprPage.sections["15"].title,
      content: <p>{t.gdprPage.sections["15"].content}</p>,
    },
    {
      title: t.gdprPage.sections["16"].title,
      content: <p>{t.gdprPage.sections["16"].content}</p>,
    },
    {
      title: t.gdprPage.sections["17"].title,
      content: <p>{t.gdprPage.sections["17"].content}</p>,
    },
    {
      title: t.gdprPage.sections["18"].title,
      content: (
        <>
          <p>{t.gdprPage.sections["18"].intro}</p>
          <ul>
            <li>{t.gdprPage.sections["18"].company} {LEGAL_CONTACT.company}</li>
            <li>{t.gdprPage.sections["18"].address} {LEGAL_CONTACT.address}</li>
            <li>
              {t.gdprPage.sections["18"].email} <ContactEmail/>
            </li>
          </ul>
        </>
      ),
    },
  ];

  return (
    <LegalDocument
      id="gdpr"
      label={t.gdprPage.label}
      title={t.gdprPage.title}
      intro={t.gdprPage.intro}
      lastUpdated="28/10/2026"
      sections={sections}
    />
  );
}