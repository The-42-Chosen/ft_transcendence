import type { Metadata } from 'next';
import Footer from '@/components/commons/Footer';
import GDPRPolicy from '@/components/commons/GDPR';
import Header from '@/components/commons/Header';

export const metadata: Metadata = {
  title: "GDPR Compliance Policy - Transcendence",
};

export default function GDPRPage() {
  return (
    <main className="min-h-screen">
      <Header/>
      <div className="px-4">
        <GDPRPolicy/>
      </div>
      <Footer/>
    </main>
  );
}
