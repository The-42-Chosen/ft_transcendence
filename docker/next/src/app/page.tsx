import Image from 'next/image'
import Footer from '@/components/commons/Footer'
import Header from '@/components/commons/Header'
import Game from '@/components/commons/Game'

export default function Home() {
  return (
    <main className="min-h-screen text-center">
      <Header/>
      <div id="main-title">
        <h1 className="font-display text-6xl tracking-wide">All Tutors are Badass</h1>
      </div>
	  <Game/>
      <Image
          src="/assets/images/atab.jpg"
          width={500}
          height={500}
          className="h-auto w-auto"
          alt="The dear Atab Tutors"
          loading="eager"
      />
      {/* <button className="p-3 m-4 text-center">Hello</button> */}
      <Footer/>
    </main>
  );
}
