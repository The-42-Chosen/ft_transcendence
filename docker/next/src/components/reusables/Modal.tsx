"use client";

import { useEffect, useRef } from "react";

type Parameters = {
	title: string;
	subtitle: string;
	content: string;
	bContent: string;
	onClose?: () => void;
}

export default function Modal({title, subtitle, content, bContent, onClose}: Parameters) {
	const ref = useRef<HTMLDialogElement>(null);

	// showModal() puts the dialog in the top layer, outside any overflow-hidden parent
	useEffect(() => {
		ref.current?.showModal();
	}, []);

	return (
		<dialog ref={ref} onClose={onClose} onClick={(e) => e.stopPropagation()}>
			<h2>{title}</h2>
			<h3>{subtitle}</h3>
			<p>{content}</p>
			<form method="dialog">
				<button>{bContent}</button>
			</form>
		</dialog>
	);
}
