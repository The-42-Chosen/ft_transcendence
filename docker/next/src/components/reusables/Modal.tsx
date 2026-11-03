"use client";

import { useEffect, useRef, type ReactNode } from "react";

type Parameters = {
	title: string;
	subtitle: string;
	content: string;
	bContent: string;
	onClose?: () => void;
	children?: ReactNode;
}

export default function Modal({title, subtitle, content, bContent, onClose, children}: Parameters) {
	const ref = useRef<HTMLDialogElement>(null);

	useEffect(() => {
		ref.current?.showModal();
	}, []);

	return (
		<dialog className="m-auto text-center p-10 bg-amber-100 rounded-2xl align-middle" ref={ref} onClose={onClose} onClick={(e) => e.stopPropagation()}>
			<h2 className="mb-5 font-display text-4xl tracking-wide">{title}</h2>
			<h3 className="mb-2 tracking-wide">{subtitle}</h3>
			{children}
			<p className="mb-2">{content}</p>
			<form method="dialog">
				<button className=" mt-2 font-medium disabled:opacity-50 rounded-full bg-amber-500 px-10 py-3 font-display text-2xl tracking-widest text-white shadow-lg transition hover:scale-105 hover:bg-amber-600 active:bg-amber-700 disabled:hover:scale-100 disabled:hover:bg-amber-500">{bContent}</button>
			</form>
		</dialog>
	);
}
