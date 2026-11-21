import type { Metadata } from "next";
import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { Bebas_Neue, Manrope, Special_Elite } from "next/font/google";
import { LanguageProvider, type Language } from "@/i18n/LanguageContext";
import "./globals.css";

const bebas = Bebas_Neue({ weight: "400", subsets: ["latin"], variable: "--font-bebas" });
const specialElite = Special_Elite({ weight: "400", subsets: ["latin"], variable: "--font-special-elite" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });

export const metadata: Metadata = {
  title: "Transcendence",
  description: "ATAB Codename",
};

const VALID_LANGUAGES: Language[] = ["fr", "en", "es"];

export default async function RootLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const cookieLang = cookieStore.get("lang")?.value as Language | undefined;
  const initialLang: Language =
    cookieLang && VALID_LANGUAGES.includes(cookieLang) ? cookieLang : "fr";

  return (
    <html lang={initialLang} className={`${bebas.variable} ${specialElite.variable} ${manrope.variable}`}>
      <body className="font-sans antialiased">
        <LanguageProvider initialLang={initialLang}>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}