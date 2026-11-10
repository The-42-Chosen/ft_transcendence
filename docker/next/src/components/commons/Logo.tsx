"use client";

import { Component } from 'react';
import Image from 'next/image';

export default class Logo extends Component {
  handleClick = () => {
    window.location.href = "/";
  };

  render() {
    return (
      <button
        type="button"
        onClick={this.handleClick}
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
}