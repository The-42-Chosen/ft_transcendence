import type { Metadata } from 'next';
import Footer from '@/components/commons/Footer';
import Header from '@/components/commons/Header';
import TermsOfService from '@/components/commons/TermsOfService';

export const metadata: Metadata = {
  title: "Terms of Service - Transcendence",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen">
      <Header/>
      <div>
        <TermsOfService/>
      </div>
      <Footer/>
    </main>
  );
}
