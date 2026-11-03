"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

type Parameters = {
	code: string;
};

export default function RoomCode({code}: Parameters) {
	const [copied, setCopied] = useState(false);

	async function copyCode() {
		await navigator.clipboard.writeText(code);
		setCopied(true);
		setTimeout(() => setCopied(false), 1500);
	}

	return (
		<div className="mb-6 flex flex-col items-center gap-2">
			<span className="font-agent text-xs uppercase tracking-widest text-amber-800">Room code</span>
			<button
				type="button"
				onClick={copyCode}
				title="Copy the room code"
				className={cn(
					"flex items-center gap-4 rounded-2xl border-2 border-dashed px-6 py-2 shadow-md transition",
					"border-amber-400 bg-white/70 hover:border-solid hover:border-amber-600 hover:bg-white",
					copied && "border-solid border-(--color-status-online) hover:border-(--color-status-online)"
				)}
			>
				<span className="font-display text-4xl tracking-[0.4em] text-amber-900">{code}</span>
				<span className="font-agent text-xs text-black/50">{copied ? "Copied!" : "Copy"}</span>
			</button>
			<p className="font-agent text-xs text-black/50">Share this code with your friends so they can join</p>
		</div>
	);
}
