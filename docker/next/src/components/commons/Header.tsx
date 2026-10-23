"use client";

import { Component } from 'react';
import Nav from '@/components/commons/Nav';
import Logo from '@/components/commons/Logo';

export default class Header extends Component {
  render() {
    return (
      <header className="flex justify-between text-amber-50">
        <Logo />
        <Nav />
      </header>
    );
  }
}
