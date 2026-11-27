"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useLanguage } from "@/i18n/LanguageContext";

type AuthCardProps = {
  title: string;
  footerText: string;
  footerLinkText: string;
  footerHref: string;
  children: ReactNode;
};

export default function AuthCard({
  title,
  footerText,
  footerLinkText,
  footerHref,
  children,
}: AuthCardProps) {
  const { t } = useLanguage();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
      <section className="w-full max-w-md rounded-2xl bg-amber-100 p-6 shadow-xl sm:p-8">
        <h1 className="mb-6 text-center font-display text-4xl uppercase tracking-wide text-black">
          {title}
        </h1>

        {children}

        <p className="mt-4 text-center font-agent text-xs text-black/60">
          {footerText}{" "}
          <Link
            href={footerHref}
            className="font-bold text-amber-900 underline decoration-amber-400 underline-offset-4 transition-colors hover:text-amber-700"
          >
            {footerLinkText}
          </Link>
        </p>
      </section>

      <Link
        href="/"
        className="font-agent text-sm text-(--color-text-secondary) transition-colors hover:text-(--color-text-primary)"
      >
        {t.auth.backHome}
      </Link>
    </main>
  );
}