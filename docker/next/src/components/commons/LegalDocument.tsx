import type { ReactNode } from "react";

export type LegalSection = {
  title: string;
  content: ReactNode;
};

type Parameters = {
  // Prefix of the section anchors, so two documents never share an id
  id: string;
  label: string;
  title: string;
  intro: string;
  lastUpdated: string;
  sections: LegalSection[];
  // Extra content rendered inside the card, after the sections
  children?: ReactNode;
};

// Company details shared by every legal page
export const LEGAL_CONTACT = {
  company: "The 42 Chosen",
  address: "96 boulevard Bessières, 75017 Paris, France",
  // TODO: Not a valid email address yet, replace it with the real contact address of the team
  email: "the.42.chosen.complain.fr",
};

export function ContactEmail() {
  return <a href={`mailto:${LEGAL_CONTACT.email}`}>{LEGAL_CONTACT.email}</a>;
}

export default function LegalDocument({ id, label, title, intro, lastUpdated, sections, children }: Parameters) {
  return (
    <article className="mx-auto my-8 max-w-3xl rounded-2xl border border-(--color-border-default) bg-(--color-bg-surface) p-6 text-left leading-relaxed shadow-2xl sm:my-16 sm:p-12">
      <header className="p-6 border-b border-(--color-border-default) pb-8 !bg-transparent">
        <span className="font-agent text-xs uppercase tracking-[0.2em] text-(--color-accent-gold)">{label}</span>
        <h1 className="my-4 font-display text-4xl tracking-wide sm:text-5xl">{title}</h1>
        <p className="text-(--color-text-secondary)">{intro}</p>
        <p className="mt-5 text-sm text-(--color-text-muted)">Last updated: {lastUpdated}</p>
      </header>

      {sections.length > 0 && (
      <nav aria-label="Table of contents" className="my-8 rounded-xl bg-(--color-bg-elevated) p-6">
        <h2 className="mb-3 font-display text-2xl tracking-wide">Table of Contents</h2>
        <ol className="grid list-decimal gap-x-6 gap-y-2 pl-5 sm:grid-cols-2">
          {sections.map((section, index) => (
            <li key={section.title}>
              <a
                href={`#${id}-section-${index + 1}`}
                className="text-(--color-text-secondary) underline decoration-(--color-border-default) underline-offset-4 transition-colors hover:text-(--color-accent-gold) hover:decoration-current"
              >
                {section.title.replace(/^\d+\.\s*/, "")}
              </a>
            </li>
          ))}
        </ol>
      </nav>
      )}

      {sections.map((section, index) => (
        <section
          key={section.title}
          id={`${id}-section-${index + 1}`}
          className="scroll-mt-24 border-b border-(--color-border-default) py-7 text-(--color-text-secondary) last:border-b-0 [&_a]:break-words [&_a]:text-(--color-text-primary) [&_a]:underline [&_a]:decoration-(--color-border-default) [&_a]:underline-offset-4 [&_a:hover]:text-(--color-accent-gold) [&_li]:my-2 [&_p]:my-3 [&_strong]:text-(--color-text-primary) [&_ul]:list-disc [&_ul]:pl-6"
        >
          <h2 className="mb-4 font-display text-2xl tracking-wide text-(--color-text-primary)">{section.title}</h2>
          {section.content}
        </section>
      ))}

      {children}
    </article>
  );
}
