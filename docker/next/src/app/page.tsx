import Image from 'next/image'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center text-center">
      <div id="main-title">
        <h1 className="text-4xl font-semibold red">All Tutors are Badass</h1>
      </div>
      <Image
          src="/assets/images/atab.jpg"
          width={500}
          height={500}
          alt="The dear Atab Tutors"
      />
    </main>
  );
}
