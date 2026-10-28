import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Bebas_Neue, Manrope, Special_Elite } from "next/font/google";
import "./globals.css";

// Codename fonts: poster titles, typewriter "secret file" accents, readable body
const bebas = Bebas_Neue({ weight: "400", subsets: ["latin"], variable: "--font-bebas" });
const specialElite = Special_Elite({ weight: "400", subsets: ["latin"], variable: "--font-special-elite" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });

export const metadata: Metadata = {
  title: "Transcendence",
  description: "ATAB Codename",
};

// The main container! Here is where we use html balises.
// Here is the main function
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" className={`${bebas.variable} ${specialElite.variable} ${manrope.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
