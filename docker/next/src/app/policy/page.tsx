import type { Metadata } from 'next';
import Footer from '@/components/commons/Footer';
import Header from '@/components/commons/Header';
import PrivacyPolicy from '@/components/commons/PrivacyPolicy';

export const metadata: Metadata = {
  title: "Privacy Policy - Transcendence",
};

export default function PolicyPage() {
  return (
    <main className="min-h-screen">
      <Header/>
      <div className="px-4">
        <PrivacyPolicy/>
      </div>
      <Footer/>
    </main>
  );
}
