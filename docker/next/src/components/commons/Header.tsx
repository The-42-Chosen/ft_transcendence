"use client";

import { Component } from 'react';
import Nav from '@/components/commons/Nav';
import Logo from '@/components/commons/Logo';

export default class Header extends Component {
  render() {
    return (
      <header className="flex flex-wrap items-center justify-between gap-2 px-2 text-amber-50">
        <Logo />
        <Nav />
      </header>
    );
  }
}
