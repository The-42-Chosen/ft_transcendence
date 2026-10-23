"use client";

import { Component } from 'react';
import Image from 'next/image';

export default class Logo extends Component {
  render() {
    return (<Image
		src="/assets/images/logo.png"
		width={60}
		height={60}
		alt="The Tontons Forkers: Happyend - Logo"
	/>);
  }
}
