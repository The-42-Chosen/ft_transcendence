"use client";

import Image from 'next/image';

export default function Logo() {
  const handleClick = () => {
    window.location.href = "/";
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="cursor-pointer border-0 bg-transparent p-0 transition-transform hover:scale-105 active:scale-95"
      title="Retour à l'accueil"
    >
      <Image
        src="/assets/images/logo.png"
        width={60}
        height={60}
        alt="The Tontons Forkers: Happyend - Logo"
      />
    </button>
  );
}
