"use client";

import { Fragment, type ReactNode } from "react";
import Link from "next/link";
import LegalDocument, { ContactEmail, LEGAL_CONTACT, type LegalSection } from "@/components/commons/LegalDocument";
import { useLanguage } from "@/i18n/LanguageContext";

// Shape of the "terms" entry of the i18n dictionaries
type TermsBlock = { p: string } | { ul: string[] };
type TermsSection = { title: string; blocks: TermsBlock[] };

// Replaces {placeholder} with its node and **text** with <strong>text</strong>
function rich(text: string, values: Record<string, ReactNode>): ReactNode[] {
  return text.split(/(\{\w+\}|\*\*[^*]+\*\*)/g).map((part, i) => {
    if (/^\{\w+\}$/.test(part)) {
      return <Fragment key={i}>{values[part.slice(1, -1)] ?? part}</Fragment>;
    }
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

export default function TermsOfService() {
  const { t } = useLanguage();
  const terms = t.terms;

  const values: Record<string, ReactNode> = {
    company: LEGAL_CONTACT.company,
    address: LEGAL_CONTACT.address,
    email: <ContactEmail/>,
    privacyPolicy: <Link href="/policy">{terms.privacyPolicy}</Link>,
    gdprPolicy: <Link href="/gdpr">{terms.gdprPolicy}</Link>,
  };

  const sections: LegalSection[] = (terms.sections as TermsSection[]).map((section) => ({
    title: section.title,
    content: (
      <>
        {section.blocks.map((block, i) =>
          "ul" in block ? (
            <ul key={i}>
              {block.ul.map((item, j) => <li key={j}>{rich(item, values)}</li>)}
            </ul>
          ) : (
            <p key={i}>{rich(block.p, values)}</p>
          )
        )}
      </>
    ),
  }));

  return (
    <LegalDocument
      id="terms"
      label={terms.label}
      title={terms.title}
      intro={terms.intro}
      lastUpdated="19/11/2026"
      lastUpdatedLabel={terms.lastUpdated}
      tableOfContentsLabel={terms.tableOfContents}
      sections={sections}
    />
  );
}
