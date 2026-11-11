import type { Metadata } from 'next';
import Footer from '@/components/commons/Footer';
import About from '@/components/commons/About';
import Header from '@/components/commons/Header';

export const metadata: Metadata = {
  title: "About the Tonton's Forkers & Cie.",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      <Header/>
      <div className="px-4">
        <About/>
      </div>
      <Footer/>
    </main>
  );
}
